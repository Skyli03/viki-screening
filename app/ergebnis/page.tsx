"use client";
import { useEffect, useState } from "react";
import { berechneScreeningProfil } from "@/lib/auswertung";
import { sendeEmailAnSystemeio } from "@/lib/systemeio";
import type { ScreeningProfil } from "@/lib/auswertung";
import type { TrackingErgebnis, ZeilenAnalyse } from "@/lib/eyetracking";
import type { VisuellTestErgebnis } from "@/lib/auswertung";
import type { FragebogenAntworten } from "@/data/fragebogen";
import { FRAGEN } from "@/data/fragebogen";
import SakkadenVisualisierung from "@/components/SakkadenVisualisierung";

const AMPEL_FARBEN = {
  gruen: { bg: "bg-green-100", border: "border-green-400", text: "text-green-800", dot: "bg-green-500", label: "Unauffällig" },
  gelb:  { bg: "bg-yellow-100", border: "border-yellow-400", text: "text-yellow-800", dot: "bg-yellow-400", label: "Auffällig" },
  rot:   { bg: "bg-red-100",    border: "border-red-400",    text: "text-red-800",    dot: "bg-red-500",    label: "Förderbedarf" },
};

// ── VIKI-Typ Texte ──────────────────────────────────────────────────────────

const TYP_DATEN: Record<string, {
  warum: string;
  symptome: string[];
  mechanismus: string;
  training: string;
  icon: string;
}> = {
  A: {
    icon: "👁️",
    warum: "Augensteuerung & Lesefluss",
    symptome: [
      "Verliert die Zeile beim Lesen und muss mit dem Finger nachfahren",
      "Liest langsam, obwohl es die Buchstaben eigentlich kennt",
      "Hausaufgaben dauern 3× so lang wie bei anderen Kindern",
    ],
    mechanismus:
      "Die Augen können nicht flüssig von Wort zu Wort springen. Statt gezielter Sakkaden macht das Gehirn viele kleine Korrekturbewegungen — das kostet enorm viel Energie und Konzentration.",
    training: "Augensprünge, Lesefluss-Training, visuelle Spurfolge-Übungen",
  },
  B: {
    icon: "🎯",
    warum: "Fokus & visuelle Verarbeitung",
    symptome: [
      "Buchstaben und Zahlen werden vertauscht (b/d, p/q, 6/9)",
      "Kind klagt über verschwommene Schrift oder müde Augen beim Lesen",
      "Das Kind blinzelt häufig oder reibt sich die Augen beim Lesen",
    ],
    mechanismus:
      "Das visuelle System verarbeitet Buchstaben und deren Position im Raum unzuverlässig. Das Gehirn \"rät\" statt wirklich zu lesen — was zu Fehlern und raschem Ermüden führt.",
    training: "Visuelle Diskrimination, Figur-Hintergrund, Raumlage-Übungen",
  },
  C: {
    icon: "🔄",
    warum: "Frühkindliche Reflexe & Körpersteuerung",
    symptome: [
      "Sitzt auffällig schief oder verdreht beim Schreiben",
      "Vermeidet Lesen und findet immer Ausreden",
      "Konzentration bricht nach wenigen Minuten ein",
    ],
    mechanismus:
      "Nicht vollständig integrierte Frühreflexe (z. B. ATNR, MORO) stören die Augen-Körper-Koordination. Das Kind muss unbewusst so viel Energie für Körperkontrolle aufwenden, dass wenig für das Lernen bleibt.",
    training: "Reflexintegration, Körper-Augen-Koordination, MORO/ATNR-Sequenzen",
  },
  D: {
    icon: "🧠",
    warum: "Kombinierte visuelle & neuronale Verarbeitung",
    symptome: [
      "In der Schule \"nicht dabei\", obwohl es zuhause alles versteht",
      "Kann nicht vorlesen, aber versteht alles wenn man vorliest",
      "Hausaufgaben: ewige Kämpfe, Tränen, kein Ende",
    ],
    mechanismus:
      "Mehrere visuelle Teilsysteme arbeiten nicht optimal zusammen: Augensteuerung, Verarbeitung und frühkindliche Reflexmuster. Das addiert sich — und das Kind wirkt \"unaufmerksam\" oder \"faul\", obwohl es das Gegenteil ist.",
    training: "Ganzheitliches Augen-Hirn-Training, Reflexintegration, visuelles Gedächtnis",
  },
};

// ── Testimonials ────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: "Sabine K.",
    details: "Mama von Lukas, 9 Jahre, 3. Klasse",
    text: "Nach dem VIKI-Training hat Lukas zum ersten Mal selbst ein Buch vom Regal geholt. Die Hausaufgaben dauern jetzt halb so lang — ganz ohne Streit.",
    vorher: "\"Es kann es ja eigentlich, aber es will einfach nicht lesen.\"",
  },
  {
    name: "Thomas M.",
    details: "Papa von Emma, 8 Jahre, 2. Klasse",
    text: "Wir haben schon so viel ausprobiert — Kinderarzt, Legasthenietraining, alles Mögliche. Aber an die Augen hat niemand gedacht. Jetzt geht vieles viel leichter für Emma.",
    vorher: "\"Wir waren schon beim dritten Spezialisten und niemand konnte uns wirklich helfen.\"",
  },
  {
    name: "Maria L.",
    details: "Mama von Noah, 10 Jahre, 4. Klasse",
    text: "Noah sagt jetzt selbst: 'Mama, Lesen geht jetzt leichter!' — Das hat er noch nie gesagt. Die Lehrerin hat gefragt, was wir anders machen.",
    vorher: "\"Es ist eigentlich schlau, aber in der Schule kommt es einfach nicht mit.\"",
  },
];

export default function ErgebnisPage() {
  const [profil, setProfil] = useState<ScreeningProfil | null>(null);
  const [kindName, setKindName] = useState("dein Kind");
  const [geschlecht, setGeschlecht] = useState<"m" | "f" | "">("") ;
  const [auffaelligeFragen, setAuffaelligeFragen] = useState<string[]>([]);
  const [emailFreigegeben, setEmailFreigegeben] = useState(false);
  const [email, setEmail] = useState("");
  const [emailFehler, setEmailFehler] = useState("");
  const [laden, setLaden] = useState(false);
  const [emailGesendet, setEmailGesendet] = useState(false);
  const [sakkadenDaten, setSakkadenDaten] = useState<{
    zeilenAnalyse: ZeilenAnalyse[];
    ruecksprueungeProZeile: number;
    verfuegbar: boolean;
  }>({ zeilenAnalyse: [], ruecksprueungeProZeile: 0, verfuegbar: false });

  useEffect(() => {
    const name = sessionStorage.getItem("kindName") ?? "dein Kind";
    const g = sessionStorage.getItem("geschlecht") ?? "";
    setGeschlecht(g as "m" | "f" | "");
    const klasse = Number(sessionStorage.getItem("klasse") ?? "2");
    const lesetest = JSON.parse(sessionStorage.getItem("lesetest") ?? "null") as TrackingErgebnis | null;
    const visuell = JSON.parse(sessionStorage.getItem("visuell") ?? "null") as VisuellTestErgebnis | null;
    const fragebogen = JSON.parse(sessionStorage.getItem("fragebogen") ?? "null") as FragebogenAntworten | null;

    setKindName(name);

    if (lesetest) {
      setSakkadenDaten({
        zeilenAnalyse: lesetest.zeilenAnalyse ?? [],
        ruecksprueungeProZeile: lesetest.ruecksprueungeProZeile ?? 0,
        verfuegbar: (lesetest.rohdaten?.length ?? 0) >= 10,
      });
    }

    if (fragebogen) {
      // Auffällige Fragen (Oft/Immer = 2/3) für personalisierte Bullet-Points
      const auffaellig = FRAGEN
        .filter(f => (fragebogen[f.id] ?? 0) >= 2)
        .map(f => f.text.replace(/^Mein Kind /, ""))
        .slice(0, 4); // max 4 Punkte
      setAuffaelligeFragen(auffaellig);
    }

    if (lesetest && visuell && fragebogen) {
      setProfil(berechneScreeningProfil(lesetest, visuell, fragebogen, klasse));
    } else {
      const demoLesetest: TrackingErgebnis = {
        ruecksprueungeProZeile: 2.1, vorwaertssprueungeProZeile: 4.2,
        lesegeschwindigkeitWPM: 82, blinzelrateProMinute: 8,
        lesetempoRuhig: false, zeilenverluste: 2, rohdaten: [], zeilenAnalyse: [],
      };
      const demoVisuell: VisuellTestErgebnis = {
        fixation: { reaktionszeit: 650, genauigkeit: 0.8 },
        sakkaden: { timing: 420, konsistenz: 0.65 },
        smoothPursuit: { abweichung: 55 },
        diskrimination: { fehlerrate: 0.2, geschwindigkeit: 2200 },
        lrs: { verwechslungen: 3, reaktionszeit: 890 },
        peripher: { reaktionszeit: 950, trefferquote: 0.75 },
      };
      const demoFragebogen: FragebogenAntworten = {
        l1: 2, l2: 2, l3: 1, l4: 2, l5: 1, l6: 2, l7: 1, l8: 1, l9: 2, l10: 1,
        k1: 2, k2: 1, k3: 1, k4: 2, k5: 1, k6: 2, k7: 0, k8: 1,
        r1: 1, r2: 0, r3: 2, r4: 1, r5: 1, r6: 2, r7: 0, r8: 1,
      };
      setProfil(berechneScreeningProfil(demoLesetest, demoVisuell, demoFragebogen, 2));
    }
  }, []);

  async function emailAbschicken() {
    if (!email.includes("@") || !email.includes(".")) {
      setEmailFehler("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }
    setEmailFehler("");
    setLaden(true);
    await sendeEmailAnSystemeio(email, kindName, `VIKI-Typ ${profil?.typ ?? "D"}`);
    setEmailGesendet(true);
    setEmailFreigegeben(true);
    setLaden(false);
  }

  if (!profil) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-5xl mb-4">⏳</div>
          <p className="font-semibold">Auswertung wird berechnet…</p>
        </div>
      </div>
    );
  }

  const gesamtAmpel = profil.gesamtScore >= 71 ? "gruen" : profil.gesamtScore >= 41 ? "gelb" : "rot";
  const gesamtFarbe = AMPEL_FARBEN[gesamtAmpel];
  const typDaten = TYP_DATEN[profil.typ] ?? TYP_DATEN.D;

  const isBub = geschlecht === "m";
  const isMaedchen = geschlecht === "f";
  const erSubj = isBub ? "Er" : isMaedchen ? "Sie" : "Es";
  const subj   = isBub ? "er"  : isMaedchen ? "sie"  : "es";
  const poss   = isBub ? "sein" : isMaedchen ? "ihr"  : "sein";
  const nameOderKind = kindName !== "dein Kind" ? kindName : "Dein Kind";
  const kindGenitivOderDein = kindName !== "dein Kind" ? `von ${kindName}` : "deines Kindes";

  const hatAuffaelligkeiten = profil.auffaelligkeitenAnzahl >= 2;

  return (
    <div className="min-h-screen" style={{ background: "#F7F9FA" }}>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-2">
          <span className="text-2xl">🦸</span>
          <span className="font-bold text-gray-900">VIKI Superblick — Screening-Ergebnis</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 space-y-6">

        {/* ── 1. EMPATHIE-HOOK ────────────────────────────────────────────── */}
        <div className="rounded-2xl p-6" style={{ background: "#FEF3E2", border: "2px solid #F5943A" }}>
          <p className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: "#C47020" }}>
            Kennst du das?
          </p>
          <blockquote className="text-lg font-medium text-gray-900 leading-relaxed italic">
            „Eigentlich ist mein Kind ja schlau — aber Hausaufgaben dauern ewig, die Konzentration hält nicht lange und Lesen klappt einfach nicht so wie bei anderen Kindern.
            Wenn ich vorlese, versteht es alles."
          </blockquote>
          <p className="mt-3 text-sm text-gray-600">
            Wenn dir das bekannt vorkommt: Du bist nicht allein. Und es liegt nicht am Willen {kindGenitivOderDein}.
          </p>
        </div>

        {/* ── 2. ERGEBNIS-KARTE ───────────────────────────────────────────── */}
        <div className={`rounded-2xl border-2 p-6 ${gesamtFarbe.bg} ${gesamtFarbe.border}`}>
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg ${gesamtFarbe.dot}`}
            >
              {profil.gesamtScore}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${gesamtFarbe.bg} ${gesamtFarbe.text}`}>
                  {gesamtFarbe.label}
                </span>
                <span className="text-xs text-gray-500">Gesamt-Score</span>
              </div>
              <h2 className={`text-xl font-bold ${gesamtFarbe.text}`}>
                {profil.auffaelligkeitenAnzahl} von 6 Bereichen mit Auffälligkeiten
              </h2>
              <p className={`text-sm mt-1 font-medium ${gesamtFarbe.text}`}>
                {typDaten.icon} Schwerpunkt: <strong>{typDaten.warum}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. WARUM — Mechanismus ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
            Warum kämpft {kindName !== "dein Kind" ? kindName : "dein Kind"} gerade?
          </p>

          {/* Symptome — personalisiert aus Fragebogen wenn vorhanden, sonst generisch */}
          <div className="space-y-2 mb-4">
            {(auffaelligeFragen.length > 0 ? auffaelligeFragen : typDaten.symptome).map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-orange-400 mt-0.5 flex-shrink-0">✓</span>
                <span>{s}</span>
              </div>
            ))}
          </div>

          {/* Mechanismus */}
          <div className="rounded-xl p-4 text-sm text-gray-700 leading-relaxed" style={{ background: "#F0F9F8" }}>
            <span className="font-semibold" style={{ color: "#2D7A73" }}>Der Grund:</span>{" "}
            {typDaten.mechanismus}
          </div>

          {hatAuffaelligkeiten && (
            <div className="mt-4 rounded-xl p-4 text-sm" style={{ background: "#FEF3E2" }}>
              <p className="font-semibold mb-2" style={{ color: "#C47020" }}>📊 Das betrifft mehr Kinder als du denkst:</p>
              <ul className="space-y-2 text-gray-700">
                <li>• Bei <strong>1 von 8 Kindern</strong> besteht eine <strong>Konvergenzinsuffizienz</strong> — das bedeutet: die Augen können beim Nahsehen (Lesen, Heft) nicht richtig zusammenarbeiten. Buchstaben verschwimmen oder verdoppeln sich. Wird oft jahrelang nicht erkannt.</li>
                <li>• <strong>Sakkadenprobleme</strong> heißt: die schnellen Sprünge der Augen von Wort zu Wort funktionieren nicht präzise. Das verlangsamt nicht nur das Lesen, sondern auch den <strong>Tafel-Heft-Blick</strong> — also das Abschreiben von der Tafel ins Heft. Kinder brauchen dafür bis zu <strong>50 % länger</strong> als Gleichaltrige.</li>
                <li>• Beides wird häufig als <strong>Konzentrationsschwäche oder Faulheit</strong> fehlgedeutet.</li>
              </ul>
            </div>
          )}
        </div>

        {/* ── 4. ERSTE 2 KATEGORIEN (immer sichtbar) ─────────────────────── */}
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-3">Auswertung — 6 Bereiche</h3>
          <div className="space-y-3">
            {profil.kategorien.map((kat, i) => {
              const farbe = AMPEL_FARBEN[kat.ampel];
              const istSichtbar = emailFreigegeben || i < 2;
              return (
                <div
                  key={kat.name}
                  className={`rounded-xl border-2 p-4 transition-all ${farbe.bg} ${farbe.border} ${!istSichtbar ? "blur-sm select-none pointer-events-none" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{kat.icon}</span>
                      <div>
                        <div className={`font-semibold text-sm ${farbe.text}`}>{kat.name}</div>
                        <div className="text-xs text-gray-500">{kat.beschreibung}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`font-bold text-lg ${farbe.text}`}>{kat.score}/100</div>
                      <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${farbe.bg} ${farbe.text}`}>
                        {farbe.label}
                      </div>
                    </div>
                  </div>
                  {istSichtbar && (
                    <>
                      <p className={`text-sm mt-3 ${farbe.text}`}>{kat.elternText}</p>
                      {i === 0 && (
                        <SakkadenVisualisierung
                          zeilenAnalyse={sakkadenDaten.zeilenAnalyse}
                          ruecksprueungeProZeile={sakkadenDaten.ruecksprueungeProZeile}
                          verfuegbar={sakkadenDaten.verfuegbar}
                        />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 5. BLINZELVERHALTEN — nur zeigen wenn gemessen ───────────────── */}
        {profil.blinzelinfo.wertProMinute > 0 && (() => {
          const b = profil.blinzelinfo;
          const farbe = AMPEL_FARBEN[b.ampel];
          return (
            <div className={`rounded-xl border-2 p-4 ${farbe.bg} ${farbe.border}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👁️</span>
                  <div>
                    <div className={`font-semibold text-sm ${farbe.text}`}>Blinzelverhalten</div>
                    <div className="text-xs text-gray-500">Entspannung der Augen beim Lesen</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-lg ${farbe.text}`}>{Math.round(b.wertProMinute)}<span className="text-sm font-normal">/min</span></div>
                  <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${farbe.bg} ${farbe.text}`}>
                    {b.label}
                  </div>
                </div>
              </div>
              <p className={`text-sm ${farbe.text}`}>{b.elternText}</p>
            </div>
          );
        })()}

        {/* ── 5b. BLINZELN AM PC — universeller Hinweis ───────────────────── */}
        <div className="rounded-xl border p-4" style={{ background: "#FFF7ED", borderColor: "#FED7AA" }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">👁️</span>
            <div>
              <p className="font-semibold text-sm mb-1" style={{ color: "#92400E" }}>
                Blinzelverhalten am Bildschirm
              </p>
              <p className="text-sm" style={{ color: "#78350F" }}>
                Kinder blinzeln vor dem Bildschirm bis zu <strong>60 % weniger</strong> als normal. Das trocknet die Augen aus und verstärkt Konzentrationsprobleme — unabhängig von anderen Sehproblemen. Ein gutes Zeichen: kurze <strong>Pausen alle 20 Minuten</strong> (20 Sekunden in die Ferne schauen) reduzieren die Augenbelastung deutlich.
              </p>
            </div>
          </div>
        </div>

        {/* ── 6. EMAIL-GATE ───────────────────────────────────────────────── */}
        {!emailFreigegeben && (
          <div className="bg-white rounded-2xl border-2 p-6 shadow-lg" style={{ borderColor: "#8DCDC5" }}>
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">🔓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Alle 6 Bereiche + persönliche Empfehlungen freischalten
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Du erhältst den <strong>vollständigen Bericht</strong> für {kindName !== "dein Kind" ? kindName : "dein Kind"} kostenlos per E-Mail —
                inklusive konkreter Übungsempfehlungen passend zum erkannten Schwerpunkt.
              </p>
            </div>
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && emailAbschicken()}
                placeholder="deine@email.at"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:outline-none"
                style={{ borderColor: "#D1D5DB" }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#8DCDC5"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#D1D5DB"}
              />
              {emailFehler && <p className="text-red-500 text-sm">{emailFehler}</p>}
              <button
                onClick={emailAbschicken}
                disabled={laden}
                className="w-full text-white font-bold text-lg py-4 rounded-xl transition-all shadow-md disabled:opacity-50 hover:opacity-90"
                style={{ background: "#F5943A" }}
              >
                {laden ? "Wird gesendet…" : `Vollständigen Bericht für ${kindName !== "dein Kind" ? kindName : "dein Kind"} erhalten →`}
              </button>
              <p className="text-xs text-gray-400 text-center">
                Kein Spam. Nur der Bericht und hilfreiche Tipps. Jederzeit abmeldbar.
              </p>
            </div>
          </div>
        )}

        {/* ── 7. NACH EMAIL-FREISCHALTUNG ─────────────────────────────────── */}
        {emailFreigegeben && (
          <>
            {/* Muster-Hinweise */}
            {profil.musterHinweise.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-gray-900">🔎 Erkannte Muster</h3>
                {profil.musterHinweise.map((m, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border-2 p-4 ${m.staerke === "stark" ? "bg-red-50 border-red-300" : "bg-orange-50 border-orange-200"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{m.staerke === "stark" ? "⚠️" : "💡"}</span>
                      <span className={`font-semibold text-sm ${m.staerke === "stark" ? "text-red-800" : "text-orange-800"}`}>
                        {m.titel}
                      </span>
                    </div>
                    <p className={`text-sm ${m.staerke === "stark" ? "text-red-700" : "text-orange-700"}`}>
                      {m.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Was passiert ohne Training */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Was passiert, wenn man nichts tut?</h3>
              <div className="space-y-3">
                {[
                  { icon: "📚", text: `Der Rückstand in der Schule wächst — nicht weil ${nameOderKind} weniger kann, sondern weil ${subj} langsamer liest als alle anderen.` },
                  { icon: "😔", text: `${erSubj} beginnt zu glauben, ${subj} sei „nicht so klug" — das Selbstbild leidet dauerhaft.` },
                  { icon: "⏰", text: "Hausaufgaben bleiben ein täglicher Stressfaktor — für das Kind und für die ganze Familie." },
                  { icon: "📒", text: "Auch Nachhilfe und Förderung greifen nur begrenzt — wenn die visuelle Grundlage fehlt, kann das Gehirn den Lernstoff nicht effizient aufnehmen. Die Ursache bleibt ungelöst." },
                  { icon: "🔁", text: "Visuell bedingte Lernschwierigkeiten lösen sich nicht von selbst. Das Gehirn braucht gezieltes Training." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <span className="leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* VIKI-Typ + Training */}
            <div className="rounded-2xl p-6" style={{ background: "#FEF0E0", border: "2px solid #F5943A" }}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: "#F5943A" }}
                >
                  {typDaten.icon}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "#C47020" }}>
                    Dein Screening-Schwerpunkt
                  </div>
                  <div className="font-bold text-gray-900">{typDaten.warum}</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Im VIKI-Kurs gibt es spezielle Inhalte und Übungen genau für diesen Schwerpunkt:
              </p>
              <div className="rounded-xl p-4 text-sm text-gray-800 font-medium" style={{ background: "white" }}>
                🎯 {typDaten.training}
              </div>
            </div>

            {/* Warteliste CTA */}
            <div className="rounded-2xl p-6 text-center" style={{ background: "#FEF3E2", border: "2px solid #F5943A" }}>
              <div className="inline-block text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-3" style={{ background: "#F5943A", color: "white" }}>
                🚀 Startet bald
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Der VIKI Superblick Kurs
              </h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Gezieltes Augentraining für zuhause — speziell für Kinder wie {kindName !== "dein Kind" ? kindName : "dein Kind"}. Entwickelt von Dr. Sarah Kopetzky, Funktionaloptometristin.
              </p>
              <div className="space-y-2 mb-5 text-left max-w-xs mx-auto">
                {[
                  "Flüssigeres Lesen & besseres Leseverständnis",
                  "Abschreiben von der Tafel — schneller, ohne Zeilenverlust",
                  "Mehr Ausdauer und Konzentration beim Lernen",
                  "Entspanntere Hausaufgaben-Situation",
                ].map((v, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="font-bold" style={{ color: "#F5943A" }}>✓</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
              <a
                href="https://kurse.vikitraining.at/warteliste"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full font-bold text-lg py-4 rounded-xl shadow-lg transition-all hover:opacity-90 hover:scale-105"
                style={{ background: "#F5943A", color: "white" }}
              >
                Unverbindlich auf die Warteliste →
              </a>
              <p className="text-xs text-gray-500 mt-3">
                Kostenlos · Unverbindlich · Frühbucher-Bonus inklusive
              </p>
            </div>

            {/* Testimonials */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4">Was andere Eltern sagen</h3>
              <div className="space-y-4">
                {TESTIMONIALS.map((t, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-sm text-gray-800 leading-relaxed mb-3">
                      {t.text}
                    </p>
                    <div className="text-xs text-gray-500 font-semibold">
                      — {t.name} · {t.details}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center mt-3 italic">
                * Namen geändert. Erfahrungen von Kursteilnehmerinnen und -teilnehmern.
              </p>
            </div>

            {/* Nächste Schritte */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Deine nächsten Schritte</h3>
              <ol className="space-y-4">
                {[
                  {
                    color: "#8DCDC5",
                    text: "Du hast den vollständigen Screening-Bericht per E-Mail erhalten — lies ihn in Ruhe durch und teile ihn mit der Lehrerin.",
                  },
                  {
                    color: "#F5943A",
                    text: `Trag dich unverbindlich auf die Warteliste für den VIKI Superblick Kurs ein — und sichere dir den Frühbucher-Bonus.`,
                  },
                  {
                    color: "#EE6B85",
                    text: "Schon wenige Minuten Training täglich machen einen Unterschied. Viele Eltern merken erste Verbesserungen nach kurzer Zeit.",
                  },
                ].map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-700">
                    <span
                      className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5"
                      style={{ background: s.color }}
                    >
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{s.text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Final CTA */}
            <div className="text-center pb-4">
              <a
                href="https://kurse.vikitraining.at/warteliste"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full font-bold text-lg py-4 rounded-xl shadow-lg transition-all hover:opacity-90"
                style={{ background: "#F5943A", color: "white" }}
              >
                Jetzt auf die Warteliste → 🚀
              </a>
              <p className="text-xs text-gray-500 mt-2">
                Kostenlos · Unverbindlich · Frühbucher-Bonus inklusive
              </p>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
