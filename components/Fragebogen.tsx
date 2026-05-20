"use client";
import { useState } from "react";
import { FRAGEN, ANTWORT_LABELS } from "@/data/fragebogen";
import type { FragebogenAntworten, Antwort } from "@/data/fragebogen";

interface Props {
  kindName: string;
  onFertig: (antworten: FragebogenAntworten) => void;
}

const ABSCHNITTE = [
  { titel: "Lesen & Schulverhalten", icon: "📚", kategorie: "lesen" as const },
  { titel: "Konzentration & Aufmerksamkeit", icon: "🧠", kategorie: "konzentration" as const },
  { titel: "Körper & Reflexe", icon: "🏃", kategorie: "reflex" as const },
];

export default function Fragebogen({ kindName, onFertig }: Props) {
  const [antworten, setAntworten] = useState<Partial<FragebogenAntworten>>({});
  const [abschnitt, setAbschnitt] = useState(0);

  const aktuellerAbschnitt = ABSCHNITTE[abschnitt];
  const fragen = FRAGEN.filter((f) => f.kategorie === aktuellerAbschnitt.kategorie);
  const beantwortet = fragen.filter((f) => antworten[f.id] !== undefined).length;
  const alle = fragen.every((f) => antworten[f.id] !== undefined);

  function setAntwort(id: string, wert: Antwort) {
    setAntworten((prev) => ({ ...prev, [id]: wert }));
  }

  function weiter() {
    if (abschnitt < ABSCHNITTE.length - 1) {
      setAbschnitt(abschnitt + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      onFertig(antworten as FragebogenAntworten);
    }
  }

  const FARBEN = ["bg-green-500", "bg-yellow-400", "bg-orange-400", "bg-red-500"];
  const FARBEN_BORDER = ["border-green-400", "border-yellow-400", "border-orange-400", "border-red-400"];
  const FARBEN_TEXT = ["text-green-700", "text-yellow-700", "text-orange-700", "text-red-700"];
  const FARBEN_BG = ["bg-green-50", "bg-yellow-50", "bg-orange-50", "bg-red-50"];

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">📋</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Elternfragebogen</h2>
        <p className="text-gray-600 max-w-md mx-auto text-sm">
          Diese Fragen helfen uns, das Gesamtbild für {kindName} zu vervollständigen.
          Bitte beantworte jede Frage ehrlich nach deiner Beobachtung.
        </p>
      </div>

      {/* Fortschritt Abschnitte */}
      <div className="flex gap-2 justify-center mb-8">
        {ABSCHNITTE.map((a, i) => (
          <div
            key={i}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              i === abschnitt ? "bg-primary text-white" : i < abschnitt ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
            }`}
          >
            {a.icon} {a.titel}
          </div>
        ))}
      </div>

      <div className="space-y-5 mb-8">
        {fragen.map((frage) => {
          const wert = antworten[frage.id];
          return (
            <div key={frage.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-gray-800 font-medium mb-4">{frage.text}</p>
              <div className="grid grid-cols-4 gap-2">
                {ANTWORT_LABELS.map((label, i) => (
                  <button
                    key={i}
                    onClick={() => setAntwort(frage.id, i as Antwort)}
                    className={`py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${
                      wert === i
                        ? `${FARBEN_BG[i]} ${FARBEN_BORDER[i]} ${FARBEN_TEXT[i]}`
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${wert === i ? FARBEN[i] : "bg-gray-200"}`} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{beantwortet} / {fragen.length} beantwortet</span>
        <button
          onClick={weiter}
          disabled={!alle}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {abschnitt < ABSCHNITTE.length - 1 ? "Weiter →" : "Auswertung anzeigen →"}
        </button>
      </div>
    </div>
  );
}
