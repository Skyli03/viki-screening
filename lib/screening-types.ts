// ─── Neue Typen nach Umbau (kamera-frei, elternbasiert) ──────────────────────

export interface KonvergenzErgebnis {
  /** Wie folgen beide Augen dem Stift beim Annähern? */
  beideAugen: "unauffaellig" | "leicht_auffaellig" | "deutlich_auffaellig";
  /** Zeichen: Doppelbilder, Auge springt raus, Kind schaut weg */
  zeichen: string[]; // z.B. ["doppelbilder", "auge_springt", "schaut_weg"]
}

export interface BuchLeseErgebnis {
  verliert_zeile: boolean;
  ueberspringt_woerter: boolean;
  benutzt_finger: boolean;
  viele_fehler_bekannte_woerter: boolean;
  fluessig: boolean;
  leseabstand: "normal" | "zu_nah" | "zu_weit" | "wechselnd";
  kopfhaltung: "gerade" | "schief_oder_verdreht";
  /** Monokularer Vergleich: wird Lesen mit einem Auge besser? */
  monokular: "besser" | "gleich" | "schlechter" | "nicht_getestet";
}

export interface PCLeseErgebnis {
  lesezeitSekunden: number;
  lesequalitaet: ("fluessig" | "holprig" | "endungen" | "langsam" | "vertauscht")[];
  fehlerAnzahl: number;
  blinzeln: "selten" | "normal" | "oft" | "nicht_beobachtet";
  pc_leichter: boolean | null; // Vergleich mit Buch
}

export interface FixationErgebnis {
  /** Konnten die Augen 10 Sekunden ruhig auf einen Punkt schauen? */
  qualitaet: "ruhig" | "leicht_unruhig" | "stark_unruhig_oder_abgelenkt";
}

export interface StiftReiseErgebnis {
  folgt: "fluessig" | "ruckelig_mit_pausen" | "verliert_stift";
  kopf_mitbewegt: boolean;
}

export interface MiniTestErgebnis {
  buchstaben: { verwechslungen: number; reaktionszeit: number };
  formen: { fehlerrate: number; geschwindigkeit: number };
  merkspanne: { fehlerrate: number; reaktionszeit: number };
}

// ─── Gesamtpaket für die Auswertung ──────────────────────────────────────────
export type Antwort = 0 | 1 | 2 | 3;

export interface ScreeningDaten {
  konvergenz: KonvergenzErgebnis;
  buchLese: BuchLeseErgebnis;
  pcLese: PCLeseErgebnis;
  fixation: FixationErgebnis;
  stiftReise: StiftReiseErgebnis;
  miniTests: MiniTestErgebnis;
  fragebogen: Record<string, Antwort>;
  klasse: number;
}
