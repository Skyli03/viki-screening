"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SCHRITTE = [
  { nr: "1", icon: "📖", titel: "Lesetest", text: "Dein Kind liest einen kurzen Text laut vor. Die Kamera beobachtet dabei sanft die Augenbewegungen." },
  { nr: "2", icon: "🎯", titel: "Sehtest", text: "6 kurze, spielerische Aufgaben am Bildschirm — dauert nur 5 Minuten." },
  { nr: "3", icon: "📋", titel: "Fragebogen", text: "Du beantwortest Fragen über dein Kind als Elternteil. Dauert ca. 3 Minuten." },
];

export default function Startseite() {
  const router = useRouter();
  const [kindName, setKindName] = useState("");
  const [geschlecht, setGeschlecht] = useState<"m" | "f" | "">("");
  const [klasse, setKlasse] = useState<number | null>(null);
  const [fehler, setFehler] = useState("");

  function starten() {
    if (!kindName.trim()) { setFehler("Bitte gib den Namen deines Kindes ein."); return; }
    if (!klasse) { setFehler("Bitte wähle die Schulstufe deines Kindes."); return; }
    sessionStorage.setItem("kindName", kindName.trim());
    sessionStorage.setItem("geschlecht", geschlecht);
    sessionStorage.setItem("klasse", String(klasse));
    router.push("/screening");
  }

  return (
    <div className="min-h-screen" style={{ background: "#F0ECE7" }}>
      {/* Header */}
      <header className="bg-white shadow-sm py-2 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <img src="/logo.png" alt="VIKI Training" className="h-14 w-auto" />
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Kostenloser Sehtest</div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">👁️✨</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
            Wie gut sieht und lernt<br />dein Kind wirklich?
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Dieser kostenlose Test zeigt dir in <strong>15 Minuten</strong>, ob dein Kind visuelle Verarbeitungsprobleme hat — die häufigste unentdeckte Ursache für Lernschwierigkeiten.
          </p>
        </div>

        {/* So funktioniert's */}
        <div className="mb-10">
          <h2 className="text-center text-lg font-bold text-gray-700 mb-4 tracking-wide uppercase" style={{ letterSpacing: "0.05em" }}>
            So funktioniert der Test
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {SCHRITTE.map((s, i) => (
              <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border-2 text-center select-none`}
                style={{ borderColor: i === 0 ? "#8DCDC5" : i === 1 ? "#F5943A" : "#EE6B85" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mx-auto mb-2"
                  style={{ background: i === 0 ? "#8DCDC5" : i === 1 ? "#F5943A" : "#EE6B85" }}>
                  {s.nr}
                </div>
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="font-semibold text-gray-900 mb-1">{s.titel}</div>
                <div className="text-sm text-gray-500">{s.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Formular */}
        <div className="bg-white rounded-2xl shadow-md border-2 p-8" style={{ borderColor: "#8DCDC5" }}>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Lass uns beginnen 🚀</h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vorname deines Kindes
              </label>
              <input
                type="text"
                value={kindName}
                onChange={(e) => { setKindName(e.target.value); setFehler(""); }}
                placeholder="z.B. Lukas"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none transition-colors"
                style={{ outlineColor: "#8DCDC5" }}
                onFocus={e => e.currentTarget.style.borderColor = "#8DCDC5"}
                onBlur={e => e.currentTarget.style.borderColor = "#E5E7EB"}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bub oder Mädchen?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { val: "m" as const, emoji: "👦", label: "Bub" },
                  { val: "f" as const, emoji: "👧", label: "Mädchen" },
                ] as const).map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => { setGeschlecht(opt.val); setFehler(""); }}
                    className="py-3 rounded-xl font-semibold text-lg border-2 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    style={
                      geschlecht === opt.val
                        ? { background: "#8DCDC5", borderColor: "#8DCDC5", color: "white" }
                        : { background: "white", borderColor: "#E5E7EB", color: "#374151" }
                    }
                  >
                    <span>{opt.emoji}</span> {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                In welche Klasse geht dein Kind?
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { val: 1, label: "1. Klasse" },
                  { val: 2, label: "2. Klasse" },
                  { val: 3, label: "3. Klasse" },
                  { val: 4, label: "4. Klasse und höher" },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => { setKlasse(val); setFehler(""); }}
                    className="py-3 rounded-xl font-semibold border-2 transition-colors cursor-pointer"
                    style={
                      klasse === val
                        ? { background: "#8DCDC5", borderColor: "#8DCDC5", color: "white" }
                        : { background: "white", borderColor: "#E5E7EB", color: "#374151" }
                    }
                  >
                    {val === 4 ? (
                      <span className="flex flex-col items-center leading-tight">
                        <span className="text-lg font-semibold">4. Klasse</span>
                        <span className="text-xs font-normal opacity-75">und höher</span>
                      </span>
                    ) : label}
                  </button>
                ))}
              </div>
            </div>

            {fehler && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {fehler}
              </div>
            )}

            <button
              onClick={starten}
              className="w-full text-white font-bold text-xl py-4 rounded-xl transition-all shadow-md hover:scale-105 active:scale-100"
              style={{ background: "#F5943A" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#E07E25")}
              onMouseLeave={e => (e.currentTarget.style.background = "#F5943A")}
            >
              Jetzt kostenlos starten →
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            🔒 Kein Account nötig · Kamerabild bleibt auf deinem Gerät · DSGVO-konform
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-gray-400">
            ⚠️ Dieser Test ersetzt keine augenärztliche oder optometrische Diagnostik. Bei Verdacht auf Sehprobleme wende dich bitte an eine Fachperson.
          </p>
          <p className="text-sm font-medium" style={{ color: "#8DCDC5" }}>Funktionaloptometrie & Visualtraining</p>
          <div className="text-sm text-gray-500">
            <a href="https://vikitraining.at" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "#F5943A" }}>vikitraining.at</a>
            {" · "}Funktionaloptometristin & Visualtrainerin
            {" · "}
            <a href="/impressum" className="hover:underline text-gray-400">Impressum</a>
            {" · "}
            <a href="/datenschutz" className="hover:underline text-gray-400">Datenschutz</a>
          </div>
        </div>
      </main>
    </div>
  );
}
