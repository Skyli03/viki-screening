"use client";
import { useState } from "react";
import type { StiftReiseErgebnis } from "@/lib/screening-types";

interface Props {
  kindName: string;
  onFertig: (ergebnis: StiftReiseErgebnis) => void;
}

type Bewegung = { richtung: string; beschreibung: string; animation: string };

const BEWEGUNGEN: Bewegung[] = [
  { richtung: "Links ↔ Rechts", beschreibung: "Stift langsam von ganz links nach ganz rechts — ca. 50 cm Breite, auf Augenhöhe.", animation: "stift-lr" },
  { richtung: "Rechts ↔ Links", beschreibung: "Jetzt zurück von rechts nach links — gleich langsam.", animation: "stift-rl" },
  { richtung: "Diagonal ↗ ↙", beschreibung: "Von unten links nach oben rechts — und zurück.", animation: "stift-diag" },
  { richtung: "Nah ↔ Fern", beschreibung: "Stift gerade zur Nase führen (bis 10 cm) — dann wieder weit weg (40 cm).", animation: "stift-nah" },
];

const ANIMATION_CSS = `
  @keyframes stift-lr { 0%,100%{transform:translateX(-80px)} 50%{transform:translateX(80px)} }
  @keyframes stift-rl { 0%,100%{transform:translateX(80px)} 50%{transform:translateX(-80px)} }
  @keyframes stift-diag { 0%,100%{transform:translate(-60px,40px)} 50%{transform:translate(60px,-40px)} }
  @keyframes stift-nah { 0%,100%{transform:scale(0.5) translateZ(0);opacity:0.6} 50%{transform:scale(1.5) translateZ(0);opacity:1} }
`;

export default function StiftReiseEltern({ kindName, onFertig }: Props) {
  const [phase, setPhase] = useState<"anleitung" | "durchfuehren" | "bewertung">("anleitung");
  const [aktBewegung, setAktBewegung] = useState(0);
  const [folgt, setFolgt] = useState<StiftReiseErgebnis["folgt"] | null>(null);
  const [kopfMitbewegt, setKopfMitbewegt] = useState<boolean | null>(null);

  function naechsteBewegung() {
    if (aktBewegung < BEWEGUNGEN.length - 1) {
      setAktBewegung(prev => prev + 1);
    } else {
      setPhase("bewertung");
    }
  }

  if (phase === "anleitung") {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">✏️🌊</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Stift-Reise</h2>
        <p className="text-sm text-gray-500 mb-6">Kann {kindName} einem Stift nur mit den Augen folgen?</p>

        <div className="bg-white rounded-2xl border-2 p-6 mb-5 text-left max-w-lg mx-auto" style={{ borderColor: "#8DCDC5" }}>
          <p className="font-semibold text-gray-900 mb-4">So geht es:</p>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#F5943A" }}>1</span>
              <span>Halte einen <strong>Stift</strong> ca. <strong>30–40 cm</strong> vor das Gesicht von {kindName}.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#F5943A" }}>2</span>
              <span>Bewege den Stift <strong>langsam</strong> — das Muster siehst du gleich. {kindName} folgt <strong>nur mit den Augen</strong>, Kopf bleibt still.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#F5943A" }}>3</span>
              <span>Du führst <strong>4 Bewegungen</strong> durch und beobachtest dabei.</span>
            </li>
          </ol>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-lg mx-auto mb-6 text-sm text-amber-800 text-left">
          <p className="font-semibold mb-1">🔍 Auffällig ist:</p>
          <ul className="space-y-1 text-xs">
            <li>• Augen folgen ruckartig statt fließend</li>
            <li>• {kindName} bewegt den Kopf mit (statt nur die Augen)</li>
            <li>• {kindName} verliert den Stift und sucht ihn wieder</li>
          </ul>
        </div>

        <button
          onClick={() => setPhase("durchfuehren")}
          className="w-full max-w-lg text-white font-bold text-xl py-4 rounded-xl shadow-md"
          style={{ background: "#F5943A" }}
        >
          Los geht's →
        </button>
      </div>
    );
  }

  if (phase === "durchfuehren") {
    const bew = BEWEGUNGEN[aktBewegung];
    return (
      <div>
        <style>{ANIMATION_CSS}</style>

        <div className="text-center mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Bewegung {aktBewegung + 1} von {BEWEGUNGEN.length}</p>
          <h3 className="text-xl font-bold text-gray-900">{bew.richtung}</h3>
          <p className="text-sm text-gray-500 mt-1">{bew.beschreibung}</p>
        </div>

        {/* Animations-Vorschau */}
        <div className="bg-gray-900 rounded-2xl overflow-hidden mb-5 mx-auto max-w-sm" style={{ height: "180px" }}>
          <div className="w-full h-full flex items-center justify-center">
            <div
              style={{
                width: "48px", height: "48px",
                background: "#F5943A",
                borderRadius: bew.animation === "stift-nah" ? "50%" : "4px",
                animation: `${bew.animation} 2s ease-in-out infinite`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "24px",
              }}
            >
              ✏️
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-3">
          {BEWEGUNGEN.map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full ${i <= aktBewegung ? "" : "bg-gray-200"}`}
              style={i <= aktBewegung ? { background: "#F5943A" } : {}} />
          ))}
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 mb-5 text-xs text-teal-800 text-center">
          Führe diese Bewegung 2–3× durch, dann weiter.
        </div>

        <button
          onClick={naechsteBewegung}
          className="w-full text-white font-bold text-xl py-4 rounded-xl shadow-md"
          style={{ background: aktBewegung < BEWEGUNGEN.length - 1 ? "#8DCDC5" : "#F5943A" }}
        >
          {aktBewegung < BEWEGUNGEN.length - 1 ? "Nächste Bewegung →" : "Fertig → Bewertung"}
        </button>
      </div>
    );
  }

  // Bewertung
  return (
    <div>
      <div className="text-center mb-5">
        <div className="text-4xl mb-2">📋</div>
        <h3 className="text-xl font-bold text-gray-900">Was hast du beobachtet?</h3>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm">
        <p className="font-semibold text-sm text-gray-900 mb-3">Wie sind die Augen von {kindName} dem Stift gefolgt?</p>
        <div className="space-y-2">
          {([
            { val: "fluessig", label: "Flüssig und gleichmäßig", sub: "Augen gleiten mit dem Stift — keine Ruckler", color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC" },
            { val: "ruckelig_mit_pausen", label: "Ruckelig / mit Pausen", sub: "Augen springen von Punkt zu Punkt statt zu gleiten", color: "#D97706", bg: "#FFFBEB", border: "#FCD34D" },
            { val: "verliert_stift", label: "Verliert den Stift", sub: "Augen springen weg und suchen den Stift wieder", color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5" },
          ] as const).map(opt => (
            <button key={opt.val} onClick={() => setFolgt(opt.val)}
              className="w-full p-3 rounded-xl border-2 text-left transition-all"
              style={folgt === opt.val ? { background: opt.bg, borderColor: opt.border } : { borderColor: "#E5E7EB" }}>
              <div className="font-semibold text-sm" style={{ color: opt.color }}>{opt.label}</div>
              <div className="text-xs text-gray-500">{opt.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 shadow-sm">
        <p className="font-semibold text-sm text-gray-900 mb-3">Hat {kindName} den Kopf mitbewegt?</p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { val: false, label: "Nein — Kopf blieb still", color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC" },
            { val: true, label: "Ja — Kopf folgte mit", color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5" },
          ] as const).map(opt => (
            <button key={String(opt.val)} onClick={() => setKopfMitbewegt(opt.val)}
              className="p-3 rounded-xl border-2 text-sm font-semibold transition-all"
              style={kopfMitbewegt === opt.val ? { background: opt.bg, borderColor: opt.border, color: opt.color } : { borderColor: "#E5E7EB", color: "#374151" }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => folgt && kopfMitbewegt !== null && onFertig({ folgt, kopf_mitbewegt: kopfMitbewegt })}
        disabled={!folgt || kopfMitbewegt === null}
        className="w-full text-white font-bold text-xl py-4 rounded-xl shadow-md disabled:opacity-40"
        style={{ background: "#F5943A" }}
      >
        Weiter →
      </button>
    </div>
  );
}
