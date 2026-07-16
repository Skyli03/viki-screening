"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import KonvergenzEltern from "@/components/tests/KonvergenzEltern";
import BuchLesetest from "@/components/tests/BuchLesetest";
import PCLesetest from "@/components/tests/PCLesetest";
import FixationEltern from "@/components/tests/FixationEltern";
import StiftReiseEltern from "@/components/tests/StiftReiseEltern";
import VisuelleTests from "@/components/VisuelleTests";
import Fragebogen from "@/components/Fragebogen";
import type {
  KonvergenzErgebnis,
  BuchLeseErgebnis,
  PCLeseErgebnis,
  FixationErgebnis,
  StiftReiseErgebnis,
  MiniTestErgebnis,
  ScreeningDaten,
} from "@/lib/screening-types";
import type { FragebogenAntworten } from "@/data/fragebogen";

type Phase =
  | "konvergenz"
  | "buch_lese"
  | "pc_lese"
  | "fixation"
  | "stift_reise"
  | "mini_tests"
  | "fragebogen";

const PHASEN: { id: Phase; label: string; icon: string }[] = [
  { id: "konvergenz",   label: "Konvergenz", icon: "👁️" },
  { id: "buch_lese",   label: "Buch-Lesen",  icon: "📖" },
  { id: "pc_lese",     label: "PC-Lesen",    icon: "💻" },
  { id: "fixation",    label: "Fixation",    icon: "🎯" },
  { id: "stift_reise", label: "Stift",       icon: "✏️" },
  { id: "mini_tests",  label: "Mini-Tests",  icon: "🎮" },
  { id: "fragebogen",  label: "Fragebogen",  icon: "📋" },
];

export default function ScreeningPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("konvergenz");
  const [kindName, setKindName] = useState("dein Kind");
  const [klasse, setKlasse] = useState(2);

  const [konvergenz, setKonvergenz] = useState<KonvergenzErgebnis | null>(null);
  const [buchLese, setBuchLese] = useState<BuchLeseErgebnis | null>(null);
  const [pcLese, setPcLese] = useState<PCLeseErgebnis | null>(null);
  const [fixation, setFixation] = useState<FixationErgebnis | null>(null);
  const [stiftReise, setStiftReise] = useState<StiftReiseErgebnis | null>(null);
  const [miniTests, setMiniTests] = useState<MiniTestErgebnis | null>(null);

  useEffect(() => {
    const name = sessionStorage.getItem("kindName");
    const kl = sessionStorage.getItem("klasse");
    if (name) setKindName(name);
    if (kl) setKlasse(Number(kl));
  }, []);

  function naechstePhase(nach: Phase) {
    window.scrollTo(0, 0);
    setPhase(nach);
  }

  function phasenIndex(): number {
    return PHASEN.findIndex(p => p.id === phase);
  }

  function fragebogenFertig(antworten: FragebogenAntworten) {
    const daten: ScreeningDaten = {
      konvergenz: konvergenz!,
      buchLese: buchLese!,
      pcLese: pcLese!,
      fixation: fixation!,
      stiftReise: stiftReise!,
      miniTests: miniTests!,
      fragebogen: antworten,
      klasse,
    };
    sessionStorage.setItem("screening_daten", JSON.stringify(daten));
    router.push("/ergebnis");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🦸</span>
              <span className="font-bold text-gray-900">VIKI Superblick</span>
            </div>
            <span className="text-sm text-gray-500">
              Schritt {phasenIndex() + 1} von {PHASEN.length}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ background: "#F5943A", width: `${((phasenIndex() + 1) / PHASEN.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {PHASEN.map((p, i) => (
              <span
                key={p.id}
                className="text-xs"
                style={{ color: i <= phasenIndex() ? "#F5943A" : "#9CA3AF", fontWeight: i === phasenIndex() ? 700 : 400 }}
              >
                {p.icon}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {phase === "konvergenz" && (
          <KonvergenzEltern
            kindName={kindName}
            onFertig={(r) => { setKonvergenz(r); naechstePhase("buch_lese"); }}
          />
        )}
        {phase === "buch_lese" && (
          <BuchLesetest
            kindName={kindName}
            onFertig={(r) => { setBuchLese(r); naechstePhase("pc_lese"); }}
          />
        )}
        {phase === "pc_lese" && (
          <PCLesetest
            kindName={kindName}
            klasse={klasse}
            onFertig={(r) => { setPcLese(r); naechstePhase("fixation"); }}
          />
        )}
        {phase === "fixation" && (
          <FixationEltern
            kindName={kindName}
            onFertig={(r) => { setFixation(r); naechstePhase("stift_reise"); }}
          />
        )}
        {phase === "stift_reise" && (
          <StiftReiseEltern
            kindName={kindName}
            onFertig={(r) => { setStiftReise(r); naechstePhase("mini_tests"); }}
          />
        )}
        {phase === "mini_tests" && (
          <VisuelleTests
            kindName={kindName}
            klasse={klasse}
            onFertig={(r) => { setMiniTests(r); naechstePhase("fragebogen"); }}
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
