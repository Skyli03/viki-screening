"use client";
import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Fragebogen from "@/components/Fragebogen";
import Vorlesen from "@/components/tests/Vorlesen";
import StiftUebung from "@/components/tests/StiftUebung";
import AugenReise from "@/components/tests/AugenReise";
import Buchstabenjaeger from "@/components/tests/Buchstabenjaeger";
import { SchrittKopf, WeiterKnopf, ORANGE } from "@/components/ui";
import { anzeigeName, ladeStand, speichereStand, type CheckStand } from "@/lib/speicher";
import { useImBrowser } from "@/lib/im-browser";
import { SCHRITTE, naechsterSchritt, schrittErlaubt, wiedereinstieg, type SchrittId } from "@/lib/schritte";

export default function SchrittSeite() {
  const router = useRouter();
  const params = useParams<{ schritt: string }>();
  const schritt = params.schritt as SchrittId;
  const imBrowser = useImBrowser();
  // Erst im Browser laden (sessionStorage), dann prüfen, ob der Schritt schon dran ist.
  const stand = useMemo<CheckStand | null>(() => {
    if (!imBrowser) return null;
    const s = ladeStand();
    const gueltig = !!s.klasse && SCHRITTE.some(x => x.id === schritt) && schrittErlaubt(schritt, s);
    return gueltig ? s : null;
  }, [imBrowser, schritt]);

  useEffect(() => {
    if (!imBrowser) return;
    if (stand) { window.scrollTo(0, 0); return; }
    const s = ladeStand();
    if (!s.klasse) { router.replace("/"); return; }
    const ziel = wiedereinstieg(s);
    router.replace(ziel ? `/screening/${ziel}` : "/ergebnis");
  }, [imBrowser, stand, router]);

  if (!stand) return <div className="min-h-screen bg-gray-50" />;

  const kindName = anzeigeName(stand);
  const index = SCHRITTE.findIndex(x => x.id === schritt);
  const aktuell = SCHRITTE[index];

  function weiter(teil?: Partial<CheckStand>) {
    if (teil) speichereStand(teil);
    const n = naechsterSchritt(schritt);
    router.push(n ? `/screening/${n}` : "/ergebnis");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between mb-2 text-sm">
            <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 font-semibold">← Zurück</button>
            <span className="font-bold text-gray-800">Augen-Check · VIKI Training</span>
            <span className="text-gray-500">{index + 1}/{SCHRITTE.length}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ background: ORANGE, width: `${((index + 1) / SCHRITTE.length) * 100}%` }} />
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">
            Teil {aktuell.teil} von 2 · {aktuell.label}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {schritt === "fragen-1" && <Fragebogen seite={1} onFertig={() => weiter()} />}
        {schritt === "fragen-2" && <Fragebogen seite={2} onFertig={() => weiter()} />}
        {schritt === "pause" && (
          <div>
            <SchrittKopf emoji="🎉" titel="Teil 1 ist geschafft!" unter={`Für Teil 2 (ca. 6 Minuten) brauchst du jetzt ${kindName === "dein Kind" ? "dein Kind" : kindName}.`} />
            <div className="bg-white rounded-2xl border-2 p-5 mb-6" style={{ borderColor: "#8DCDC5" }}>
              <p className="font-semibold text-gray-900 mb-3">Leg dir bereit:</p>
              <ul className="space-y-2 text-gray-700">
                <li>👧 {kindName === "dein Kind" ? "Dein Kind" : kindName}, gut ausgeschlafen und nicht hungrig</li>
                <li>📖 Ein Buch, das {kindName} kennt und gern liest</li>
                <li>✏️ Zwei Stifte</li>
                <li>💡 Einen hellen, ruhigen Platz</li>
              </ul>
              {stand.vorfragen.brille === "ja" && (
                <p className="text-sm text-gray-600 mt-3">👓 Die Brille bitte bei allen Übungen aufbehalten.</p>
              )}
            </div>
            <p className="text-sm text-gray-500 text-center mb-4">Gerade nicht passend? Dein Stand bleibt gespeichert, solange dieser Tab offen ist.</p>
            <WeiterKnopf onClick={() => weiter()}>Wir sind bereit →</WeiterKnopf>
          </div>
        )}
        {schritt === "lesen" && <Vorlesen kindName={kindName} onFertig={r => weiter({ lesen: r })} />}
        {schritt === "stift" && <StiftUebung kindName={kindName} onFertig={r => weiter({ konvergenz: r })} />}
        {schritt === "augen-reise" && <AugenReise kindName={kindName} onFertig={r => weiter({ augenReise: r })} />}
        {schritt === "spiel" && <Buchstabenjaeger kindName={kindName} klasse={stand.klasse!} onFertig={r => weiter({ buchstaben: r })} />}
      </main>
    </div>
  );
}
