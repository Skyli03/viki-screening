"use client";
import { useState } from "react";
import VideoEmbed from "@/components/VideoEmbed";
import type { StiftReiseErgebnis } from "@/lib/screening-types";

interface Props {
  kindName: string;
  onFertig: (ergebnis: StiftReiseErgebnis) => void;
}

type PursuitBewegung = { richtung: string; beschreibung: string; animation: string };

const BEWEGUNGEN: PursuitBewegung[] = [
  {
    richtung: "Links ↔ Rechts",
    beschreibung: "Schulterbreite des Kindes · auf Augenhöhe",
    animation: "stift-lr",
  },
  {
    richtung: "Diagonal ↗ ↙",
    beschreibung: "Von unten links nach oben rechts — und zurück",
    animation: "stift-diag1",
  },
];

const ANIMATION_CSS = `
  @keyframes stift-lr    { 0%,100%{transform:translateX(-90px)} 50%{transform:translateX(90px)} }
  @keyframes stift-diag1 { 0%,100%{transform:translate(-70px,50px)} 50%{transform:translate(70px,-50px)} }
`;

type Phase = "anleitung" | "bewegungen" | "bewertung_stift";

export default function StiftReiseEltern({ kindName, onFertig }: Props) {
  const [phase, setPhase] = useState<Phase>("anleitung");
  const [aktBewegung, setAktBewegung] = useState(0);
  const [folgt, setFolgt] = useState<StiftReiseErgebnis["folgt"] | null>(null);
  const [kopfMitbewegt, setKopfMitbewegt] = useState<boolean | null>(null);

  function naechsteBewegung() {
    if (aktBewegung < BEWEGUNGEN.length - 1) {
      setAktBewegung(prev => prev + 1);
    } else {
      setPhase("bewertung_stift");
    }
  }

  function abschicken() {
    if (!folgt || kopfMitbewegt === null) return;
    onFertig({ folgt, kopf_mitbewegt: kopfMitbewegt, konvergenz_nahfern: "nicht_getestet" });
  }

  // ─── Anleitung ────────────────────────────────────────────────────────────────
  if (phase === "anleitung") {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">✏️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Stift-Reise</h2>
        <p className="text-sm text-gray-500 mb-1">Kann {kindName} einem Stift nur mit den Augen folgen?</p>
        <p className="text-xs font-semibold mb-3" style={{ color: "#8DCDC5" }}>Muster und Geschwindigkeit beobachten</p>
        <div className="rounded-xl px-4 py-3 mb-4 text-sm text-center max-w-lg mx-auto" style={{ background: "#E4F5F3", color: "#2D7A73" }}>
          💡 Flüssiges Lesen braucht Augen, die gleichmäßig gleiten können. Ruckeln sie statt zu gleiten, holpert auch das Gelesene — selbst wenn das Kind jeden Buchstaben kennt.
        </div>

        <p className="text-sm text-gray-600 mb-4 max-w-lg mx-auto text-center">
          Stift ca. <strong>30 cm</strong> vor das Gesicht — {kindName} folgt <strong>nur mit den Augen</strong>, Kopf bleibt still. 2 Bewegungen: Links-Rechts und Diagonal.
        </p>

        <VideoEmbed src="/videos/augenbewegung.mp4" />

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-lg mx-auto mb-6 text-sm text-amber-800 text-left">
          <p className="font-semibold mb-2 text-base">🔍 Auffällig ist:</p>
          <ul className="space-y-1 text-sm">
            <li>• Augen folgen ruckartig statt fließend</li>
            <li>• {kindName} bewegt den Kopf mit (statt nur die Augen)</li>
            <li>• {kindName} verliert den Stift und sucht ihn wieder</li>
          </ul>
        </div>

        <button
          onClick={() => setPhase("bewegungen")}
          className="w-full max-w-lg text-white font-bold text-xl py-4 rounded-xl shadow-md"
          style={{ background: "#F5943A" }}
        >
          Los geht's →
        </button>
      </div>
    );
  }

  // ─── Bewegungen (Smooth Pursuit) ─────────────────────────────────────────────
  if (phase === "bewegungen") {
    const bew = BEWEGUNGEN[aktBewegung];
    return (
      <div>
        <style>{ANIMATION_CSS}</style>

        <div className="text-center mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Bewegung {aktBewegung + 1} von {BEWEGUNGEN.length}</p>
          <h3 className="text-xl font-bold text-gray-900">{bew.richtung}</h3>
          <p className="text-sm text-gray-500 mt-1">{bew.beschreibung}</p>
        </div>

        <div className="rounded-2xl overflow-hidden mb-2 mx-auto max-w-sm flex items-center justify-center" style={{ height: "180px", background: "#E4F5F3" }}>
          <div
            style={{
              animation: `${bew.animation} 4s ease-in-out infinite`,
              display: "inline-block",
            }}
          >
            <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ width: "10px", height: "6px", background: "#9CA3AF", borderRadius: "3px 3px 0 0", display: "block" }} />
              <span style={{ width: "10px", height: "52px", background: "linear-gradient(90deg, #FCD34D 40%, #F59E0B 60%)", display: "block" }} />
              <span style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "10px solid #92400E", display: "block" }} />
            </span>
          </div>
        </div>

        <p className="text-center text-xs font-semibold mb-4" style={{ color: "#2D7A73" }}>Siehst du die Geschwindigkeit?</p>

        <div className="flex gap-3 mb-3">
          {BEWEGUNGEN.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-2 rounded-full"
              style={{ background: i <= aktBewegung ? "#F5943A" : "#E5E7EB" }}
            />
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

  // ─── Bewertung Stift (Smooth Pursuit) ────────────────────────────────────────
  return (
    <div>
      <div className="text-center mb-5">
        <div className="text-4xl mb-2">📋</div>
        <h3 className="text-xl font-bold text-gray-900">Was hast du beobachtet?</h3>
        <p className="text-sm text-gray-400 mt-1">Links-Rechts und Diagonal-Bewegungen</p>
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
        onClick={abschicken}
        disabled={!folgt || kopfMitbewegt === null}
        className="w-full text-white font-bold text-xl py-4 rounded-xl shadow-md disabled:opacity-40"
        style={{ background: "#F5943A" }}
      >
        Weiter →
      </button>
    </div>
  );
}
