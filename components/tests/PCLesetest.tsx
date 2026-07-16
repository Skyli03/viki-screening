"use client";
import { useState, useRef, useEffect } from "react";
import type { PCLeseErgebnis } from "@/lib/screening-types";

interface Props {
  kindName: string;
  klasse: number;
  onFertig: (ergebnis: PCLeseErgebnis) => void;
}

const KURZTEXTE: Record<number, { zeilen: string[]; wortanzahl: number; schriftgroesse: number }> = {
  1: {
    zeilen: ["Gi em Aus", "As est Wentar.", "Temi, Mumu ond Gi bahan reis.", "Gi est dar Hond vin Temi.", "Temi ond Gi send bota Frienda.", "Temi, Mumu ond Gi bahan zom Tauch."],
    wortanzahl: 34, schriftgroesse: 24,
  },
  2: {
    zeilen: ["Gi em Aus", "As est Wentar.", "Temi, Mumu ond Gi bahan reis.", "Gi est dar Hond vin Temi.", "Temi ond Gi send bota Frienda.", "Temi, Mumu ond Gi bahan zom Tauch."],
    wortanzahl: 34, schriftgroesse: 22,
  },
  3: {
    zeilen: ["Gi em Aus", "As est Wentar.", "Temi, Mumu ond Gi bahan reis.", "Gi est dar Hond vin Temi.", "Temi ond Gi send bota Frienda.", "Temi, Mumu ond Gi bahan zom Tauch."],
    wortanzahl: 34, schriftgroesse: 20,
  },
  4: {
    zeilen: ["Gi em Aus", "As est Wentar.", "Temi, Mumu ond Gi bahan reis.", "Gi est dar Hond vin Temi.", "Temi ond Gi send bota Frienda.", "Temi, Mumu ond Gi bahan zom Tauch."],
    wortanzahl: 34, schriftgroesse: 18,
  },
};

function getKurztext(klasse: number) {
  const key = klasse <= 1 ? 1 : klasse <= 2 ? 2 : klasse <= 4 ? 3 : 4;
  return KURZTEXTE[key];
}

const QUALITAET_OPTIONEN = [
  { id: "fluessig", emoji: "😊", label: "Flüssig gelesen" },
  { id: "holprig", emoji: "📖", label: "Holprig / stolpernd" },
  { id: "endungen", emoji: "✂️", label: "Endungen vergessen" },
  { id: "langsam", emoji: "🐌", label: "Richtig, aber sehr langsam" },
  { id: "vertauscht", emoji: "🔀", label: "Buchstaben / Wörter verdreht" },
] as const;

type Qualitaet = "fluessig" | "holprig" | "endungen" | "langsam" | "vertauscht";

const FEHLER_STUFEN = [
  { wert: 0, label: "0 Fehler" },
  { wert: 2, label: "1–3 Fehler" },
  { wert: 5, label: "4–7 Fehler" },
  { wert: 10, label: "8 oder mehr" },
];

export default function PCLesetest({ kindName, klasse, onFertig }: Props) {
  const text = getKurztext(klasse);
  const [phase, setPhase] = useState<"briefing" | "countdown" | "lesen" | "qualitaet" | "fehler" | "blinzeln">("briefing");
  const [countdown, setCountdown] = useState(3);
  const [vergangeneZeit, setVergangeneZeit] = useState(0);
  const [lesequalitaet, setLesequalitaet] = useState<Qualitaet[]>([]);
  const [fehlerAnzahl, setFehlerAnzahl] = useState<number | null>(null);
  const [blinzeln, setBlinzeln] = useState<PCLeseErgebnis["blinzeln"] | null>(null);
  const [pcLeichter, setPcLeichter] = useState<boolean | null>(null);
  const startzeitRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === "countdown") {
      let c = 3;
      setCountdown(3);
      const interval = setInterval(() => {
        c -= 1;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(interval);
          // Lesen starten
          startzeitRef.current = Date.now();
          timerRef.current = setInterval(() => {
            setVergangeneZeit(Math.floor((Date.now() - startzeitRef.current) / 1000));
          }, 1000);
          setPhase("lesen");
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  function lesenFertig() {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("qualitaet");
  }

  function toggleQualitaet(m: Qualitaet) {
    setLesequalitaet(prev => {
      if (m === "fluessig") return ["fluessig"];
      const ohneFluessig = prev.filter(x => x !== "fluessig");
      return ohneFluessig.includes(m) ? ohneFluessig.filter(x => x !== m) : [...ohneFluessig, m];
    });
  }

  function abschicken() {
    if (!blinzeln) return;
    const dauerSek = Math.max(vergangeneZeit, 1);
    onFertig({
      lesezeitSekunden: dauerSek,
      lesequalitaet: lesequalitaet.length > 0 ? lesequalitaet : ["fluessig"],
      fehlerAnzahl: fehlerAnzahl ?? 0,
      blinzeln,
      pc_leichter: pcLeichter,
    });
  }

  if (phase === "briefing") {
    return (
      <div>
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">💻</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Lesetest — Bildschirm</h2>
          <p className="text-sm text-gray-500">{kindName} liest jetzt <strong>EINEN Quatschtext</strong> am Bildschirm.</p>
        </div>

        <div className="bg-white rounded-2xl border-2 p-5 mb-5" style={{ borderColor: "#8DCDC5" }}>
          <p className="font-semibold text-gray-900 mb-3">Jetzt bitte beobachten:</p>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex gap-2"><span>👁️</span><span><strong>Blinzeln:</strong> Blinzelt {kindName} oft, selten oder gar nicht?</span></div>
            <div className="flex gap-2"><span>🔄</span><span><strong>Vergleich:</strong> Liest {kindName} am Bildschirm besser oder schlechter als aus dem Buch?</span></div>
            <div className="flex gap-2"><span>❌</span><span><strong>Fehler:</strong> Zähle falsch gelesene Wörter</span></div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-sm text-amber-800">
          <p className="font-semibold mb-1">⏱️ Starte den Timer erst wenn {kindName} bereit ist:</p>
          <p className="text-sm">Klicke auf „Lesetest starten" → 3-2-1 Countdown beginnt automatisch.</p>
        </div>

        <button
          onClick={() => setPhase("countdown")}
          className="w-full text-white font-bold text-xl py-4 rounded-xl shadow-md"
          style={{ background: "#F5943A" }}
        >
          ⏱️ Lesetest starten →
        </button>
      </div>
    );
  }

  if (phase === "countdown") {
    return (
      <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "400px" }}>
        <p className="text-gray-500 text-lg mb-4">{kindName} bereit machen …</p>
        <div
          className="text-9xl font-black mb-6"
          style={{ color: countdown > 1 ? "#F5943A" : "#8DCDC5", lineHeight: 1 }}
        >
          {countdown}
        </div>
        <p className="text-gray-400 text-sm">{kindName} soll schon auf den Bildschirm schauen</p>
      </div>
    );
  }

  if (phase === "lesen") {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-gray-900">💻 Quatschtext am Bildschirm</h3>
            <p className="text-xs text-gray-400">{kindName} liest laut vor</p>
          </div>
          <span className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold">⏱ {vergangeneZeit}s</span>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mb-4 text-xs text-amber-700 flex gap-4">
          <span>👁️ Blinzeln beobachten</span>
          <span>❌ Fehler zählen</span>
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
          className="w-full text-white font-bold text-xl py-4 rounded-xl shadow-md"
          style={{ background: "#8DCDC5" }}
        >
          ✅ Fertig gelesen — Zeit stoppen
        </button>
      </div>
    );
  }

  if (phase === "qualitaet") {
    return (
      <div>
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">⭐</div>
          <h3 className="text-xl font-bold text-gray-900">Wie hat {kindName} am Bildschirm gelesen?</h3>
          <p className="text-sm text-gray-400">Zeit: {vergangeneZeit}s · Mehrfachauswahl möglich</p>
        </div>

        <div className="space-y-2 mb-5">
          {QUALITAET_OPTIONEN.map(opt => {
            const aktiv = lesequalitaet.includes(opt.id);
            return (
              <button key={opt.id} onClick={() => toggleQualitaet(opt.id)}
                className="w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all"
                style={aktiv ? { borderColor: "#8DCDC5", background: "#E4F5F3" } : { borderColor: "#E5E7EB" }}>
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-sm font-semibold text-gray-900">{opt.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setPhase("fehler")}
          disabled={lesequalitaet.length === 0}
          className="w-full text-white font-bold py-3 rounded-xl disabled:opacity-40"
          style={{ background: "#F5943A" }}
        >
          Weiter →
        </button>
      </div>
    );
  }

  if (phase === "fehler") {
    return (
      <div>
        <div className="text-center mb-5">
          <h3 className="text-xl font-bold text-gray-900">Wie viele Wörter wurden falsch gelesen?</h3>
          <p className="text-xs text-gray-400 mt-1">Falsch = falsches Wort, Buchstabe gedreht, Wort übersprungen</p>
        </div>

        <div className="space-y-2 mb-5">
          {FEHLER_STUFEN.map(stufe => (
            <button key={stufe.wert} onClick={() => setFehlerAnzahl(stufe.wert)}
              className="w-full p-3 rounded-xl border-2 text-left font-semibold text-sm transition-all"
              style={fehlerAnzahl === stufe.wert ? { borderColor: "#8DCDC5", background: "#E4F5F3", color: "#2D7A73" } : { borderColor: "#E5E7EB", color: "#374151" }}>
              {stufe.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setPhase("blinzeln")}
          disabled={fehlerAnzahl === null}
          className="w-full text-white font-bold py-3 rounded-xl disabled:opacity-40"
          style={{ background: "#F5943A" }}
        >
          Weiter →
        </button>
      </div>
    );
  }

  // Phase blinzeln
  return (
    <div>
      <div className="text-center mb-5">
        <div className="text-4xl mb-2">👁️</div>
        <h3 className="text-xl font-bold text-gray-900">Zwei letzte Fragen</h3>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm">
        <p className="font-semibold text-sm text-gray-900 mb-3">Wie oft hat {kindName} beim Lesen am Bildschirm geblinzelt?</p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { val: "selten", label: "Sehr selten / kaum", color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5" },
            { val: "normal", label: "Normal", color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC" },
            { val: "oft", label: "Sehr oft", color: "#D97706", bg: "#FFFBEB", border: "#FCD34D" },
            { val: "nicht_beobachtet", label: "Nicht beobachtet", color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB" },
          ] as const).map(opt => (
            <button key={opt.val} onClick={() => setBlinzeln(opt.val)}
              className="p-3 rounded-xl border-2 text-sm font-semibold transition-all"
              style={blinzeln === opt.val ? { background: opt.bg, borderColor: opt.border, color: opt.color } : { borderColor: "#E5E7EB", color: "#374151" }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 shadow-sm">
        <p className="font-semibold text-sm text-gray-900 mb-3">Hat {kindName} am Bildschirm besser gelesen als aus dem Buch?</p>
        <div className="grid grid-cols-3 gap-2">
          {([
            { val: true, label: "Ja, besser" },
            { val: false, label: "Schlechter / gleich" },
            { val: null, label: "Schwer zu sagen" },
          ] as const).map((opt, i) => (
            <button key={i} onClick={() => setPcLeichter(opt.val)}
              className="p-3 rounded-xl border-2 text-sm font-semibold transition-all"
              style={pcLeichter === opt.val ? { background: "#FEF3E2", borderColor: "#F5943A", color: "#92400E" } : { borderColor: "#E5E7EB", color: "#374151" }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={abschicken}
        disabled={!blinzeln}
        className="w-full text-white font-bold text-xl py-4 rounded-xl shadow-md disabled:opacity-40"
        style={{ background: "#F5943A" }}
      >
        Weiter →
      </button>
    </div>
  );
}
