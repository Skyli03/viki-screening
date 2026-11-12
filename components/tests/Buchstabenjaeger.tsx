"use client";
import { useState } from "react";
import type { BuchstabenErgebnis } from "@/lib/screening-types";
import { Infobox, SchrittKopf, WeiterKnopf, ORANGE, TUERKIS } from "@/components/ui";

interface Props {
  kindName: string;
  klasse: number;
  onFertig: (ergebnis: BuchstabenErgebnis) => void;
}

const RUNDEN = 8;

// Je 4× gleich und 4× verschieden. Ohne Zeitdruck und ohne Aufblitzen:
// gemessen wird nur, ob ähnliche Buchstaben sicher unterschieden werden.
function paareFuer(klasse: number): [string, string][] {
  const verschieden: [string, string][] =
    klasse <= 1 ? [["b", "d"], ["d", "b"], ["b", "d"], ["d", "b"]]
    : klasse === 2 ? [["b", "d"], ["p", "q"], ["d", "b"], ["q", "p"]]
    : [["b", "d"], ["p", "q"], ["n", "u"], ["d", "p"]];
  const gleich: [string, string][] =
    klasse <= 1 ? [["b", "b"], ["d", "d"], ["b", "b"], ["d", "d"]]
    : klasse === 2 ? [["b", "b"], ["d", "d"], ["p", "p"], ["q", "q"]]
    : [["d", "d"], ["q", "q"], ["u", "u"], ["b", "b"]];
  const alle = [...verschieden, ...gleich];
  for (let i = alle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [alle[i], alle[j]] = [alle[j], alle[i]];
  }
  return alle;
}

export default function Buchstabenjaeger({ kindName, klasse, onFertig }: Props) {
  const [phase, setPhase] = useState<"intro" | "spiel">("intro");
  const [paare] = useState(() => paareFuer(klasse));
  const [runde, setRunde] = useState(0);
  const [fehler, setFehler] = useState(0);
  const [pause, setPause] = useState(false);

  if (phase === "intro") {
    return (
      <div>
        <div className="rounded-xl px-4 py-3 mb-5 font-semibold text-center" style={{ background: "#FFF3CD", color: "#92400E", border: "1px solid #FCD34D" }}>
          👉 Jetzt ist {kindName} dran! Gib das Handy bitte deinem Kind.
        </div>
        <SchrittKopf emoji="🔤" titel="Buchstabenjäger" unter="Schau dir die zwei Buchstaben an: Sind sie gleich oder verschieden?" />
        <div className="mb-6">
          <Infobox>💡 Für Eltern: b, d, p und q sehen sich sehr ähnlich. Hier sehen wir, ob dein Kind sie schon sicher auseinanderhält. Es gibt keine Zeitbegrenzung.</Infobox>
        </div>
        <WeiterKnopf onClick={() => setPhase("spiel")}>Los geht&apos;s →</WeiterKnopf>
      </div>
    );
  }

  const [links, rechts] = paare[runde];
  const schrift = klasse <= 2 ? 110 : 88;

  function antworte(gleich: boolean) {
    if (pause) return;
    const richtig = (links === rechts) === gleich;
    const neueFehler = richtig ? fehler : fehler + 1;
    setPause(true);
    setTimeout(() => {
      if (runde + 1 >= RUNDEN) {
        onFertig({ fehler: neueFehler, runden: RUNDEN });
        return;
      }
      setFehler(neueFehler);
      setRunde(r => r + 1);
      setPause(false);
    }, 450);
  }

  return (
    <div className="text-center">
      <div className="flex gap-1.5 mb-6 max-w-xs mx-auto">
        {Array.from({ length: RUNDEN }).map((_, i) => (
          <div key={i} className="flex-1 h-2 rounded-full" style={{ background: i < runde ? ORANGE : i === runde ? TUERKIS : "#E5E7EB" }} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-10 mb-8 bg-white rounded-3xl shadow-sm border border-gray-100 py-8 select-none" style={{ minHeight: 180 }}>
        {pause ? (
          <span className="text-6xl">👍</span>
        ) : (
          <>
            <span style={{ fontSize: schrift, fontFamily: "Arial, sans-serif", lineHeight: 1, color: "#1F2937" }}>{links}</span>
            <span style={{ fontSize: schrift, fontFamily: "Arial, sans-serif", lineHeight: 1, color: "#1F2937" }}>{rechts}</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => antworte(true)} disabled={pause}
          className="py-5 rounded-2xl text-white font-bold text-xl shadow-md active:scale-95 transition-transform" style={{ background: TUERKIS }}>
          = gleich
        </button>
        <button onClick={() => antworte(false)} disabled={pause}
          className="py-5 rounded-2xl text-white font-bold text-xl shadow-md active:scale-95 transition-transform" style={{ background: ORANGE }}>
          ≠ verschieden
        </button>
      </div>
      <p className="text-sm text-gray-400 mt-4">Runde {runde + 1} von {RUNDEN}</p>
    </div>
  );
}
