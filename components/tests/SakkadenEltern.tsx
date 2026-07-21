"use client";
import { useState, useEffect, useRef } from "react";
import type { SakkadenErgebnis } from "@/lib/screening-types";

interface Props {
  kindName: string;
  onFertig: (ergebnis: SakkadenErgebnis) => void;
}

const SPRUNGE = 12;
const INTERVALL_MS = 1500;

type Phase = "anleitung" | "sprunge" | "bewertung";

export default function SakkadenEltern({ kindName, onFertig }: Props) {
  const [phase, setPhase] = useState<Phase>("anleitung");
  const [aktiv, setAktiv] = useState<"links" | "rechts">("links");
  const [schritt, setSchritt] = useState(0);
  const [praezision, setPraezision] = useState<SakkadenErgebnis["praezision"] | null>(null);
  const [kopfMitbewegt, setKopfMitbewegt] = useState<boolean | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase !== "sprunge") return;
    timerRef.current = setInterval(() => {
      setSchritt(prev => {
        const naechster = prev + 1;
        if (naechster >= SPRUNGE) {
          clearInterval(timerRef.current!);
          setTimeout(() => setPhase("bewertung"), 400);
          return naechster;
        }
        setAktiv(a => a === "links" ? "rechts" : "links");
        return naechster;
      });
    }, INTERVALL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  function starten() {
    setSchritt(0);
    setAktiv("links");
    setPhase("sprunge");
  }

  function abschicken() {
    if (!praezision || kopfMitbewegt === null) return;
    onFertig({ praezision, kopf_mitbewegt: kopfMitbewegt });
  }

  // ─── Anleitung ────────────────────────────────────────────────────────────────
  if (phase === "anleitung") {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">👈👉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Blicksprung-Test</h2>
        <p className="text-sm text-gray-500 mb-1">Kann {kindName} präzise zwischen zwei Punkten hin- und herspringen?</p>
        <p className="text-xs font-semibold mb-3" style={{ color: "#8DCDC5" }}>Genauigkeit der Augenbewegungen beobachten</p>

        <div className="rounded-xl px-4 py-3 mb-5 text-sm text-center max-w-lg mx-auto" style={{ background: "#E4F5F3", color: "#2D7A73" }}>
          💡 Lesen besteht fast nur aus Blicksprüngen — von Wort zu Wort, von Zeile zu Zeile. Präzise Sprünge bedeuten ruhiges Lesen. Ungenau? Das Auge sucht — und kostet enorm viel Energie.
        </div>

        <div className="bg-white rounded-2xl border-2 p-6 mb-5 text-left max-w-lg mx-auto" style={{ borderColor: "#8DCDC5" }}>
          <p className="font-semibold text-gray-900 mb-4">So geht es:</p>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#F5943A" }}>1</span>
              <span>Halte beide <strong>Zeigefinger</strong> ca. <strong>40 cm auseinander</strong> — auf Augenhöhe von {kindName}, ca. 30–40 cm vor dem Gesicht.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#F5943A" }}>2</span>
              <span>Unten am Bildschirm siehst du, <strong>welchen Finger</strong> {kindName} anschauen soll — der leuchtende Punkt zeigt es an.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#F5943A" }}>3</span>
              <span>{kindName} soll <strong>nur mit den Augen</strong> springen — <strong>Kopf bleibt still</strong>. Du beobachtest, wie präzise die Sprünge landen.</span>
            </li>
          </ol>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-lg mx-auto mb-6 text-sm text-amber-800 text-left">
          <p className="font-semibold mb-2 text-base">🔍 Auffällig ist:</p>
          <ul className="space-y-1 text-sm">
            <li>• Augen schießen über das Ziel hinaus und korrigieren sich</li>
            <li>• Mehrere kleine Korrekturbewegungen bis das Ziel getroffen wird</li>
            <li>• {kindName} bewegt den Kopf mit statt nur die Augen</li>
          </ul>
        </div>

        <button
          onClick={starten}
          className="w-full max-w-lg text-white font-bold text-xl py-4 rounded-xl shadow-md"
          style={{ background: "#F5943A" }}
        >
          Los geht's →
        </button>
      </div>
    );
  }

  // ─── Sprünge ─────────────────────────────────────────────────────────────────
  if (phase === "sprunge") {
    const fertig = schritt >= SPRUNGE;
    return (
      <div>
        <div className="text-center mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Blicksprung {Math.min(schritt + 1, SPRUNGE)} von {SPRUNGE}
          </p>
          <p className="text-sm text-gray-500 mt-1">Beobachte die Augen von {kindName}</p>
        </div>

        <div className="flex gap-1.5 mb-8 max-w-xs mx-auto">
          {Array.from({ length: SPRUNGE }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full transition-all"
              style={{ background: i < schritt ? "#F5943A" : i === schritt ? "#8DCDC5" : "#E5E7EB" }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between px-4 mb-3" style={{ minHeight: "140px" }}>
          <div className="flex flex-col items-center gap-2">
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width: aktiv === "links" ? "72px" : "36px",
                height: aktiv === "links" ? "72px" : "36px",
                background: aktiv === "links" ? "#F5943A" : "#D1D5DB",
                boxShadow: aktiv === "links" ? "0 0 0 8px #FEF3E2" : "none",
              }}
            />
            <span className="text-xs font-semibold" style={{ color: aktiv === "links" ? "#F5943A" : "#9CA3AF" }}>
              Linker Finger
            </span>
          </div>

          <div className="text-2xl font-black text-gray-200">↔</div>

          <div className="flex flex-col items-center gap-2">
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width: aktiv === "rechts" ? "72px" : "36px",
                height: aktiv === "rechts" ? "72px" : "36px",
                background: aktiv === "rechts" ? "#F5943A" : "#D1D5DB",
                boxShadow: aktiv === "rechts" ? "0 0 0 8px #FEF3E2" : "none",
              }}
            />
            <span className="text-xs font-semibold" style={{ color: aktiv === "rechts" ? "#F5943A" : "#9CA3AF" }}>
              Rechter Finger
            </span>
          </div>
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-800 text-center max-w-sm mx-auto">
          Der leuchtende Punkt zeigt: <strong>welchen Finger soll {kindName} gerade ansehen?</strong><br />
          <span className="text-teal-600">Hier siehst du die Geschwindigkeit der Blicksprünge.</span>
        </div>

        {fertig && (
          <div className="text-center mt-6 text-green-600 font-bold text-lg">✓ Fertig!</div>
        )}
      </div>
    );
  }

  // ─── Bewertung ────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="text-center mb-5">
        <div className="text-4xl mb-2">📋</div>
        <h3 className="text-xl font-bold text-gray-900">Was hast du beobachtet?</h3>
        <p className="text-sm text-gray-400 mt-1">12 Blicksprünge zwischen zwei Fingern</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm">
        <p className="font-semibold text-sm text-gray-900 mb-3">Wie präzise haben die Augen von {kindName} das Ziel getroffen?</p>
        <div className="space-y-2">
          {([
            { val: "praezise", label: "Direkt und präzise", sub: "Augen landen sofort auf dem Finger — kein Korrigieren nötig", color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC" },
            { val: "ueberschiesst", label: "Überschießt kurz", sub: "Augen springen zu weit, dann kleine Korrektur zurück", color: "#D97706", bg: "#FFFBEB", border: "#FCD34D" },
            { val: "ungenau_sucht", label: "Ungenau — sucht das Ziel", sub: "Mehrere kleine Bewegungen bis die Augen ankommen", color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5" },
          ] as const).map(opt => (
            <button key={opt.val} onClick={() => setPraezision(opt.val)}
              className="w-full p-3 rounded-xl border-2 text-left transition-all"
              style={praezision === opt.val ? { background: opt.bg, borderColor: opt.border } : { borderColor: "#E5E7EB" }}>
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
        disabled={!praezision || kopfMitbewegt === null}
        className="w-full text-white font-bold text-xl py-4 rounded-xl shadow-md disabled:opacity-40"
        style={{ background: "#F5943A" }}
      >
        Weiter →
      </button>
    </div>
  );
}
