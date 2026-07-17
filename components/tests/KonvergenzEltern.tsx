"use client";
import { useState } from "react";
import type { KonvergenzErgebnis } from "@/lib/screening-types";

interface Props {
  kindName: string;
  onFertig: (ergebnis: KonvergenzErgebnis) => void;
}

const ZEICHEN_OPTIONEN = [
  { id: "doppelbilder", label: "Kind klagt über Doppelbilder", emoji: "👀" },
  { id: "auge_springt", label: "Ein Auge weicht aus / springt raus", emoji: "↗️" },
  { id: "schaut_weg", label: "Kind schaut weg oder blinzelt stark", emoji: "😣" },
  { id: "kann_nicht_folgen", label: "Kind kann Stift nicht bis zur Nase folgen", emoji: "🚫" },
  { id: "anstrengend", label: "Kind berichtet, dass die Übung anstrengend war", emoji: "😮‍💨" },
];

const ANIMATION_CSS = `
  @keyframes konv-nah {
    0%, 100% { transform: scale(0.35); opacity: 0.55; }
    50%       { transform: scale(1.7);  opacity: 1; }
  }
`;

function KonvergenzIcon() {
  return (
    <svg viewBox="0 0 100 50" width="110" height="55" xmlns="http://www.w3.org/2000/svg">
      {/* Linkes Auge */}
      <circle cx="10" cy="25" r="9" fill="#8DCDC5"/>
      <circle cx="10" cy="25" r="4.5" fill="#2D7A73"/>
      <circle cx="12" cy="23" r="1.8" fill="white"/>
      {/* Rechtes Auge */}
      <circle cx="90" cy="25" r="9" fill="#8DCDC5"/>
      <circle cx="90" cy="25" r="4.5" fill="#2D7A73"/>
      <circle cx="92" cy="23" r="1.8" fill="white"/>
      {/* Linker Pfeil → Mitte */}
      <line x1="23" y1="25" x2="43" y2="25" stroke="#F5943A" strokeWidth="3" strokeLinecap="round"/>
      <polygon points="40,20 49,25 40,30" fill="#F5943A"/>
      {/* Rechter Pfeil → Mitte */}
      <line x1="77" y1="25" x2="57" y2="25" stroke="#F5943A" strokeWidth="3" strokeLinecap="round"/>
      <polygon points="60,20 51,25 60,30" fill="#F5943A"/>
      {/* Stift-Punkt in der Mitte */}
      <circle cx="50" cy="25" r="7" fill="#F5943A"/>
      <circle cx="50" cy="25" r="3" fill="white"/>
    </svg>
  );
}

function NahFernDot() {
  return (
    <div
      className="rounded-2xl flex flex-col items-center justify-center gap-3 mx-auto"
      style={{ width: "220px", height: "160px", background: "#E4F5F3" }}
    >
      <style>{ANIMATION_CSS}</style>
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "#F5943A",
          animation: "konv-nah 5s ease-in-out infinite",
        }}
      />
      <p className="text-xs text-teal-700 font-semibold text-center px-3">
        Hier siehst du die Geschwindigkeit — Stift zur Nase
      </p>
    </div>
  );
}

export default function KonvergenzEltern({ kindName, onFertig }: Props) {
  const [phase, setPhase] = useState<"anleitung" | "beobachtung" | "zeichen">("anleitung");
  const [beideAugen, setBeideAugen] = useState<KonvergenzErgebnis["beideAugen"] | null>(null);
  const [zeichen, setZeichen] = useState<string[]>([]);

  function toggleZeichen(id: string) {
    setZeichen(prev => prev.includes(id) ? prev.filter(z => z !== id) : [...prev, id]);
  }

  function abschicken() {
    if (!beideAugen) return;
    onFertig({ beideAugen, zeichen });
  }

  if (phase === "anleitung") {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <KonvergenzIcon />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Konvergenz-Test</h2>
        <p className="text-sm text-gray-500 mb-3">Du führst diesen Test durch — {kindName} macht mit.</p>
        <div className="rounded-xl px-4 py-3 mb-5 text-sm text-center max-w-lg mx-auto" style={{ background: "#E4F5F3", color: "#2D7A73" }}>
          💡 Beim Lesen drehen sich die Augen ständig ein und aus — für jede Zeile, jeden Tafel-Heft-Blick. Klappt das nicht reibungslos, verschwimmen Buchstaben, erscheinen doppelt, oder das Kind muss viel mehr Energie aufwenden als andere.
        </div>

        <div className="bg-white rounded-2xl border-2 p-6 mb-5 text-left max-w-lg mx-auto" style={{ borderColor: "#8DCDC5" }}>
          <p className="font-semibold text-gray-900 mb-4">So geht es:</p>
          <ol className="space-y-4 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#F5943A" }}>1</span>
              <span>Halte einen <strong>Stift oder Finger</strong> ca. <strong>30 cm</strong> vor die Nase von {kindName}. {kindName} schaut den Stift an.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#F5943A" }}>2</span>
              <span>Bewege den Stift <strong>langsam auf die Nase zu</strong> (bis ca. 5–10 cm). Dann wieder zurück. <strong>3× wiederholen.</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#F5943A" }}>3</span>
              <span><strong>Beobachte</strong> dabei die Augen von {kindName}: Folgen <em>beide</em> Augen gleichmäßig? Weicht ein Auge aus?</span>
            </li>
          </ol>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-lg mx-auto mb-6 text-sm text-amber-800 text-left">
          <p className="font-semibold mb-2 text-base">👁️ Worauf du achtest:</p>
          <ul className="space-y-1 text-sm">
            <li>• Folgen beide Augen gleichmäßig nach innen?</li>
            <li>• Weicht ein Auge nach außen ab (springt weg)?</li>
            <li>• Klagt {kindName} über Doppelbilder?</li>
            <li>• Blinzelt {kindName} stark oder schaut weg?</li>
          </ul>
        </div>

        <button
          onClick={() => setPhase("beobachtung")}
          className="w-full max-w-lg text-white font-bold text-xl py-4 rounded-xl shadow-md"
          style={{ background: "#F5943A" }}
        >
          Test jetzt durchführen →
        </button>
      </div>
    );
  }

  if (phase === "beobachtung") {
    return (
      <div>
        <div className="text-center mb-5">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Jetzt durchführen</h2>
          <p className="text-sm text-gray-500">Stift 3× langsam zur Nase und zurück</p>
        </div>

        <div className="flex justify-center mb-5">
          <NahFernDot />
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6 text-sm text-teal-800">
          <p className="font-semibold">Stift 3× langsam von 30 cm auf 5 cm annähern und zurück.</p>
          <p className="mt-1 text-xs">Wenn du fertig beobachtet hast → weiter.</p>
        </div>

        <button
          onClick={() => setPhase("zeichen")}
          className="w-full text-white font-bold text-xl py-4 rounded-xl shadow-md"
          style={{ background: "#8DCDC5" }}
        >
          Fertig beobachtet → Ergebnis eingeben
        </button>
      </div>
    );
  }

  // Phase "zeichen"
  return (
    <div>
      <div className="text-center mb-5">
        <div className="text-4xl mb-2">📋</div>
        <h2 className="text-xl font-bold text-gray-900">Was hast du beobachtet?</h2>
      </div>

      <div className="bg-white rounded-2xl border-2 p-5 mb-4" style={{ borderColor: "#8DCDC5" }}>
        <p className="font-semibold text-gray-900 mb-3">Wie haben die Augen von {kindName} dem Stift gefolgt?</p>
        <div className="space-y-2">
          {([
            { val: "unauffaellig", label: "Beide Augen folgen gleichmäßig", sub: "Kein Ausweichen, kein Zögern", color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC" },
            { val: "leicht_auffaellig", label: "Ein Auge weicht leicht aus", sub: "Kurzes Ausweichen, aber Kind folgt noch", color: "#D97706", bg: "#FFFBEB", border: "#FCD34D" },
            { val: "deutlich_auffaellig", label: "Deutliche Auffälligkeit", sub: "Auge springt klar raus, Doppelbilder, Kind schaut weg", color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5" },
          ] as const).map(opt => (
            <button
              key={opt.val}
              onClick={() => setBeideAugen(opt.val)}
              className="w-full p-3 rounded-xl border-2 text-left transition-all"
              style={beideAugen === opt.val
                ? { background: opt.bg, borderColor: opt.border }
                : { borderColor: "#E5E7EB" }
              }
            >
              <div className="font-semibold text-sm" style={{ color: opt.color }}>{opt.label}</div>
              <div className="text-xs text-gray-500">{opt.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
        <p className="font-semibold text-gray-900 mb-1 text-sm">Hast du zusätzlich folgendes beobachtet?</p>
        <p className="text-xs text-gray-400 mb-3">Mehrfachauswahl möglich — nichts wählen wenn unauffällig</p>
        <div className="space-y-2">
          {ZEICHEN_OPTIONEN.map(opt => (
            <button
              key={opt.id}
              onClick={() => toggleZeichen(opt.id)}
              className="w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all"
              style={zeichen.includes(opt.id)
                ? { borderColor: "#F5943A", background: "#FEF3E2" }
                : { borderColor: "#E5E7EB" }
              }
            >
              <span className="text-lg">{opt.emoji}</span>
              <span className="text-sm font-medium text-gray-700">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={abschicken}
        disabled={!beideAugen}
        className="w-full text-white font-bold text-xl py-4 rounded-xl shadow-md disabled:opacity-40"
        style={{ background: "#F5943A" }}
      >
        Weiter →
      </button>
    </div>
  );
}
