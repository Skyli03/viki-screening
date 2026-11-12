import type { BereichId, Stufe } from "@/lib/auswertung";

// Gemeinsame Texte für Ergebnisseite und Bericht-Mail.
// Regeln: keine Diagnose, keine Ursache für LRS/ADHS, keine Heilversprechen.

export const STUFEN: Record<Stufe, { emoji: string; label: string; bg: string; border: string; text: string }> = {
  0: { emoji: "🟢", label: "Unauffällig",        bg: "#F0FDF4", border: "#86EFAC", text: "#166534" },
  1: { emoji: "🟡", label: "Leichte Hinweise",   bg: "#FEFCE8", border: "#FDE047", text: "#854D0E" },
  2: { emoji: "🟠", label: "Deutliche Hinweise", bg: "#FFF7ED", border: "#FDBA74", text: "#9A3412" },
  3: { emoji: "🔴", label: "Starke Hinweise",    bg: "#FEF2F2", border: "#FCA5A5", text: "#991B1B" },
};

export interface BereichText {
  icon: string;
  beobachtet: string;
  alltag: string;
  hinweis: string;
  positiv: string;
  /** Was dazu im Superblick-Kurs vorkommt */
  training: string;
}

export const BEREICH_TEXTE: Record<BereichId, BereichText> = {
  lesen: {
    icon: "📖",
    beobachtet: "Beim Vorlesen, bei der Augen-Reise oder im Fragebogen zeigten sich Hinweise auf einen unruhigen Lesefluss, zum Beispiel Zeilenverluste, übersprungene Wörter oder ruckelige Augenbewegungen.",
    alltag: "Manche Kinder brauchen beim Lesen länger, verlieren öfter die Zeile oder beginnen zu raten, obwohl sie die Buchstaben gut kennen. Lesen und Hausaufgaben werden dadurch anstrengender.",
    hinweis: "Das sagt nichts über Intelligenz oder Fleiß aus. Flüssiges Lesen braucht viele Fähigkeiten, die Augenbewegungen sind eine davon.",
    positiv: "Beim Vorlesen und bei der Augen-Reise zeigten sich keine Auffälligkeiten.",
    training: "Übungen für Blicksprünge, Folgebewegungen und den Lesefluss",
  },
  teamarbeit: {
    icon: "👀",
    beobachtet: "Bei der Stift-Übung oder im Fragebogen zeigten sich Hinweise darauf, dass die Zusammenarbeit beider Augen in der Nähe noch nicht durchgehend stabil ist.",
    alltag: "Manche Kinder erzählen, dass Buchstaben verschwimmen oder verrutschen, dass Lesen schnell anstrengend wird oder dass sie nach kurzer Zeit eine Pause brauchen.",
    hinweis: "Das ist keine Aussage über die Sehschärfe. Es geht darum, wie gut beide Augen beim Lesen und Nahsehen als Team zusammenarbeiten.",
    positiv: "Bei der Stift-Übung haben beide Augen gut zusammengearbeitet.",
    training: "Übungen zur Teamarbeit beider Augen beim Nahsehen",
  },
  buchstaben: {
    icon: "🔤",
    beobachtet: "Beim Buchstabenjäger oder im Fragebogen zeigten sich Hinweise darauf, dass ähnliche Buchstaben wie b/d oder p/q noch nicht immer sicher unterschieden werden.",
    alltag: "Manche Kinder brauchen etwas länger, um ähnliche Buchstaben auseinanderzuhalten. Lesen und Abschreiben gehen dann langsamer.",
    hinweis: "Das ist kein Hinweis auf Legasthenie oder eine Lernschwäche. Es zeigt nur, dass das Unterscheiden ähnlicher Formen noch nicht ganz automatisch läuft.",
    positiv: "Ähnliche Buchstaben wurden sicher unterschieden.",
    training: "Spiele zum sicheren Unterscheiden von Formen und Buchstaben",
  },
  koerper: {
    icon: "🤸",
    beobachtet: "Im Fragebogen hast du Merkmale beschrieben, die man häufig bei Kindern sieht, bei denen frühkindliche Reflexe noch Einfluss auf Haltung und Bewegung haben können.",
    alltag: "Manche Kinder sitzen beim Schreiben schief, rutschen viel herum oder erschrecken sehr leicht. Das kostet Kraft, die dann beim Lernen fehlen kann.",
    hinweis: "Ob frühkindliche Reflexe noch aktiv sind, lässt sich mit einem Fragebogen nicht feststellen. Die Antworten geben nur einen ersten Hinweis.",
    positiv: "Bei Haltung und Bewegung hast du keine auffälligen Beobachtungen angegeben.",
    training: "Bewegungsübungen zur Reflexintegration (Moro-, ATNR- und STNR-Reflex)",
  },
};

export const AUSDAUER_TEXT =
  "Du hast angegeben, dass dein Kind sich bei Hausaufgaben oft nur kurz konzentrieren kann und beim Lesen schnell müde wird. Dafür gibt es viele mögliche Gründe. Wenn das Sehen sehr anstrengend ist, kann es einer davon sein, muss es aber nicht.";

export const UNTERSUCHUNG_TEXT =
  "Die letzte Augenuntersuchung ist länger als ein Jahr her oder du weißt es nicht genau. Lass am besten zuerst die Sehschärfe bei einer Augenärztin, einem Augenarzt oder einer Optometristin bzw. einem Optometristen prüfen. Erst dann lässt sich gut einschätzen, welche Rolle die Zusammenarbeit der Augen spielt.";

export const WARNZEICHEN_EMPFEHLUNG =
  "Diese Beobachtungen solltest du fachlich abklären lassen, bei einer Augenärztin bzw. einem Augenarzt oder einer Funktionaloptometristin bzw. einem Funktionaloptometristen. Das hat Vorrang vor jedem Training.";

export const KURS_URL = "https://kurse.vikitraining.at/superblick-kurs";
export function kursLink(medium: "ergebnis" | "ergebnis-ohne-mail" | "bericht-mail"): string {
  return `${KURS_URL}?utm_source=augen-check&utm_medium=${medium}`;
}
