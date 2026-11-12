"use client";
import { useState } from "react";
import { useImBrowser } from "@/lib/im-browser";
import { useRouter } from "next/navigation";
import { ladeStand, neuerCheck } from "@/lib/speicher";
import { ersterOffenerSchritt } from "@/lib/schritte";

const ABLAUF = [
  { nr: "1", icon: "📋", titel: "Deine Beobachtungen", dauer: "ca. 4 Min.", text: "16 kurze Fragen zum Alltag. Das machst du allein, dein Kind muss noch nicht dabei sein." },
  { nr: "2", icon: "✏️", titel: "Mit deinem Kind", dauer: "ca. 6 Min.", text: "Kurz vorlesen, zwei Augen-Übungen mit einem Stift und ein Buchstaben-Spiel am Handy." },
  { nr: "3", icon: "🎯", titel: "Dein Ergebnis", dauer: "sofort", text: "Ein erstes Ergebnis siehst du sofort. Den ausführlichen Bericht bekommst du per E-Mail." },
];
const FARBEN = ["#8DCDC5", "#F5943A", "#EE6B85"];

const KLASSEN = [
  { val: 1, oben: "1.", unten: "Klasse" },
  { val: 2, oben: "2.", unten: "Klasse" },
  { val: 3, oben: "3.", unten: "Klasse" },
  { val: 4, oben: "4.", unten: "oder älter" },
];

export default function Startseite() {
  const router = useRouter();
  const [kindName, setKindName] = useState("");
  const [klasse, setKlasse] = useState<number | null>(null);
  const [fehler, setFehler] = useState("");
  const imBrowser = useImBrowser();
  const angefangen = imBrowser && (() => {
    const s = ladeStand();
    return !!s.klasse && ersterOffenerSchritt(s) !== "fragen-1";
  })();

  function starten() {
    if (!klasse) { setFehler("Bitte wähle die Schulstufe deines Kindes."); return; }
    neuerCheck(kindName.trim().slice(0, 30), klasse);
    router.push("/screening/fragen-1");
  }

  return (
    <div className="min-h-screen" style={{ background: "#F0ECE7" }}>
      <header className="bg-white shadow-sm py-2 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="VIKI Training" className="h-14 w-auto" />
          <div className="hidden sm:block text-xs text-gray-500 font-medium uppercase tracking-wide">Kostenloser Augen-Check</div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👀</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
            Lesen ist anstrengend?<br />Schau, ob die Augen mitspielen.
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Der kostenlose Augen-Check gibt dir in <strong>ca. 10–12 Minuten</strong> eine erste Orientierung, ob die Zusammenarbeit der Augen beim Lesen deines Kindes eine Rolle spielen könnte.
          </p>
        </div>

        {angefangen && (
          <div className="bg-white rounded-2xl border-2 p-5 mb-6 text-center" style={{ borderColor: "#F5943A" }}>
            <p className="font-semibold text-gray-900 mb-3">Du hast schon angefangen. Möchtest du weitermachen?</p>
            <button onClick={() => router.push("/screening")} className="w-full text-white font-bold py-3 rounded-xl" style={{ background: "#F5943A" }}>
              Weitermachen →
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {ABLAUF.map((s, i) => (
            <div key={s.nr} className="bg-white rounded-2xl p-4 shadow-sm border-2 flex sm:block gap-3 sm:text-center" style={{ borderColor: FARBEN[i] }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 sm:mx-auto sm:mb-2" style={{ background: FARBEN[i] }}>
                {s.nr}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{s.icon} {s.titel} <span className="text-sm font-normal text-gray-500">· {s.dauer}</span></div>
                <div className="text-sm text-gray-600 mt-1">{s.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-md border-2 p-6 sm:p-8" style={{ borderColor: "#8DCDC5" }}>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Los geht&apos;s</h2>
          <div className="space-y-5">
            <div>
              <label htmlFor="kindname" className="block text-sm font-semibold text-gray-700 mb-2">
                Vorname deines Kindes <span className="font-normal text-gray-400">(freiwillig, bleibt auf deinem Gerät)</span>
              </label>
              <input
                id="kindname"
                type="text"
                maxLength={30}
                value={kindName}
                onChange={e => setKindName(e.target.value)}
                placeholder="z. B. Lukas"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-[#8DCDC5]"
              />
            </div>

            <div>
              <p className="block text-sm font-semibold text-gray-700 mb-2">In welche Klasse geht dein Kind?</p>
              <div className="grid grid-cols-4 gap-2">
                {KLASSEN.map(k => (
                  <button
                    key={k.val}
                    type="button"
                    aria-pressed={klasse === k.val}
                    onClick={() => { setKlasse(k.val); setFehler(""); }}
                    className="py-3 rounded-xl border-2 transition-colors flex flex-col items-center leading-tight"
                    style={klasse === k.val
                      ? { background: "#8DCDC5", borderColor: "#8DCDC5", color: "white" }
                      : { background: "white", borderColor: "#E5E7EB", color: "#374151" }}
                  >
                    <span className="text-lg font-bold">{k.oben}</span>
                    <span className="text-xs">{k.unten}</span>
                  </button>
                ))}
              </div>
            </div>

            {fehler && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{fehler}</div>}

            <button
              onClick={starten}
              className="w-full text-white font-bold text-xl py-4 rounded-xl shadow-md transition-colors hover:bg-[#E07E25]"
              style={{ background: "#F5943A" }}
            >
              Augen-Check starten →
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            🔒 Kostenlos · Kein Konto nötig · Keine Kamera
          </p>
        </div>

        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-gray-500">
            Der Augen-Check ist eine erste Orientierung, keine Diagnose. Er ersetzt keine Untersuchung bei einer Augenärztin, einem Augenarzt oder in der Optometrie.
          </p>
          <div className="text-sm text-gray-500">
            <a href="https://vikitraining.at" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "#F5943A" }}>vikitraining.at</a>
            {" · Funktionaloptometrie & Visualtraining · "}
            <a href="/impressum" className="hover:underline">Impressum</a>
            {" · "}
            <a href="/datenschutz" className="hover:underline">Datenschutz</a>
          </div>
        </div>
      </main>
    </div>
  );
}
