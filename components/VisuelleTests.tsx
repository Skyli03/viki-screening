"use client";
import { useState } from "react";
import LRSTest from "@/components/tests/LRSTest";
import VisuelleDiskrimination from "@/components/tests/VisuelleDiskrimination";
import Merkspanne from "@/components/tests/Merkspanne";
import type { MiniTestErgebnis } from "@/lib/screening-types";

interface Props {
  kindName: string;
  klasse: number;
  onFertig: (ergebnis: MiniTestErgebnis) => void;
}

type Phase =
  | "buchstaben_intro"
  | "buchstaben"
  | "formen_intro"
  | "formen"
  | "merkspanne_intro"
  | "merkspanne";

function IntroCard({
  emoji, name, beschreibung, warum, hinweis, onStart,
}: { emoji: string; name: string; beschreibung: string; warum: string; hinweis: string; onStart: () => void }) {
  return (
    <div className="text-center">
      <div className="text-6xl mb-3">{emoji}</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">{name}</h2>
      <p className="text-gray-500 text-sm mb-3">{beschreibung}</p>
      <div className="rounded-xl px-4 py-3 mb-4 text-sm text-center max-w-sm mx-auto" style={{ background: "#E4F5F3", color: "#2D7A73" }}>
        💡 {warum}
      </div>
      <div className="rounded-xl p-4 text-sm text-left mb-6 max-w-sm mx-auto border-l-4" style={{ background: "#FFF8F0", borderLeftColor: "#F5943A", color: "#374151" }}>
        🎯 {hinweis}
      </div>
      <button
        onClick={onStart}
        className="w-full max-w-sm text-white font-bold text-xl py-4 rounded-xl shadow-md"
        style={{ background: "#F5943A" }}
      >
        Los geht&apos;s →
      </button>
    </div>
  );
}

export default function VisuelleTests({ kindName, klasse, onFertig }: Props) {
  const [phase, setPhase] = useState<Phase>("buchstaben_intro");
  const [buchstaben, setBuchstaben] = useState<{ verwechslungen: number; reaktionszeit: number } | null>(null);
  const [formen, setFormen] = useState<{ fehlerrate: number; geschwindigkeit: number } | null>(null);

  function buchstabenFertig(r: { verwechslungen: number; reaktionszeit: number }) {
    setBuchstaben(r);
    setPhase("formen_intro");
  }

  function formenFertig(r: { fehlerrate: number; geschwindigkeit: number }) {
    setFormen(r);
    setPhase("merkspanne_intro");
  }

  function merkspanneFertig(r: { fehlerrate: number; reaktionszeit: number }) {
    onFertig({
      buchstaben: buchstaben ?? { verwechslungen: 0, reaktionszeit: 1500 },
      formen: formen ?? { fehlerrate: 0, geschwindigkeit: 1500 },
      merkspanne: r,
    });
  }

  return (
    <div>
      {/* Fortschrittsanzeige */}
      <div className="flex gap-2 mb-6">
        {(["buchstaben", "formen", "merkspanne"] as const).map((id, i) => {
          const aktiv = phase.startsWith(id);
          const fertig =
            (id === "buchstaben" && !!buchstaben) ||
            (id === "formen" && !!formen);
          return (
            <div key={id} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="h-2 w-full rounded-full"
                style={{ background: fertig ? "#F5943A" : aktiv ? "#8DCDC5" : "#E5E7EB" }}
              />
              <span className="text-xs text-gray-400">{["Buchstabenjäger", "Spürnase", "Blitzgedächtnis"][i]}</span>
            </div>
          );
        })}
      </div>

      {phase === "buchstaben_intro" && (
        <IntroCard
          emoji="🔤"
          name="Buchstabenjäger"
          beschreibung={`${kindName} entscheidet: Sind die zwei Buchstaben gleich oder verschieden?`}
          warum={`b, d, p, q sind spiegelverkehrt zum Verwechseln ähnlich. Wer sie nicht automatisch unterscheidet, muss beim Lesen jedes Mal kurz nachdenken statt sofort zu erkennen.`}
          hinweis={`Manche Buchstaben (b/d, p/q${klasse >= 3 ? ", n/u, m/w" : ""}) sehen sich sehr ähnlich. Schau genau hin — und antworte schnell!`}
          onStart={() => setPhase("buchstaben")}
        />
      )}

      {phase === "buchstaben" && (
        <LRSTest klasse={klasse} onFertig={buchstabenFertig} />
      )}

      {phase === "formen_intro" && (
        <IntroCard
          emoji="🔍"
          name="Spürnase"
          beschreibung={`3 Symbole sind gleich — eines schleicht sich rein. ${kindName} tippt so schnell wie möglich das Sonderzeichen!`}
          warum="Das Gehirn muss Formen blitzschnell sortieren und unterscheiden. Klappt das nicht automatisch, wird jedes Lesen zur Denkaufgabe statt zur Routine."
          hinweis="Schau dir alle 4 Symbole genau an. Drei davon sind identisch — welches passt nicht dazu? Schnell tippen!"
          onStart={() => setPhase("formen")}
        />
      )}

      {phase === "formen" && (
        <VisuelleDiskrimination klasse={klasse} onFertig={formenFertig} />
      )}

      {phase === "merkspanne_intro" && (
        <IntroCard
          emoji="⚡"
          name="Blitzgedächtnis"
          beschreibung={`Ein Symbol blitzt kurz auf und verschwindet. ${kindName} tippt es aus dem Gedächtnis!`}
          warum="Wer ein Zeichen sieht und es sofort vergisst, kann aus Buchstaben kein Wort zusammensetzen. Visuelles Kurzzeitgedächtnis ist die unsichtbare Grundlage des Lesens."
          hinweis={`${klasse <= 2 ? "Ein Symbol" : "Ein Buchstabe"} erscheint kurz — und ist dann weg. Welches war es? Schnell tippen!`}
          onStart={() => setPhase("merkspanne")}
        />
      )}

      {phase === "merkspanne" && (
        <Merkspanne klasse={klasse} onFertig={merkspanneFertig} />
      )}
    </div>
  );
}
