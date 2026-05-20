"use client";
import { useState, useCallback, useEffect, useRef } from "react";

interface Props {
  onFertig: (result: { verwechslungen: number; reaktionszeit: number }) => void;
}

const PAARE: Array<[string, string, boolean]> = [
  ["b", "d", false], ["p", "q", false], ["b", "b", true], ["d", "d", true],
  ["p", "p", true], ["b", "p", false], ["d", "q", false], ["b", "q", false],
  ["p", "d", false], ["b", "d", false], ["q", "q", true], ["p", "b", false],
  ["d", "b", false], ["q", "p", false], ["b", "b", true], ["d", "q", false],
];

const RUNDEN = 12;

// Zeitlimits pro Klasse (ms) — ab wann gilt eine Antwort als "langsam"
// Basierend auf Entwicklungsforschung zur visuellen Diskrimination
const ZEITLIMIT_MS: Record<number, number> = {
  1: 3500,
  2: 2800,
  3: 2200,
  4: 1800,
};
function getZeitlimit(klasse: number): number {
  if (klasse <= 1) return ZEITLIMIT_MS[1];
  if (klasse >= 4) return ZEITLIMIT_MS[4];
  return ZEITLIMIT_MS[klasse] ?? 2200;
}

export default function LRSTest({ onFertig }: Props) {
  const [runde, setRunde] = useState(0);
  const [verwechslungen, setVerwechslungen] = useState(0);
  const [zeiten, setZeiten] = useState<number[]>([]);
  const [zeitRef, setZeitRef] = useState(Date.now());
  const [bewertet, setBewertet] = useState(false);
  const [letzteAntwort, setLetzteAntwort] = useState<boolean | null>(null);
  const [verstricheneMs, setVerstricheneMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Klasse aus sessionStorage lesen
  const klasse = typeof window !== "undefined"
    ? Number(sessionStorage.getItem("klasse") ?? "2")
    : 2;
  const zeitlimit = getZeitlimit(klasse);

  // Timer pro Runde
  useEffect(() => {
    if (bewertet) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setVerstricheneMs(0);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      setVerstricheneMs(Date.now() - start);
    }, 100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [runde, bewertet]);

  const [links, rechts, gleich] = PAARE[runde % PAARE.length];

  const antworten = useCallback((antwortGleich: boolean) => {
    if (bewertet) return;
    setBewertet(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const reaktion = Date.now() - zeitRef;
    const richtig = antwortGleich === gleich;
    setLetzteAntwort(richtig);
    const neueVerwechslungen = richtig ? verwechslungen : verwechslungen + 1;
    const neueZeiten = [...zeiten, reaktion];
    const naechste = runde + 1;

    if (naechste >= RUNDEN) {
      const mittel = neueZeiten.reduce((a, b) => a + b, 0) / neueZeiten.length;
      setTimeout(() => onFertig({ verwechslungen: neueVerwechslungen, reaktionszeit: mittel }), 600);
    } else {
      setTimeout(() => {
        setVerwechslungen(neueVerwechslungen);
        setZeiten(neueZeiten);
        setRunde(naechste);
        setZeitRef(Date.now());
        setBewertet(false);
        setLetzteAntwort(null);
      }, 500);
    }
  }, [bewertet, zeitRef, gleich, verwechslungen, zeiten, runde, onFertig]);

  const timerProzent = Math.min(100, (verstricheneMs / zeitlimit) * 100);
  const timerFarbe = timerProzent < 60 ? "#8DCDC5" : timerProzent < 85 ? "#F5943A" : "#EF4444";
  const timerSek = (verstricheneMs / 1000).toFixed(1);

  return (
    <div>
      <div className="text-sm text-gray-500 text-center mb-3">
        Runde {Math.min(runde + 1, RUNDEN)} / {RUNDEN} — Sind die zwei Buchstaben gleich oder verschieden?
      </div>

      {/* Timer-Balken */}
      {!bewertet && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>⏱️ {timerSek}s</span>
            <span style={{ color: timerProzent > 85 ? "#EF4444" : "#9CA3AF" }}>
              {timerProzent > 85 ? "⚠️ langsam" : `Ziel: <${(zeitlimit / 1000).toFixed(1)}s`}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${timerProzent}%`, background: timerFarbe, transition: "width 0.1s linear" }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-12 mb-10" style={{ minHeight: "160px" }}>
        <span className="font-mono font-bold text-gray-900 select-none" style={{ fontSize: "96px", lineHeight: 1 }}>{links}</span>
        <span className="font-mono font-bold text-gray-900 select-none" style={{ fontSize: "96px", lineHeight: 1 }}>{rechts}</span>
      </div>

      {letzteAntwort !== null && (
        <div className={`text-center text-xl font-bold mb-4 ${letzteAntwort ? "text-green-600" : "text-orange-500"}`}>
          {letzteAntwort ? "⭐ Super!" : "🙈 Ups — weiter geht's!"}
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <button
          onClick={() => antworten(true)}
          disabled={bewertet}
          className="flex-1 max-w-xs py-4 rounded-xl font-bold text-xl border-2 border-green-400 bg-green-50 text-green-800 hover:bg-green-100 active:scale-95 transition-all disabled:opacity-50"
        >
          👍 Gleich
        </button>
        <button
          onClick={() => antworten(false)}
          disabled={bewertet}
          className="flex-1 max-w-xs py-4 rounded-xl font-bold text-xl border-2 border-orange-400 bg-orange-50 text-orange-800 hover:bg-orange-100 active:scale-95 transition-all disabled:opacity-50"
        >
          ✌️ Verschieden
        </button>
      </div>
    </div>
  );
}
