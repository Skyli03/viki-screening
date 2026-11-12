"use client";
import type { ReactNode } from "react";

// Kleine gemeinsame Bausteine, damit alle Schritte gleich aussehen.

export const ORANGE = "#F5943A";
export const TUERKIS = "#8DCDC5";
export const TUERKIS_HELL = "#C8E8E4";
export const TUERKIS_DUNKEL = "#1A5550";

export function WeiterKnopf({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full text-white font-bold text-lg py-4 rounded-xl shadow-md transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ background: ORANGE }}
    >
      {children}
    </button>
  );
}

type Ton = "gut" | "mittel" | "stark" | "neutral";
const TOENE: Record<Ton, { bg: string; border: string; text: string }> = {
  gut:     { bg: "#F0FDF4", border: "#86EFAC", text: "#166534" },
  mittel:  { bg: "#FFFBEB", border: "#FCD34D", text: "#92400E" },
  stark:   { bg: "#FEF2F2", border: "#FCA5A5", text: "#991B1B" },
  neutral: { bg: "#F0F9F8", border: TUERKIS,   text: TUERKIS_DUNKEL },
};

export function Auswahl({ label, sub, aktiv, onClick, ton = "neutral" }: {
  label: string; sub?: string; aktiv: boolean; onClick: () => void; ton?: Ton;
}) {
  const t = TOENE[ton];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktiv}
      className="w-full p-3 rounded-xl border-2 text-left transition-all"
      style={aktiv ? { background: t.bg, borderColor: t.border } : { background: "white", borderColor: "#E5E7EB" }}
    >
      <div className="font-semibold text-base" style={{ color: aktiv ? t.text : "#374151" }}>{label}</div>
      {sub && <div className="text-sm text-gray-500 mt-0.5">{sub}</div>}
    </button>
  );
}

export function Frageblock({ frage, children }: { frage: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <p className="font-semibold text-gray-900 mb-3">{frage}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function Infobox({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl px-4 py-3 text-sm text-left" style={{ background: TUERKIS_HELL, color: TUERKIS_DUNKEL }}>
      {children}
    </div>
  );
}

export function Achtungbox({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 text-left">
      <p className="font-semibold mb-2">{titel}</p>
      {children}
    </div>
  );
}

export function SchrittKopf({ emoji, titel, unter }: { emoji: string; titel: string; unter?: string }) {
  return (
    <div className="text-center mb-5">
      <div className="text-5xl mb-3">{emoji}</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">{titel}</h2>
      {unter && <p className="text-gray-600">{unter}</p>}
    </div>
  );
}
