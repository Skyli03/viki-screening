"use client";
import { useState, useCallback, useEffect, useRef } from "react";

interface Props {
  klasse: number;
  onFertig: (result: { verwechslungen: number; reaktionszeit: number }) => void;
}

// Klasse 1: nur b/d (typische Verwechslung, normal für Klasse 1)
const PAARE_K1: Array<[string, string, boolean]> = [
  ["b", "d", false], ["d", "b", false], ["b", "b", true], ["d", "d", true],
  ["b", "d", false], ["d", "b", false], ["b", "b", true], ["d", "d", true],
];

// Klasse 2: b/d + p/q
const PAARE_K2: Array<[string, string, boolean]> = [
  ["b", "d", false], ["p", "q", false], ["b", "b", true], ["d", "d", true],
  ["p", "p", true], ["b", "p", false], ["d", "q", false], ["q", "q", true],
  ["d", "b", false], ["p", "d", false],
];

// Klasse 3+: alle konfundierbaren Paare
const PAARE_K3PLUS: Array<[string, string, boolean]> = [
  ["b", "d", false], ["p", "q", false], ["b", "b", true], ["d", "d", true],
  ["p", "p", true], ["b", "p", false], ["d", "q", false], ["b", "q", false],
  ["n", "u", false], ["m", "w", false], ["n", "n", true], ["m", "m", true],
  ["u", "n", false], ["w", "m", false], ["p", "d", false], ["q", "q", true],
];

const RUNDEN_PRO_KLASSE: Record<number, number> = { 1: 8, 2: 10, 3: 12, 4: 12 };
const SCHRIFTGROESSE: Record<number, number> = { 1: 110, 2: 96, 3: 64, 4: 52 };
const ZEITLIMIT_MS: Record<number, number> = { 1: 4500, 2: 3500, 3: 2200, 4: 1800 };
// Klasse 3-4: Buchstaben nur kurz sichtbar → Kind muss aus dem Gedächtnis antworten
const FLASH_MS: Partial<Record<number, number>> = { 3: 1000, 4: 700 };

function getKonfig(klasse: number) {
  const k = Math.min(4, Math.max(1, klasse));
  const paare = k === 1 ? PAARE_K1 : k === 2 ? PAARE_K2 : PAARE_K3PLUS;
  return {
    paare,
    runden: RUNDEN_PRO_KLASSE[k] ?? 10,
    schriftgroesse: SCHRIFTGROESSE[k] ?? 64,
    zeitlimit: ZEITLIMIT_MS[k] ?? 2200,
    flashDauer: FLASH_MS[k] ?? null,
  };
}

export default function LRSTest({ klasse, onFertig }: Props) {
  const { paare, runden: RUNDEN, schriftgroesse, zeitlimit, flashDauer } = getKonfig(klasse);

  const [runde, setRunde] = useState(0);
  const [verwechslungen, setVerwechslungen] = useState(0);
  const [zeiten, setZeiten] = useState<number[]>([]);
  const [zeitRef, setZeitRef] = useState(Date.now());
  const [bewertet, setBewertet] = useState(false);
  const [letzteAntwort, setLetzteAntwort] = useState<boolean | null>(null);
  const [verstricheneMs, setVerstricheneMs] = useState(0);
  const [sichtbar, setSichtbar] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [links, rechts, gleich] = paare[runde % paare.length];

  // Flash: Buchstaben nach flashDauer ms ausblenden
  useEffect(() => {
    setSichtbar(true);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    if (flashDauer) {
      flashTimerRef.current = setTimeout(() => setSichtbar(false), flashDauer);
    }
    return () => { if (flashTimerRef.current) clearTimeout(flashTimerRef.current); };
  }, [runde, flashDauer]);

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
  }, [bewertet, zeitRef, gleich, verwechslungen, zeiten, runde, onFertig, RUNDEN]);

  const timerProzent = Math.min(100, (verstricheneMs / zeitlimit) * 100);
  const timerFarbe = timerProzent < 60 ? "#8DCDC5" : timerProzent < 85 ? "#F5943A" : "#EF4444";

  return (
    <div>
      <div className="text-sm text-gray-500 text-center mb-3">
        Runde {Math.min(runde + 1, RUNDEN)} / {RUNDEN} — Sind die zwei Buchstaben gleich oder verschieden?
      </div>

      {!bewertet && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>⏱️ {(verstricheneMs / 1000).toFixed(1)}s</span>
            <span style={{ color: timerProzent > 85 ? "#EF4444" : "#9CA3AF" }}>
              {timerProzent > 85 ? "⚠️ langsam" : `Ziel: <${(zeitlimit / 1000).toFixed(1)}s`}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${timerProzent}%`, background: timerFarbe, transition: "width 0.1s linear" }}
            />
          </div>
        </div>
      )}

      {flashDauer && !sichtbar && !bewertet && (
        <div className="text-center text-xs font-semibold mb-1" style={{ color: "#8DCDC5" }}>
          Aus dem Gedächtnis antworten!
        </div>
      )}

      <div className="flex items-center justify-center gap-12 mb-10" style={{ minHeight: "160px" }}>
        <span
          className="font-mono font-bold select-none transition-all duration-150"
          style={{
            fontSize: `${schriftgroesse}px`,
            lineHeight: 1,
            color: sichtbar || bewertet ? "#111827" : "#D1D5DB",
          }}
        >
          {sichtbar || bewertet ? links : "?"}
        </span>
        <span
          className="font-mono font-bold select-none transition-all duration-150"
          style={{
            fontSize: `${schriftgroesse}px`,
            lineHeight: 1,
            color: sichtbar || bewertet ? "#111827" : "#D1D5DB",
          }}
        >
          {sichtbar || bewertet ? rechts : "?"}
        </span>
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
