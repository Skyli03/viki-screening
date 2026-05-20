"use client";
import { useState, useRef, useEffect } from "react";
import { getLesetextByKlasse } from "@/data/lesetexte";
import type { TrackingErgebnis, LesequalitaetMerkmal } from "@/lib/eyetracking";

interface Props {
  kindName: string;
  klasse: number;
  onFertig: (ergebnis: TrackingErgebnis) => void;
}

type Phase =
  | "erklaerung"
  | "kameracheck_erklaerung"   // NEU: Erklärung bevor Punkte starten
  | "kameracheck_countdown"    // NEU: 3-2-1 Countdown
  | "kameracheck_punkte"       // Die eigentlichen Punkte
  | "probelauf"
  | "quatschtext_briefing"     // NEU: Eltern-Briefing vor Quatschtext
  | "lesen"
  | "qualitaet"
  | "fehler";

// Lesequalität-Optionen (Mehrfachauswahl, klinisch abgeleitet)
const QUALITAET_OPTIONEN: { id: LesequalitaetMerkmal; emoji: string; label: string; detail: string }[] = [
  { id: "fluessig",   emoji: "😊", label: "Flüssig gelesen",             detail: "Auch die seltsamen Wörter wurden sicher gelesen" },
  { id: "holprig",    emoji: "📖", label: "Holprig / stolpernd",          detail: "Oft gestolpert, Wörter mehrmals versucht" },
  { id: "endungen",   emoji: "✂️", label: "Endungen vergessen",           detail: "Wortenden abgehackt oder verschluckt" },
  { id: "langsam",    emoji: "🐌", label: "Richtig, aber sehr langsam",   detail: "Vorsichtig buchstabiert, lange gebraucht" },
  { id: "vertauscht", emoji: "🔀", label: "Buchstaben / Wörter erfunden", detail: "Ähnliche Wörter ersetzt oder Buchstaben gedreht" },
];

const FEHLER_STUFEN = [
  { wert: 0,  label: "0 Fehler",    detail: "Hat alles richtig gelesen" },
  { wert: 2,  label: "1–3 Fehler",  detail: "Wenige Fehler" },
  { wert: 5,  label: "4–7 Fehler",  detail: "Mehrere Fehler" },
  { wert: 10, label: "8 oder mehr", detail: "Viele Fehler / konnte kaum lesen" },
];

export default function LeseTest({ kindName, klasse, onFertig }: Props) {
  const ergebnisRef = useRef<TrackingErgebnis | null>(null);
  const [phase, setPhase] = useState<Phase>("erklaerung");
  const trackerBereit = true; // Eye-Tracking entfernt — Test startet sofort
  const [startzeit, setStartzeit] = useState<number>(0);
  const [vergangeneZeit, setVergangeneZeit] = useState(0);
  const [kameraPunktIndex, setKameraPunktIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [lesequalitaet, setLesequalitaet] = useState<LesequalitaetMerkmal[]>([]);
  const [fehlerAnzahl, setFehlerAnzahl] = useState<number | null>(null);
  const text = getLesetextByKlasse(klasse);

  const KAMERA_PUNKTE = [
    { x: "10%", y: "20%" },
    { x: "90%", y: "20%" },
    { x: "50%", y: "50%" },
    { x: "10%", y: "80%" },
    { x: "90%", y: "80%" },
  ];

  // ── Kameracheck: Erklärung → Countdown → Punkte ───────────────────────────

  function kameraCheckErklaerungStarten() {
    setPhase("kameracheck_erklaerung");
  }

  function kameraCountdownStarten() {
    setPhase("kameracheck_countdown");
    setCountdown(3);
    let c = 3;
    const interval = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(interval);
        kameraPunkteStarten();
      }
    }, 1000);
  }

  function kameraPunkteStarten() {
    setPhase("kameracheck_punkte");
    setKameraPunktIndex(0);
    let idx = 0;
    const interval = setInterval(() => {
      idx += 1;
      if (idx >= KAMERA_PUNKTE.length) {
        clearInterval(interval);
        setPhase("probelauf");
      } else {
        setKameraPunktIndex(idx);
      }
    }, 1500);
  }

  // ── Lesen ─────────────────────────────────────────────────────────────────

  function lesenStarten() {
    setPhase("lesen");
    const start = Date.now();
    setStartzeit(start);
    const interval = setInterval(() => {
      setVergangeneZeit(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    setTimeout(() => clearInterval(interval), 300000);
  }

  function lesenFertig() {
    const dauerSek = (Date.now() - startzeit) / 1000;
    const ergebnis: TrackingErgebnis = {
      ruecksprueungeProZeile: 0, vorwaertssprueungeProZeile: 0,
      lesegeschwindigkeitWPM: Math.round((text.wortanzahl / Math.max(dauerSek, 1)) * 60),
      blinzelrateProMinute: -1,
      lesetempoRuhig: true, zeilenverluste: 0, rohdaten: [], zeilenAnalyse: [],
      lesezeitSekunden: Math.round(dauerSek),
    };
    ergebnisRef.current = ergebnis;
    setPhase("qualitaet");
  }

  function qualitaetWeiter() { setPhase("fehler"); }

  function toggleQualitaet(m: LesequalitaetMerkmal) {
    setLesequalitaet(prev => {
      if (m === "fluessig") return ["fluessig"];
      const ohneFluessig = prev.filter(x => x !== "fluessig");
      return ohneFluessig.includes(m)
        ? ohneFluessig.filter(x => x !== m)
        : [...ohneFluessig, m];
    });
  }

  function weiter() {
    const ergebnis = ergebnisRef.current ?? {
      ruecksprueungeProZeile: 0, vorwaertssprueungeProZeile: 0,
      lesegeschwindigkeitWPM: Math.round((text.wortanzahl / Math.max(vergangeneZeit, 1)) * 60),
      blinzelrateProMinute: -1,
      lesetempoRuhig: true, zeilenverluste: 0, rohdaten: [], zeilenAnalyse: [],
    };
    ergebnis.lesequalitaet = lesequalitaet.length > 0 ? lesequalitaet : ["fluessig"];
    ergebnis.fehlerAnzahl = fehlerAnzahl ?? 0;
    if (lesequalitaet.includes("holprig") || lesequalitaet.includes("vertauscht")) {
      ergebnis.lesetempoRuhig = false;
    }
    onFertig(ergebnis);
  }

  return (
    <div>
      {/* ── 1. Erklärung ────────────────────────────────────────────────── */}
      {phase === "erklaerung" && (
        <div className="text-center">
          <div className="text-5xl mb-4">📖</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Der Lesetest</h2>
          <p className="text-gray-600 mb-5 max-w-lg mx-auto">
            {kindName} liest gleich einen kurzen Text <strong>laut vor</strong> — so gut es geht, ganz ohne Druck. 😊<br />
            Du hörst zu, liest mit und beobachtest.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto mb-5 text-left text-sm text-blue-800">
            <p className="font-semibold mb-2">ℹ️ Was ist das für ein Text?</p>
            <p>Das ist ein <strong>Quatschtext</strong> — mit Fantasiewörtern.
            Das ist Absicht! So sehen wir, ob {kindName} liest oder bereits bekannte Wörter abruft.</p>
          </div>

          <div className="bg-orange-50 rounded-xl p-5 max-w-md mx-auto mb-8 text-left">
            <p className="font-semibold mb-3">So geht es:</p>
            <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
              <li>Kurzer Kameracheck — {kindName} sitzt ca. 40–60 cm vor dem Bildschirm</li>
              <li>Kurzer Probelauf mit einem normalen Satz</li>
              <li>Dann der Quatschtext — <strong>Zeit läuft</strong>, du <strong>liest mit und zählst Fehler</strong></li>
              <li>Du beschreibst kurz, wie das Lesen geklungen hat</li>
            </ol>
            <p className="text-xs text-gray-500 mt-3">💡 Fehler = falsches Wort, Buchstaben gedreht, Wort übersprungen</p>
          </div>

          {!trackerBereit ? (
            <div className="flex flex-col items-center gap-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 max-w-md text-sm text-yellow-800">
                ⏳ Analyse wird vorbereitet... Das kann 10–20 Sekunden dauern.
              </div>
              <div className="animate-spin text-3xl">⚙️</div>
            </div>
          ) : (
            <button
              onClick={kameraCheckErklaerungStarten}
              className="bg-primary hover:bg-primary-dark text-white font-bold text-xl px-10 py-4 rounded-xl transition-colors shadow-md"
            >
              Kameracheck starten →
            </button>
          )}
        </div>
      )}

      {/* ── 2a. Kameracheck — Erklärung ─────────────────────────────────── */}
      {phase === "kameracheck_erklaerung" && (
        <div className="text-center">
          <div className="text-5xl mb-5">🎯</div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Kameracheck</h3>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 max-w-md mx-auto mb-6 text-left text-sm text-blue-800">
            <p className="font-semibold mb-3">So geht der Kameracheck:</p>
            <ol className="space-y-2 list-decimal list-inside">
              <li>Gleich erscheinen <strong>5 orangene Punkte</strong> nacheinander auf dem Bildschirm</li>
              <li>{kindName} schaut jeden Punkt direkt an — <strong>nur mit den Augen</strong>, Kopf bleibt still</li>
              <li>Der Punkt springt automatisch weiter</li>
            </ol>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-md mx-auto mb-8 text-sm text-amber-800">
            <strong>{kindName}</strong> sitzt jetzt ca. 40–60 cm vor dem Bildschirm — Gesicht gut beleuchtet?
          </div>

          <button
            onClick={kameraCountdownStarten}
            className="text-white font-bold text-xl px-10 py-4 rounded-xl shadow-md"
            style={{ background: "#F5943A" }}
          >
            Los geht's →
          </button>
        </div>
      )}

      {/* ── 2b. Kameracheck — Countdown ─────────────────────────────────── */}
      {phase === "kameracheck_countdown" && (
        <div className="flex flex-col items-center justify-center" style={{ minHeight: "380px" }}>
          <p className="text-gray-500 text-lg mb-4">Gleich starten die Punkte …</p>
          <div
            className="text-9xl font-black"
            style={{ color: "#F5943A", lineHeight: 1 }}
          >
            {countdown}
          </div>
        </div>
      )}

      {/* ── 2c. Kameracheck — Punkte ────────────────────────────────────── */}
      {phase === "kameracheck_punkte" && (
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden" style={{ minHeight: "380px" }}>
          <div className="absolute inset-0 flex items-center justify-center text-white text-center p-8 pointer-events-none">
            <p className="text-gray-400 text-sm">Punkt anschauen — Kopf bleibt still</p>
          </div>
          {KAMERA_PUNKTE.map((pos, i) => (
            <div
              key={i}
              className={`absolute w-8 h-8 rounded-full transition-all duration-300 ${
                i === kameraPunktIndex
                  ? "scale-125"
                  : i < kameraPunktIndex
                  ? "bg-green-400 scale-75"
                  : "opacity-0"
              }`}
              style={{
                left: pos.x,
                top: pos.y,
                transform: "translate(-50%, -50%)",
                background: i === kameraPunktIndex ? "#F5943A" : undefined,
              }}
            />
          ))}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {KAMERA_PUNKTE.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i <= kameraPunktIndex ? "bg-orange-400" : "bg-gray-600"}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── 3. Probelauf ────────────────────────────────────────────────── */}
      {phase === "probelauf" && (
        <div className="text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Kameracheck abgeschlossen!</h3>
          <p className="text-gray-600 mb-2">Kurzer Probelauf mit einem <strong>normalen</strong> Satz:</p>
          <p className="text-xs text-gray-400 mb-6">(Danach kommt der Quatschtext.)</p>
          <div className="bg-white border-2 border-primary rounded-xl p-6 max-w-lg mx-auto mb-8 text-xl font-medium text-gray-900 leading-relaxed">
            Die Superhelden fliegen heute über die Stadt.
          </div>
          <button
            onClick={() => setPhase("quatschtext_briefing")}
            className="bg-primary hover:bg-primary-dark text-white font-bold text-xl px-10 py-4 rounded-xl transition-colors shadow-md"
          >
            Weiter zum Quatschtext →
          </button>
        </div>
      )}

      {/* ── 4. Quatschtext-Briefing ─────────────────────────────────────── */}
      {phase === "quatschtext_briefing" && (
        <div>
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">⏱️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Jetzt kommt der Quatschtext</h3>
            <p className="text-gray-500 text-sm">Die Zeit wird beim Drücken von „Starten" automatisch gestoppt.</p>
          </div>

          <div className="bg-white rounded-2xl border-2 p-5 mb-5" style={{ borderColor: "#8DCDC5" }}>
            <p className="font-semibold text-gray-900 mb-4">Bitte beachte während des Lesens:</p>
            <div className="space-y-3">
              {[
                {
                  icon: "👁️",
                  titel: "Lies mit",
                  text: `Verfolge den Text selbst mit — so kannst du Fehler mitbekommen.`,
                },
                {
                  icon: "🔢",
                  titel: "Fehler zählen",
                  text: "Zähle falsch gelesene Wörter (falsches Wort, Buchstaben gedreht, Wort übersprungen).",
                },
                {
                  icon: "📖",
                  titel: "Wie liest dein Kind?",
                  text: `Flüssig? Holprig? Langsam? Werden Endungen verschluckt?`,
                },
                {
                  icon: "🔄",
                  titel: "Kopf beobachten",
                  text: `Dreht ${kindName} den Kopf mit, statt nur die Augen zu bewegen?`,
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div className="text-sm">
                    <span className="font-semibold text-gray-900">{item.titel}: </span>
                    <span className="text-gray-600">{item.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={lesenStarten}
            className="w-full text-white font-bold text-xl py-4 rounded-xl shadow-md"
            style={{ background: "#F5943A" }}
          >
            ⏱️ Quatschtext starten — Zeit läuft →
          </button>
        </div>
      )}

      {/* ── 5. Lesen ────────────────────────────────────────────────────── */}
      {phase === "lesen" && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="font-bold text-gray-900">📖 Quatschtext</h3>
              <p className="text-xs text-gray-400">{kindName} liest laut vor — du liest mit</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-xs px-2 py-1 rounded-full font-semibold"
                style={{ background: "#FEF9C3", color: "#A16207" }}
              >
                📖 {kindName} liest laut vor
              </span>
              <span className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold">
                ⏱ {vergangeneZeit}s
              </span>
            </div>
          </div>

          {/* Eltern-Beobachtungs-Hinweis */}
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "#E4F5F3", color: "#2D7A73" }}>
            <p className="font-semibold mb-1">👀 Jetzt beobachten:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
              <span>• Fehler zählen</span>
              <span>• Endungen verschluckt?</span>
              <span>• Kopf mitbewegt?</span>
              <span>• Finger zeigt auf Zeile?</span>
            </div>
          </div>

          <div
            className="bg-white border-2 border-gray-100 rounded-2xl p-8 mb-6 shadow-sm"
            style={{ fontSize: `${text.schriftgroesse}px`, lineHeight: "2.4" }}
          >
            {text.zeilen.map((zeile, i) => (
              <p key={i} className="text-gray-900">{zeile}</p>
            ))}
          </div>

          <button
            onClick={lesenFertig}
            className="w-full text-white font-bold text-xl py-4 rounded-xl transition-colors shadow-md"
            style={{ background: "#8DCDC5" }}
          >
            ✅ {kindName} hat fertig gelesen — Zeit stoppen
          </button>
        </div>
      )}

      {/* ── 6. Lesequalität ─────────────────────────────────────────────── */}
      {phase === "qualitaet" && (
        <div>
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Gut gemacht, {kindName}!</h3>
            <p className="text-gray-500 text-sm">Zeit: <strong>{vergangeneZeit} Sekunden</strong></p>
          </div>

          <div className="bg-white rounded-2xl border-2 p-5 mb-5" style={{ borderColor: "#8DCDC5" }}>
            <p className="font-semibold text-gray-900 mb-1">Wie hat {kindName} den Quatschtext gelesen?</p>
            <p className="text-xs text-gray-500 mb-4">Mehrfachauswahl möglich — wähle alles, was dir aufgefallen ist.</p>
            <div className="flex flex-col gap-2">
              {QUALITAET_OPTIONEN.map((opt) => {
                const aktiv = lesequalitaet.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleQualitaet(opt.id)}
                    className="p-3 rounded-xl border-2 text-left flex items-start gap-3 transition-all"
                    style={aktiv
                      ? { borderColor: "#8DCDC5", background: "#E4F5F3" }
                      : { borderColor: "#E5E7EB" }
                    }
                  >
                    <span className="text-xl flex-shrink-0">{opt.emoji}</span>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{opt.label}</div>
                      <div className="text-xs text-gray-500">{opt.detail}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={qualitaetWeiter}
            disabled={lesequalitaet.length === 0}
            className="w-full text-white font-bold py-3 rounded-xl disabled:opacity-40"
            style={{ background: "#F5943A" }}
          >
            Weiter →
          </button>
        </div>
      )}

      {/* ── 7. Fehleranzahl ─────────────────────────────────────────────── */}
      {phase === "fehler" && (
        <div>
          <div className="bg-white rounded-2xl border-2 p-5 mb-5" style={{ borderColor: "#8DCDC5" }}>
            <p className="font-semibold text-gray-900 mb-1">Wie viele Wörter wurden falsch gelesen?</p>
            <p className="text-xs text-gray-500 mb-4">Falsch = falsches Wort gesagt, Buchstaben verdreht, oder Wort übersprungen</p>
            <div className="flex flex-col gap-2">
              {FEHLER_STUFEN.map((stufe) => (
                <button
                  key={stufe.wert}
                  type="button"
                  onClick={() => setFehlerAnzahl(stufe.wert)}
                  className="p-3 rounded-xl border-2 text-left flex justify-between items-center transition-all"
                  style={fehlerAnzahl === stufe.wert
                    ? { borderColor: "#8DCDC5", background: "#E4F5F3" }
                    : { borderColor: "#E5E7EB" }
                  }
                >
                  <span className="text-sm font-semibold text-gray-900">{stufe.label}</span>
                  <span className="text-xs text-gray-400">{stufe.detail}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={weiter}
            disabled={fehlerAnzahl === null}
            className="w-full text-white font-bold py-3 rounded-xl disabled:opacity-40"
            style={{ background: "#F5943A" }}
          >
            Weiter zum Sehtest →
          </button>
        </div>
      )}
    </div>
  );
}
