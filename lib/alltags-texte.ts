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
    beobachtet: "Beim Lesetest zeigten sich Hinweise auf einen unruhigen Lesefluss — z. B. Stocken beim Vorlesen, Zeilenverluste oder Wörter überspringen.",
    alltag: "Manche Kinder, bei denen sich in diesem Bereich Auffälligkeiten zeigen, brauchen beim Lesen deutlich länger als Gleichaltrige. Sie verlieren die Zeile, überspringen Wörter oder raten — obwohl sie die Buchstaben gut kennen. Hausaufgaben dauern oft deutlich länger als nötig.",
    disclaimer: "Das ist kein Hinweis auf mangelnde Intelligenz oder fehlenden Fleiß — es kann auf eine visuelle Verarbeitungsstrategie hinweisen, die mit gezieltem Training verbessert werden kann.",
    positiv: "Der Lesefluss war unauffällig — dein Kind liest flüssig und zeigt keine Auffälligkeiten beim Vorlesen.",
  },
  "Augensteuerung": {
    fachtitel: "Nahsehen & Augenkoordination",
    beobachtet: "Bei den Übungen zu Konvergenz, Fixation und/oder Augenverfolgung zeigten sich Hinweise auf Auffälligkeiten in der Augensteuerung.",
    alltag: "Manche Kinder mit Hinweisen in diesem Bereich klagen über Doppelbilder oder ein Verschwimmen beim Lesen, legen Bücher lieber weg oder berichten, dass die Buchstaben 'springen'. Lesen strengt schnell an — auch wenn das Kind eigentlich gut sehen kann.",
    disclaimer: "Das ist kein Hinweis auf eine Sehschwäche im klassischen Sinn. Es betrifft die Teamarbeit beider Augen beim Nahsehen — und diese lässt sich gezielt trainieren.",
    positiv: "Die Augenkoordination war unauffällig — Konvergenz, Fixation und Verfolgung zeigten keine Auffälligkeiten.",
  },
  "Visuelle Verarbeitung": {
    fachtitel: "Buchstaben & Symbole unterscheiden",
    beobachtet: "Beim Buchstabenjäger und/oder der Spürnase zeigten sich Hinweise auf Schwierigkeiten beim schnellen Unterscheiden ähnlicher Zeichen.",
    alltag: "Manche Kinder, bei denen sich in diesem Bereich Auffälligkeiten zeigen, brauchen beim Lesen länger — weil das Gehirn bei ähnlichen Buchstaben (b/d, p/q) jedes Mal kurz nachdenken muss statt sofort zu erkennen. Das verlangsamt den Lesefluss, auch wenn das Kind die Buchstaben theoretisch kennt.",
    disclaimer: "Das ist kein Hinweis auf Legasthenie oder eine Lernschwäche. Es betrifft die visuelle Verarbeitungsgeschwindigkeit — und diese ist gezielt trainierbar.",
    positiv: "Buchstaben und Symbole werden sicher und schnell unterschieden — die visuelle Diskrimination ist unauffällig.",
  },
  "Visuelle Merkspanne": {
    fachtitel: "Visuelles Kurzzeitgedächtnis",
    beobachtet: "Beim Blitzgedächtnis-Test zeigten sich Hinweise auf eine eingeschränkte visuelle Merkspanne.",
    alltag: "Manche Kinder mit Hinweisen in diesem Bereich haben Schwierigkeiten, kurz Gesehenes zu behalten — z. B. beim Abschreiben von der Tafel oder beim Merken von Buchstabenfolgen. Sie schauen öfter hin und können sich kürzere Einheiten auf einmal behalten.",
    disclaimer: "Das ist kein Hinweis auf ein allgemeines Gedächtnisproblem. Es betrifft das visuelle Arbeitsgedächtnis — gezielte Übungen können hier spürbar helfen.",
    positiv: "Das visuelle Kurzzeitgedächtnis ist unauffällig — kurz Gesehenes bleibt gut im Gedächtnis.",
  },
  "Konzentration": {
    fachtitel: "Aufmerksamkeit & Fokus",
    beobachtet: "Die Fragebogen-Antworten weisen auf häufige Konzentrationsschwierigkeiten hin.",
    alltag: "Manche Kinder mit Hinweisen in diesem Bereich können sich beim Lernen nur kurz konzentrieren, sind schnell abgelenkt oder brauchen häufige Pausen. Oft ist das kein Willensproblem — sondern ein Zeichen, dass das Gehirn bei visuellen Aufgaben viel Energie aufwenden muss.",
    disclaimer: "Konzentrationsschwierigkeiten haben viele mögliche Ursachen. Dieser Bereich zeigt, ob visuelle Belastung ein Faktor sein könnte — und ersetzt keine professionelle Abklärung.",
    positiv: "Die Konzentration war laut Fragebogen unauffällig — keine Häufung von Aufmerksamkeitsschwierigkeiten.",
  },
  "Reflexintegration": {
    fachtitel: "Frühkindliche Reflexe",
    beobachtet: "Die Fragebogen-Antworten weisen auf mögliche aktive frühkindliche Reflexe hin (z. B. MORO, ATNR).",
    alltag: "Manche Kinder mit Hinweisen in diesem Bereich sitzen beim Schreiben auffällig schief, haben Mühe beim Stillsitzen oder zeigen unwillkürliche Mitbewegungen. Das kostet unbewusst viel Energie — und kann Konzentration und Augensteuerung beeinflussen.",
    disclaimer: "Frühkindliche Reflexe integrieren sich bei manchen Kindern langsamer. Das ist keine Entwicklungsstörung — gezielte Übungen können dabei helfen.",
    positiv: "Die Reflexintegration zeigte keine Auffälligkeiten — keine Häufung typischer Reflex-Zeichen.",
  },
};
