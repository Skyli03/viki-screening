"use client";
import { useState, useEffect, useRef } from "react";

interface Props {
  klasse: number;
  onFertig: (result: { fehlerrate: number; reaktionszeit: number }) => void;
}

// Klasse 1-2: einfache Symbole
const POOL_LEICHT = ["○", "□", "△", "★", "◇", "♡", "☆", "⬡"];
// Klasse 3-4: konfundierbare Buchstaben
const POOL_SCHWER = ["b", "d", "p", "q", "n", "u", "m", "w"];

function generiereRunde(pool: string[], rundeIndex: number) {
  // Wähle das Ziel-Symbol deterministisch nach Index, dann misch die Reihenfolge leicht
  const shuffled = [...pool].sort(() => (Math.sin(rundeIndex * 137.5) > 0 ? 1 : -1));
  const zielItem = shuffled[rundeIndex % pool.length];
  // 3 Ablenker aus dem Pool — NIEMALS das Ziel selbst
  const moeglicheAblenker = pool.filter(x => x !== zielItem);
  const ablenker = moeglicheAblenker
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  // Alle 4 Optionen zusammenstellen
  const optionen: string[] = [...ablenker];
  const richtigPos = Math.floor(Math.random() * 4);
  optionen.splice(richtigPos, 0, zielItem);
  return { zielItem, optionen, richtigPos };
}

const RUNDEN = 8;

export default function Merkspanne({ klasse, onFertig }: Props) {
  const schwer = klasse >= 3;
  const pool = schwer ? POOL_SCHWER : POOL_LEICHT;
  const zeigeDauer = schwer ? 1000 : 1500;
  const anzeigeGroesse = schwer ? "56px" : "64px";

  const [runde, setRunde] = useState(0);
  const [displayPhase, setDisplayPhase] = useState<"zeigen" | "antworten" | "feedback">("zeigen");
  const [aktRundeDaten, setAktRundeDaten] = useState(() => generiereRunde(pool, 0));
  const [fehler, setFehler] = useState(0);
  const [zeiten, setZeiten] = useState<number[]>([]);
  const [letzteRichtig, setLetzteRichtig] = useState<boolean | null>(null);
  const zeitRef = useRef(Date.now());

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
        setAktRundeDaten(generiereRunde(pool, naechste));
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

      {/* Fortschritt */}
      <div className="flex gap-1 mb-5">
        {Array.from({ length: RUNDEN }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full"
            style={{ background: i < runde ? "#F5943A" : i === runde ? "#8DCDC5" : "#E5E7EB" }}
          />
        ))}
      </div>

      {/* Zeige-Phase — 1 Symbol */}
      {displayPhase === "zeigen" && (
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-semibold">
            Merke dir dieses Symbol:
          </div>
          <div
            className="rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ height: "160px", maxWidth: "220px", background: "#1F2937" }}
          >
            <span
              className="font-mono font-bold text-white"
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
