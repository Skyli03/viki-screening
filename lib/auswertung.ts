import type { ScreeningDaten } from "@/lib/screening-types";

export interface KategorieScore {
  name: string;
  score: number;
  ampel: "gruen" | "gelb" | "rot";
  beschreibung: string;
  elternText: string;
  icon: string;
}

export interface MusterHinweis {
  titel: string;
  text: string;
  staerke: "mittel" | "stark";
}

export interface BlinzelInfo {
  ampel: "gruen" | "gelb" | "rot";
  label: string;
  elternText: string;
}

export interface ScreeningProfil {
  typ: "A" | "B" | "C" | "D";
  hauptproblem: string;
  kategorien: KategorieScore[];
  gesamtScore: number;
  auffaelligkeitenAnzahl: number;
  blinzelinfo: BlinzelInfo;
  musterHinweise: MusterHinweis[];
}

function getAmpel(score: number): "gruen" | "gelb" | "rot" {
  if (score >= 71) return "gruen";
  if (score >= 41) return "gelb";
  return "rot";
}

// ─── 1. Lesefluss & Augenbewegungen ──────────────────────────────────────────
// Sources: BuchLeseErgebnis + PCLeseErgebnis + Fragebogen l1-l10

function scoreLesefluss(daten: ScreeningDaten): number {
  let score = 100;
  const b = daten.buchLese;
  const pc = daten.pcLese;
  const fragen = daten.fragebogen;

  // Buchlesetest — direkte klinische Beobachtungen
  if (b.verliert_zeile)            score -= 20;
  if (b.ueberspringt_woerter)      score -= 15;
  if (b.benutzt_finger)            score -= 10;
  if (b.viele_fehler_bekannte_woerter) score -= 20;
  if (b.fluessig)                  score = Math.max(score, 80);

  if (b.leseabstand === "zu_nah" || b.leseabstand === "wechselnd") score -= 10;
  if (b.kopfhaltung === "schief_oder_verdreht") score -= 10;

  // Monokularer Vergleich: wenn ein Auge deutlich besser → Binokularproblem
  if (b.monokular === "besser") score -= 15;

  // PC-Lesetest Qualität
  const q = pc.lesequalitaet;
  if (q.includes("vertauscht")) score -= 20;
  if (q.includes("holprig"))    score -= 12;
  if (q.includes("endungen"))   score -= 8;
  if (q.includes("langsam") && !q.includes("vertauscht")) score -= 8;
  if (q.includes("fluessig"))   score = Math.max(score, 75);

  // PC-Lesetest Fehleranzahl
  if (pc.fehlerAnzahl >= 8)  score -= 20;
  else if (pc.fehlerAnzahl >= 4) score -= 10;

  // Fragebogen Lesefragen l1-l10 (0=nie/1=manchmal/2=oft/3=immer)
  const lKeys = ["l1","l2","l3","l4","l5","l6","l7","l8","l9","l10"];
  const lSumme = lKeys.reduce((s, k) => s + (fragen[k] ?? 0), 0);
  const lMax = lKeys.length * 3;
  const lProzent = lSumme / lMax;
  if (lProzent > 0.6)      score -= 20;
  else if (lProzent > 0.35) score -= 10;
  else if (lProzent > 0.15) score -= 4;

  return Math.max(0, Math.min(100, score));
}

// ─── 2. Augensteuerung ────────────────────────────────────────────────────────
// Sources: KonvergenzErgebnis + FixationErgebnis + StiftReiseErgebnis

function scoreAugensteuerung(daten: ScreeningDaten): number {
  let score = 100;
  const k = daten.konvergenz;
  const f = daten.fixation;
  const sak = daten.sakkaden;
  const s = daten.stiftReise;

  // Konvergenz
  if (k.beideAugen === "deutlich_auffaellig") score -= 35;
  else if (k.beideAugen === "leicht_auffaellig") score -= 18;

  if (k.zeichen.includes("doppelbilder")) score -= 15;
  if (k.zeichen.includes("auge_springt_raus")) score -= 15;
  if (k.zeichen.includes("schaut_weg")) score -= 10;

  // Fixation (10 Sekunden ruhig fixieren)
  if (f.qualitaet === "stark_unruhig_oder_abgelenkt") score -= 30;
  else if (f.qualitaet === "leicht_unruhig") score -= 15;

  // Blicksprünge (Sakkaden)
  if (sak.praezision === "ungenau_sucht") score -= 25;
  else if (sak.praezision === "ueberschiesst") score -= 12;
  if (sak.kopf_mitbewegt) score -= 8;

  // Stift-Reise (smooth pursuit)
  if (s.folgt === "verliert_stift") score -= 30;
  else if (s.folgt === "ruckelig_mit_pausen") score -= 18;

  if (s.kopf_mitbewegt) score -= 10;

  // Nah-Fern Konvergenz (eigene Übung)
  if (s.konvergenz_nahfern === "kann_nicht_fixieren") score -= 20;
  else if (s.konvergenz_nahfern === "ein_auge_langsamer" || s.konvergenz_nahfern === "ruckelt") score -= 12;

  return Math.max(0, Math.min(100, score));
}

// ─── 3. Visuelle Verarbeitung ─────────────────────────────────────────────────
// Sources: MiniTests buchstaben + formen, class-scaled

function scoreVisuelleVerarbeitung(daten: ScreeningDaten, klasse: number): number {
  let score = 100;
  const lrs = daten.miniTests.buchstaben;
  const disk = daten.miniTests.formen;

  // Buchstabenverwechslungen (class-scaled)
  const lrsGrenz = klasse <= 1
    ? { gelb: 5, rot: 8 }
    : klasse <= 2
    ? { gelb: 3, rot: 5 }
    : { gelb: 1, rot: 3 };

  if (lrs.verwechslungen >= lrsGrenz.rot)   score -= 35;
  else if (lrs.verwechslungen >= lrsGrenz.gelb) score -= 18;

  // Visuelle Diskrimination (Spürnase)
  if (disk.fehlerrate > 0.4)       score -= 25;
  else if (disk.fehlerrate > 0.25) score -= 15;
  else if (disk.fehlerrate > 0.1)  score -= 8;

  if (disk.geschwindigkeit > 4000) score -= 10;
  else if (disk.geschwindigkeit > 2800) score -= 5;

  return Math.max(0, Math.min(100, score));
}

// ─── 4. Visuelle Merkspanne (Blitzgedächtnis) ────────────────────────────────

function scoreMerkspanne(daten: ScreeningDaten, klasse: number): number {
  let score = 100;
  const m = daten.miniTests.merkspanne;

  if (m.fehlerrate > 0.6)       score -= 40;
  else if (m.fehlerrate > 0.4)  score -= 25;
  else if (m.fehlerrate > 0.25) score -= 12;

  // Reaktionszeit (class-adjusted)
  const rtGrenz = klasse <= 2 ? { gelb: 3500, rot: 5000 } : { gelb: 2500, rot: 4000 };
  if (m.reaktionszeit > rtGrenz.rot)  score -= 15;
  else if (m.reaktionszeit > rtGrenz.gelb) score -= 8;

  return Math.max(0, Math.min(100, score));
}

// ─── 5. Konzentration ─────────────────────────────────────────────────────────

function scoreKonzentration(fragen: Record<string, number>): number {
  const keys = ["k1","k2","k3","k4","k5","k6","k7","k8"];
  const summe = keys.reduce((s, k) => s + (fragen[k] ?? 0), 0);
  const max = keys.length * 3;
  return Math.round(Math.max(0, 100 - (summe / max) * 100));
}

// ─── 6. Reflexintegration ────────────────────────────────────────────────────
// MORO (r1,r2) und ATNR (r7,r8) doppelt gewichtet

function scoreReflexintegration(fragen: Record<string, number>, buchLese: ScreeningDaten["buchLese"]): number {
  const allKeys = ["r1","r2","r3","r4","r5","r6","r7","r8"];
  const gewichtung: Record<string, number> = {
    r1: 1.5, r2: 1.5, r3: 1.0, r4: 1.0,
    r5: 1.0, r6: 1.0, r7: 1.5, r8: 1.5,
  };
  const summe = allKeys.reduce((s, k) => s + (fragen[k] ?? 0) * (gewichtung[k] ?? 1), 0);
  const maxGewichtet = allKeys.reduce((s, k) => s + 3 * (gewichtung[k] ?? 1), 0);
  let score = Math.round(100 - (summe / maxGewichtet) * 100);

  // Lesebeobachtungen als zusätzliches Reflex-Signal
  const q = buchLese;
  if (q.verliert_zeile && q.benutzt_finger)    score = Math.min(score, 60);
  if (q.kopfhaltung === "schief_oder_verdreht") score = Math.min(score, 65);

  return Math.max(0, score);
}

// ─── Blinzelverhalten (PC-Lesetest) ──────────────────────────────────────────

function berecheBlinzelinfo(blinzeln: ScreeningDaten["pcLese"]["blinzeln"]): BlinzelInfo {
  switch (blinzeln) {
    case "selten":
      return {
        ampel: "rot",
        label: "Sehr selten",
        elternText:
          "Dein Kind blinzelt beim Lesen am Bildschirm sehr selten. Seltenes Blinzeln trocknet die Augen aus und ist ein Zeichen von visuellem Stress. Kurze Pausen alle 20 Minuten helfen.",
      };
    case "normal":
      return {
        ampel: "gruen",
        label: "Unauffällig",
        elternText:
          "Das Blinzelverhalten am Bildschirm war unauffällig — die Augen entspannen sich regelmäßig.",
      };
    case "oft":
      return {
        ampel: "gelb",
        label: "Häufig",
        elternText:
          "Dein Kind blinzelt beim Lesen am Bildschirm oft. Das kann auf Augenreizung oder erhöhte Anspannung hinweisen.",
      };
    default:
      return {
        ampel: "gelb",
        label: "Nicht beobachtet",
        elternText: "Das Blinzelverhalten am Bildschirm wurde nicht beobachtet.",
      };
  }
}

// ─── Mustererkennung ──────────────────────────────────────────────────────────

function erkenneMuster(scores: Record<string, number>, daten: ScreeningDaten): MusterHinweis[] {
  const hinweise: MusterHinweis[] = [];

  // Konvergenzinsuffizienz-Muster
  const k = daten.konvergenz;
  if (
    (k.beideAugen === "leicht_auffaellig" || k.beideAugen === "deutlich_auffaellig" || k.zeichen.includes("doppelbilder")) &&
    scores.lesefluss < 70
  ) {
    hinweise.push({
      titel: "Hinweis auf Konvergenzinsuffizienz",
      text: "Auffälligkeiten beim Konvergenztest kombiniert mit einem unruhigen Lesefluss sind ein typisches Muster. Die Augen arbeiten beim Nahsehen nicht präzise zusammen — Buchstaben können verschwimmen oder doppelt erscheinen.",
      staerke: k.beideAugen === "deutlich_auffaellig" ? "stark" : "mittel",
    });
  }

  // Monokularer Vergleich + Augensteuerung → klarer Binokularbefund
  if (daten.buchLese.monokular === "besser" && scores.augensteuerung < 70) {
    hinweise.push({
      titel: "Binokulare Zusammenarbeit eingeschränkt",
      text: "Das Kind liest mit einem Auge bedeckt flüssiger — ein starkes Zeichen, dass die Teamarbeit beider Augen nicht optimal funktioniert. Das ist trainierbar.",
      staerke: "stark",
    });
  }

  // Reflexdominantes Muster
  if (scores.reflexintegration < 55 && scores.konzentration < 60 && scores.augensteuerung < 65) {
    hinweise.push({
      titel: "Reflexintegration beeinflusst Lernen",
      text: "Aktive frühkindliche Reflexe kombiniert mit Konzentrationsschwierigkeiten und eingeschränkter Augensteuerung ist ein typisches Muster. Die Reflexe erzeugen eine Grundanspannung, die Energie für das Lernen raubt.",
      staerke: scores.reflexintegration < 40 ? "stark" : "mittel",
    });
  }

  // Sitzposition + STNR/TLR
  const fragen = daten.fragebogen;
  const stnr1 = fragen["r5"] ?? 0;
  const stnr2 = fragen["r6"] ?? 0;
  const tlr1 = fragen["r3"] ?? 0;
  if (stnr1 + stnr2 >= 4 && tlr1 >= 2) {
    hinweise.push({
      titel: "STNR/TLR-Muster: Sitzen und Schreiben",
      text: "Unbewusste Mitbewegungen beim Schreiben und eine schlechte Sitzhaltung sind Zeichen eines noch aktiven STNR- und TLR-Reflexes.",
      staerke: "mittel",
    });
  }

  return hinweise;
}

// ─── Hauptauswertung ──────────────────────────────────────────────────────────

export function berechneScreeningProfil(
  daten: ScreeningDaten,
  klasse: number
): ScreeningProfil {
  const scores = {
    lesefluss:            scoreLesefluss(daten),
    augensteuerung:       scoreAugensteuerung(daten),
    visuelleVerarbeitung: scoreVisuelleVerarbeitung(daten, klasse),
    merkspanne:           scoreMerkspanne(daten, klasse),
    konzentration:        scoreKonzentration(daten.fragebogen),
    reflexintegration:    scoreReflexintegration(daten.fragebogen, daten.buchLese),
  };

  const kategorien: KategorieScore[] = [
    {
      name: "Lesefluss",
      score: scores.lesefluss,
      ampel: getAmpel(scores.lesefluss),
      beschreibung: "Zeilenverluste, Wortüberspringen, Lesefluss und -qualität",
      elternText:
        scores.lesefluss < 41
          ? "Beim Lesen zeigt dein Kind deutliche Auffälligkeiten: Zeilen verlieren, Wörter überspringen oder raten statt wirklich lesen. Das kostet viel Energie."
          : scores.lesefluss < 71
          ? "Der Lesefluss zeigt leichte Unregelmäßigkeiten — einzelne Auffälligkeiten beim Lesen wurden beobachtet."
          : "Der Lesefluss ist gut und stabil — dein Kind liest flüssig und verliert keine Zeilen.",
      icon: "📖",
    },
    {
      name: "Augensteuerung",
      score: scores.augensteuerung,
      ampel: getAmpel(scores.augensteuerung),
      beschreibung: "Konvergenz, Fixation und Stift-Folgebewegungen",
      elternText:
        scores.augensteuerung < 41
          ? `Die Augensteuerung zeigt deutliche Auffälligkeiten — Konvergenztest, Fixation und/oder Stift-Folgebewegungen waren eingeschränkt.${daten.konvergenz.zeichen.includes("doppelbilder") ? " Beim Konvergenztest wurden Doppelbilder berichtet — das sollte fachlich abgeklärt werden." : ""}`
          : scores.augensteuerung < 71
          ? "Die Augensteuerung ist in einzelnen Bereichen noch nicht optimal."
          : "Die Augensteuerung ist gut — Konvergenz, Fixation und Verfolgung unauffällig.",
      icon: "🎯",
    },
    {
      name: "Visuelle Verarbeitung",
      score: scores.visuelleVerarbeitung,
      ampel: getAmpel(scores.visuelleVerarbeitung),
      beschreibung: "Buchstaben unterscheiden (b/d, p/q) und visuelle Diskrimination",
      elternText:
        scores.visuelleVerarbeitung < 41
          ? "Dein Kind hat Schwierigkeiten, ähnliche Buchstaben visuell zu unterscheiden — das kann Lesen und Schreiben deutlich erschweren."
          : scores.visuelleVerarbeitung < 71
          ? "Die visuelle Unterscheidungsfähigkeit zeigt leichte Auffälligkeiten — für das Klassenalter beobachtbar."
          : "Dein Kind kann Buchstaben und Symbole gut unterscheiden.",
      icon: "🔍",
    },
    {
      name: "Visuelle Merkspanne",
      score: scores.merkspanne,
      ampel: getAmpel(scores.merkspanne),
      beschreibung: "Kurzfristiges visuelles Gedächtnis (Blitzgedächtnis)",
      elternText:
        scores.merkspanne < 41
          ? "Das kurzzeitige visuelle Merken fällt schwer — dein Kind hat Mühe, kurz gesehene Symbole zu behalten. Das betrifft z. B. das Abschreiben von der Tafel."
          : scores.merkspanne < 71
          ? "Die visuelle Merkspanne ist leicht eingeschränkt — manchmal gehen kurz gesehene Details verloren."
          : "Die visuelle Merkspanne ist gut — kurz Gesehenes bleibt gut im Gedächtnis.",
      icon: "⚡",
    },
    {
      name: "Konzentration",
      score: scores.konzentration,
      ampel: getAmpel(scores.konzentration),
      beschreibung: "Aufmerksamkeit, Ruhe und Fokus",
      elternText:
        scores.konzentration < 41
          ? "Dein Kind zeigt laut deinen Angaben deutliche Konzentrationsschwierigkeiten — oft ein Zusammenspiel aus visuellem Stress und Aufmerksamkeit."
          : scores.konzentration < 71
          ? "Gelegentliche Konzentrationsprobleme können mit visueller Überlastung zusammenhängen."
          : "Die Konzentration ist im Normalbereich.",
      icon: "🧠",
    },
    {
      name: "Reflexintegration",
      score: scores.reflexintegration,
      ampel: getAmpel(scores.reflexintegration),
      beschreibung: "Frühkindliche Reflexe (MORO, TLR, STNR, ATNR)",
      elternText:
        scores.reflexintegration < 41
          ? "Mehrere frühkindliche Reflexe scheinen noch aktiv zu sein — MORO und ATNR beeinflussen dabei direkt die Augensteuerung und das Lesen."
          : scores.reflexintegration < 71
          ? "Einzelne frühkindliche Reflexe könnten noch nicht vollständig integriert sein."
          : "Die Reflexintegration zeigt keine Auffälligkeiten.",
      icon: "🦺",
    },
  ];

  const auffaelligkeitenAnzahl = kategorien.filter(k => k.ampel !== "gruen").length;

  const gesamtScore = Math.round(
    Object.values(scores).reduce((s, v) => s + v, 0) / 6
  );

  // VIKI-Typ
  const niedrigste = kategorien.reduce((a, b) => a.score < b.score ? a : b);
  let typ: "A" | "B" | "C" | "D" = "D";
  let hauptproblem = "Ganzheitlicher Förderbedarf";

  if (niedrigste.name === "Lesefluss" && scores.lesefluss < 50) {
    typ = "A"; hauptproblem = "Lesefluss & Augenbewegungen";
  } else if (niedrigste.name === "Augensteuerung" && scores.augensteuerung < 50) {
    typ = "B"; hauptproblem = "Augensteuerung & Fokus";
  } else if (niedrigste.name === "Reflexintegration" && scores.reflexintegration < 50) {
    typ = "C"; hauptproblem = "Reflexintegration & Körperwahrnehmung";
  }

  const blinzelinfo = berecheBlinzelinfo(daten.pcLese.blinzeln);
  const musterHinweise = erkenneMuster(scores, daten);

  return {
    typ, hauptproblem,
    kategorien, gesamtScore, auffaelligkeitenAnzahl,
    blinzelinfo, musterHinweise,
  };
}
