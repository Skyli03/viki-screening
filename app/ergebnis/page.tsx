"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { berechneScreeningProfil, type ScreeningProfil } from "@/lib/auswertung";
import type { ScreeningDaten } from "@/lib/screening-types";
import { alsScreeningDaten, anzeigeName, ladeStand } from "@/lib/speicher";
import { useImBrowser } from "@/lib/im-browser";
import {
  AUSDAUER_TEXT, BEREICH_TEXTE, STUFEN, UNTERSUCHUNG_TEXT, WARNZEICHEN_EMPFEHLUNG, kursLink,
} from "@/lib/alltags-texte";

type Versand = "offen" | "laeuft" | "gesendet" | "fehler_versand";

export default function ErgebnisPage() {
  const router = useRouter();
  const imBrowser = useImBrowser();
  const ausgewertet = useMemo<{ daten: ScreeningDaten; profil: ScreeningProfil; kindName: string } | null>(() => {
    if (!imBrowser) return null;
    const stand = ladeStand();
    const d = alsScreeningDaten(stand);
    return d ? { daten: d, profil: berechneScreeningProfil(d), kindName: anzeigeName(stand) } : null;
  }, [imBrowser]);
  const [email, setEmail] = useState("");
  const [einwilligung, setEinwilligung] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [fehler, setFehler] = useState("");
  const [versand, setVersand] = useState<Versand>("offen");

  // Keine (vollständigen) Daten → zurück in den Check, statt ein Beispiel-Ergebnis zu zeigen
  useEffect(() => {
    if (imBrowser && !ausgewertet) router.replace("/screening");
  }, [imBrowser, ausgewertet, router]);

  async function berichtAnfordern() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setFehler("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }
    if (!einwilligung) {
      setFehler("Bitte setz das erste Häkchen, damit wir dir den Bericht schicken dürfen.");
      return;
    }
    setFehler("");
    setVersand("laeuft");
    try {
      const res = await fetch("/api/bericht", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), einwilligung, newsletter, kindName: kindName === "dein Kind" ? "" : kindName, daten }),
      });
      if (res.ok) { setVersand("gesendet"); return; }
      if (res.status === 400 || res.status === 429) {
        const j = await res.json().catch(() => ({}));
        setFehler(j.fehler ?? "Das hat leider nicht geklappt. Bitte versuch es noch einmal.");
        setVersand("offen");
        return;
      }
      setVersand("fehler_versand");
    } catch {
      setVersand("fehler_versand");
    }
  }

  const daten = ausgewertet?.daten ?? null;
  const profil = ausgewertet?.profil ?? null;
  const kindName = ausgewertet?.kindName ?? "dein Kind";

  if (!profil) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Auswertung wird berechnet…</div>;
  }

  const freigeschaltet = versand === "gesendet" || versand === "fehler_versand";
  const gesamt = STUFEN[profil.gesamtStufe];
  const unauffaellig = profil.bereiche.filter(b => b.stufe === 0);
  const hinweise = profil.bereiche.filter(b => b.stufe > 0).sort((a, b) => a.score - b.score);
  const schwerpunktText = profil.schwerpunkt ? BEREICH_TEXTE[profil.schwerpunkt] : null;
  const vonKind = kindName === "dein Kind" ? "deines Kindes" : `von ${kindName}`;

  return (
    <div className="min-h-screen" style={{ background: "#F7F9FA" }}>
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-5 py-4 font-bold text-gray-900">👀 Augen-Check · Dein Ergebnis</div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 space-y-6">
        <div className="rounded-2xl p-6 text-center bg-white" style={{ border: "2px solid #C8E8E4" }}>
          <div className="text-3xl mb-2">❤️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Danke, dass du genau hingeschaut hast!</h2>
          <p className="text-gray-700 leading-relaxed">
            Das Ergebnis ist eine Momentaufnahme, keine Diagnose. Es hilft dir einzuschätzen, was schon gut klappt und wo es sich lohnen kann, genauer hinzuschauen.
          </p>
        </div>

        {/* Warnzeichen haben Vorrang vor allem anderen */}
        {profil.warnzeichen.length > 0 && (
          <div className="rounded-2xl p-5 border-2" style={{ background: "#FEF2F2", borderColor: "#FCA5A5" }}>
            <h3 className="font-bold text-red-900 mb-2">⚠️ Bitte abklären lassen</h3>
            <ul className="space-y-1 text-red-900 mb-3">
              {profil.warnzeichen.map(w => <li key={w.id}>• {w.text}</li>)}
            </ul>
            <p className="text-sm text-red-900">{WARNZEICHEN_EMPFEHLUNG}</p>
          </div>
        )}
        {profil.untersuchungEmpfohlen && profil.warnzeichen.length === 0 && (
          <div className="rounded-2xl p-5 border-2 bg-white" style={{ borderColor: "#FCD34D" }}>
            <h3 className="font-bold text-gray-900 mb-1">👓 Tipp vorab</h3>
            <p className="text-gray-700">{UNTERSUCHUNG_TEXT}</p>
          </div>
        )}

        <div className="rounded-2xl border-2 p-6" style={{ background: gesamt.bg, borderColor: gesamt.border }}>
          <div className="flex items-center gap-4">
            <div className="text-5xl">{gesamt.emoji}</div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: gesamt.text }}>Ergebnis für {kindName}</div>
              <div className="text-xl font-bold" style={{ color: gesamt.text }}>{gesamt.label}</div>
              <div className="text-sm mt-1" style={{ color: gesamt.text }}>
                {hinweise.length === 0
                  ? "In allen 4 Bereichen unauffällig."
                  : `${hinweise.length} von 4 Bereichen mit Hinweisen`}
              </div>
            </div>
          </div>
        </div>

        {unauffaellig.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">💪 Das läuft gut</h3>
            <div className="space-y-2">
              {unauffaellig.map(b => (
                <div key={b.id} className="flex items-start gap-3">
                  <span className="text-xl shrink-0">{BEREICH_TEXTE[b.id].icon}</span>
                  <div><span className="font-semibold text-gray-800">{b.name}</span> <span className="text-gray-600">· {BEREICH_TEXTE[b.id].positiv}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hinweise.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-3">👀 Hier lohnt sich ein genauerer Blick</h3>
            <div className="space-y-4">
              {hinweise.map((b, i) => {
                const stufe = STUFEN[b.stufe];
                const txt = BEREICH_TEXTE[b.id];
                const sichtbar = freigeschaltet || i < 2;
                return (
                  <div key={b.id} className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: stufe.border }}>
                    <div className="flex items-center gap-3 px-5 py-3" style={{ background: stufe.bg }}>
                      <span className="text-2xl">{txt.icon}</span>
                      <div className="flex-1 font-bold" style={{ color: stufe.text }}>{b.name}</div>
                      <span className="text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap" style={{ background: stufe.border, color: stufe.text }}>
                        {stufe.emoji} {stufe.label}
                      </span>
                    </div>
                    {sichtbar ? (
                      <div className="bg-white px-5 py-4 space-y-3 text-gray-700">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">Was aufgefallen ist</div>
                          <p>{txt.beobachtet}</p>
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">Im Alltag kann das bedeuten</div>
                          <p>{txt.alltag}</p>
                        </div>
                        <div className="rounded-xl px-3 py-2 text-sm" style={{ background: "#C8E8E4", color: "#1F5C57" }}>ℹ️ {txt.hinweis}</div>
                      </div>
                    ) : (
                      <div className="bg-white px-5 py-4 text-sm text-gray-500">🔒 Die Erklärung zu diesem Bereich steht im Bericht per E-Mail.</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {profil.ausdauerHinweis && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-1">🧠 Ausdauer</h3>
            <p className="text-gray-700">{AUSDAUER_TEXT}</p>
          </div>
        )}

        {/* E-Mail-Bericht */}
        {!freigeschaltet && (
          <div className="bg-white rounded-2xl border-2 p-6 shadow-lg" style={{ borderColor: "#8DCDC5" }}>
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">📩</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Deinen Bericht per E-Mail bekommen</h3>
              <p className="text-gray-600 leading-relaxed">
                Kostenlos: alle Bereiche mit Erklärung, erkannte Zusammenhänge und konkrete nächste Schritte für {kindName === "dein Kind" ? "dein Kind" : kindName}. So kannst du alles in Ruhe nachlesen.
              </p>
            </div>
            <div className="space-y-3">
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && berichtAnfordern()}
                placeholder="deine@email.at"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-[#8DCDC5]"
              />
              <label className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed cursor-pointer">
                <input type="checkbox" checked={einwilligung} onChange={e => setEinwilligung(e.target.checked)} className="mt-1 h-4 w-4 shrink-0" />
                <span>
                  Ich willige ein, dass VIKI Training mir den Bericht mit den Ergebnissen meines Kindes per E-Mail schickt. Die Ergebnisse werden nur für diesen Bericht verwendet. Mehr in der{" "}
                  <a href="/datenschutz" target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{ color: "#F5943A" }}>Datenschutzerklärung</a>. <span className="text-gray-400">(nötig für den Bericht)</span>
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed cursor-pointer">
                <input type="checkbox" checked={newsletter} onChange={e => setNewsletter(e.target.checked)} className="mt-1 h-4 w-4 shrink-0" />
                <span>
                  Ja, ich möchte außerdem hilfreiche Tipps zu Sehen, Lesen und Lernen sowie Infos zu Angeboten von VIKI Training per E-Mail bekommen. Abmeldung jederzeit möglich. <span className="text-gray-400">(freiwillig)</span>
                </span>
              </label>
              {fehler && <p className="text-red-600 text-sm">{fehler}</p>}
              <button
                onClick={berichtAnfordern}
                disabled={versand === "laeuft"}
                className="w-full text-white font-bold text-lg py-4 rounded-xl shadow-md disabled:opacity-50"
                style={{ background: "#F5943A" }}
              >
                {versand === "laeuft" ? "Wird gesendet…" : "Bericht kostenlos zuschicken →"}
              </button>
              <p className="text-xs text-gray-400 text-center">Kein Spam. Tipps nur, wenn du das zweite Häkchen setzt.</p>
            </div>
            <p className="text-sm text-gray-500 text-center mt-5">
              Du möchtest dich zuerst nur umschauen?{" "}
              <a href={kursLink("ergebnis-ohne-mail")} target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{ color: "#F5943A" }}>Zum Superblick-Kurs</a>
            </p>
          </div>
        )}

        {versand === "gesendet" && (
          <div className="rounded-2xl p-5 border-2 text-center" style={{ background: "#F0FDF4", borderColor: "#86EFAC" }}>
            <p className="font-bold text-green-900 mb-1">✅ Dein Bericht ist unterwegs!</p>
            <p className="text-sm text-green-900">Er kommt in den nächsten Minuten an {email.trim()}. Schau bitte auch im Spam- oder Werbung-Ordner nach.</p>
          </div>
        )}
        {versand === "fehler_versand" && (
          <div className="rounded-2xl p-5 border-2 text-center" style={{ background: "#FFFBEB", borderColor: "#FCD34D" }}>
            <p className="font-bold text-amber-900 mb-1">Die E-Mail konnte gerade nicht verschickt werden.</p>
            <p className="text-sm text-amber-900">Das liegt an uns, nicht an dir. Hier siehst du trotzdem alles. Wenn du den Bericht als E-Mail möchtest, schreib uns gern an hallo@vikitraining.at.</p>
          </div>
        )}

        {freigeschaltet && (
          <>
            {profil.zusammenhaenge.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900">🔎 Erkannte Zusammenhänge</h3>
                {profil.zusammenhaenge.map(z => (
                  <div key={z.titel} className="rounded-xl border-2 p-4 bg-blue-50 border-blue-200">
                    <div className="font-semibold text-blue-900 mb-1">💡 {z.titel}</div>
                    <p className="text-sm text-blue-900">{z.text}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-2xl p-6" style={{ background: "#FEF0E0", border: "2px solid #F5943A" }}>
              {schwerpunktText ? (
                <>
                  <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#C47020" }}>Dein Schwerpunkt</div>
                  <div className="font-bold text-gray-900 text-lg mb-3">{schwerpunktText.icon} {profil.bereiche.find(b => b.id === profil.schwerpunkt)?.name}</div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Im Superblick-Kurs gibt es dazu: <strong>{schwerpunktText.training}</strong>.
                  </p>
                </>
              ) : (
                <>
                  <div className="font-bold text-gray-900 text-lg mb-2">🌟 Kein Schwerpunkt aufgefallen</div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Super! Im Augen-Check gab es keine Hinweise. Wenn Lesen {vonKind} trotzdem schwerfällt, sprich mit der Lehrkraft oder lass die Augen fachlich untersuchen. Der Check kann nicht alles erfassen.
                  </p>
                </>
              )}
              <div className="rounded-2xl p-5 bg-white">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Der Superblick-Kurs</h3>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  Spielerisches Visualtraining für zu Hause, entwickelt von Dr. Sarah Kopetzky, Funktionaloptometristin.
                </p>
                <ul className="space-y-1.5 mb-5 text-sm text-gray-700">
                  <li>✓ Kurze Übungen für Augen-Teamarbeit, Blicksprünge und Buchstaben</li>
                  <li>✓ Bewegungsübungen zur Reflexintegration</li>
                  <li>✓ Schritt für Schritt mit Videos erklärt</li>
                </ul>
                <a href={kursLink("ergebnis")} target="_blank" rel="noopener noreferrer"
                  className="block w-full text-center font-bold text-lg py-4 rounded-xl shadow-lg text-white" style={{ background: "#F5943A" }}>
                  Mehr über den Kurs erfahren →
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">📋 Deine nächsten Schritte</h3>
              <ol className="space-y-2 text-gray-700 list-decimal pl-5">
                {(profil.warnzeichen.length > 0 || profil.untersuchungEmpfohlen) && (
                  <li>Lass die Augen fachlich untersuchen (siehe Hinweis oben).</li>
                )}
                <li>Lies den Bericht in Ruhe und vergleiche ihn mit deinen Beobachtungen im Alltag.</li>
                <li>Wenn du gezielt üben möchtest: Schau dir den Superblick-Kurs an.</li>
              </ol>
            </div>
          </>
        )}

        <div className="mt-8 text-center text-xs text-gray-500 space-y-1">
          <p>Der Augen-Check ist eine erste Orientierung, keine Diagnose. Er ersetzt keine Untersuchung bei einer Augenärztin, einem Augenarzt oder in der Optometrie.</p>
          <p>
            <Link href="/" className="hover:underline">Neuen Check starten</Link>{" · "}
            <a href="/impressum" className="hover:underline">Impressum</a>{" · "}
            <a href="/datenschutz" className="hover:underline">Datenschutz</a>
          </p>
        </div>
      </main>
    </div>
  );
}
