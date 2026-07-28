export interface AlltagesText {
  fachtitel: string;
  beobachtet: string;
  alltag: string;
  disclaimer: string;
  positiv: string;
}

export const ALLTAGS_TEXTE: Record<string, AlltagesText> = {
  "Lesefluss": {
    fachtitel: "Lesefluss & Augenbewegungen",
    beobachtet: "Beim Lesetest zeigten sich Hinweise auf einen unruhigen Lesefluss – z. B. Stocken beim Vorlesen, Zeilenverluste oder das Überspringen von Wörtern.",
    alltag: "Manche Kinder brauchen beim Lesen deutlich länger, verlieren häufiger die Zeile, überspringen Wörter oder beginnen zu raten – obwohl sie die Buchstaben grundsätzlich kennen. Dadurch werden Lesen und Hausaufgaben oft unnötig anstrengend.",
    disclaimer: "Das ist kein Hinweis auf mangelnde Intelligenz oder fehlenden Fleiß. Visuelle Fähigkeiten spielen beim flüssigen Lesen eine wichtige Rolle und können durch gezieltes Visualtraining unterstützt werden.",
    positiv: "Der Lesefluss war unauffällig – dein Kind liest flüssig und zeigt keine Auffälligkeiten beim Vorlesen.",
  },
  "Augensteuerung": {
    fachtitel: "Nahsehen & Augenkoordination",
    beobachtet: "Bei den Übungen zur Blicksteuerung und zum Nahsehen zeigten sich Hinweise darauf, dass die Zusammenarbeit der Augen noch nicht durchgehend stabil arbeitet.",
    alltag: "Manche Kinder berichten, dass Buchstaben verschwimmen oder verrutschen, Lesen schnell anstrengend wird oder sie nach kurzer Zeit eine Pause brauchen.",
    disclaimer: "Das ist kein Hinweis auf eine Sehschwäche im klassischen Sinn. Es betrifft die Zusammenarbeit beider Augen beim Lesen und Nahsehen. Diese Fähigkeiten können durch gezieltes Visualtraining verbessert und gefestigt werden.",
    positiv: "Die Augenkoordination war unauffällig – Blicksteuerung und Nahsehen zeigten keine Auffälligkeiten.",
  },
  "Visuelle Verarbeitung": {
    fachtitel: "Buchstaben & Symbole unterscheiden",
    beobachtet: "Beim Buchstabenjäger und/oder der Spürnase zeigten sich Hinweise darauf, dass das schnelle Unterscheiden ähnlicher Buchstaben oder Formen erschwert war.",
    alltag: "Manche Kinder benötigen etwas mehr Zeit, um ähnliche Buchstaben wie b/d oder p/q sicher zu unterscheiden. Dadurch wird der Lesefluss langsamer und das Abschreiben fällt häufig schwerer.",
    disclaimer: "Das ist kein Hinweis auf Legasthenie oder eine Lernschwäche. Es zeigt lediglich, dass das Gehirn ähnliche visuelle Informationen noch nicht immer automatisch verarbeitet. Diese Fähigkeit kann gezielt trainiert werden.",
    positiv: "Buchstaben und Symbole werden sicher und schnell unterschieden – die visuelle Diskrimination ist unauffällig.",
  },
  "Visuelle Merkspanne": {
    fachtitel: "Visuelles Kurzzeitgedächtnis",
    beobachtet: "Beim Blitzgedächtnis zeigten sich Hinweise darauf, dass das kurzfristige Merken visueller Informationen erschwert war.",
    alltag: "Manche Kinder schauen beim Abschreiben häufiger zwischen Vorlage und Heft hin und her oder können sich nur kurze Buchstaben- oder Zahlenfolgen auf einmal merken.",
    disclaimer: "Das ist kein Hinweis auf ein allgemeines Gedächtnisproblem. Es betrifft das kurzfristige Speichern visueller Informationen – eine Fähigkeit, die sich durch gezieltes Training gut fördern lässt.",
    positiv: "Das visuelle Kurzzeitgedächtnis ist unauffällig – kurz Gesehenes bleibt gut im Gedächtnis.",
  },
  "Konzentration": {
    fachtitel: "Aufmerksamkeit & Fokus",
    beobachtet: "Die Antworten im Fragebogen zeigen Hinweise auf häufige Konzentrationsschwierigkeiten.",
    alltag: "Manche Kinder lassen sich beim Lernen schneller ablenken, benötigen häufiger Pausen oder verlieren rascher den Fokus. Visuelle Belastungen können dabei ein zusätzlicher Einflussfaktor sein.",
    disclaimer: "Konzentrationsschwierigkeiten können viele Ursachen haben. Dieses Screening zeigt lediglich, ob visuelle Belastungen eine mögliche Rolle spielen könnten.",
    positiv: "Die Konzentration war laut Fragebogen unauffällig – es zeigten sich keine Hinweise auf häufige Aufmerksamkeitsschwierigkeiten.",
  },
  "Reflexintegration": {
    fachtitel: "Frühkindliche Reflexe",
    beobachtet: "Die Antworten im Fragebogen zeigen Merkmale, die häufig bei Kindern beobachtet werden, deren frühkindliche Reflexe noch Einfluss auf Haltung, Bewegung oder Lernen haben können.",
    alltag: "Manche Kinder sitzen beim Schreiben auffällig schief, haben Mühe mit längerem Stillsitzen oder zeigen unbewusste Mitbewegungen. Dadurch wird viel Energie gebunden, die beim konzentrierten Lernen und Lesen fehlt.",
    disclaimer: "Frühkindliche Reflexe können die Entwicklung von Haltung, Gleichgewicht, Augensteuerung und Konzentration beeinflussen. Deshalb beziehen wir in unserem Visualtraining auch gezielte Übungen zur Reflexintegration mit ein.",
    positiv: "Im Fragebogen zeigten sich keine auffälligen Hinweise auf einen möglichen Einfluss frühkindlicher Reflexe.",
  },
};
