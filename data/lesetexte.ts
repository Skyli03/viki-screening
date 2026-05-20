// ─── Lesetexte für den VIKI-Lesetest ─────────────────────────────────────────
//
// Haupttext: "Gi em Aus" — Unsinntext (Pseudowort-Lesetest)
// Klinischer Hintergrund:
//   Pseudowörter testen die phonologische Dekodierungsfähigkeit isoliert —
//   das Kind kann nicht auf auswendig gelernte Wortbilder zurückgreifen.
//   Das ist diagnostisch viel aussagekräftiger als das Lesen realer Texte.
//   (Quellen: SLRT-II, ENWAKO-Protokoll, Suchodoletz 2007)
//
// Normwerte nach ENWAKO-Protokoll (Dr. Sarah-Maria Kopetzky):
//   Klasse 2:   < 100 Sek, < 10 Fehler = unauffällig
//   Klasse 3–4: < 70 Sek,  <  7 Fehler = unauffällig
//   Ab Klasse 5: < 55 Sek, <  2 Fehler = unauffällig
//
// Lesequality-Signale (klinische Interpretation):
//   holprig/stockend          → ATNR, MORO, Sakkaden, Konvergenzprobleme
//   Endungen vergessen         → ATNR / MORO
//   richtig aber extrem langsam → MORO + visuelles System
//   Buchstaben/Wörter erfunden  → ATNR + visuelle Verarbeitung

export interface LesetextNorm {
  zeitGut: number;    // Sekunden — unter diesem Wert = unauffällig
  zeitWarn: number;   // Sekunden — über diesem Wert = Förderbedarf
  fehlerGut: number;  // Fehler — unter diesem Wert = unauffällig
  fehlerWarn: number; // Fehler — über diesem Wert = Förderbedarf
}

export interface Lesetext {
  level: 1 | 2 | 3 | 4;
  klasse: string;
  titel: string;
  zeilen: string[];
  wortanzahl: number;
  schriftgroesse: number;
  norm: LesetextNorm;
  istUnsinntext: boolean;
}

// Der "Gi em Aus"-Unsinntext wird für alle Klassen verwendet.
// Die Interpretation (Normwerte) passt sich dem Klassenalter an.
const GI_EM_AUS_ZEILEN = [
  "Gi em Aus",
  "As est Wentar.",
  "Temi, Mumu ond Gi bahan reis.",
  "Gi est dar Hond vin Temi.",
  "Temi ond Gi send bota Frienda.",
  "Temi, Mumu ond Gi bahan zom Tauch.",
  "Eif dam Tauch est schin Aus.",
  "Temi well eif dus Aus bahan.",
  "Dich Mumu well dus necht.",
  'Mumu subt: „Dus Aus est nich zo dönn.“',
  "Ulsi bahan sie necht ögar dan Tauch.",
  "Sie bahan liegar om dan Tauch harom.",
];

export const LESETEXTE: Lesetext[] = [
  {
    level: 1,
    klasse: "Klasse 1",
    titel: "Gi em Aus",
    zeilen: GI_EM_AUS_ZEILEN,
    wortanzahl: 70,
    schriftgroesse: 24,
    norm: { zeitGut: 120, zeitWarn: 180, fehlerGut: 12, fehlerWarn: 18 },
    istUnsinntext: true,
  },
  {
    level: 2,
    klasse: "Klasse 2",
    titel: "Gi em Aus",
    zeilen: GI_EM_AUS_ZEILEN,
    wortanzahl: 70,
    schriftgroesse: 22,
    norm: { zeitGut: 100, zeitWarn: 150, fehlerGut: 10, fehlerWarn: 15 },
    istUnsinntext: true,
  },
  {
    level: 3,
    klasse: "Klasse 3–4",
    titel: "Gi em Aus",
    zeilen: GI_EM_AUS_ZEILEN,
    wortanzahl: 70,
    schriftgroesse: 20,
    norm: { zeitGut: 70, zeitWarn: 110, fehlerGut: 7, fehlerWarn: 12 },
    istUnsinntext: true,
  },
  {
    level: 4,
    klasse: "Ab Klasse 5",
    titel: "Gi em Aus",
    zeilen: GI_EM_AUS_ZEILEN,
    wortanzahl: 70,
    schriftgroesse: 18,
    norm: { zeitGut: 55, zeitWarn: 85, fehlerGut: 2, fehlerWarn: 6 },
    istUnsinntext: true,
  },
];

export function getLesetextByKlasse(klasse: number): Lesetext {
  const level = klasse <= 1 ? 1 : klasse <= 2 ? 2 : klasse <= 4 ? 3 : 4;
  return LESETEXTE.find((t) => t.level === level) ?? LESETEXTE[1];
}
