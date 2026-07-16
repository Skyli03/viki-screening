"use client";
import { useState, useCallback } from "react";

interface Props {
  klasse: number;
  onFertig: (result: { fehlerrate: number; geschwindigkeit: number }) => void;
}

// Klasse 1-2: klar unterschiedliche Symbole
const SETS_LEICHT = [
  { basis: "○", aehnlich: "●" }, { basis: "□", aehnlich: "■" },
  { basis: "△", aehnlich: "▲" }, { basis: "◇", aehnlich: "◆" },
  { basis: "★", aehnlich: "☆" }, { basis: "○", aehnlich: "●" },
  { basis: "□", aehnlich: "■" }, { basis: "△", aehnlich: "▲" },
  { basis: "◇", aehnlich: "◆" }, { basis: "★", aehnlich: "☆" },
];

// Klasse 3-4: ähnlichere Symbole
const SETS_SCHWER = [
  { basis: "⬟", aehnlich: "⬡" }, { basis: "⬡", aehnlich: "⬠" },
  { basis: "◻", aehnlich: "▫" }, { basis: "▿", aehnlich: "△" },
  { basis: "⬟", aehnlich: "⬠" }, { basis: "◇", aehnlich: "◈" },
  { basis: "⬡", aehnlich: "⬟" }, { basis: "▿", aehnlich: "▽" },
  { basis: "◻", aehnlich: "□" }, { basis: "⬠", aehnlich: "⬡" },
];

const RUNDEN = 10;

function generiereRunde(sets: typeof SETS_LEICHT, runde: number) {
  const { basis, aehnlich } = sets[runde % sets.length];
  const andersIndex = Math.floor(Math.random() * 4);
  const optionen = [aehnlich, aehnlich, aehnlich, aehnlich];
  optionen[andersIndex] = basis;
  return { optionen, richtig: andersIndex };
}

export default function VisuelleDiskrimination({ klasse, onFertig }: Props) {
  const sets = klasse >= 3 ? SETS_SCHWER : SETS_LEICHT;

  const [runde, setRunde] = useState(0);
  const [fehler, setFehler] = useState(0);
  const [zeiten, setZeiten] = useState<number[]>([]);
  const [aktRunde, setAktRunde] = useState(() => generiereRunde(sets, 0));
  const [zeitRef, setZeitRef] = useState(Date.now());
  const [bewertet, setBewertet] = useState(false);
  const [letzteRichtig, setLetzteRichtig] = useState<boolean | null>(null);

  const antworten = useCallback((index: number) => {
    if (bewertet) return;
    setBewertet(true);
    const reaktion = Date.now() - zeitRef;
    const istRichtig = index === aktRunde.richtig;
    setLetzteRichtig(istRichtig);
    const neueFehler = istRichtig ? fehler : fehler + 1;
    const neueZeiten = [...zeiten, reaktion];
    const naechste = runde + 1;

    if (naechste >= RUNDEN) {
      const mittelZeit = neueZeiten.reduce((a, b) => a + b, 0) / neueZeiten.length;
      setTimeout(() => onFertig({ fehlerrate: neueFehler / RUNDEN, geschwindigkeit: mittelZeit }), 500);
    } else {
      setTimeout(() => {
        setFehler(neueFehler);
        setZeiten(neueZeiten);
        setRunde(naechste);
        setAktRunde(generiereRunde(sets, naechste));
        setZeitRef(Date.now());
        setBewertet(false);
        setLetzteRichtig(null);
      }, 400);
    }
  }, [bewertet, zeitRef, aktRunde, fehler, zeiten, runde, onFertig, sets]);

  return (
    <div>
      <div className="text-sm text-gray-500 text-center mb-4">
        Runde {Math.min(runde + 1, RUNDEN)} / {RUNDEN} — Welches Symbol ist anders?
      </div>

      {letzteRichtig !== null && (
        <div className={`text-center text-lg font-bold mb-3 ${letzteRichtig ? "text-green-600" : "text-orange-500"}`}>
          {letzteRichtig ? "⭐ Super!" : "🙈 Ups — weiter!"}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 max-w-xs mx-auto" style={{ minHeight: "300px", alignContent: "center" }}>
        {aktRunde.optionen.map((sym, i) => (
          <button
            key={i}
            onClick={() => antworten(i)}
            disabled={bewertet}
            className="flex items-center justify-center bg-white border-2 border-gray-200 rounded-2xl hover:border-orange-400 hover:bg-orange-50 transition-all active:scale-95 shadow-sm disabled:opacity-70"
            style={{ height: "110px", fontSize: "44px" }}
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  );
}
