import type { FragebogenAntworten } from "@/data/fragebogen";

export interface LesetestErgebnis {
  ruecksprueungeProZeile: number;
  vorwaertssprueungeProZeile: number;
  lesegeschwindigkeitWPM: number;
  blinzelrateProMinute: number;
  lesetempoRuhig: boolean;
  zeilenverluste: number;
  rohdaten: { zeit: number; x: number; y: number }[];
  // Gi em Aus Unsinntext-Felder (neu)
  lesequalitaet?: string[];
  fehlerAnzahl?: number;
  lesezeitSekunden?: number;
}

export interface VisuellTestErgebnis {
  fixation: { reaktionszeit: number; genauigkeit: number };
  sakkaden: { timing: number; konsistenz: number };
  smoothPursuit: { abweichung: number };
  diskrimination: { fehlerrate: number; geschwindigkeit: number };
  lrs: { verwechslungen: number; reaktionszeit: number };
  peripher: { reaktionszeit: number; trefferquote: number };
  vergenz?: { ergebnis: "normal" | "auffaellig" | "stark_auffaellig" };
}

export interface KategorieScore {
  name: string;
  score: number;
  ampel: "gruen" | "gelb" | "rot";
  beschreibung: string;
  elternText: string;
  icon: string;
}

export interface BlinzelInfo {
  wertProMinute: number;
  ampel: "gruen" | "gelb" | "rot";
  label: string;
  elternText: string;
}

export interface MusterHinweis {
  titel: string;
  text: string;
  staerke: "mittel" | "stark";
}

export interface ScreeningProfil {
  typ: "A" | "B" | "C" | "D";
  hauptproblem: string;
  empfohlenModule: string;
  kategorien: KategorieScore[];
  gesamtScore: number;
  auffaelligkeitenAnzahl: number;
  blinzelinfo: BlinzelInfo;
  musterHinweise: MusterHinweis[];
  lesegeschwindigkeitInfo: { wpm: number; bewertung: "gut" | "grenzwertig" | "langsam"; normMin: number; normMax: number };
}

// ─── Ampel ────────────────────────────────────────────────────────────────────

function getAmpel(score: number): "gruen" | "gelb" | "rot" {
  if (score >= 71) return "gruen";
  if (score >= 41) return "gelb";
  return "rot";
}

// ─── Lesefluss ────────────────────────────────────────────────────────────────
// Quellen: Rayner (2009), Buswell (1920), McConkie & Rayner (1975)
// Normwerte für deutschsprachigen Raum angepasst
//
// Regressions-Normwerte pro Zeile (6 Zeilen Text):
//   Klasse 1: bis 2.5 Rücksprünge/Zeile normal (Refixationsrate ~50-57% typisch)
//   Klasse 2: bis 2.0 normal (Refixationsrate sinkt auf ~40%)
//   Klasse 3: bis 1.5 normal (>50% Refixationsrate = Förderbedarf laut Rayner 2009)
//   Klasse 4: bis 1.0 normal
//
// WPM-Normwerte (mündliches Lesen, deutschsprachig, konservative Schätzung):
//   Klasse 1: 40–70 WPM | Klasse 2: 65–100 WPM
//   Klasse 3: 90–120 WPM | Klasse 4: 110–145 WPM

function scoreLesefluss(ergebnis: LesetestErgebnis, klasse: number): number {
  // ── Gi em Aus Normwerte (ENWAKO-Protokoll, Dr. Sarah-Maria Kopetzky) ───────
  // Primärindikator: Lesezeit + Fehleranzahl des Unsinntext-Tests
  // Sekundär: Lesequalität-Beobachtung durch Elternteil
  const giEmAusNormen = [
    { zeitGut: 120, zeitWarn: 180, fehlerGut: 12, fehlerWarn: 18 }, // Klasse 1
    { zeitGut: 100, zeitWarn: 150, fehlerGut: 10, fehlerWarn: 15 }, // Klasse 2
    { zeitGut:  70, zeitWarn: 110, fehlerGut:  7, fehlerWarn: 12 }, // Klasse 3–4
    { zeitGut:  55, zeitWarn:  85, fehlerGut:  2, fehlerWarn:  6 }, // Klasse 5+
  ];
  const norm = giEmAusNormen[Math.min(klasse <= 2 ? klasse - 1 : klasse <= 4 ? 2 : 3, 3)];

  let score = 100;

  // ── Lesezeit (primär) ────────────────────────────────────────────────────
  const zeit = ergebnis.lesezeitSekunden ?? 0;
  if (zeit > 0) {
    if (zeit > norm.zeitWarn) score -= 35;
    else if (zeit > norm.zeitGut) score -= 18;
  }

  // ── Fehleranzahl (primär) ───────────────────────────────────────────────
  const fehler = ergebnis.fehlerAnzahl ?? 0;
  if (fehler > norm.fehlerWarn) score -= 30;
  else if (fehler > norm.fehlerGut) score -= 15;

  // ── Lesequalität (Elternbeobachtung, klinisch interpretiert) ────────────
  // Klinische Regeln nach Sarah Kopetzky:
  //   holprig     → ATNR, MORO, Sakkaden, Konvergenz
  //   endungen    → ATNR / MORO
  //   langsam     → MORO + visuelles System
  //   vertauscht  → ATNR + visuelle Verarbeitung
  const qualitaet = ergebnis.lesequalitaet ?? [];
  if (qualitaet.includes("vertauscht")) score -= 20; // stärkstes Signal
  if (qualitaet.includes("holprig"))    score -= 15;
  if (qualitaet.includes("endungen"))   score -= 10;
  if (qualitaet.includes("langsam") && !qualitaet.includes("vertauscht")) score -= 8;
  if (qualitaet.includes("fluessig"))   score = Math.max(score, 75); // Minimum grün wenn fließend

  // ── Kopfbewegungsanalyse (Kamera, wenn verfügbar) ────────────────────────
  const trackingVerfuegbar = ergebnis.rohdaten.length >= 10;
  if (trackingVerfuegbar) {
    if (ergebnis.ruecksprueungeProZeile > 3) score -= 15;
    else if (ergebnis.ruecksprueungeProZeile > 1.5) score -= 7;
    if (!ergebnis.lesetempoRuhig) score -= 8;
    if (ergebnis.zeilenverluste > 2) score -= 10;
    if (ergebnis.blinzelrateProMinute >= 0 && ergebnis.blinzelrateProMinute < 4) score -= 8;
  }

  return Math.max(0, score);
}

// ─── Augensteuerung ───────────────────────────────────────────────────────────
// Quellen: NSUCO Oculomotor Test; Normative Values of Saccades in Children
// (PubMed 2019); Smooth Pursuit in Children (PMC 2019)
//
// Fixation: >800ms Reaktionszeit = verzögert; <0.7 Genauigkeit = ungenau
// Sakkaden: Konsistenz <0.6 = instabil; Timing >500ms = langsam
// Smooth Pursuit: abweichung >80 (Elternrating 3) = problematisch

function scoreAugensteuerung(v: VisuellTestErgebnis): number {
  let score = 100;

  // Fixation (Laserblick)
  if (v.fixation.reaktionszeit > 1000) score -= 25;
  else if (v.fixation.reaktionszeit > 800) score -= 15;
  if (v.fixation.genauigkeit < 0.6) score -= 20;
  else if (v.fixation.genauigkeit < 0.75) score -= 10;

  // Sakkaden (Blitzblick) — Konsistenz ist Hauptindikator
  if (v.sakkaden.konsistenz < 0.4) score -= 25;
  else if (v.sakkaden.konsistenz < 0.6) score -= 15;
  if (v.sakkaden.timing > 600) score -= 15;
  else if (v.sakkaden.timing > 450) score -= 8;

  // Smooth Pursuit (Raketenblick) — Elternbeurteilung
  // abweichung 15 = flüssig, 55 = ruckelig, 90 = kaum verfolgt
  if (v.smoothPursuit.abweichung >= 90) score -= 20;
  else if (v.smoothPursuit.abweichung >= 55) score -= 10;

  // Vergenz / Konvergenz — binokulare Zusammenarbeit (Convergence Insufficiency Treatment Trial, CITT 2008)
  // Konvergenzinsuffizienz betrifft ~5% aller Schulkinder; stark assoziiert mit Leseschwierigkeiten
  // Elternbeurteilung anhand Augenabweichung während animiertem Nahpunkt-Test
  if (v.vergenz?.ergebnis === "stark_auffaellig") score -= 30;
  else if (v.vergenz?.ergebnis === "auffaellig") score -= 15;

  return Math.max(0, score);
}

// ─── Visuelle Verarbeitung ────────────────────────────────────────────────────
// Quellen: Dusek et al. (2020) — Frequency of Visual Deficits in Dyslexia (PMC)
// DEM Test norms; b/d reversal age norms (BDA, Dynamic Vision Therapy)
//
// Buchstabenverwechslungen (LRS) nach Klasse:
//   Klasse 1: >5 = gelb, >8 = rot  (bis 15% Fehlerrate noch altersgemäß)
//   Klasse 2: >3 = gelb, >5 = rot  (>10% Fehlerrate = Förderbedarf)
//   Klasse 3+: >1 = gelb, >3 = rot  (>5% Fehlerrate = Überweisung empfohlen)
//
// Referenz: 66% der Kinder mit Dyslexie fallen im DEM-Fehlertest durch,
//           vs. nur 3% der typischen Leser (PMC 2021)

function scoreVisuelleVerarbeitung(v: VisuellTestErgebnis, klasse: number): number {
  let score = 100;

  // Diskrimination (visuelle Unterscheidung)
  if (v.diskrimination.fehlerrate > 0.4) score -= 30;
  else if (v.diskrimination.fehlerrate > 0.25) score -= 18;
  else if (v.diskrimination.fehlerrate > 0.15) score -= 8;

  if (v.diskrimination.geschwindigkeit > 4000) score -= 12;
  else if (v.diskrimination.geschwindigkeit > 3000) score -= 6;

  // LRS-Buchstabenverwechslungen — klassenabhängige Schwellen
  const lrsGrenz = klasse <= 1
    ? { gelb: 5, rot: 8 }
    : klasse <= 2
    ? { gelb: 3, rot: 5 }
    : { gelb: 1, rot: 3 };

  if (v.lrs.verwechslungen >= lrsGrenz.rot) score -= 40;
  else if (v.lrs.verwechslungen >= lrsGrenz.gelb) score -= 20;

  return Math.max(0, score);
}

// ─── Peripheres Sehen ─────────────────────────────────────────────────────────
// Quelle: Peripheral Visual Fields in Children (PMC 2016)
// Reaktionszeit verbessert sich stark mit Alter (5J: hohes Varianz, 8J: nahezu adult)
// Trefferquote: <0.6 = problematisch

function scorePeripheresSehen(v: VisuellTestErgebnis, klasse: number): number {
  let score = 100;

  // Reaktionszeit — altersabhängige Toleranz (jüngere Kinder langsamer)
  const rtGrenz = klasse <= 1
    ? { gelb: 1400, rot: 1800 }
    : klasse <= 2
    ? { gelb: 1200, rot: 1600 }
    : { gelb: 1000, rot: 1300 };

  if (v.peripher.reaktionszeit > rtGrenz.rot) score -= 40;
  else if (v.peripher.reaktionszeit > rtGrenz.gelb) score -= 20;

  // Trefferquote
  if (v.peripher.trefferquote < 0.5) score -= 30;
  else if (v.peripher.trefferquote < 0.7) score -= 15;

  return Math.max(0, score);
}

// ─── Konzentration ────────────────────────────────────────────────────────────
function scoreKonzentration(antworten: FragebogenAntworten): number {
  const keys = ["k1", "k2", "k3", "k4", "k5", "k6", "k7", "k8"];
  const summe = keys.reduce((s, k) => s + (antworten[k] ?? 0), 0);
  const max = keys.length * 3;
  return Math.round(100 - (summe / max) * 100);
}

// ─── Reflexintegration ────────────────────────────────────────────────────────
// Quelle: Goddard-Blythe (2017) INPP; Frontiers in Psychology (2025)
// Gewichtung: MORO (r1,r2) und ATNR (r7,r8) haben direkten Einfluss auf Lesen
//
// Zusatz: Lesequalität aus Gi em Aus verstärkt Reflex-Score:
//   holprig / endungen / vertauscht → höhere Wahrscheinlichkeit für aktive ATNR/MORO
//   (Klinische Beobachtung: Sarah Kopetzky, ENWAKO-Protokoll)

function scoreReflexintegration(antworten: FragebogenAntworten, lesequalitaet?: string[]): number {
  const allKeys = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8"];
  // MORO und ATNR doppelt gewichten (stärkster Einfluss auf Lesen/Augensteuerung)
  const gewichtung: Record<string, number> = {
    r1: 1.5, r2: 1.5,  // MORO
    r3: 1.0, r4: 1.0,  // TLR
    r5: 1.0, r6: 1.0,  // STNR
    r7: 1.5, r8: 1.5,  // ATNR
  };
  const summe = allKeys.reduce((s, k) => s + (antworten[k] ?? 0) * (gewichtung[k] ?? 1), 0);
  const maxGewichtet = allKeys.reduce((s, k) => s + 3 * (gewichtung[k] ?? 1), 0);
  let score = Math.round(100 - (summe / maxGewichtet) * 100);

  // Lesequalität als zusätzliches Reflex-Signal
  if (lesequalitaet) {
    if (lesequalitaet.includes("vertauscht")) score = Math.min(score, 55); // ATNR-Signal stark
    else if (lesequalitaet.includes("holprig") || lesequalitaet.includes("endungen")) {
      score = Math.min(score, 65); // ATNR/MORO-Signal mittel
    }
  }
  return Math.max(0, score);
}

// ─── Mustererkennung ──────────────────────────────────────────────────────────
// Kombinierte Muster aus mehreren Bereichen erhöhen die Aussagekraft erheblich
// Quelle: Dusek et al. (2020): 79% der Kinder mit Dyslexie zeigen Defizite
//         in MEHREREN visuellen Bereichen gleichzeitig

function erkenneMuster(
  scores: Record<string, number>,
  v: VisuellTestErgebnis,
  antworten: FragebogenAntworten,
  bpm: number,
  klasse: number
): MusterHinweis[] {
  const hinweise: MusterHinweis[] = [];

  // Muster 2: Visueller Stress
  // Niedrige Blinzelrate + schlechter Lesefluss + langsame Augensteuerung
  if (bpm < 6 && scores.lesefluss < 65 && scores.augensteuerung < 65) {
    hinweise.push({
      titel: "Zeichen von visuellem Stress",
      text:
        "Sehr seltenes Blinzeln kombiniert mit Schwierigkeiten beim Lesefluss und der Augensteuerung deutet auf visuellen Stress hin. Das Gehirn versucht, durch Blinzeln möglichst wenig zu verpassen — ein klares Signal der Überlastung.",
      staerke: bpm < 4 ? "stark" : "mittel",
    });
  }

  // Muster 3: Reflexdominantes Muster
  // Aktive Reflexe + schlechte Konzentration + Augensteuerungsprobleme
  if (
    scores.reflexintegration < 55 &&
    scores.konzentration < 60 &&
    scores.augensteuerung < 65
  ) {
    hinweise.push({
      titel: "Reflexintegration beeinflusst Lernen",
      text:
        "Aktive frühkindliche Reflexe kombiniert mit Konzentrationsschwierigkeiten und eingeschränkter Augensteuerung ist ein typisches Muster. Die Reflexe erzeugen im Nervensystem eine dauerhafte Grundanspannung — das raubt Energie, die fürs Lernen fehlt.",
      staerke: scores.reflexintegration < 40 ? "stark" : "mittel",
    });
  }

  // Muster 4b: Konvergenzinsuffizienz-Muster
  // Vergenz auffällig + schlechter Lesefluss + Buchstabenverschwimmen (L10)
  if (
    (v.vergenz?.ergebnis === "auffaellig" || v.vergenz?.ergebnis === "stark_auffaellig") &&
    scores.lesefluss < 70
  ) {
    hinweise.push({
      titel: "Hinweis auf Konvergenzinsuffizienz",
      text:
        "Die Augen weichen beim Nahsehen auseinander — kombiniert mit einem unruhigen Lesefluss ist das ein typisches Zeichen einer Konvergenzinsuffizienz. Betroffen sind ca. 5% aller Schulkinder. Die Buchstaben verschwimmen oder erscheinen doppelt, weil beide Augen nicht präzise zusammenarbeiten. Ein Funktionaloptometriker kann das gezielt abklären und mit Übungen trainieren.",
      staerke: v.vergenz?.ergebnis === "stark_auffaellig" ? "stark" : "mittel",
    });
  }

  // Muster 4: Motorische Unruhe + STNR-Hinweis
  // Kind sitzt schlecht + kann nicht ruhig sitzen + unbewusste Mundbewegungen
  const stnr1 = antworten["r5"] ?? 0;
  const stnr2 = antworten["r6"] ?? 0;
  const tlr1 = antworten["r3"] ?? 0;
  if (stnr1 + stnr2 >= 4 && tlr1 >= 2) {
    hinweise.push({
      titel: "STNR/TLR-Muster: Sitzen und Schreiben",
      text:
        "Unbewusste Mitbewegungen beim Schreiben und eine schlechte Sitzhaltung sind klassische Zeichen eines noch aktiven STNR- und TLR-Reflexes.",
      staerke: "mittel",
    });
  }

  return hinweise;
}

// ─── Lesegeschwindigkeit bewerten ─────────────────────────────────────────────

function bewerteLesegeschwindigkeit(
  wpm: number,
  klasse: number
): { wpm: number; bewertung: "gut" | "grenzwertig" | "langsam"; normMin: number; normMax: number } {
  const normen = [
    { normMin: 40, normMax: 70 },   // Klasse 1
    { normMin: 65, normMax: 100 },  // Klasse 2
    { normMin: 90, normMax: 120 },  // Klasse 3
    { normMin: 110, normMax: 145 }, // Klasse 4+
  ];
  const norm = normen[Math.min(klasse - 1, 3)];
  const bewertung =
    wpm >= norm.normMin ? "gut" :
    wpm >= norm.normMin * 0.75 ? "grenzwertig" : "langsam";
  return { wpm, bewertung, normMin: norm.normMin, normMax: norm.normMax };
}

// ─── Blinzelverhalten ─────────────────────────────────────────────────────────
// Quelle: Blink Rate Measured In Situ (PMC 2023); ADHD Blink Rate (PMC 2017)
// Optimale Blinzelrate beim Lesen: 7–15/min (Studie: 7.9–10.7/min gemessen)
// <4/min: starke visuelle Anspannung (kognitive Unterdrückung)
// >20/min: Augenreizung, Trockenheit oder Unaufmerksamkeit

function berecheBlinzelinfo(bpm: number): BlinzelInfo {
  // -1 = Tracking nicht verfügbar (kein Gesicht erkannt oder Kamera-Problem)
  if (bpm < 0) {
    return {
      wertProMinute: 0,
      ampel: "gelb",
      label: "Nicht gemessen",
      elternText:
        "Das Blinzelverhalten konnte bei diesem Durchlauf nicht gemessen werden. Mögliche Ursachen: Kind zu weit von der Kamera entfernt, schlechte Beleuchtung, oder das Gesicht war nicht gut sichtbar. Beim nächsten Test darauf achten: ca. 40–60 cm Abstand, gutes Frontlicht.",
    };
  }
  if (bpm < 4) {
    return {
      wertProMinute: bpm,
      ampel: "rot",
      label: "Zu selten",
      elternText:
        "Dein Kind blinzelt beim Lesen sehr selten — weniger als 4 Mal pro Minute. Studien zeigen: Kinder blinzeln im Schnitt 8–11 Mal pro Minute beim Lesen. So seltenes Blinzeln ist ein klares Zeichen starker visueller Anspannung. Die Augen trocknen aus, ermüden schnell und der Fokus bricht ein.",
    };
  } else if (bpm <= 7) {
    return {
      wertProMinute: bpm,
      ampel: "gelb",
      label: "Leicht zu selten",
      elternText:
        "Die Blinzelrate deines Kindes liegt etwas unter dem optimalen Bereich (8–11 Mal/Minute). Das kann ein Zeichen leichter visueller Anspannung sein — noch kein Alarm, aber ein Hinweis.",
    };
  } else if (bpm <= 15) {
    return {
      wertProMinute: bpm,
      ampel: "gruen",
      label: "Optimal",
      elternText:
        "Die Blinzelrate deines Kindes beim Lesen liegt im optimalen Bereich (Studienmittel: 8–11 Mal/Minute). Das deutet auf entspannte, gut arbeitende Augen hin.",
    };
  } else if (bpm <= 22) {
    return {
      wertProMinute: bpm,
      ampel: "gelb",
      label: "Leicht erhöht",
      elternText:
        "Dein Kind blinzelt beim Lesen etwas häufiger als üblich. Das kann auf leichte Augenreizung, Trockenheit oder erhöhte Anspannung hinweisen — früher Hinweis, den man beobachten sollte.",
    };
  } else {
    return {
      wertProMinute: bpm,
      ampel: "rot",
      label: "Erhöht",
      elternText:
        "Dein Kind blinzelt beim Lesen sehr häufig — mehr als doppelt so oft wie im Normbereich. Das ist ein deutliches Zeichen für Augenreizung, Trockenheit oder starken visuellen Stress.",
    };
  }
}

// ─── Hauptauswertung ──────────────────────────────────────────────────────────

export function berechneScreeningProfil(
  lesetest: LesetestErgebnis,
  visuell: VisuellTestErgebnis,
  fragebogen: FragebogenAntworten,
  klasse: number
): ScreeningProfil {
  const scores = {
    lesefluss: scoreLesefluss(lesetest, klasse),
    augensteuerung: scoreAugensteuerung(visuell),
    visuelleVerarbeitung: scoreVisuelleVerarbeitung(visuell, klasse),
    peripheresSehen: scorePeripheresSehen(visuell, klasse),
    konzentration: scoreKonzentration(fragebogen),
    reflexintegration: scoreReflexintegration(fragebogen, lesetest.lesequalitaet),
  };

  const wpmInfo = bewerteLesegeschwindigkeit(lesetest.lesegeschwindigkeitWPM, klasse);

  // WPM-Zusatz für Lesefluss-Text
  const wpmText =
    wpmInfo.wpm > 0
      ? wpmInfo.bewertung === "gut"
        ? ` Die Lesegeschwindigkeit (${wpmInfo.wpm} Wörter/Min.) liegt im Normbereich für diese Klasse.`
        : wpmInfo.bewertung === "grenzwertig"
        ? ` Die Lesegeschwindigkeit (${wpmInfo.wpm} Wörter/Min.) liegt leicht unter dem Erwartungswert (${wpmInfo.normMin}–${wpmInfo.normMax} Wörter/Min.).`
        : ` Die Lesegeschwindigkeit (${wpmInfo.wpm} Wörter/Min.) ist deutlich unter dem Normbereich (${wpmInfo.normMin}–${wpmInfo.normMax} Wörter/Min.) — ein klarer Hinweis auf Lesefluss-Probleme.`
      : "";

  const kategorien: KategorieScore[] = [
    {
      name: "Lesefluss",
      score: scores.lesefluss,
      ampel: getAmpel(scores.lesefluss),
      beschreibung: "Augenbewegungen, Rücksprünge und Lesegeschwindigkeit",
      elternText:
        scores.lesefluss < 41
          ? `Beim Lesen zeigt dein Kind deutliche Bewegungsmuster, die auf Schwierigkeiten mit dem Lesefluss hinweisen. Das kostet viel Kraft und verlangsamt das Verstehen.${wpmText}`
          : scores.lesefluss < 71
          ? `Der Lesefluss deines Kindes zeigt leichte Unregelmäßigkeiten.${wpmText}`
          : `Der Lesefluss deines Kindes ist gut und stabil.${wpmText}`,
      icon: "📖",
    },
    {
      name: "Augensteuerung",
      score: scores.augensteuerung,
      ampel: getAmpel(scores.augensteuerung),
      beschreibung: "Fixieren, Folgen, Sakkaden und binokulare Konvergenz",
      elternText:
        scores.augensteuerung < 41
          ? `Die Augensteuerung deines Kindes braucht Training — Fixieren, Verfolgen und schnelle Augenbewegungen fallen schwer.${visuell.vergenz?.ergebnis === "stark_auffaellig" ? " Beim Konvergenztest (Nahsehen) wurde ein deutliches Ausweichen eines Auges beobachtet — das sollte fachlich abgeklärt werden." : visuell.vergenz?.ergebnis === "auffaellig" ? " Beim Konvergenztest wurden leichte Auffälligkeiten beobachtet." : ""}`
          : scores.augensteuerung < 71
          ? `Die Augensteuerung ist in einigen Bereichen noch nicht optimal entwickelt.${visuell.vergenz?.ergebnis === "stark_auffaellig" ? " Beim Konvergenztest wurde ein deutliches Ausweichen beobachtet." : visuell.vergenz?.ergebnis === "auffaellig" ? " Der Konvergenztest zeigte leichte Auffälligkeiten beim Nahsehen." : ""}`
          : "Die Augensteuerung deines Kindes ist gut entwickelt.",
      icon: "🎯",
    },
    {
      name: "Visuelle Verarbeitung",
      score: scores.visuelleVerarbeitung,
      ampel: getAmpel(scores.visuelleVerarbeitung),
      beschreibung: "Buchstaben unterscheiden, visuelle Diskrimination",
      elternText:
        scores.visuelleVerarbeitung < 41
          ? "Dein Kind hat Schwierigkeiten, ähnliche Buchstaben (b/d, p/q) visuell zu unterscheiden. Das kann das Lesen und Schreiben erschweren."
          : scores.visuelleVerarbeitung < 71
          ? "Die visuelle Unterscheidungsfähigkeit zeigt leichte Auffälligkeiten — für das Klassenalter noch beobachtbar, aber ein früher Hinweis."
          : "Dein Kind kann Buchstaben und Muster gut unterscheiden.",
      icon: "🔍",
    },
    {
      name: "Peripheres Sehen",
      score: scores.peripheresSehen,
      ampel: getAmpel(scores.peripheresSehen),
      beschreibung: "Reaktion auf Reize am Rand des Sichtfelds",
      elternText:
        scores.peripheresSehen < 41
          ? "Das periphere Sehen deines Kindes reagiert langsam — das erschwert die Raumorientierung und das Erfassen von Zeilen."
          : scores.peripheresSehen < 71
          ? "Das periphere Sehen zeigt leichte Verzögerungen."
          : "Das periphere Sehen deines Kindes ist gut.",
      icon: "👁️",
    },
    {
      name: "Konzentration",
      score: scores.konzentration,
      ampel: getAmpel(scores.konzentration),
      beschreibung: "Aufmerksamkeit, Ruhe und Fokus in der Schule",
      elternText:
        scores.konzentration < 41
          ? "Dein Kind zeigt laut deinen Angaben deutliche Konzentrationsschwierigkeiten — oft ein Zusammenspiel aus visuellem Stress und Aufmerksamkeit."
          : scores.konzentration < 71
          ? "Gelegentliche Konzentrationsprobleme können mit visueller Überlastung zusammenhängen."
          : "Die Konzentration deines Kindes ist im Normalbereich.",
      icon: "🧠",
    },
    {
      name: "Reflexintegration",
      score: scores.reflexintegration,
      ampel: getAmpel(scores.reflexintegration),
      beschreibung: "Frühkindliche Reflexe (MORO, TLR, STNR, ATNR) — gewichtet",
      elternText:
        scores.reflexintegration < 41
          ? "Mehrere frühkindliche Reflexe scheinen noch aktiv zu sein — MORO und ATNR beeinflussen dabei direkt die Augensteuerung und das Lesen."
          : scores.reflexintegration < 71
          ? "Einzelne frühkindliche Reflexe könnten noch nicht vollständig integriert sein."
          : "Die Reflexintegration deines Kindes zeigt keine Auffälligkeiten.",
      icon: "🦺",
    },
  ];

  const auffaelligkeitenAnzahl = kategorien.filter(
    (k) => k.ampel === "rot" || k.ampel === "gelb"
  ).length;

  const gesamtScore = Math.round(
    Object.values(scores).reduce((s, v) => s + v, 0) / 6
  );

  // VIKI-Typ bestimmen
  let typ: "A" | "B" | "C" | "D" = "D";
  let hauptproblem = "Ganzheitlicher Förderbedarf";
  const empfohlenModule = "alle 8 Module";

  const niedrigsteKategorie = kategorien.reduce((a, b) =>
    a.score < b.score ? a : b
  );

  if (niedrigsteKategorie.name === "Lesefluss" && scores.lesefluss < 50) {
    typ = "A";
    hauptproblem = "Lesefluss & Augenbewegungen";
  } else if (niedrigsteKategorie.name === "Augensteuerung" && scores.augensteuerung < 50) {
    typ = "B";
    hauptproblem = "Augensteuerung & Fokus";
  } else if (niedrigsteKategorie.name === "Reflexintegration" && scores.reflexintegration < 50) {
    typ = "C";
    hauptproblem = "Reflexintegration & Körperwahrnehmung";
  }

  const blinzelinfo = berecheBlinzelinfo(lesetest.blinzelrateProMinute);

  const musterHinweise = erkenneMuster(
    scores, visuell, fragebogen, lesetest.blinzelrateProMinute, klasse
  );

  return {
    typ, hauptproblem, empfohlenModule,
    kategorien, gesamtScore, auffaelligkeitenAnzahl,
    blinzelinfo, musterHinweise,
    lesegeschwindigkeitInfo: wpmInfo,
  };
}
