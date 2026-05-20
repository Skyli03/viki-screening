"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import KameraCheck from "@/components/KameraCheck";
import LeseTest from "@/components/LeseTest";
import VisuelleTests from "@/components/VisuelleTests";
import Fragebogen from "@/components/Fragebogen";
import type { TrackingErgebnis } from "@/lib/eyetracking";
import type { VisuellTestErgebnis } from "@/lib/auswertung";
import type { FragebogenAntworten } from "@/data/fragebogen";

type Phase = "kamera" | "lesen" | "visuell" | "fragebogen" | "fertig";

const PHASEN: { id: Phase; label: string; icon: string }[] = [
  { id: "kamera", label: "Kamera", icon: "📷" },
  { id: "lesen", label: "Lesetest", icon: "📖" },
  { id: "visuell", label: "Sehtest", icon: "🎯" },
  { id: "fragebogen", label: "Fragebogen", icon: "📋" },
];

export default function ScreeningPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("kamera");
  const [kindName, setKindName] = useState("dein Kind");
  const [klasse, setKlasse] = useState(2);
  const [lesetestErgebnis, setLesetestErgebnis] = useState<TrackingErgebnis | null>(null);
  const [visuellErgebnis, setVisuellErgebnis] = useState<VisuellTestErgebnis | null>(null);
  const [fragebogenAntworten, setFragebogenAntworten] = useState<FragebogenAntworten | null>(null);

  useEffect(() => {
    const name = sessionStorage.getItem("kindName");
    const kl = sessionStorage.getItem("klasse");
    if (name) setKindName(name);
    if (kl) setKlasse(Number(kl));
  }, []);

  function phasenIndex() {
    return PHASEN.findIndex((p) => p.id === phase);
  }

  function naechstePhase(nach: Phase) {
    setPhase(nach);
    window.scrollTo(0, 0);
  }

  function lesetestFertig(ergebnis: TrackingErgebnis) {
    setLesetestErgebnis(ergebnis);
    naechstePhase("visuell");
  }

  function visuellFertig(ergebnis: VisuellTestErgebnis) {
    setVisuellErgebnis(ergebnis);
    naechstePhase("fragebogen");
  }

  function fragebogenFertig(antworten: FragebogenAntworten) {
    setFragebogenAntworten(antworten);
    // Ergebnisse speichern und weiterleiten
    sessionStorage.setItem("lesetest", JSON.stringify(lesetestErgebnis));
    sessionStorage.setItem("visuell", JSON.stringify(visuellErgebnis));
    sessionStorage.setItem("fragebogen", JSON.stringify(antworten));
    router.push("/ergebnis");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mit Fortschritt */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🦸</span>
              <span className="font-bold text-gray-900">VIKI Superblick</span>
            </div>
            <span className="text-sm text-gray-500">
              Schritt {Math.min(phasenIndex() + 1, 4)} von 4
            </span>
          </div>
          {/* Fortschrittsbalken */}
          <div className="flex gap-2">
            {PHASEN.map((p, i) => (
              <div
                key={p.id}
                className={`flex-1 h-2 rounded-full transition-all ${
                  i <= phasenIndex() ? "bg-primary" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {PHASEN.map((p, i) => (
              <span
                key={p.id}
                className={`text-xs ${i <= phasenIndex() ? "text-primary font-semibold" : "text-gray-400"}`}
              >
                {p.icon} {p.label}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {phase === "kamera" && (
          <KameraCheck
            kindName={kindName}
            onWeiter={() => naechstePhase("lesen")}
          />
        )}
        {phase === "lesen" && (
          <LeseTest
            kindName={kindName}
            klasse={klasse}
            onFertig={lesetestFertig}
          />
        )}
        {phase === "visuell" && (
          <VisuelleTests
            kindName={kindName}
            onFertig={visuellFertig}
          />
        )}
        {phase === "fragebogen" && (
          <Fragebogen
            kindName={kindName}
            onFertig={fragebogenFertig}
          />
        )}
      </main>
    </div>
  );
}
