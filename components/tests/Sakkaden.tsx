"use client";
import { useState } from "react";

// Sakkaden-Test nach ENWAKO-Protokoll
// Sarah Kopetzky: "Ich halte 2 Stifte mit silberner Spitze hoch, ca. 40 cm Abstand,
//  Schulterbreite vom Kind. Das gleiche dann auch einen Stift vor Nase und einen dahinter
//  → Nah-Fern-Sprünge."
//
// Online-Adaptation: Elternteil führt den Test mit Fingern/Stiften durch,
//  beobachtet und bewertet nach klaren Kriterien.

interface Props {
  onFertig: (result: {
    timing: number;
    konsistenz: number;
    einzelauge: "fluessig" | "leicht" | "stark";
    binaokular: "fluessig" | "leicht" | "stark";
    kopfbewegung: boolean;
    nahfern: "fluessig" | "auffaellig";
  }) => void;
}

type Phase =
  | "anleitung"
  | "binaokular"
  | "nahfern"
  | "fertig";

type Qualitaet = "fluessig" | "leicht" | "stark";

function QualitaetButtons({
  wert, onChange
}: { wert: Qualitaet | null; onChange: (v: Qualitaet) => void }) {
  const opts: { v: Qualitaet; emoji: string; label: string; detail: string }[] = [
    { v: "fluessig", emoji: "😊", label: "Flüssig gesprungen",     detail: "Augen fanden beide Ziele sicher und direkt" },
    { v: "leicht",   emoji: "🤔", label: "Leicht ungenau",         detail: "Kleines Vorbei- oder Nachkorrigieren" },
    { v: "stark",    emoji: "😟", label: "Große Schwierigkeiten",   detail: "Auge fand das Ziel nicht, Kopf half stark mit" },
  ];
  return (
    <div className="flex flex-col gap-2 mb-4">
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className="p-3 rounded-xl border-2 text-left flex items-start gap-3 transition-all"
          style={wert === o.v
            ? { borderColor: "#8DCDC5", background: "#E4F5F3" }
            : { borderColor: "#E5E7EB" }
          }
        >
          <span className="text-xl flex-shrink-0">{o.emoji}</span>
          <div>
            <div className="text-sm font-semibold text-gray-900">{o.label}</div>
            <div className="text-xs text-gray-500">{o.detail}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Visualisierung: Horizontale Sakkaden ─────────────────────────────────────
function VisualBlitzblick() {
  return (
    <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid #BAE6FD" }}>
      <img
        src="/sakkaden-blitzblick.png"
        alt="So hältst du die Finger: ca. 40 cm vor dem Gesicht des Kindes, Schulterbreite auseinander"
        className="w-full"
        style={{ display: "block" }}
      />
    </div>
  );
}

// ── Visualisierung: Nah-Fern-Sprünge ─────────────────────────────────────────
function VisualNahFern() {
  return (
    <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid #BBF7D0" }}>
      <img
        src="/sakkaden-blitzblick-40cm.png"
        alt="Nah-Fern-Sprünge: ein Finger nah vor der Nase, einer weiter hinten"
        className="w-full"
        style={{ display: "block" }}
      />
    </div>
  );
}

export default function Sakkaden({ onFertig }: Props) {
  const [phase, setPhase] = useState<Phase>("anleitung");
  const [binaokular, setBinaokular] = useState<Qualitaet | null>(null);
  const [kopfbewegung, setKopfbewegung] = useState<boolean | null>(null);
  const [nahfern, setNahfern] = useState<"fluessig" | "auffaellig" | null>(null);

  function weiterZuBinaokular() { setPhase("binaokular"); }
  function weiterZuNahfern() { if (binaokular && kopfbewegung !== null) setPhase("nahfern"); }

  function abschliessen() {
    if (!nahfern || !binaokular) return;
    const qualMap: Record<Qualitaet, number> = { fluessig: 0.85, leicht: 0.55, stark: 0.25 };
    const konsistenz = qualMap[binaokular];
    const timing = binaokular === "stark" ? 580 : binaokular === "leicht" ? 430 : 320;

    onFertig({
      timing,
      konsistenz,
      einzelauge: binaokular,
      binaokular: binaokular,
      kopfbewegung: kopfbewegung!,
      nahfern: nahfern,
    });
    setPhase("fertig");
  }

  // ── Anleitung ────────────────────────────────────────────────────────────
  if (phase === "anleitung") {
    return (
      <div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-4">
          <p className="font-semibold text-blue-900 mb-3">👆 Du führst diesen Test mit deinem Kind durch und beobachtest dabei seine Augen.</p>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>So geht's:</strong> Stellt euch gegenüber auf. Halte 2 Finger (oder Stifte) auf Schulterbreite — ca. 40 cm vor dem Gesicht deines Kindes.</p>
            <p>Bitte dein Kind, mit den Augen abwechselnd zwischen deinen zwei Fingern (Stiften) hin- und herzuspringen — <strong>5–10 Mal</strong>. Kopf bleibt still, nur die Augen bewegen sich.</p>
          </div>
        </div>

        <VisualBlitzblick />

        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 mb-5 text-sm text-teal-800">
          <p className="font-semibold mb-1">👀 Worauf du achtest:</p>
          <ul className="space-y-1 text-xs">
            <li>• Springen die Augen direkt zum Ziel, oder schießen sie vorbei?</li>
            <li>• Müssen die Augen mehrmals korrigieren?</li>
            <li>• Bewegt sich der Kopf mit, statt nur die Augen?</li>
            <li>• Wirkt das Kind angestrengt oder blinzelt es viel?</li>
          </ul>
        </div>
        <button
          onClick={weiterZuBinaokular}
          className="w-full text-white font-bold py-4 rounded-xl text-lg"
          style={{ background: "#F5943A" }}
        >
          Test beginnen →
        </button>
      </div>
    );
  }

  // ── Binokulare Sakkaden ───────────────────────────────────────────────────
  if (phase === "binaokular") {
    return (
      <div>
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">👀</div>
          <h3 className="text-lg font-bold text-gray-900">Beide Augen zusammen</h3>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5 text-sm text-orange-800">
          <strong>Jetzt:</strong> Beide Augen springen gemeinsam zwischen deinen Fingern hin und her.
          Wieder <strong>5–10 Mal</strong>. Achte besonders: Bewegt sich der Kopf mit?
        </div>
        <div className="bg-white rounded-2xl border-2 p-5 mb-4" style={{ borderColor: "#8DCDC5" }}>
          <p className="font-semibold text-gray-900 mb-3">Qualität mit beiden Augen:</p>
          <QualitaetButtons wert={binaokular} onChange={setBinaokular} />

          <p className="font-semibold text-gray-900 mb-2">Hat das Kind den Kopf mitbewegt?</p>
          <div className="flex gap-3">
            {[
              { v: false, label: "Nein, Kopf blieb still" },
              { v: true,  label: "Ja, Kopf bewegte sich mit" },
            ].map((opt) => (
              <button
                key={String(opt.v)}
                type="button"
                onClick={() => setKopfbewegung(opt.v)}
                className="flex-1 p-3 rounded-xl border-2 text-sm font-semibold transition-all"
                style={kopfbewegung === opt.v
                  ? { borderColor: "#8DCDC5", background: "#E4F5F3", color: "#1D6E68" }
                  : { borderColor: "#E5E7EB", color: "#374151" }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={weiterZuNahfern}
          disabled={!binaokular || kopfbewegung === null}
          className="w-full text-white font-bold py-3 rounded-xl disabled:opacity-40"
          style={{ background: "#F5943A" }}
        >
          Weiter — Nah/Fern-Sprünge →
        </button>
      </div>
    );
  }

  // ── Nah-Fern-Sprünge ─────────────────────────────────────────────────────
  if (phase === "nahfern") {
    return (
      <div>
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🎯</div>
          <h3 className="text-lg font-bold text-gray-900">Nah-Fern-Sprünge</h3>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3 text-sm text-blue-800">
          <p className="font-semibold mb-2">So geht's:</p>
          <p>Halte einen Finger oder Stift direkt vor die Nase deines Kindes (~15 cm). Den anderen Finger oder Stift halte ca. 30–40 cm dahinter.</p>
          <p className="mt-2">Bitte dein Kind, mit den Augen abwechselnd zwischen den 2 Fingern (Stiften) hin- und herzuspringen: nah → fern → nah → fern … (<strong>5–8 Mal</strong>).</p>
        </div>

        <VisualNahFern />

        <div className="bg-white rounded-2xl border-2 p-5 mb-4" style={{ borderColor: "#8DCDC5" }}>
          <p className="font-semibold text-gray-900 mb-3">Wie liefen die Nah-Fern-Sprünge?</p>
          <div className="flex flex-col gap-2">
            {[
              { v: "fluessig" as const,    emoji: "😊", label: "Gut",         detail: "Augen fanden nah und fern sicher" },
              { v: "auffaellig" as const,  emoji: "😟", label: "Schwierig",   detail: "Fokussieren dauerte lang, Kind blinzelte viel, kniff die Augen zusammen oder fand es anstrengend" },
            ].map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setNahfern(opt.v)}
                className="p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all"
                style={nahfern === opt.v
                  ? { borderColor: "#8DCDC5", background: "#E4F5F3" }
                  : { borderColor: "#E5E7EB" }
                }
              >
                <span className="text-xl">{opt.emoji}</span>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{opt.label}</div>
                  <div className="text-xs text-gray-500">{opt.detail}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={abschliessen}
          disabled={!nahfern}
          className="w-full text-white font-bold py-3 rounded-xl disabled:opacity-40"
          style={{ background: "#F5943A" }}
        >
          Sakkaden-Test abschließen →
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-10">
      <div className="text-5xl mb-3">✅</div>
      <p className="font-bold text-gray-900">Sakkaden-Test abgeschlossen!</p>
    </div>
  );
}
