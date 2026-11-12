"use client";
import type {
  Antwort, AugenReiseErgebnis, BuchstabenErgebnis, KonvergenzErgebnis,
  LeseErgebnis, ScreeningDaten, Vorfragen,
} from "@/lib/screening-types";

// Zwischenstand im sessionStorage: übersteht Neuladen und App-Wechsel,
// wird beim Schließen des Tabs gelöscht. Verlässt den Browser nicht.

const KEY = "augencheck_v2";

export interface CheckStand {
  kindName: string;
  klasse: number | null;
  vorfragen: Partial<Vorfragen>;
  fragebogen: Record<string, Antwort>;
  lesen?: LeseErgebnis;
  konvergenz?: KonvergenzErgebnis;
  augenReise?: AugenReiseErgebnis;
  buchstaben?: BuchstabenErgebnis;
}

const LEER: CheckStand = { kindName: "", klasse: null, vorfragen: {}, fragebogen: {} };

export function ladeStand(): CheckStand {
  if (typeof window === "undefined") return { ...LEER };
  try {
    const roh = sessionStorage.getItem(KEY);
    return roh ? { ...LEER, ...JSON.parse(roh) } : { ...LEER };
  } catch {
    return { ...LEER };
  }
}

export function speichereStand(teil: Partial<CheckStand>): CheckStand {
  const neu = { ...ladeStand(), ...teil };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(neu));
  } catch {
    // Privater Modus o. Ä.: Check funktioniert trotzdem, nur ohne Zwischenstand.
  }
  return neu;
}

export function neuerCheck(kindName: string, klasse: number) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...LEER, kindName, klasse }));
  } catch {
    // siehe oben
  }
}

export function alsScreeningDaten(s: CheckStand): ScreeningDaten | null {
  const v = s.vorfragen;
  if (!s.klasse || !v.brille || !v.untersuchung || !s.lesen || !s.konvergenz || !s.augenReise || !s.buchstaben) {
    return null;
  }
  return {
    klasse: s.klasse,
    vorfragen: { brille: v.brille, untersuchung: v.untersuchung },
    fragebogen: s.fragebogen,
    lesen: s.lesen,
    konvergenz: s.konvergenz,
    augenReise: s.augenReise,
    buchstaben: s.buchstaben,
  };
}

/** "dein Kind", wenn kein Name angegeben wurde */
export function anzeigeName(s: CheckStand): string {
  return s.kindName.trim() || "dein Kind";
}
