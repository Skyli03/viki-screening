export type Antwort = 0 | 1 | 2 | 3;
export const ANTWORT_LABELS = ["Nie", "Manchmal", "Oft", "Immer"];

export interface Frage {
  id: string;
  text: string;
  kategorie: "lesen" | "konzentration" | "reflex";
  reflex?: "MORO" | "TLR" | "STNR" | "ATNR";
}

export const FRAGEN: Frage[] = [
  // Abschnitt A: Lesen & Schulverhalten
  { id: "l1", text: "Mein Kind verliert beim Lesen häufig die Zeile.", kategorie: "lesen" },
  { id: "l2", text: "Mein Kind liest sehr langsam für sein Alter.", kategorie: "lesen" },
  { id: "l3", text: "Mein Kind vertauscht Buchstaben (z.B. b und d, p und q).", kategorie: "lesen" },
  { id: "l4", text: "Mein Kind klagt über Kopfschmerzen oder müde Augen nach dem Lesen.", kategorie: "lesen" },
  { id: "l5", text: "Mein Kind hält das Buch sehr nah oder sehr weit weg.", kategorie: "lesen" },
  { id: "l6", text: "Mein Kind überspringt beim Lesen Wörter oder ganze Zeilen.", kategorie: "lesen" },
  { id: "l7", text: "Mein Kind muss beim Lesen mit dem Finger die Zeile verfolgen.", kategorie: "lesen" },
  { id: "l8", text: "Mein Kind hat Schwierigkeiten beim Abschreiben von der Tafel.", kategorie: "lesen" },
  { id: "l9", text: "Mein Kind vermeidet Lesen oder Hausaufgaben, wo möglich.", kategorie: "lesen" },
  { id: "l10", text: "Mein Kind sieht Buchstaben oder Wörter verschwommen oder doppelt.", kategorie: "lesen" },

  // Abschnitt B: Konzentration & ADHS
  { id: "k1", text: "Mein Kind kann sich schlecht längere Zeit auf eine Aufgabe konzentrieren.", kategorie: "konzentration" },
  { id: "k2", text: "Mein Kind ist motorisch sehr unruhig und zappelig.", kategorie: "konzentration" },
  { id: "k3", text: "Mein Kind reagiert sehr empfindlich auf Licht oder laute Geräusche.", kategorie: "konzentration" },
  { id: "k4", text: "Mein Kind wirkt oft abgelenkt und träumt viel.", kategorie: "konzentration" },
  { id: "k5", text: "Mein Kind hat Schwierigkeiten, Anweisungen zu befolgen.", kategorie: "konzentration" },
  { id: "k6", text: "Mein Kind verliert schnell die Motivation bei schwierigen Aufgaben.", kategorie: "konzentration" },
  { id: "k7", text: "Mein Kind hat Probleme beim Einschlafen oder schläft unruhig.", kategorie: "konzentration" },
  { id: "k8", text: "Mein Kind hat Stimmungsschwankungen oder reagiert sehr impulsiv.", kategorie: "konzentration" },

  // Abschnitt C: Reflexe
  { id: "r1", text: "Mein Kind reagiert übertrieben erschrocken auf laute oder plötzliche Geräusche.", kategorie: "reflex", reflex: "MORO" },
  { id: "r2", text: "Mein Kind hat Angst vor Bewegung (Schaukeln, Lift, schnelle Bewegungen).", kategorie: "reflex", reflex: "MORO" },
  { id: "r3", text: "Mein Kind hat eine schlechte Körperhaltung — sitzt gebeugt oder hängt durch.", kategorie: "reflex", reflex: "TLR" },
  { id: "r4", text: "Mein Kind hat Schwierigkeiten beim Treppensteigen oder schätzt Entfernungen falsch ein.", kategorie: "reflex", reflex: "TLR" },
  { id: "r5", text: "Mein Kind macht beim Schreiben unbewusste Kopf- oder Mundbewegungen.", kategorie: "reflex", reflex: "STNR" },
  { id: "r6", text: "Mein Kind kann nicht lange ruhig am Tisch sitzen, rutscht ständig.", kategorie: "reflex", reflex: "STNR" },
  { id: "r7", text: "Mein Kind hat Schwierigkeiten bei Bewegungen, die beide Körperseiten gleichzeitig nutzen.", kategorie: "reflex", reflex: "ATNR" },
  { id: "r8", text: "Mein Kind dreht beim Schreiben den Kopf zur Schreibhand oder hält den Kopf oder das Heft schief.", kategorie: "reflex", reflex: "ATNR" },
];

export type FragebogenAntworten = Record<string, Antwort>;
