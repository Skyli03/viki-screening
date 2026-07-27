"use client";
import { useEffect, useState } from "react";
import { berechneScreeningProfil } from "@/lib/auswertung";
import type { ScreeningProfil } from "@/lib/auswertung";
import type { ScreeningDaten, Antwort } from "@/lib/screening-types";
import { ALLTAGS_TEXTE } from "@/lib/alltags-texte";

// 4-level Ampel — keine Zahlen für Eltern sichtbar
function getAmpelLevel(score: number): 0 | 1 | 2 | 3 {
  if (score >= 71) return 0;
  if (score >= 56) return 1;
  if (score >= 41) return 2;
  return 3;
}

const STUFEN = [
  { emoji: "🟢", label: "Unauffällig",       bg: "#F0FDF4", border: "#86EFAC", text: "#166534" },
  { emoji: "🟡", label: "Leichte Hinweise",  bg: "#FEFCE8", border: "#FDE047", text: "#854D0E" },
  { emoji: "🟠", label: "Deutliche Hinweise",bg: "#FFF7ED", border: "#FDBA74", text: "#9A3412" },
  { emoji: "🔴", label: "Starke Hinweise",   bg: "#FEF2F2", border: "#FCA5A5", text: "#991B1B" },
];


const TYP_DATEN: Record<string, { icon: string; warum: string; training: string }> = {
  A: { icon: "👁️", warum: "Lesefluss & Augenbewegungen",                     training: "Augensprünge, Lesefluss-Training, visuelle Spurfolge-Übungen" },
  B: { icon: "🎯", warum: "Fokus & Augensteuerung",                           training: "Konvergenztraining, Fixation, Stift-Folgeübungen" },
  C: { icon: "🔄", warum: "Frühkindliche Reflexe & Körpersteuerung",          training: "Reflexintegration, Körper-Augen-Koordination, Reflex-Sequenzen (MORO, ATNR, STNR, TLR)" },
  D: { icon: "🧠", warum: "Kombinierte visuelle & neuronale Verarbeitung",    training: "Ganzheitliches Augen-Hirn-Training, Reflexintegration, visuelles Gedächtnis" },
};

function demoScreeningDaten(): ScreeningDaten {
  return {
    konvergenz: { beideAugen: "leicht_auffaellig", zeichen: ["schaut_weg"] },
    buchLese: {
      verliert_zeile: true, ueberspringt_woerter: false, benutzt_finger: true,
      viele_fehler_bekannte_woerter: false, fluessig: false,
      leseabstand: "zu_nah", kopfhaltung: "gerade", monokular: "gleich",
    },
    pcLese: {
      lesezeitSekunden: 65, lesequalitaet: ["holprig"],
      fehlerAnzahl: 2, blinzeln: "selten", pc_leichter: null,
    },
    fixation: { qualitaet: "leicht_unruhig" },
    sakkaden: { praezision: "ueberschiesst", kopf_mitbewegt: false },
    stiftReise: { folgt: "ruckelig_mit_pausen", kopf_mitbewegt: false, konvergenz_nahfern: "nicht_getestet" },
    miniTests: {
      buchstaben: { verwechslungen: 3, reaktionszeit: 2200 },
      formen: { fehlerrate: 0.2, geschwindigkeit: 2000 },
      merkspanne: { fehlerrate: 0.25, reaktionszeit: 2800 },
    },
    fragebogen: {
      l1: 2, l2: 1, l3: 2, l4: 1, l5: 2, l6: 1, l7: 1, l8: 2, l9: 1, l10: 1,
      k1: 1, k2: 2, k3: 1, k4: 1, k5: 0, k6: 1, k7: 1, k8: 0,
      r1: 1, r2: 0, r3: 1, r4: 1, r5: 1, r6: 1, r7: 0, r8: 1,
    } as Record<string, Antwort>,
    klasse: 2,
  };
}

export default function ErgebnisPage() {
  const [profil, setProfil] = useState<ScreeningProfil | null>(null);
  const [kindName, setKindName] = useState("dein Kind");
  const [emailFreigegeben, setEmailFreigegeben] = useState(false);
  const [email, setEmail] = useState("");
  const [emailFehler, setEmailFehler] = useState("");
  const [laden, setLaden] = useState(false);
  const [emailGesendet, setEmailGesendet] = useState(false);

  useEffect(() => {
    const name = sessionStorage.getItem("kindName") ?? "dein Kind";
    const klasse = Number(sessionStorage.getItem("klasse") ?? "2");
    setKindName(name);

    const rohdaten = sessionStorage.getItem("screening_daten");
    const daten: ScreeningDaten = rohdaten ? JSON.parse(rohdaten) : demoScreeningDaten();
    setProfil(berechneScreeningProfil(daten, daten.klasse ?? klasse));
  }, []);

  async function emailAbschicken() {
    if (!email.includes("@") || !email.includes(".")) {
      setEmailFehler("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }
    setEmailFehler("");
    setLaden(true);
    try {
      await fetch("/api/bericht", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          kindName,
          vikiTyp: profil?.typ ?? "D",
          gesamtScore: profil?.gesamtScore ?? 0,
          auffaelligkeiten: profil?.auffaelligkeitenAnzahl ?? 0,
          kategorien: profil?.kategorien.map(k => ({
            name: k.name,
            ampel: k.ampel,
            elternText: k.elternText,
          })) ?? [],
          musterHinweise: profil?.musterHinweise ?? [],
          blinzelinfo: profil?.blinzelinfo,
        }),
      });
    } catch (e) {
      console.error("Bericht-API Fehler:", e);
    }
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

  const gesamtLevel = getAmpelLevel(profil.gesamtScore);
  const gesamtStufe = STUFEN[gesamtLevel];
  const typDaten = TYP_DATEN[profil.typ] ?? TYP_DATEN.D;

  const staerken = profil.kategorien.filter(k => k.ampel === "gruen");
  const hinweise = profil.kategorien.filter(k => k.ampel !== "gruen");
  const kindNameAngezeigt = kindName !== "dein Kind" ? kindName : "dein Kind";

  return (
    <div className="min-h-screen" style={{ background: "#F7F9FA" }}>
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-2">
          <span className="text-2xl">🦸</span>
          <span className="font-bold text-gray-900">VIKI Superblick — Screening-Ergebnis</span>
        </div>
        <div className="max-w-2xl mx-auto px-5 pb-2 text-xs text-gray-400 flex items-center gap-1">
          <span>🔒</span>
          <span>Deine Testergebnisse werden nicht auf unseren Servern gespeichert.</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 space-y-6">

        {/* Prominenter Disclaimer */}
        <div className="rounded-xl px-4 py-3 text-sm flex items-start gap-3" style={{ background: "#C8E8E4", border: "1px solid #8DCDC5", color: "#1F5C57" }}>
          <span className="text-lg shrink-0">ℹ️</span>
          <div>
            <span className="font-semibold">Eltern-Screening — kein medizinisches Diagnoseinstrument.</span>{" "}
            Dieses Screening gibt Hinweise auf mögliche visuelle Auffälligkeiten und ersetzt keine augenärztliche oder optometrische Diagnose. Bei Fragen wende dich an eine Fachperson.
          </div>
        </div>

        {/* Empathie-Hook */}
        <div className="rounded-2xl p-6" style={{ background: "#FEF3E2", border: "2px solid #F5943A" }}>
          <p className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: "#C47020" }}>Kennst du das?</p>
          <blockquote className="text-lg font-medium text-gray-900 leading-relaxed italic">
            „Eigentlich ist mein Kind ja schlau — aber Hausaufgaben dauern ewig, die Konzentration hält nicht lange und Lesen klappt einfach nicht so wie bei anderen Kindern."
          </blockquote>
          <p className="mt-3 text-sm text-gray-600">
            Wenn dir das bekannt vorkommt: Du bist nicht allein. Und es liegt nicht am Willen {kindName !== "dein Kind" ? `von ${kindName}` : "deines Kindes"}.
          </p>
        </div>

        {/* Ergebnis-Übersicht (ohne Zahlen) */}
        <div className="rounded-2xl border-2 p-6" style={{ background: gesamtStufe.bg, borderColor: gesamtStufe.border }}>
          <div className="flex items-center gap-4">
            <div className="text-5xl">{gesamtStufe.emoji}</div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: gesamtStufe.text }}>
                Screening-Ergebnis für {kindNameAngezeigt}
              </div>
              <div className="text-xl font-bold" style={{ color: gesamtStufe.text }}>
                {gesamtStufe.label}
              </div>
              <div className="text-sm mt-1" style={{ color: gesamtStufe.text }}>
                {hinweise.length === 0
                  ? "Alle Bereiche unauffällig — gut gemacht!"
                  : `${hinweise.length} Bereich${hinweise.length > 1 ? "e" : ""} mit Hinweisen · ${staerken.length} unauffällig`}
              </div>
            </div>
          </div>
        </div>

        {/* Stärken */}
        {staerken.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>💪</span> Das läuft gut
            </h3>
            <div className="space-y-2">
              {staerken.map(kat => {
                const txt = ALLTAGS_TEXTE[kat.name];
                return (
                  <div key={kat.name} className="flex items-start gap-3 text-sm">
                    <span className="text-xl shrink-0">{kat.icon}</span>
                    <div>
                      <span className="font-semibold text-gray-800">{kat.name}</span>
                      {txt && <span className="text-gray-500"> — {txt.positiv}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hinweise-Kategorien */}
        {hinweise.length > 0 && (
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>👀</span> Hinweise aufgefallen
            </h3>
            <div className="space-y-4">
              {hinweise.map((kat, i) => {
                const level = getAmpelLevel(kat.score);
                const stufe = STUFEN[level];
                const txt = ALLTAGS_TEXTE[kat.name];
                const istSichtbar = emailFreigegeben || i < 2;

                return (
                  <div
                    key={kat.name}
                    className={`rounded-2xl border-2 overflow-hidden transition-all ${!istSichtbar ? "blur-sm select-none pointer-events-none" : ""}`}
                    style={{ borderColor: stufe.border }}
                  >
                    {/* Kategorie-Header */}
                    <div className="flex items-center gap-3 px-5 py-3" style={{ background: stufe.bg }}>
                      <span className="text-2xl">{kat.icon}</span>
                      <div className="flex-1">
                        <div className="font-bold text-sm" style={{ color: stufe.text }}>{kat.name}</div>
                        {txt && <div className="text-xs text-gray-500">{txt.fachtitel}</div>}
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: stufe.border, color: stufe.text }}>
                        {stufe.emoji} {stufe.label}
                      </span>
                    </div>

                    {/* 3-Part Schema */}
                    {istSichtbar && txt && (
                      <div className="bg-white px-5 py-4 space-y-3">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">Was beobachtet</div>
                          <p className="text-sm text-gray-700">{txt.beobachtet}</p>
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">Im Alltag kann das bedeuten</div>
                          <p className="text-sm text-gray-700">{txt.alltag}</p>
                        </div>
                        <div className="rounded-xl px-3 py-2 text-xs" style={{ background: "#C8E8E4", color: "#1F5C57" }}>
                          ℹ️ {txt.disclaimer}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Email-Gate */}
        {!emailFreigegeben && (
          <div className="bg-white rounded-2xl border-2 p-6 shadow-lg" style={{ borderColor: "#8DCDC5" }}>
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">🔓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Alle Bereiche freischalten
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Du erhältst den <strong>vollständigen Bericht</strong> für {kindNameAngezeigt} kostenlos per E-Mail — inklusive konkreter Hinweise passend zum erkannten Schwerpunkt.
              </p>
            </div>
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && emailAbschicken()}
                placeholder="deine@email.at"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:outline-none"
                onFocus={e => e.currentTarget.style.borderColor = "#8DCDC5"}
                onBlur={e => e.currentTarget.style.borderColor = "#D1D5DB"}
              />
              {emailFehler && <p className="text-red-500 text-sm">{emailFehler}</p>}
              <button
                onClick={emailAbschicken}
                disabled={laden}
                className="w-full text-white font-bold text-lg py-4 rounded-xl transition-all shadow-md disabled:opacity-50 hover:opacity-90"
                style={{ background: "#F5943A" }}
              >
                {laden ? "Wird gesendet…" : `Vollständigen Bericht erhalten →`}
              </button>
              <p className="text-xs text-gray-400 text-center">
                Kein Spam. Nur der Bericht und hilfreiche Tipps. Jederzeit abmeldbar.
              </p>
            </div>
          </div>
        )}

        {/* Nach Email-Freischaltung */}
        {emailFreigegeben && (
          <>
            {/* Erkannte Zusammenhänge (Muster) */}
            {profil.musterHinweise.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-gray-900">🔎 Erkannte Zusammenhänge</h3>
                {profil.musterHinweise.map((m, i) => (
                  <div key={i} className={`rounded-xl border-2 p-4 ${m.staerke === "stark" ? "bg-orange-50 border-orange-300" : "bg-blue-50 border-blue-200"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{m.staerke === "stark" ? "💡" : "💡"}</span>
                      <span className={`font-semibold text-sm ${m.staerke === "stark" ? "text-orange-800" : "text-blue-800"}`}>
                        {m.titel}
                      </span>
                    </div>
                    <p className={`text-sm ${m.staerke === "stark" ? "text-orange-700" : "text-blue-700"}`}>
                      {m.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Schwerpunkt & CTA */}
            <div className="rounded-2xl p-6" style={{ background: "#FEF0E0", border: "2px solid #F5943A" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: "#F5943A" }}>
                  {typDaten.icon}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "#C47020" }}>Screening-Schwerpunkt</div>
                  <div className="font-bold text-gray-900">{typDaten.warum}</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Der VIKI-Onlinekurs unterstützt Kinder spielerisch dabei, visuelle Verarbeitung, Augensteuerung und Konzentration zu stärken — mit Übungen, die speziell auf diesen Schwerpunkt abgestimmt sind:
              </p>
              <div className="rounded-xl p-3 text-sm text-gray-800 font-medium mb-5" style={{ background: "white" }}>
                🎯 {typDaten.training}
              </div>

              <div className="rounded-2xl p-5 text-center" style={{ background: "white" }}>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Der VIKI Superblick Kurs</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Spielerisches Visualtraining für Kinder — entwickelt von Dr. Sarah Kopetzky, Funktionaloptometristin.
                </p>
                <div className="space-y-2 mb-5 text-left max-w-xs mx-auto">
                  {[
                    "Flüssigeres Lesen & besseres Leseverständnis",
                    "Abschreiben von der Tafel — schneller und entspannter",
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
                  href="https://kurse.vikitraining.at/superblick-kurs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full font-bold text-lg py-4 rounded-xl shadow-lg transition-all hover:opacity-90"
                  style={{ background: "#F5943A", color: "white" }}
                >
                  Mehr über den Kurs erfahren →
                </a>
              </div>
            </div>

            {/* Nächste Schritte */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">📋 Deine nächsten Schritte</h3>
              <ol className="space-y-4">
                {[
                  { color: "#8DCDC5", text: `Du hast den vollständigen Screening-Bericht für ${kindNameAngezeigt} per E-Mail erhalten — lies ihn in Ruhe durch.` },
                  { color: "#F5943A", text: "Schau dir den VIKI Superblick Kurs an — und entscheide, ob das Training für dein Kind passt." },
                  { color: "#EE6B85", text: "Bei konkreten Fragen zu den Ergebnissen: Wende dich an eine Funktionaloptometristin / einen Funktionaloptometristen oder eine Augenärztin / einen Augenarzt für eine professionelle Einschätzung." },
                ].map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-700">
                    <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: s.color }}>{i + 1}</span>
                    <span className="leading-relaxed">{s.text}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="text-center pb-4">
              <a
                href="https://kurse.vikitraining.at/superblick-kurs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full font-bold text-lg py-4 rounded-xl shadow-lg transition-all hover:opacity-90"
                style={{ background: "#F5943A", color: "white" }}
              >
                Mehr über den Kurs erfahren →
              </a>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
