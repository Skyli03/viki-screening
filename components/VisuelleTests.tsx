"use client";
import { useState } from "react";
import Fixation from "./tests/Fixation";
import Sakkaden from "./tests/Sakkaden";
import SmoothPursuit from "./tests/SmoothPursuit";
import VisuelleDiskrimination from "./tests/VisuelleDiskrimination";
import LRSTest from "./tests/LRSTest";
import PeripheresSehen from "./tests/PeripheresSehen";
import VergenzTest from "./tests/VergenzTest";
import type { VisuellTestErgebnis } from "@/lib/auswertung";

interface Props {
  kindName: string;
  onFertig: (ergebnis: VisuellTestErgebnis) => void;
}

const TESTS = [
  { id: "fixation", name: "Laserblick", icon: "🎯", beschreibung: "Treffe den Superheldenstar 🌟 so schnell du kannst!" },
  { id: "sakkaden", name: "Blitzblick", icon: "⚡", beschreibung: "Lass deine Augen schnell zwischen zwei Punkten hin- und herspringen!" },
  { id: "smoothPursuit", name: "Raketenblick", icon: "🚀", beschreibung: "Begleite die Rakete nur mit den Augen — Kopf bleibt still!" },
  { id: "diskrimination", name: "Spürnase", icon: "🔍", beschreibung: "Welches Bild ist anders als die anderen drei?" },
  { id: "lrs", name: "Buchstabenjäger", icon: "🦸", beschreibung: "Sind die zwei Buchstaben gleich oder verschieden?" },
  { id: "peripher", name: "Superhelden-Radar", icon: "📡", beschreibung: "Schau auf die Mitte und drücke sobald du etwas am Rand siehst!" },
  { id: "vergenz", name: "Tiefenblick", icon: "🎯", beschreibung: "Eltern beobachten: Wie arbeiten beide Augen zusammen?" },
];

export default function VisuelleTests({ kindName, onFertig }: Props) {
  const [testIndex, setTestIndex] = useState(-1); // -1 = Einführung, TESTS.length = Feier
  const [ergebnisse, setErgebnisse] = useState<Partial<VisuellTestErgebnis>>({});
  const [feier, setFeier] = useState(false);

  function testFertig(key: keyof VisuellTestErgebnis, wert: VisuellTestErgebnis[keyof VisuellTestErgebnis]) {
    const neu = { ...ergebnisse, [key]: wert };
    setErgebnisse(neu);
    if (testIndex < TESTS.length - 1) {
      setTestIndex(testIndex + 1);
    } else {
      setFeier(true);
      setTimeout(() => onFertig(neu as VisuellTestErgebnis), 3500);
    }
  }

  if (feier) {
    return (
      <div className="text-center py-10 animate-pulse">
        <div className="text-7xl mb-6">🎉🚀🌟</div>
        <h2 className="text-3xl font-black mb-3" style={{ color: "#F5943A" }}>
          {kindName} ist ein Superstar!
        </h2>
        <p className="text-lg text-gray-600 mb-2">Alle 7 Tests geschafft — das war großartig!</p>
        <div className="text-4xl mt-4">⭐ 🎯 ⚡ 🔍 🦸 📡 🎯</div>
        <p className="text-sm text-gray-400 mt-6">Auswertung wird vorbereitet...</p>
      </div>
    );
  }

  if (testIndex === -1) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Der Sehtest</h2>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
          Jetzt kommen 7 kurze Tests für {kindName}! Die meisten dauert nur 1–2 Minuten.
          {kindName} spielt selbst — du schaust einfach zu.
        </p>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-8">
          {TESTS.map((t) => (
            <div key={t.id} className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl mb-1">{t.icon}</div>
              <div className="text-sm font-semibold text-gray-700">{t.name}</div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setTestIndex(0)}
          className="bg-primary hover:bg-primary-dark text-white font-bold text-xl px-10 py-4 rounded-xl transition-colors shadow-md"
        >
          Spielen starten →
        </button>
      </div>
    );
  }

  const aktuellerTest = TESTS[testIndex];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-sm font-semibold text-primary">
            Test {testIndex + 1} von {TESTS.length}
          </span>
          <h2 className="text-xl font-bold text-gray-900">
            {aktuellerTest.icon} {aktuellerTest.name}
          </h2>
        </div>
        <div className="flex gap-1">
          {TESTS.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i <= testIndex ? "bg-primary" : "bg-gray-200"}`} />
          ))}
        </div>
      </div>
      <p className="text-gray-600 mb-6 text-center text-lg">{aktuellerTest.beschreibung}</p>

      {aktuellerTest.id === "fixation" && (
        <Fixation onFertig={(r) => testFertig("fixation", r)} />
      )}
      {aktuellerTest.id === "sakkaden" && (
        <Sakkaden onFertig={(r) => testFertig("sakkaden", r)} />
      )}
      {aktuellerTest.id === "smoothPursuit" && (
        <SmoothPursuit onFertig={(r) => testFertig("smoothPursuit", r)} />
      )}
      {aktuellerTest.id === "diskrimination" && (
        <VisuelleDiskrimination onFertig={(r) => testFertig("diskrimination", r)} />
      )}
      {aktuellerTest.id === "lrs" && (
        <LRSTest onFertig={(r) => testFertig("lrs", r)} />
      )}
      {aktuellerTest.id === "peripher" && (
        <PeripheresSehen onFertig={(r) => testFertig("peripher", r)} />
      )}
      {aktuellerTest.id === "vergenz" && (
        <VergenzTest onFertig={(r) => testFertig("vergenz", r)} />
      )}
    </div>
  );
}
