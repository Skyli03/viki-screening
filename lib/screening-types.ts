// ─── Datenmodell Augen-Check (Kurzfassung, Stand 11/2026) ─────────────────────
// Alles bleibt im Browser (sessionStorage). Nur für den Bericht per E-Mail wird
// dieses Paket an /api/bericht geschickt und dort ausgewertet.

/** 0 = nie, 1 = manchmal, 2 = oft, 3 = immer, null = weiß nicht */
export type Antwort = 0 | 1 | 2 | 3 | null;

export interface Vorfragen {
  brille: "ja" | "nein" | "weiss_nicht";
  untersuchung: "unter_1_jahr" | "laenger" | "nie" | "weiss_nicht";
}

export interface LeseErgebnis {
  fluessig: boolean;
  zeile_verloren: boolean;
  finger: boolean;
  /** Sehr nah am Buch, Kopf schief oder Abstand wechselt ständig */
  haltung: "unauffaellig" | "auffaellig";
}

export type KonvergenzZeichen = "doppelbilder" | "schaut_weg" | "anstrengend";

export interface KonvergenzErgebnis {
  augen: "gleichmaessig" | "weicht_kurz_aus" | "weicht_deutlich_aus";
  zeichen: KonvergenzZeichen[];
}

export interface AugenReiseErgebnis {
  folgen: "fluessig" | "ruckelig" | "verliert";
  springen: "praezise" | "korrigiert" | "sucht";
  kopf_mitbewegt: boolean;
}

export interface BuchstabenErgebnis {
  fehler: number;
  runden: number;
}

export interface ScreeningDaten {
  klasse: number;
  vorfragen: Vorfragen;
  fragebogen: Record<string, Antwort>;
  lesen: LeseErgebnis;
  konvergenz: KonvergenzErgebnis;
  augenReise: AugenReiseErgebnis;
  buchstaben: BuchstabenErgebnis;
}
