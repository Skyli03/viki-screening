import type { CheckStand } from "@/lib/speicher";
import { FRAGEN } from "@/data/fragebogen";

// Jeder Schritt hat eine eigene Adresse (/screening/<id>). So zählt Vercel
// Analytics die Aufrufe pro Schritt und man sieht, wo Eltern abbrechen.

export type SchrittId = "fragen-1" | "fragen-2" | "pause" | "lesen" | "stift" | "augen-reise" | "spiel";

export const SCHRITTE: { id: SchrittId; label: string; teil: 1 | 2 }[] = [
  { id: "fragen-1",    label: "Fragen",          teil: 1 },
  { id: "fragen-2",    label: "Fragen",          teil: 1 },
  { id: "pause",       label: "Kurz vorbereiten", teil: 2 },
  { id: "lesen",       label: "Vorlesen",        teil: 2 },
  { id: "stift",       label: "Stift-Übung",     teil: 2 },
  { id: "augen-reise", label: "Augen-Reise",     teil: 2 },
  { id: "spiel",       label: "Buchstabenjäger", teil: 2 },
];

function beantwortet(s: CheckStand, abschnitte: string[]): boolean {
  return FRAGEN.filter(f => abschnitte.includes(f.abschnitt)).every(f => f.id in s.fragebogen);
}

export function schrittErledigt(id: SchrittId, s: CheckStand): boolean {
  switch (id) {
    case "fragen-1": return !!s.vorfragen.brille && !!s.vorfragen.untersuchung && beantwortet(s, ["lesen"]);
    case "fragen-2": return beantwortet(s, ["ausdauer", "koerper"]);
    case "pause":    return beantwortet(s, ["ausdauer", "koerper"]); // reine Info-Seite
    case "lesen":    return !!s.lesen;
    case "stift":    return !!s.konvergenz;
    case "augen-reise": return !!s.augenReise;
    case "spiel":    return !!s.buchstaben;
  }
}

/** Erster offener Schritt, oder null wenn alles erledigt ist */
export function ersterOffenerSchritt(s: CheckStand): SchrittId | null {
  return SCHRITTE.find(x => !schrittErledigt(x.id, s))?.id ?? null;
}

/** Darf dieser Schritt schon angezeigt werden? (alle vorherigen erledigt) */
export function schrittErlaubt(id: SchrittId, s: CheckStand): boolean {
  const i = SCHRITTE.findIndex(x => x.id === id);
  return SCHRITTE.slice(0, i).every(x => schrittErledigt(x.id, s));
}

/** Wohin beim Wiedereinstieg: vor dem Vorlesen zuerst die Vorbereitungs-Seite zeigen */
export function wiedereinstieg(s: CheckStand): SchrittId | null {
  const offen = ersterOffenerSchritt(s);
  return offen === "lesen" ? "pause" : offen;
}

export function naechsterSchritt(id: SchrittId): SchrittId | null {
  const i = SCHRITTE.findIndex(x => x.id === id);
  return SCHRITTE[i + 1]?.id ?? null;
}
