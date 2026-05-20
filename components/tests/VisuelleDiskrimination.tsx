"use client";
import { useState, useCallback } from "react";

interface Props {
  onFertig: (result: { fehlerrate: number; geschwindigkeit: number }) => void;
}

const SYMBOLE = ["○", "□", "△", "◇", "★", "⬟", "⬡", "⬠"];

function generiereRunde(runde: number) {
  const basis = SYMBOLE[runde % SYMBOLE.length];
  const aehnlich = getAehnlich(basis);
  const andersIndex = Math.floor(Math.random() * 4);
  const optionen = [aehnlich, aehnlich, aehnlich, aehnlich];
  optionen[andersIndex] = basis;
  return { optionen, richtig: andersIndex };
}

function getAehnlich(sym: string): string {
  const paare: Record<string, string> = {
    "○": "●", "□": "■", "△": "▲", "◇": "◆",
    "★": "☆", "⬟": "⬡", "⬡": "⬟", "⬠": "⬡",
  };
  return paare[sym] ?? sym + "·";
}

const RUNDEN = 10;

export default function VisuelleDiskrimination({ onFertig }: Props) {
  const [runde, setRunde] = useState(0);
  const [fehler, setFehler] = useState(0);
  const [zeiten, setZeiten] = useState<number[]>([]);
  const [erschienZeit] = useState(() => Date.now());
  const [aktuelleRunde] = useState(() => generiereRunde(0));
  const [aktRunde, setAktRunde] = useState(aktuelleRunde);
  const [zeitRef, setZeitRef] = useState(Date.now());
  const [bewertet, setBewertet] = useState(false);

  const antworten = useCallback((index: number) => {
    if (bewertet) return;
    setBewertet(true);
    const reaktion = Date.now() - zeitRef;
    const istRichtig = index === aktRunde.richtig;
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
        setAktRunde(generiereRunde(naechste));
        setZeitRef(Date.now());
        setBewertet(false);
      }, 400);
    }
  }, [bewertet, zeitRef, aktRunde, fehler, zeiten, runde, onFertig]);

  const groesse = 28 + runde * 2;

  return (
    <div>
      <div className="text-sm text-gray-500 text-center mb-4">
        Runde {Math.min(runde + 1, RUNDEN)} / {RUNDEN} — Welches Symbol ist anders?
      </div>
      <div className="grid grid-cols-2 gap-6 max-w-xs mx-auto" style={{ minHeight: "300px", alignContent: "center" }}>
        {aktRunde.optionen.map((sym, i) => (
          <button
            key={i}
            onClick={() => antworten(i)}
            disabled={bewertet}
            className="flex items-center justify-center bg-white border-2 border-gray-200 rounded-2xl hover:border-primary hover:bg-orange-50 transition-all active:scale-95 shadow-sm"
            style={{ height: "110px", fontSize: `${groesse}px` }}
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  );
}
