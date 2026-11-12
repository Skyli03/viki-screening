import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { berechneScreeningProfil, type ScreeningProfil } from "@/lib/auswertung";
import {
  AUSDAUER_TEXT, BEREICH_TEXTE, STUFEN, UNTERSUCHUNG_TEXT, WARNZEICHEN_EMPFEHLUNG, kursLink,
} from "@/lib/alltags-texte";
import type { Antwort, KonvergenzZeichen, ScreeningDaten } from "@/lib/screening-types";
import { FRAGEN } from "@/data/fragebogen";

// ─── Schutz ───────────────────────────────────────────────────────────────────
// Der Client schickt nur Rohantworten (feste Auswahlwerte). Alle Texte der Mail
// entstehen hier auf dem Server. So kann niemand eigene Inhalte über unser
// Postfach verschicken.

const ERLAUBTE_HERKUNFT = [/^https:\/\/viki-screening[a-z0-9-]*\.vercel\.app$/, /^https:\/\/(www\.)?vikitraining\.at$/, /^http:\/\/localhost(:\d+)?$/];
const LIMIT = 5;              // Berichte pro IP …
const FENSTER_MS = 60 * 60 * 1000; // … pro Stunde (pro Server-Instanz, als Bremse gedacht)
const anfragen = new Map<string, number[]>();

function zuVieleAnfragen(ip: string): boolean {
  const jetzt = Date.now();
  const liste = (anfragen.get(ip) ?? []).filter(t => jetzt - t < FENSTER_MS);
  liste.push(jetzt);
  anfragen.set(ip, liste);
  if (anfragen.size > 5000) anfragen.clear();
  return liste.length > LIMIT;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function eines<T extends string>(wert: unknown, erlaubt: readonly T[]): T | null {
  return typeof wert === "string" && (erlaubt as readonly string[]).includes(wert) ? (wert as T) : null;
}

/** Baut aus der Anfrage ein sauberes Datenpaket oder gibt null zurück. */
function pruefeDaten(roh: unknown): ScreeningDaten | null {
  if (!roh || typeof roh !== "object") return null;
  const d = roh as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  const klasse = Number(d.klasse);
  if (![1, 2, 3, 4].includes(klasse)) return null;

  const brille = eines(d.vorfragen?.brille, ["ja", "nein", "weiss_nicht"] as const);
  const untersuchung = eines(d.vorfragen?.untersuchung, ["unter_1_jahr", "laenger", "nie", "weiss_nicht"] as const);
  const haltung = eines(d.lesen?.haltung, ["unauffaellig", "auffaellig"] as const);
  const augen = eines(d.konvergenz?.augen, ["gleichmaessig", "weicht_kurz_aus", "weicht_deutlich_aus"] as const);
  const folgen = eines(d.augenReise?.folgen, ["fluessig", "ruckelig", "verliert"] as const);
  const springen = eines(d.augenReise?.springen, ["praezise", "korrigiert", "sucht"] as const);
  const fehler = Number(d.buchstaben?.fehler);
  if (!brille || !untersuchung || !haltung || !augen || !folgen || !springen || !Number.isInteger(fehler) || fehler < 0 || fehler > 8) {
    return null;
  }

  const fragebogen: Record<string, Antwort> = {};
  for (const f of FRAGEN) {
    const v = d.fragebogen?.[f.id];
    fragebogen[f.id] = v === 0 || v === 1 || v === 2 || v === 3 ? v : null;
  }

  const alleZeichen: KonvergenzZeichen[] = ["doppelbilder", "schaut_weg", "anstrengend"];
  const zeichen = Array.isArray(d.konvergenz?.zeichen)
    ? alleZeichen.filter(z => d.konvergenz.zeichen.includes(z))
    : [];

  return {
    klasse,
    vorfragen: { brille, untersuchung },
    fragebogen,
    lesen: { fluessig: d.lesen?.fluessig === true, zeile_verloren: d.lesen?.zeile_verloren === true, finger: d.lesen?.finger === true, haltung },
    konvergenz: { augen, zeichen },
    augenReise: { folgen, springen, kopf_mitbewegt: d.augenReise?.kopf_mitbewegt === true },
    buchstaben: { fehler, runden: 8 },
  };
}

// ─── systeme.io (nur mit Newsletter-Einwilligung, nur E-Mail-Adresse) ─────────
// POST /api/contacts nimmt keine Tags an: Tag per Name suchen/anlegen und dann
// separat über POST /api/contacts/{id}/tags zuweisen.

const SYSTEMEIO_TAG_NAME = "viki-screening";

async function systemeioKontaktId(email: string, headers: Record<string, string>): Promise<number | null> {
  const res = await fetch("https://api.systeme.io/api/contacts", { method: "POST", headers, body: JSON.stringify({ email }) });
  if (res.status === 201) return (await res.json()).id ?? null;
  if (res.status === 400 || res.status === 422) {
    // Kontakt existiert vermutlich schon → nachschlagen
    const suche = await fetch(`https://api.systeme.io/api/contacts?email=${encodeURIComponent(email)}`, { headers });
    if (suche.ok) return (await suche.json()).items?.[0]?.id ?? null;
    console.error("systeme.io Kontaktsuche fehlgeschlagen:", suche.status);
    return null;
  }
  console.error("systeme.io Kontakt anlegen fehlgeschlagen:", res.status, await res.text());
  return null;
}

async function systemeioTagId(headers: Record<string, string>): Promise<number | null> {
  const suche = await fetch(`https://api.systeme.io/api/tags?query=${encodeURIComponent(SYSTEMEIO_TAG_NAME)}`, { headers });
  if (suche.ok) {
    const gefunden = ((await suche.json()).items ?? []).find((t: { id: number; name: string }) => t.name === SYSTEMEIO_TAG_NAME);
    if (gefunden) return gefunden.id;
  }
  const neu = await fetch("https://api.systeme.io/api/tags", { method: "POST", headers, body: JSON.stringify({ name: SYSTEMEIO_TAG_NAME }) });
  if (neu.status === 201) return (await neu.json()).id ?? null;
  console.error("systeme.io Tag anlegen fehlgeschlagen:", neu.status);
  return null;
}

async function inSystemeioEintragen(email: string, apiKey: string) {
  const headers = { "Content-Type": "application/json", "X-API-Key": apiKey };
  const kontakt = await systemeioKontaktId(email, headers);
  const tag = kontakt ? await systemeioTagId(headers) : null;
  if (!kontakt || !tag) return;
  const res = await fetch(`https://api.systeme.io/api/contacts/${kontakt}/tags`, { method: "POST", headers, body: JSON.stringify({ tagId: tag }) });
  if (!res.ok) console.error("systeme.io Tag-Zuweisung fehlgeschlagen:", res.status);
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const herkunft = request.headers.get("origin");
  if (herkunft && !ERLAUBTE_HERKUNFT.some(r => r.test(herkunft))) {
    return NextResponse.json({ fehler: "Nicht erlaubt." }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unbekannt";
  if (zuVieleAnfragen(ip)) {
    return NextResponse.json({ fehler: "Du hast schon mehrere Berichte angefordert. Bitte versuch es in einer Stunde noch einmal." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ fehler: "Ungültige Anfrage." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (email.length > 254 || !/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(email)) {
    return NextResponse.json({ fehler: "Bitte gib eine gültige E-Mail-Adresse ein." }, { status: 400 });
  }
  if (body.einwilligung !== true) {
    return NextResponse.json({ fehler: "Ohne Einwilligung können wir den Bericht nicht schicken." }, { status: 400 });
  }
  const daten = pruefeDaten(body.daten);
  if (!daten) {
    return NextResponse.json({ fehler: "Die Angaben aus dem Check sind unvollständig. Bitte mach den Check noch einmal." }, { status: 400 });
  }
  // Nur Buchstaben, Leerzeichen und Bindestrich, max. 30 Zeichen
  const kindName = typeof body.kindName === "string" ? body.kindName.replace(/[^\p{L}\s'-]/gu, "").trim().slice(0, 30) : "";

  const profil = berechneScreeningProfil(daten);

  const systemeioKey = process.env.SYSTEMEIO_API_KEY;
  if (systemeioKey && body.newsletter === true) {
    try {
      await inSystemeioEintragen(email, systemeioKey);
    } catch (e) {
      console.error("systeme.io Fehler:", e);
    }
  }

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpUser || !smtpPass) {
    console.error("SMTP nicht konfiguriert");
    return NextResponse.json({ fehler: "Versand nicht möglich." }, { status: 500 });
  }

  try {
    const transporter = nodemailer.createTransport({ host: "smtp.gmail.com", port: 587, secure: false, auth: { user: smtpUser, pass: smtpPass } });
    const name = kindName || "dein Kind";
    await transporter.sendMail({
      from: `"Sarah | Viki Training" <${smtpUser}>`,
      to: email,
      subject: kindName ? `Dein Augen-Check-Bericht für ${kindName}` : "Dein Augen-Check-Bericht",
      html: berichtHtml(name, profil),
      text: berichtText(name, profil),
    });
  } catch (e) {
    console.error("Gmail SMTP Fehler:", e);
    return NextResponse.json({ fehler: "Versand fehlgeschlagen." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}

// ─── Bericht-Mail ─────────────────────────────────────────────────────────────

function berichtText(name: string, p: ScreeningProfil): string {
  const zeilen = [
    "Hallo!",
    "",
    `Hier ist dein Bericht zum Augen-Check für ${name}.`,
    "",
    `Ergebnis: ${STUFEN[p.gesamtStufe].label}`,
    "",
  ];
  if (p.warnzeichen.length) {
    zeilen.push("BITTE ABKLÄREN LASSEN:", ...p.warnzeichen.map(w => `- ${w.text}`), WARNZEICHEN_EMPFEHLUNG, "");
  } else if (p.untersuchungEmpfohlen) {
    zeilen.push(UNTERSUCHUNG_TEXT, "");
  }
  for (const b of p.bereiche) {
    const t = BEREICH_TEXTE[b.id];
    zeilen.push(`${b.name}: ${STUFEN[b.stufe].label}`);
    zeilen.push(b.stufe === 0 ? t.positiv : `${t.beobachtet} ${t.alltag} ${t.hinweis}`, "");
  }
  if (p.ausdauerHinweis) zeilen.push(`Ausdauer: ${AUSDAUER_TEXT}`, "");
  for (const z of p.zusammenhaenge) zeilen.push(`${z.titel}: ${z.text}`, "");
  zeilen.push(
    `Superblick-Kurs: ${kursLink("bericht-mail")}`,
    "",
    "Der Augen-Check ist eine erste Orientierung, keine Diagnose. Er ersetzt keine Untersuchung bei einer Augenärztin, einem Augenarzt oder in der Optometrie.",
    "",
    "Liebe Grüße",
    "Sarah | Viki Training",
  );
  return zeilen.join("\n");
}

function berichtHtml(name: string, p: ScreeningProfil): string {
  const n = escapeHtml(name);
  const gesamt = STUFEN[p.gesamtStufe];
  const hinweise = p.bereiche.filter(b => b.stufe > 0).sort((a, b) => a.score - b.score);
  const gut = p.bereiche.filter(b => b.stufe === 0);
  const schwerpunkt = p.schwerpunkt ? p.bereiche.find(b => b.id === p.schwerpunkt) : null;

  const warnHtml = p.warnzeichen.length ? `
    <div style="background:#FEF2F2;border:2px solid #FCA5A5;border-radius:12px;padding:16px 18px;margin-bottom:24px;">
      <div style="font-weight:700;font-size:15px;color:#991B1B;margin-bottom:6px;">⚠️ Bitte abklären lassen</div>
      <ul style="margin:0 0 8px;padding-left:18px;font-size:14px;color:#7F1D1D;line-height:1.6;">${p.warnzeichen.map(w => `<li>${w.text}</li>`).join("")}</ul>
      <div style="font-size:13px;color:#7F1D1D;line-height:1.6;">${WARNZEICHEN_EMPFEHLUNG}</div>
    </div>` : p.untersuchungEmpfohlen ? `
    <div style="background:#FFFBEB;border:1px solid #FCD34D;border-radius:12px;padding:14px 16px;margin-bottom:24px;font-size:14px;color:#78350F;line-height:1.6;">
      <strong>👓 Tipp vorab:</strong> ${UNTERSUCHUNG_TEXT}
    </div>` : "";

  const gutHtml = gut.length ? `
    <h3 style="color:#111827;font-size:15px;margin:0 0 10px;">💪 Das läuft gut</h3>
    ${gut.map(b => `<p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 8px;">${BEREICH_TEXTE[b.id].icon} <strong>${b.name}</strong> · ${BEREICH_TEXTE[b.id].positiv}</p>`).join("")}
    <div style="height:16px;"></div>` : "";

  const hinweisHtml = hinweise.length ? `
    <h3 style="color:#111827;font-size:15px;margin:0 0 12px;">👀 Hier lohnt sich ein genauerer Blick</h3>
    ${hinweise.map(b => {
      const s = STUFEN[b.stufe];
      const t = BEREICH_TEXTE[b.id];
      return `
      <div style="border:2px solid ${s.border};border-radius:12px;overflow:hidden;margin-bottom:14px;">
        <div style="background:${s.bg};padding:10px 16px;font-weight:700;font-size:14px;color:${s.text};">${t.icon} ${b.name} · ${s.emoji} ${s.label}</div>
        <div style="background:#fff;padding:14px 16px;font-size:14px;color:#374151;line-height:1.6;">
          <p style="margin:0 0 8px;"><strong>Was aufgefallen ist:</strong> ${t.beobachtet}</p>
          <p style="margin:0 0 8px;"><strong>Im Alltag kann das bedeuten:</strong> ${t.alltag}</p>
          <p style="margin:0;background:#F0F9F8;border-radius:8px;padding:8px 10px;font-size:13px;color:#1F5C57;">ℹ️ ${t.hinweis}</p>
        </div>
      </div>`;
    }).join("")}` : "";

  const ausdauerHtml = p.ausdauerHinweis ? `<p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 20px;"><strong>🧠 Ausdauer:</strong> ${AUSDAUER_TEXT}</p>` : "";

  const zusammenhangHtml = p.zusammenhaenge.length ? `
    <h3 style="color:#111827;font-size:15px;margin:8px 0 10px;">🔎 Erkannte Zusammenhänge</h3>
    ${p.zusammenhaenge.map(z => `<div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:12px 14px;margin-bottom:10px;font-size:14px;color:#1E3A8A;line-height:1.6;"><strong>${z.titel}:</strong> ${z.text}</div>`).join("")}` : "";

  const schwerpunktHtml = schwerpunkt
    ? `<p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 12px;">Dein Schwerpunkt: <strong>${schwerpunkt.name}</strong>. Im Superblick-Kurs gibt es dazu: ${BEREICH_TEXTE[schwerpunkt.id].training}.</p>`
    : `<p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 12px;">Im Augen-Check ist kein Schwerpunkt aufgefallen. Wenn Lesen trotzdem schwerfällt, sprich mit der Lehrkraft oder lass die Augen fachlich untersuchen.</p>`;

  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Dein Augen-Check-Bericht</title></head>
<body style="margin:0;padding:16px;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;">
  <div style="background:#F5943A;padding:26px 32px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:22px;">Dein Augen-Check-Bericht</h1>
    <p style="color:rgba(255,255,255,0.92);margin:6px 0 0;font-size:14px;">VIKI Training · erste Orientierung, keine Diagnose</p>
  </div>
  <div style="padding:28px 32px;">
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">Hallo!<br>Hier ist dein Bericht zum Augen-Check für <strong>${n}</strong>. Danke, dass du dir die Zeit genommen und genau hingeschaut hast.</p>

    ${warnHtml}

    <div style="background:${gesamt.bg};border:2px solid ${gesamt.border};border-radius:14px;padding:20px;text-align:center;margin-bottom:24px;">
      <div style="font-size:40px;line-height:1;margin-bottom:6px;">${gesamt.emoji}</div>
      <div style="font-size:20px;font-weight:800;color:${gesamt.text};">${gesamt.label}</div>
      <div style="font-size:13px;color:#6B7280;margin-top:4px;">${hinweise.length ? `${hinweise.length} von 4 Bereichen mit Hinweisen` : "In allen 4 Bereichen unauffällig"}</div>
    </div>

    ${gutHtml}
    ${hinweisHtml}
    ${ausdauerHtml}
    ${zusammenhangHtml}

    <div style="background:#FEF3E2;border:2px solid #F5943A;border-radius:14px;padding:22px;margin-top:20px;">
      <h3 style="color:#1F2937;font-size:17px;margin:0 0 8px;">Wie es weitergehen kann</h3>
      ${schwerpunktHtml}
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">Der Superblick-Kurs ist spielerisches Visualtraining für zu Hause, mit kurzen Übungen für Augen-Teamarbeit, Blicksprünge, Buchstaben und Bewegungsübungen zur Reflexintegration.</p>
      <div style="text-align:center;"><a href="${kursLink("bericht-mail")}" style="display:inline-block;background:#F5943A;color:#fff;font-weight:700;font-size:15px;padding:13px 28px;border-radius:10px;text-decoration:none;">Kurs ansehen →</a></div>
    </div>

    <p style="color:#374151;font-size:15px;line-height:1.6;margin:24px 0 0;">Liebe Grüße<br>Sarah | Viki Training</p>
  </div>
  <div style="padding:0 32px 24px;">
    <p style="font-size:11px;color:#6B7280;line-height:1.6;margin:0;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:12px 14px;">
      <strong>Wichtig:</strong> Der Augen-Check ist eine erste Orientierung auf Basis deiner Beobachtungen, keine medizinische oder optometrische Diagnose. Er ersetzt keine Untersuchung bei einer Augenärztin, einem Augenarzt oder in der Optometrie.
      Die Ergebnisse werden nur für diesen Bericht verwendet. Fragen oder Widerruf: <a href="mailto:hallo@vikitraining.at" style="color:#6B7280;">hallo@vikitraining.at</a>
    </p>
  </div>
  <div style="background:#F9FAFB;padding:16px 32px;border-top:1px solid #E5E7EB;text-align:center;font-size:12px;color:#9CA3AF;line-height:1.6;">
    Dr. Sarah Kopetzky · Funktionaloptometristin · <a href="https://vikitraining.at" style="color:#9CA3AF;">vikitraining.at</a><br>
    <a href="https://viki-screening.vercel.app/datenschutz" style="color:#9CA3AF;">Datenschutz</a> · <a href="https://viki-screening.vercel.app/impressum" style="color:#9CA3AF;">Impressum</a>
  </div>
</div>
</body></html>`;
}
