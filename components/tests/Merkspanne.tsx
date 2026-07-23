"use client";
import { useState, useEffect, useRef } from "react";

interface Props {
  klasse: number;
  onFertig: (result: { fehlerrate: number; reaktionszeit: number }) => void;
}

// Klasse 1: nur neutrale geometrische Formen (keine emotional aufgeladenen Symbole —
// Stern/Herz werden semantisch erkannt, nicht über Form, und verfälschen die Merkspanne)
const POOL_K1 = ["○", "□", "△", "◇", "⬡", "▽", "▷", "◁"];
// Klasse 2: neutrale geometrische Formen (wie K1 — emotionale Symbole verfälschen die Messung)
const POOL_K2 = ["○", "□", "△", "◇", "⬡", "▽", "▷", "◁"];
// Klasse 3-4: konfundierbare Buchstaben
const POOL_SCHWER = ["b", "d", "p", "q", "n", "u", "m", "w"];

// Ähnlich aussehende Ablenker pro Symbol — macht den Test deutlich schwieriger
const AEHNLICHE_LEICHT: Record<string, string[]> = {
  "○": ["⬡", "◇", "□"],
  "□": ["◇", "△", "⬡"],
  "△": ["▽", "□", "◇"],
  "★": ["☆", "♡", "◇"],
  "◇": ["□", "△", "⬡"],
  "♡": ["☆", "★", "◇"],
  "☆": ["★", "♡", "○"],
  "⬡": ["○", "◇", "□"],
  "▽": ["△", "◇", "⬡"],
  "▷": ["◁", "△", "▽"],
  "◁": ["▷", "▽", "△"],
};
const AEHNLICHE_SCHWER: Record<string, string[]> = {
  "b": ["d", "p", "q"],
  "d": ["b", "p", "q"],
  "p": ["q", "b", "d"],
  "q": ["p", "b", "d"],
  "n": ["u", "m", "w"],
  "u": ["n", "m", "w"],
  "m": ["w", "n", "u"],
  "w": ["m", "n", "u"],
};

function generiereRunde(pool: string[], aehnliche: Record<string, string[]>, rundeIndex: number) {
  const shuffled = [...pool].sort(() => (Math.sin(rundeIndex * 137.5) > 0 ? 1 : -1));
  const zielItem = shuffled[rundeIndex % pool.length];
  const moeglicheAblenker = aehnliche[zielItem] ?? pool.filter(x => x !== zielItem).slice(0, 3);
  const ablenker = [...moeglicheAblenker].sort(() => Math.random() - 0.5).slice(0, 3);
  const optionen: string[] = [...ablenker];
  const richtigPos = Math.floor(Math.random() * 4);
  optionen.splice(richtigPos, 0, zielItem);
  return { zielItem, optionen, richtigPos };
}

const RUNDEN = 8;

// Zeigt-Dauer wird pro Runde kürzer: Runde 0 am längsten, Runde 7 am kürzesten
function getZeigeDauer(runde: number, klasse: number): number {
  if (klasse >= 4) { const s = 650, step = 50; return Math.max(300, s - runde * step); }
  if (klasse === 3) { const s = 850, step = 70; return Math.max(360, s - runde * step); }
  const s = 1400, step = 100; return Math.max(600, s - runde * step);
}

export default function Merkspanne({ klasse, onFertig }: Props) {
  const schwer = klasse >= 3;
  const pool = schwer ? POOL_SCHWER : klasse >= 2 ? POOL_K2 : POOL_K1;
  const aehnliche = schwer ? AEHNLICHE_SCHWER : AEHNLICHE_LEICHT;
  const anzeigeGroesse = schwer ? "56px" : "64px";

  const [runde, setRunde] = useState(0);
  const [displayPhase, setDisplayPhase] = useState<"zeigen" | "antworten" | "feedback">("zeigen");
  const [aktRundeDaten, setAktRundeDaten] = useState(() => generiereRunde(pool, aehnliche, 0));
  const [fehler, setFehler] = useState(0);
  const [zeiten, setZeiten] = useState<number[]>([]);
  const [letzteRichtig, setLetzteRichtig] = useState<boolean | null>(null);
  const zeitRef = useRef(Date.now());

  const zeigeDauer = getZeigeDauer(runde, klasse);

  useEffect(() => {
    if (displayPhase === "zeigen") {
      const t = setTimeout(() => {
        setDisplayPhase("antworten");
        zeitRef.current = Date.now();
      }, zeigeDauer);
      return () => clearTimeout(t);
    }
  }, [displayPhase, zeigeDauer]);

  function antworten(index: number) {
    if (displayPhase !== "antworten") return;
    const reaktion = Date.now() - zeitRef.current;
    const richtig = index === aktRundeDaten.richtigPos;
    const neueFehler = richtig ? fehler : fehler + 1;
    const neueZeiten = [...zeiten, reaktion];
    setLetzteRichtig(richtig);
    setDisplayPhase("feedback");

    setTimeout(() => {
      const naechste = runde + 1;
      if (naechste >= RUNDEN) {
        const mittel = neueZeiten.reduce((a, b) => a + b, 0) / neueZeiten.length;
        onFertig({ fehlerrate: neueFehler / RUNDEN, reaktionszeit: mittel });
      } else {
        setFehler(neueFehler);
        setZeiten(neueZeiten);
        setRunde(naechste);
        setAktRundeDaten(generiereRunde(pool, aehnliche, naechste));
        setLetzteRichtig(null);
        setDisplayPhase("zeigen");
      }
    }, 600);
  }

  return (
    <div>
      <div className="text-sm text-gray-500 text-center mb-1">
        Runde {Math.min(runde + 1, RUNDEN)} / {RUNDEN}
      </div>

      <div className="flex gap-1 mb-5">
        {Array.from({ length: RUNDEN }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full"
            style={{ background: i < runde ? "#F5943A" : i === runde ? "#8DCDC5" : "#E5E7EB" }}
          />
        ))}
      </div>

      {/* Zeige-Phase */}
      {displayPhase === "zeigen" && (
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-semibold">
            Merke dir dieses Symbol:
          </div>
          <div
            className="rounded-2xl flex items-center justify-center mx-auto mb-4 border-2"
            style={{ height: "160px", maxWidth: "220px", background: "white", borderColor: "#8DCDC5" }}
          >
            <span
              className="font-mono font-bold text-gray-900"
              style={{ fontSize: schwer ? "96px" : "108px", lineHeight: 1 }}
            >
              {aktRundeDaten.zielItem}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-xs mx-auto overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                background: "#F5943A",
                width: "100%",
                animation: `shrink ${zeigeDauer}ms linear forwards`,
              }}
            />
          </div>
          <style>{`@keyframes shrink { from{width:100%} to{width:0%} }`}</style>
          <p className="text-xs text-gray-400 mt-2">Gleich verschwinden …</p>
        </div>
      )}

      {/* Antwort-Phase */}
      {(displayPhase === "antworten" || displayPhase === "feedback") && (
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-semibold">
            Was hast du gesehen?
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-4">
            {aktRundeDaten.optionen.map((opt, i) => {
              let style: React.CSSProperties = { borderColor: "#E5E7EB", background: "white" };
              if (displayPhase === "feedback") {
                if (i === aktRundeDaten.richtigPos) style = { borderColor: "#86EFAC", background: "#F0FDF4" };
                else if (letzteRichtig === false) style = { borderColor: "#FCA5A5", background: "#FEF2F2" };
              }
              return (
                <button
                  key={i}
                  onClick={() => antworten(i)}
                  disabled={displayPhase === "feedback"}
                  className="flex items-center justify-center bg-white border-2 rounded-2xl hover:border-orange-300 transition-all active:scale-95 shadow-sm disabled:cursor-default"
                  style={{ height: "100px", fontSize: anzeigeGroesse, ...style }}
                >
                  <span className="font-mono font-bold text-gray-900">{opt}</span>
                </button>
              );
            })}
          </div>

          {displayPhase === "feedback" && letzteRichtig !== null && (
            <div className={`text-center text-lg font-bold ${letzteRichtig ? "text-green-600" : "text-orange-500"}`}>
              {letzteRichtig ? "⭐ Super!" : "🙈 Weiter geht's!"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
