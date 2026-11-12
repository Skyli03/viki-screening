import type { Antwort } from "@/lib/screening-types";

export const ANTWORT_OPTIONEN: { wert: Antwort; label: string }[] = [
  { wert: 0, label: "Nie" },
  { wert: 1, label: "Manchmal" },
  { wert: 2, label: "Oft" },
  { wert: 3, label: "Immer" },
  { wert: null, label: "Weiß nicht" },
];

export interface Frage {
  id: string;
  text: string;
  abschnitt: "lesen" | "ausdauer" | "koerper";
}

// 14 Fragen. Reflex-Fragen: MORO (k1), STNR (k2), ATNR (k3) — passend zum Superblick-Kurs.
export const FRAGEN: Frage[] = [
  // Lesen & Sehen
  { id: "l1", abschnitt: "lesen", text: "Mein Kind verliert beim Lesen die Zeile oder überspringt Wörter." },
  { id: "l2", abschnitt: "lesen", text: "Mein Kind liest langsamer als andere Kinder in der Klasse." },
  { id: "l3", abschnitt: "lesen", text: "Mein Kind verwechselt ähnliche Buchstaben (z. B. b und d, p und q)." },
  { id: "l4", abschnitt: "lesen", text: "Mein Kind klagt nach dem Lesen über Kopfschmerzen, brennende oder müde Augen." },
  { id: "l5", abschnitt: "lesen", text: "Mein Kind geht beim Lesen oder Schreiben mit dem Kopf sehr nah ans Blatt." },
  { id: "l6", abschnitt: "lesen", text: "Mein Kind braucht den Finger, um in der Zeile zu bleiben." },
  { id: "l7", abschnitt: "lesen", text: "Mein Kind hat Mühe beim Abschreiben von der Tafel." },
  { id: "l8", abschnitt: "lesen", text: "Mein Kind vermeidet Lesen oder Hausaufgaben, wo es nur geht." },
  { id: "l9", abschnitt: "lesen", text: "Mein Kind sagt, dass Buchstaben verschwimmen, wackeln oder doppelt erscheinen." },

  // Ausdauer
  { id: "a1", abschnitt: "ausdauer", text: "Mein Kind kann sich bei den Hausaufgaben nur kurz konzentrieren." },
  { id: "a2", abschnitt: "ausdauer", text: "Mein Kind wird beim Lesen schnell müde oder gibt rasch auf." },

  // Körper & Haltung
  { id: "k1", abschnitt: "koerper", text: "Mein Kind erschrickt sehr stark bei lauten oder plötzlichen Geräuschen." },
  { id: "k2", abschnitt: "koerper", text: "Mein Kind kann beim Schreiben schwer ruhig sitzen, rutscht herum oder liegt fast auf dem Tisch." },
  { id: "k3", abschnitt: "koerper", text: "Mein Kind dreht beim Schreiben den Kopf zur Schreibhand oder legt Kopf bzw. Heft stark schief." },
];
