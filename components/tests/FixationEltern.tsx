"use client";
import { useState, useEffect, useRef } from "react";
import type { FixationErgebnis } from "@/lib/screening-types";

interface Props {
  kindName: string;
  onFertig: (ergebnis: FixationErgebnis) => void;
}

export default function FixationEltern({ kindName, onFertig }: Props) {
  const [phase, setPhase] = useState<"anleitung" | "countdown" | "fixation" | "bewertung">("anleitung");
  const [countdown, setCountdown] = useState(3);
  const [sekunden, setSekunden] = useState(10);
  const [qualitaet, setQualitaet] = useState<FixationErgebnis["qualitaet"] | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === "countdown") {
      let c = 3;
      timerRef.current = setInterval(() => {
        c -= 1;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(timerRef.current!);
          setPhase("fixation");
        }
      }, 1000);
    }
    if (phase === "fixation") {
      let s = 10;
      timerRef.current = setInterval(() => {
        s -= 1;
        setSekunden(s);
        if (s <= 0) {
          clearInterval(timerRef.current!);
          setPhase("bewertung");
        }
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  if (phase === "anleitung") {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Fixations-Test</h2>
        <p className="text-sm text-gray-500 mb-6">Kann {kindName} die Augen für 10 Sekunden ruhig halten?</p>

        <div className="bg-white rounded-2xl border-2 p-6 mb-5 text-left max-w-lg mx-auto" style={{ borderColor: "#8DCDC5" }}>
          <p className="font-semibold text-gray-900 mb-4">So geht es:</p>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#F5943A" }}>1</span>
              <span>Zeige {kindName} einen <strong>Punkt an der Wand</strong> — ein Aufkleber, eine Ecke, ein kleines Bild. Ungefähr <strong>so weit entfernt wie von einem Schulpult zur Tafel</strong> — ca. 2–4 Meter, auf Augenhöhe.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#F5943A" }}>2</span>
              <span>{kindName} schaut diesen Punkt <strong>10 Sekunden lang an</strong> — <strong>ohne wegzuschauen</strong>. Kopf bleibt still.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#F5943A" }}>3</span>
              <span>Du beobachtest dabei die <strong>Augen</strong> von {kindName}: Zittern sie? Springen sie? Schaut {kindName} weg?</span>
            </li>
          </ol>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-lg mx-auto mb-6 text-sm text-amber-800 text-left">
          <p className="font-semibold mb-1">🔍 Auffällig ist:</p>
          <ul className="space-y-1 text-sm">
            <li>• Augen zittern oder machen kleine Sprünge</li>
            <li>• {kindName} schaut nach wenigen Sekunden weg</li>
            <li>• {kindName} kann sich nicht auf den Punkt konzentrieren</li>
          </ul>
        </div>

        <button
          onClick={() => setPhase("countdown")}
          className="w-full max-w-lg text-white font-bold text-xl py-4 rounded-xl shadow-md"
          style={{ background: "#F5943A" }}
        >
          Countdown starten →
        </button>
      </div>
    );
  }

  if (phase === "countdown") {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: "400px" }}>
        <p className="text-gray-500 text-lg mb-4">Punkt zeigen … dann beobachten</p>
        <div className="text-9xl font-black" style={{ color: "#F5943A", lineHeight: 1 }}>{countdown}</div>
        <p className="text-gray-400 text-sm mt-6">{kindName} soll den Wandpunkt schon anschauen</p>
      </div>
    );
  }

  if (phase === "fixation") {
    const fortschritt = ((10 - sekunden) / 10) * 100;
    return (
      <div className="text-center" style={{ minHeight: "400px" }}>
        <div className="text-4xl mb-6">👀</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Jetzt beobachten!</h3>
        <p className="text-gray-600 mb-8 text-sm">Wie verhalten sich die Augen von {kindName}?</p>

        {/* Timer-Ring */}
        <div className="relative w-36 h-36 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
            <circle cx="72" cy="72" r="60" fill="none" stroke="#E5E7EB" strokeWidth="12" />
            <circle
              cx="72" cy="72" r="60" fill="none"
              stroke="#F5943A" strokeWidth="12"
              strokeDasharray={`${2 * Math.PI * 60}`}
              strokeDashoffset={`${2 * Math.PI * 60 * (1 - fortschritt / 100)}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-black text-gray-900">{sekunden}</span>
          </div>
        </div>

        <div className="max-w-sm mx-auto bg-teal-50 border border-teal-200 rounded-xl p-4 text-sm text-teal-800">
          <p className="font-semibold">Beobachte jetzt die Augen:</p>
          <p className="text-xs mt-1">Ruhig? Zitternd? Wegschauen?</p>
        </div>
      </div>
    );
  }

  // Bewertung
  return (
    <div>
      <div className="text-center mb-5">
        <div className="text-4xl mb-2">✅</div>
        <h3 className="text-xl font-bold text-gray-900">Wie waren die Augen von {kindName}?</h3>
      </div>

      <div className="space-y-3 mb-6">
        {([
          { val: "ruhig", label: "Augen blieben ruhig", sub: `${kindName} konnte 10 Sekunden fixieren, Augen waren still`, color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC" },
          { val: "leicht_unruhig", label: "Leichte Unruhe", sub: "Augen machten gelegentlich kleine Sprünge, aber blieb dabei", color: "#D97706", bg: "#FFFBEB", border: "#FCD34D" },
          { val: "stark_unruhig_oder_abgelenkt", label: "Stark unruhig oder abgelenkt", sub: "Augen zitterten deutlich, sprangen, oder Kind schaute weg", color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5" },
        ] as const).map(opt => (
          <button key={opt.val} onClick={() => setQualitaet(opt.val)}
            className="w-full p-4 rounded-xl border-2 text-left transition-all"
            style={qualitaet === opt.val ? { background: opt.bg, borderColor: opt.border } : { borderColor: "#E5E7EB" }}>
            <div className="font-semibold text-sm" style={{ color: opt.color }}>{opt.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{opt.sub}</div>
          </button>
        ))}
      </div>

      <button
        onClick={() => qualitaet && onFertig({ qualitaet })}
        disabled={!qualitaet}
        className="w-full text-white font-bold text-xl py-4 rounded-xl shadow-md disabled:opacity-40"
        style={{ background: "#F5943A" }}
      >
        Weiter →
      </button>
    </div>
  );
}
