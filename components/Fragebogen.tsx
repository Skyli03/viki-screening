"use client";
import { useState } from "react";
import { FRAGEN, ANTWORT_OPTIONEN } from "@/data/fragebogen";
import type { Antwort, Vorfragen } from "@/lib/screening-types";
import { ladeStand, speichereStand } from "@/lib/speicher";
import { Auswahl, Frageblock, SchrittKopf, WeiterKnopf } from "@/components/ui";

interface Props {
  seite: 1 | 2;
  onFertig: () => void;
}

const FARBEN: Record<string, string> = { "0": "#16A34A", "1": "#CA8A04", "2": "#EA580C", "3": "#DC2626", null: "#6B7280" };

export default function Fragebogen({ seite, onFertig }: Props) {
  const [antworten, setAntworten] = useState<Record<string, Antwort>>(() => ladeStand().fragebogen);
  const [vorfragen, setVorfragen] = useState<Partial<Vorfragen>>(() => ladeStand().vorfragen);

  const abschnitte = seite === 1 ? ["lesen"] : ["ausdauer", "koerper"];
  const fragen = FRAGEN.filter(f => abschnitte.includes(f.abschnitt));
  const offen = fragen.filter(f => !(f.id in antworten)).length + (seite === 1 ? (vorfragen.brille ? 0 : 1) + (vorfragen.untersuchung ? 0 : 1) : 0);

  // Sofort speichern, damit beim Neuladen nichts verloren geht
  function antworte(id: string, wert: Antwort) {
    speichereStand({ fragebogen: { ...ladeStand().fragebogen, [id]: wert } });
    setAntworten(prev => ({ ...prev, [id]: wert }));
  }

  function vorfrage<K extends keyof Vorfragen>(key: K, wert: Vorfragen[K]) {
    speichereStand({ vorfragen: { ...ladeStand().vorfragen, [key]: wert } });
    setVorfragen(prev => ({ ...prev, [key]: wert }));
  }

  return (
    <div>
      {seite === 1 ? (
        <SchrittKopf emoji="📋" titel="Teil 1: Deine Beobachtungen" unter="Diesen Teil machst du allein, dein Kind muss noch nicht dabei sein. Antworte einfach nach deinem Gefühl." />
      ) : (
        <SchrittKopf emoji="📋" titel="Fast geschafft" unter="Noch 5 Fragen zu Ausdauer, Haltung und Bewegung." />
      )}

      <div className="space-y-4 mb-6">
        {seite === 1 && (
          <>
            <Frageblock frage="Trägt dein Kind eine Brille?">
              <div className="grid grid-cols-3 gap-2">
                <Auswahl label="Ja" aktiv={vorfragen.brille === "ja"} onClick={() => vorfrage("brille", "ja")} />
                <Auswahl label="Nein" aktiv={vorfragen.brille === "nein"} onClick={() => vorfrage("brille", "nein")} />
                <Auswahl label="Weiß nicht" aktiv={vorfragen.brille === "weiss_nicht"} onClick={() => vorfrage("brille", "weiss_nicht")} />
              </div>
            </Frageblock>
            <Frageblock frage="Wann wurden die Augen deines Kindes zuletzt untersucht (Augenärztin/Augenarzt oder Optometrie)?">
              <div className="grid grid-cols-2 gap-2">
                <Auswahl label="Vor weniger als 1 Jahr" aktiv={vorfragen.untersuchung === "unter_1_jahr"} onClick={() => vorfrage("untersuchung", "unter_1_jahr")} />
                <Auswahl label="Länger her" aktiv={vorfragen.untersuchung === "laenger"} onClick={() => vorfrage("untersuchung", "laenger")} />
                <Auswahl label="Noch nie" aktiv={vorfragen.untersuchung === "nie"} onClick={() => vorfrage("untersuchung", "nie")} />
                <Auswahl label="Weiß nicht" aktiv={vorfragen.untersuchung === "weiss_nicht"} onClick={() => vorfrage("untersuchung", "weiss_nicht")} />
              </div>
            </Frageblock>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide pt-2">Lesen & Sehen</p>
          </>
        )}

        {fragen.map((frage, i) => {
          const zeigeTitel = seite === 2 && (i === 0 || fragen[i - 1].abschnitt !== frage.abschnitt);
          return (
            <div key={frage.id}>
              {zeigeTitel && (
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 mt-2">
                  {frage.abschnitt === "ausdauer" ? "Ausdauer" : "Körper & Haltung"}
                </p>
              )}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <p className="text-gray-800 font-medium mb-3">{frage.text}</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {ANTWORT_OPTIONEN.map(opt => {
                    const aktiv = frage.id in antworten && antworten[frage.id] === opt.wert;
                    const farbe = FARBEN[String(opt.wert)];
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        aria-pressed={aktiv}
                        onClick={() => antworte(frage.id, opt.wert)}
                        className="py-2.5 px-1 rounded-xl border-2 text-xs sm:text-sm font-semibold leading-tight transition-all"
                        style={aktiv ? { borderColor: farbe, color: farbe, background: "#FAFAFA" } : { borderColor: "#E5E7EB", color: "#6B7280" }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <WeiterKnopf onClick={onFertig} disabled={offen > 0}>
        {offen > 0 ? `Noch ${offen} offen` : "Weiter →"}
      </WeiterKnopf>
    </div>
  );
}
