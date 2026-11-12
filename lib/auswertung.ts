import type { Antwort, ScreeningDaten } from "@/lib/screening-types";

// ─── Auswertung Augen-Check ───────────────────────────────────────────────────
// Bewusst einfach und nachvollziehbar: 4 Bereiche mit Ampel, dazu Ausdauer als
// kurzer Hinweis (keine Ampel) und Warnzeichen, die eine fachliche Abklärung
// nahelegen. Keine Normwerte, keine Diagnose — nur Orientierung.

export type BereichId = "lesen" | "teamarbeit" | "buchstaben" | "koerper";

/** 0 = unauffällig, 1 = leichte, 2 = deutliche, 3 = starke Hinweise */
export type Stufe = 0 | 1 | 2 | 3;

export interface Bereich {
  id: BereichId;
  name: string;
  score: number;
  stufe: Stufe;
}

export interface Warnzeichen {
  id: string;
  text: string;
}

export interface Zusammenhang {
  titel: string;
  text: string;
}

export interface ScreeningProfil {
  bereiche: Bereich[];
  gesamtStufe: Stufe;
  /** Bereich mit den stärksten Hinweisen, null wenn alles unauffällig */
  schwerpunkt: BereichId | null;
  warnzeichen: Warnzeichen[];
  /** Letzte Augenuntersuchung länger her / nie / unbekannt */
  untersuchungEmpfohlen: boolean;
  ausdauerHinweis: boolean;
  zusammenhaenge: Zusammenhang[];
}

export const BEREICH_NAMEN: Record<BereichId, string> = {
  lesen: "Lesen & Augenbewegungen",
  teamarbeit: "Augen-Teamarbeit beim Nahsehen",
  buchstaben: "Buchstaben unterscheiden",
  koerper: "Körper & Haltung",
};

export function stufeAusScore(score: number): Stufe {
  if (score >= 71) return 0;
  if (score >= 56) return 1;
  if (score >= 41) return 2;
  return 3;
}

function wert(fragen: Record<string, Antwort> | undefined, id: string): number | null {
  const v = fragen?.[id];
  return typeof v === "number" && v >= 0 && v <= 3 ? v : null;
}

/** Durchschnitt der beantworteten Fragen als Anteil 0–1 ("weiß nicht" zählt nicht) */
function anteil(fragen: Record<string, Antwort> | undefined, ids: string[]): number {
  const werte = ids.map(id => wert(fragen, id)).filter((v): v is number => v !== null);
  if (werte.length === 0) return 0;
  return werte.reduce((s, v) => s + v, 0) / (werte.length * 3);
}

/** "Oft" oder "Immer" */
function haeufig(fragen: Record<string, Antwort> | undefined, id: string): boolean {
  return (wert(fragen, id) ?? 0) >= 2;
}

function begrenzen(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

// ─── Bereiche ─────────────────────────────────────────────────────────────────

function scoreLesen(d: ScreeningDaten): number {
  let s = 100;
  if (d.lesen?.fluessig === false) s -= 15;
  if (d.lesen?.zeile_verloren) s -= 20;
  if (d.lesen?.finger) s -= 10;

  if (d.augenReise?.folgen === "verliert") s -= 25;
  else if (d.augenReise?.folgen === "ruckelig") s -= 12;
  if (d.augenReise?.springen === "sucht") s -= 20;
  else if (d.augenReise?.springen === "korrigiert") s -= 10;
  if (d.augenReise?.kopf_mitbewegt) s -= 8;

  // "Manchmal" bei allen Fragen (Anteil 0,33) zählt bewusst noch nicht.
  const a = anteil(d.fragebogen, ["l1", "l2", "l6", "l8"]);
  if (a > 0.6) s -= 20;
  else if (a > 0.4) s -= 10;
  return begrenzen(s);
}

function scoreTeamarbeit(d: ScreeningDaten): number {
  let s = 100;
  if (d.konvergenz?.augen === "weicht_deutlich_aus") s -= 40;
  else if (d.konvergenz?.augen === "weicht_kurz_aus") s -= 20;
  const z = d.konvergenz?.zeichen ?? [];
  if (z.includes("doppelbilder")) s -= 20;
  if (z.includes("schaut_weg")) s -= 10;
  if (z.includes("anstrengend")) s -= 8;
  if (d.lesen?.haltung === "auffaellig") s -= 10;

  const a = anteil(d.fragebogen, ["l4", "l5", "l7", "l9"]);
  if (a > 0.6) s -= 20;
  else if (a > 0.4) s -= 10;
  return begrenzen(s);
}

function scoreBuchstaben(d: ScreeningDaten): number {
  let s = 100;
  const fehler = Number(d.buchstaben?.fehler) || 0;
  // 8 Runden. In der 1. Klasse sind b/d-Verwechslungen noch häufig → großzügiger.
  const grenze = d.klasse <= 1 ? { gelb: 3, rot: 5 } : d.klasse === 2 ? { gelb: 2, rot: 4 } : { gelb: 2, rot: 3 };
  if (fehler >= grenze.rot) s -= 45;
  else if (fehler >= grenze.gelb) s -= 25;
  if (d.klasse >= 2 && haeufig(d.fragebogen, "l3")) s -= 15;
  return begrenzen(s);
}

function scoreKoerper(d: ScreeningDaten): number {
  const anzahl = ["k1", "k2", "k3"].filter(id => haeufig(d.fragebogen, id)).length;
  return [100, 65, 50, 35][anzahl];
}

// ─── Warnzeichen ──────────────────────────────────────────────────────────────

function erkenneWarnzeichen(d: ScreeningDaten): Warnzeichen[] {
  const w: Warnzeichen[] = [];
  if (d.konvergenz?.zeichen?.includes("doppelbilder")) {
    w.push({ id: "doppelbilder", text: "Bei der Stift-Übung hat dein Kind Doppelbilder bemerkt." });
  }
  if (d.konvergenz?.augen === "weicht_deutlich_aus") {
    w.push({ id: "auge_weicht_aus", text: "Bei der Stift-Übung ist ein Auge deutlich nach außen ausgewichen." });
  }
  if (haeufig(d.fragebogen, "l9")) {
    w.push({ id: "verschwommen", text: "Dein Kind sagt oft, dass Buchstaben verschwimmen, wackeln oder doppelt erscheinen." });
  }
  if (haeufig(d.fragebogen, "l4")) {
    w.push({ id: "kopfschmerzen", text: "Dein Kind klagt oft über Kopfschmerzen oder müde Augen nach dem Lesen." });
  }
  return w;
}

function erkenneZusammenhaenge(bereiche: Record<BereichId, Stufe>): Zusammenhang[] {
  const z: Zusammenhang[] = [];
  if (bereiche.teamarbeit > 0 && bereiche.lesen > 0) {
    z.push({
      titel: "Nahsehen und Lesefluss",
      text: "Hinweise zeigten sich sowohl bei der Zusammenarbeit der Augen in der Nähe als auch beim Lesen selbst. Wenn das Nahsehen viel Kraft kostet, kann Lesen schneller anstrengend werden. Ob das bei deinem Kind so ist, klärt eine fachliche Untersuchung.",
    });
  }
  if (bereiche.koerper > 0 && (bereiche.lesen > 0 || bereiche.teamarbeit > 0)) {
    z.push({
      titel: "Körper und Augen",
      text: "Neben den Augen-Übungen hast du auch bei Haltung und Bewegung einiges beobachtet. Haltung, Gleichgewicht und Augensteuerung hängen eng zusammen. Darum denken wir Augen und Körper im Training gemeinsam.",
    });
  }
  return z;
}

// ─── Hauptauswertung ──────────────────────────────────────────────────────────

export function berechneScreeningProfil(daten: ScreeningDaten): ScreeningProfil {
  const scores: Record<BereichId, number> = {
    lesen: scoreLesen(daten),
    teamarbeit: scoreTeamarbeit(daten),
    buchstaben: scoreBuchstaben(daten),
    koerper: scoreKoerper(daten),
  };

  const bereiche: Bereich[] = (Object.keys(scores) as BereichId[]).map(id => ({
    id,
    name: BEREICH_NAMEN[id],
    score: scores[id],
    stufe: stufeAusScore(scores[id]),
  }));

  // Gesamtergebnis = auffälligster Bereich (kein Durchschnitt, sonst "verschwindet" ein roter Bereich).
  const gesamtStufe = Math.max(...bereiche.map(b => b.stufe)) as Stufe;
  const niedrigster = bereiche.reduce((a, b) => (b.score < a.score ? b : a));
  const schwerpunkt = niedrigster.stufe > 0 ? niedrigster.id : null;

  const stufen = Object.fromEntries(bereiche.map(b => [b.id, b.stufe])) as Record<BereichId, Stufe>;

  return {
    bereiche,
    gesamtStufe,
    schwerpunkt,
    warnzeichen: erkenneWarnzeichen(daten),
    untersuchungEmpfohlen: daten.vorfragen?.untersuchung !== "unter_1_jahr",
    ausdauerHinweis: haeufig(daten.fragebogen, "a1") && haeufig(daten.fragebogen, "a2"),
    zusammenhaenge: erkenneZusammenhaenge(stufen),
  };
}
