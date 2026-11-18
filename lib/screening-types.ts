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
  /** Ähnlich aussehende Buchstaben (b/d, p/q) öfter verwechselt. Fehlt bei älteren Zwischenständen. */
  verwechselt?: boolean;
  /** Sehr nah am Buch, Kopf schief oder Abstand wechselt ständig */
  haltung: "unauffaellig" | "auffaellig";
}

export type KonvergenzZeichen = "schaut_weg" | "anstrengend";

/** Ab welchem Abstand der Stift doppelt wurde. Ganz nah (unter ca. 6 cm) ist normal. */
export type DoppeltAbstand = "nah_oder_nie" | "daumen_bis_hand" | "weit" | "unklar";

export interface KonvergenzErgebnis {
  augen: "gleichmaessig" | "weicht_kurz_aus" | "weicht_deutlich_aus";
  doppelt: DoppeltAbstand;
  zeichen: KonvergenzZeichen[];
}

export interface AugenReiseErgebnis {
  folgen: "fluessig" | "ruckelig" | "verliert";
  springen: "praezise" | "korrigiert" | "sucht";
  kopf_mitbewegt: boolean;
}

export interface ScreeningDaten {
  klasse: number;
  vorfragen: Vorfragen;
  fragebogen: Record<string, Antwort>;
  lesen: LeseErgebnis;
  konvergenz: KonvergenzErgebnis;
  augenReise: AugenReiseErgebnis;
}
