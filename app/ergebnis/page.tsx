"use client";
import { useEffect, useState } from "react";
import { berechneScreeningProfil } from "@/lib/auswertung";
import type { ScreeningProfil } from "@/lib/auswertung";
import type { ScreeningDaten, Antwort } from "@/lib/screening-types";
import { FRAGEN } from "@/data/fragebogen";

const AMPEL_FARBEN = {
  gruen: { bg: "bg-green-100", border: "border-green-400", text: "text-green-800", dot: "bg-green-500", label: "Unauffällig" },
  gelb:  { bg: "bg-yellow-100", border: "border-yellow-400", text: "text-yellow-800", dot: "bg-yellow-400", label: "Auffällig" },
  rot:   { bg: "bg-red-100",    border: "border-red-400",    text: "text-red-800",    dot: "bg-red-500",    label: "Förderbedarf" },
};

const TYP_DATEN: Record<string, {
  warum: string; symptome: string[]; mechanismus: string; training: string; icon: string;
}> = {
  A: {
    icon: "👁️", warum: "Lesefluss & Augenbewegungen",
    symptome: [
      "Verliert die Zeile beim Lesen und muss mit dem Finger nachfahren",
      "Liest langsam, obwohl es die Buchstaben kennt",
      "Hausaufgaben dauern 3× so lang wie bei anderen Kindern",
    ],
    mechanismus: "Die Augen können nicht flüssig von Wort zu Wort springen. Statt gezielter Sakkaden macht das Gehirn viele kleine Korrekturbewegungen — das kostet viel Energie.",
    training: "Augensprünge, Lesefluss-Training, visuelle Spurfolge-Übungen",
  },
  B: {
    icon: "🎯", warum: "Fokus & Augensteuerung",
    symptome: [
      "Klagt über Doppelbilder oder Verschwimmen beim Lesen",
      "Bücher werden lieber weggelegt statt gelesen",
      "Kann einem bewegten Stift nicht flüssig mit den Augen folgen",
    ],
    mechanismus: "Die Augensteuerung (Konvergenz, Fixation, Smooth Pursuit) ist eingeschränkt. Das kostet dem Gehirn enorm viel Kraft — sichtbar als Konzentrationsprobleme.",
    training: "Konvergenztraining, Fixation, Stift-Folgeübungen",
  },
  C: {
    icon: "🔄", warum: "Frühkindliche Reflexe & Körpersteuerung",
    symptome: [
      "Sitzt auffällig schief oder verdreht beim Schreiben",
      "Vermeidet Lesen und findet immer Ausreden",
      "Konzentration bricht nach wenigen Minuten ein",
    ],
    mechanismus: "Nicht vollständig integrierte Frühreflexe (z. B. ATNR, MORO) stören die Augen-Körper-Koordination. Das Kind muss unbewusst so viel Energie für Körperkontrolle aufwenden, dass wenig für das Lernen bleibt.",
    training: "Reflexintegration, Körper-Augen-Koordination, MORO/ATNR-Sequenzen",
  },
  D: {
    icon: "🧠", warum: "Kombinierte visuelle & neuronale Verarbeitung",
    symptome: [
      "In der Schule \"nicht dabei\", obwohl es zuhause alles versteht",
      "Kann nicht vorlesen, aber versteht alles wenn man vorliest",
      "Hausaufgaben: ewige Kämpfe, Tränen, kein Ende",
    ],
    mechanismus: "Mehrere visuelle Teilsysteme arbeiten nicht optimal zusammen. Das addiert sich — und das Kind wirkt \"unaufmerksam\" oder \"faul\", obwohl es das Gegenteil ist.",
    training: "Ganzheitliches Augen-Hirn-Training, Reflexintegration, visuelles Gedächtnis",
  },
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
  const [geschlecht, setGeschlecht] = useState<"m" | "f" | "">("");
  const [auffaelligeFragen, setAuffaelligeFragen] = useState<string[]>([]);
  const [emailFreigegeben, setEmailFreigegeben] = useState(false);
  const [email, setEmail] = useState("");
  const [emailFehler, setEmailFehler] = useState("");
  const [laden, setLaden] = useState(false);
  const [emailGesendet, setEmailGesendet] = useState(false);

  useEffect(() => {
    const name = sessionStorage.getItem("kindName") ?? "dein Kind";
    const g = sessionStorage.getItem("geschlecht") ?? "";
    const klasse = Number(sessionStorage.getItem("klasse") ?? "2");
    setKindName(name);
    setGeschlecht(g as "m" | "f" | "");

    const rohdaten = sessionStorage.getItem("screening_daten");
    const daten: ScreeningDaten = rohdaten ? JSON.parse(rohdaten) : demoScreeningDaten();

    if (daten.fragebogen) {
      const auffaellig = FRAGEN
        .filter(f => (daten.fragebogen[f.id] ?? 0) >= 2)
        .map(f => f.text.replace(/^Mein Kind /, ""))
        .slice(0, 4);
      setAuffaelligeFragen(auffaellig);
    }

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

  const gesamtAmpel = profil.gesamtScore >= 71 ? "gruen" : profil.gesamtScore >= 41 ? "gelb" : "rot";
  const gesamtFarbe = AMPEL_FARBEN[gesamtAmpel];
  const typDaten = TYP_DATEN[profil.typ] ?? TYP_DATEN.D;

  const isBub = geschlecht === "m";
  const isMaedchen = geschlecht === "f";
  const subj    = isBub ? "er"   : isMaedchen ? "sie"  : "es";
  const erSubj  = isBub ? "Er"   : isMaedchen ? "Sie"  : "Es";
  const nameOderKind = kindName !== "dein Kind" ? kindName : "Dein Kind";
  const kindGenitivOderDein = kindName !== "dein Kind" ? `von ${kindName}` : "deines Kindes";
  const hatAuffaelligkeiten = profil.auffaelligkeitenAnzahl >= 2;

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

        {/* 1. Empathie-Hook */}
        <div className="rounded-2xl p-6" style={{ background: "#FEF3E2", border: "2px solid #F5943A" }}>
          <p className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: "#C47020" }}>Kennst du das?</p>
          <blockquote className="text-lg font-medium text-gray-900 leading-relaxed italic">
            „Eigentlich ist mein Kind ja schlau — aber Hausaufgaben dauern ewig, die Konzentration hält nicht lange und Lesen klappt einfach nicht so wie bei anderen Kindern."
          </blockquote>
          <p className="mt-3 text-sm text-gray-600">
            Wenn dir das bekannt vorkommt: Du bist nicht allein. Und es liegt nicht am Willen {kindGenitivOderDein}.
          </p>
        </div>

        {/* 2. Ergebnis-Karte */}
        <div className={`rounded-2xl border-2 p-6 ${gesamtFarbe.bg} ${gesamtFarbe.border}`}>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg ${gesamtFarbe.dot}`}>
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

        {/* 3. Warum */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
            Warum kämpft {kindName !== "dein Kind" ? kindName : "dein Kind"} gerade?
          </p>
          <div className="space-y-2 mb-4">
            {(auffaelligeFragen.length > 0 ? auffaelligeFragen : typDaten.symptome).map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-orange-400 mt-0.5 flex-shrink-0">✓</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-4 text-sm text-gray-700 leading-relaxed" style={{ background: "#F0F9F8" }}>
            <span className="font-semibold" style={{ color: "#2D7A73" }}>Der mögliche Grund:</span>{" "}
            {typDaten.mechanismus}
          </div>
          <div className="mt-4 rounded-xl p-4 text-sm" style={{ background: "#FEF3E2" }}>
            <p className="font-semibold mb-2" style={{ color: "#C47020" }}>💡 Wichtig zu wissen:</p>
            <ul className="space-y-2 text-gray-700">
              <li>• Schwierigkeiten bei der visuellen Verarbeitung bleiben oft jahrelang unentdeckt — weil Kinder keinen Vergleich haben und gar nicht wissen, dass andere anders sehen als sie.</li>
              <li>• Was wie Unaufmerksamkeit oder mangelnde Motivation wirkt, ist häufig eine unsichtbare visuelle Belastung.</li>
            </ul>
          </div>
        </div>

        {/* 4. Kategorien (erste 2 immer sichtbar) */}
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
                    <p className={`text-sm mt-3 ${farbe.text}`}>{kat.elternText}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Email-Gate */}
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
                {laden ? "Wird gesendet…" : `Vollständigen Bericht für ${kindName !== "dein Kind" ? kindName : "dein Kind"} erhalten →`}
              </button>
              <p className="text-xs text-gray-400 text-center">
                Kein Spam. Nur der Bericht und hilfreiche Tipps. Jederzeit abmeldbar.
              </p>
            </div>
          </div>
        )}

        {/* 7. Nach Email-Freischaltung */}
        {emailFreigegeben && (
          <>
            {profil.musterHinweise.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-gray-900">🔎 Erkannte Muster</h3>
                {profil.musterHinweise.map((m, i) => (
                  <div key={i} className={`rounded-xl border-2 p-4 ${m.staerke === "stark" ? "bg-red-50 border-red-300" : "bg-orange-50 border-orange-200"}`}>
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

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Was passiert, wenn man nichts tut?</h3>
              <div className="space-y-3">
                {[
                  { icon: "📚", text: `Der Rückstand in der Schule wächst — nicht weil ${nameOderKind} weniger kann, sondern weil ${subj} langsamer liest als alle anderen.` },
                  { icon: "😔", text: `${erSubj} beginnt zu glauben, ${subj} sei „nicht so klug" — das Selbstbild leidet dauerhaft.` },
                  { icon: "⏰", text: "Hausaufgaben bleiben ein täglicher Stressfaktor — für das Kind und für die ganze Familie." },
                  { icon: "🔁", text: "Visuell bedingte Lernschwierigkeiten lösen sich nicht von selbst. Das Gehirn braucht gezieltes Training." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <span className="leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{ background: "#FEF0E0", border: "2px solid #F5943A" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: "#F5943A" }}>
                  {typDaten.icon}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "#C47020" }}>Dein Screening-Schwerpunkt</div>
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

            <div className="rounded-2xl p-6 text-center" style={{ background: "#FEF3E2", border: "2px solid #F5943A" }}>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Der VIKI Superblick Kurs</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Mit Visualtraining die Basis für müheloses Lesen & entspanntes Lernen legen — speziell für Kinder wie {kindName !== "dein Kind" ? kindName : "dein Kind"}.
              </p>
              <p className="text-xs text-gray-500 mb-4">Entwickelt von Dr. Sarah Kopetzky, Funktionaloptometristin.</p>
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
                href="https://kurse.vikitraining.at/superblick-kurs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full font-bold text-lg py-4 rounded-xl shadow-lg transition-all hover:opacity-90"
                style={{ background: "#F5943A", color: "white" }}
              >
                JETZT KURS ANSEHEN
              </a>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Deine nächsten Schritte</h3>
              <ol className="space-y-4">
                {[
                  { color: "#8DCDC5", text: "Du hast den vollständigen Screening-Bericht per E-Mail erhalten — lies ihn in Ruhe durch." },
                  { color: "#F5943A", text: "Starte jetzt mit dem VIKI Superblick Kurs — und lege die Basis für müheloses Lesen & entspanntes Lernen." },
                  { color: "#EE6B85", text: "Schon wenige Minuten Training täglich machen einen Unterschied. Viele Eltern merken erste Verbesserungen nach kurzer Zeit." },
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
                JETZT KURS ANSEHEN
              </a>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
