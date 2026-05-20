"use client";

// ─── Tracking-Ansatz: Kopfposition + Blinzeln ─────────────────────────────────
//
// Iris-Tracking im Browser ist bei 30fps nicht zuverlässig genug für
// Sakkaden-Analyse (dafür braucht man 500+ Hz Hardware).
//
// Stattdessen: Kopfbewegungsanalyse während des Lesens
// Wissenschaftlicher Hintergrund:
//   Kinder mit Okulomotorikproblemen kompensieren schwache Augenmotorik
//   durch Kopfbewegungen. Während gute Leser den Kopf still halten und
//   nur die Augen bewegen, zeigen Kinder mit Leseproblemen messbar mehr
//   Kopfbewegung (Griffiths et al. 2016; Kapoula et al. 2016).
//
// Gemessen wird:
//   1. Nasenpunkt (Landmark 4) — stabile Gesichtsmitte, IOD-normalisiert
//   2. Blinzelrate — via Augenlid-Abstand (Landmark 159/145)
//   3. Bewegungs-Varianz → Lesestabilität
//
// FaceMesh OHNE refineLandmarks → kleiner, schneller, auf allen Geräten stabil

export interface BlickPunkt {
  zeit: number;
  x: number;   // Nasenpunkt X, IOD-normalisiert × 1000
  y: number;   // Nasenpunkt Y, IOD-normalisiert × 1000
  blinzeln: boolean;
}

export interface ZeilenAnalyse {
  zeileIndex: number;
  ruecksprueunge: number;
  vorwaertssprueunge: number;
  dauerMs: number;
}

// Lesequalität-Beobachtung durch Elternteil (Mehrfachauswahl möglich)
export type LesequalitaetMerkmal =
  | "fluessig"        // Gut und flüssig
  | "holprig"         // Holprig / stolpernd → ATNR, MORO, Sakkaden, Konvergenz
  | "endungen"        // Endungen vergessen/verschluckt → ATNR / MORO
  | "langsam"         // Richtig aber extrem langsam → MORO + visuelles System
  | "vertauscht";     // Buchstaben/Wörter erfunden oder vertauscht → ATNR + visuelle Verarbeitung

export interface TrackingErgebnis {
  ruecksprueungeProZeile: number;
  vorwaertssprueungeProZeile: number;
  lesegeschwindigkeitWPM: number;
  blinzelrateProMinute: number;  // -1 = nicht gemessen (kein Tracking)
  lesetempoRuhig: boolean;
  zeilenverluste: number;
  rohdaten: BlickPunkt[];
  zeilenAnalyse: ZeilenAnalyse[];
  // Elternbeobachtung Lesequalität (Gi em Aus)
  lesequalitaet?: LesequalitaetMerkmal[];
  fehlerAnzahl?: number;         // 0 = keine, 1-3 = wenige, 4-7 = mehrere, 8+ = viele
  lesezeitSekunden?: number;     // gemessene Zeit für Normvergleich
}

// ─── Landmark-Indizes (FaceMesh 468-Punkte, kein refineLandmarks nötig) ───────
const IDX_NASE         = 4;    // Nasenpunkt — sehr stabil, ideal für Kopfposition
const IDX_AUGE_LINKS   = 33;   // Linker Augenaußenwinkel — für IOD-Berechnung
const IDX_AUGE_RECHTS  = 263;  // Rechter Augenaußenwinkel — für IOD-Berechnung
const IDX_OBERLID      = 159;  // Linkes Oberlid — für Blinzelerkennung
const IDX_UNTERLID     = 145;  // Linkes Unterlid — für Blinzelerkennung

// ─── Schwellenwerte ────────────────────────────────────────────────────────────
// SCHWELLENWERT: Nasenpunkt-Verschiebung als Anteil des IOD × 1000
// 0.06 IOD ≈ 6px bei 60cm Abstand — merkliche Kopfbewegung beim Lesen
const SCHWELLENWERT          = 60;
const GLÄTTUNG_FENSTER       = 3;
const MIN_IOD_PX             = 30;   // Zu weit weg oder nicht erkannt
const MAX_FRAMES_PRO_SEKUNDE = 15;   // Stabil, wenig Rauschen

export class EyeTracker {
  private rohdaten: BlickPunkt[] = [];
  private startzeit: number = 0;
  private aktiv: boolean = false;
  private blinzelZaehler: number = 0;
  private videoEl: HTMLVideoElement | null = null;
  private model: unknown = null;
  private animFrameId: number | null = null;
  private letzterFrameZeit: number = 0;
  private glättungsPuffer: { x: number; y: number }[] = [];
  private framesOhneGesicht: number = 0;

  async init(videoElement: HTMLVideoElement): Promise<boolean> {
    try {
      this.videoEl = videoElement;

      const tf = await import("@tensorflow/tfjs");
      await tf.ready();

      const faceLandmarksDetection = await import(
        "@tensorflow-models/face-landmarks-detection"
      );
      this.model = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: "tfjs",
          refineLandmarks: false,  // KEIN Iris-Tracking → zuverlässiger, schneller
          maxFaces: 1,
        }
      );
      return true;
    } catch (e) {
      console.error("Tracking Init-Fehler:", e);
      return false;
    }
  }

  starten() {
    this.rohdaten = [];
    this.startzeit = Date.now();
    this.aktiv = true;
    this.blinzelZaehler = 0;
    this.glättungsPuffer = [];
    this.letzterFrameZeit = 0;
    this.framesOhneGesicht = 0;
    this.loop();
  }

  stoppen(): TrackingErgebnis {
    this.aktiv = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    return this.analysieren();
  }

  get datenpunkte(): number {
    return this.rohdaten.length;
  }

  private async loop() {
    if (!this.aktiv || !this.videoEl || !this.model) return;

    const jetzt = Date.now();
    const mindestAbstand = 1000 / MAX_FRAMES_PRO_SEKUNDE;
    if (jetzt - this.letzterFrameZeit < mindestAbstand) {
      this.animFrameId = requestAnimationFrame(() => this.loop());
      return;
    }
    this.letzterFrameZeit = jetzt;

    try {
      const detector = this.model as {
        estimateFaces: (v: HTMLVideoElement) => Promise<
          { keypoints: { x: number; y: number; name?: string }[] }[]
        >;
      };

      if (this.videoEl.readyState < 2) {
        this.animFrameId = requestAnimationFrame(() => this.loop());
        return;
      }

      const gesichter = await detector.estimateFaces(this.videoEl);

      if (gesichter.length > 0) {
        this.framesOhneGesicht = 0;
        const kps = gesichter[0].keypoints;

        // Mindestanzahl Keypoints prüfen (brauchen bis Index 263)
        if (kps.length < 264) {
          this.animFrameId = requestAnimationFrame(() => this.loop());
          return;
        }

        const linksAuge  = kps[IDX_AUGE_LINKS];
        const rechtsAuge = kps[IDX_AUGE_RECHTS];

        // ── IOD-Berechnung (Augenaußenwinkel-Abstand) ──────────────────────
        const iod = Math.sqrt(
          Math.pow(rechtsAuge.x - linksAuge.x, 2) +
          Math.pow(rechtsAuge.y - linksAuge.y, 2)
        );

        if (iod < MIN_IOD_PX) {
          this.animFrameId = requestAnimationFrame(() => this.loop());
          return;
        }

        // ── Nasenpunkt normalisiert (= Kopfposition) ───────────────────────
        const nase  = kps[IDX_NASE];
        const normX = (nase.x / iod) * 1000;
        const normY = (nase.y / iod) * 1000;

        // ── 3-Frame Glättung ───────────────────────────────────────────────
        this.glättungsPuffer.push({ x: normX, y: normY });
        if (this.glättungsPuffer.length > GLÄTTUNG_FENSTER) {
          this.glättungsPuffer.shift();
        }
        const geglättetX =
          this.glättungsPuffer.reduce((s, p) => s + p.x, 0) / this.glättungsPuffer.length;
        const geglättetY =
          this.glättungsPuffer.reduce((s, p) => s + p.y, 0) / this.glättungsPuffer.length;

        // ── Blinzelerkennung via Augenlid-Abstand ─────────────────────────
        const obLid    = kps[IDX_OBERLID];
        const unLid    = kps[IDX_UNTERLID];
        const lidAbstand = obLid && unLid ? Math.abs(obLid.y - unLid.y) : null;
        const blinzeln = lidAbstand !== null ? lidAbstand / iod < 0.10 : false;

        if (blinzeln) this.blinzelZaehler++;

        this.rohdaten.push({
          zeit: Date.now() - this.startzeit,
          x: geglättetX,
          y: geglättetY,
          blinzeln,
        });
      } else {
        this.framesOhneGesicht++;
        if (this.framesOhneGesicht > MAX_FRAMES_PRO_SEKUNDE * 3) {
          this.glättungsPuffer = [];
        }
      }
    } catch (_) {
      // Einzelne Frame-Fehler ignorieren
    }

    this.animFrameId = requestAnimationFrame(() => this.loop());
  }

  private analysieren(): TrackingErgebnis {
    const MIN_DATENPUNKTE = 10;

    if (this.rohdaten.length < MIN_DATENPUNKTE) {
      return this.leeresErgebnis();
    }

    const dauerSek = (Date.now() - this.startzeit) / 1000;
    const blinzelrate = Math.round((this.blinzelZaehler / Math.max(dauerSek, 1)) * 60);

    // ── Bewegungsanalyse (Rück- und Vorwärtsbewegungen des Kopfes) ──────────
    let ruecksprueunge = 0;
    let vorwaertssprueunge = 0;
    let letzteRichtung: "vor" | "rueck" | null = null;

    for (let i = 1; i < this.rohdaten.length; i++) {
      const dx = this.rohdaten[i].x - this.rohdaten[i - 1].x;
      if (dx < -SCHWELLENWERT) {
        if (letzteRichtung !== "rueck") {
          ruecksprueunge++;
          letzteRichtung = "rueck";
        }
      } else if (dx > SCHWELLENWERT) {
        if (letzteRichtung !== "vor") {
          vorwaertssprueunge++;
          letzteRichtung = "vor";
        }
      }
    }

    // ── Vertikale Sprünge (Zeilenverluste) ─────────────────────────────────
    let zeilenverluste = 0;
    const Y_SCHWELLENWERT = 40;
    for (let i = 1; i < this.rohdaten.length; i++) {
      const dy = Math.abs(this.rohdaten[i].y - this.rohdaten[i - 1].y);
      if (dy > Y_SCHWELLENWERT) zeilenverluste++;
    }

    // ── Lesestabilität (Varianz der X-Geschwindigkeit) ─────────────────────
    const xGeschwindigkeiten = this.rohdaten
      .slice(1)
      .map((p, i) => {
        const dt = Math.max(p.zeit - this.rohdaten[i].zeit, 1);
        return Math.abs(p.x - this.rohdaten[i].x) / dt;
      });
    const mittel =
      xGeschwindigkeiten.reduce((a, b) => a + b, 0) / xGeschwindigkeiten.length;
    const varianz =
      xGeschwindigkeiten.reduce((a, b) => a + Math.pow(b - mittel, 2), 0) /
      xGeschwindigkeiten.length;
    const lesetempoRuhig = varianz < 2.0;

    // ── Zeilen-Analyse (6 gleichmäßige Abschnitte) ─────────────────────────
    const ZEILEN_ANZAHL = 6;
    const zeilenDauer = (dauerSek * 1000) / ZEILEN_ANZAHL;
    const zeilenAnalyse: ZeilenAnalyse[] = Array.from(
      { length: ZEILEN_ANZAHL },
      (_, i) => {
        const zeilePunkte = this.rohdaten.filter(
          (p) => p.zeit >= i * zeilenDauer && p.zeit < (i + 1) * zeilenDauer
        );
        let zRueck = 0, zVorwaerts = 0;
        let letztR: "vor" | "rueck" | null = null;
        for (let j = 1; j < zeilePunkte.length; j++) {
          const dx = zeilePunkte[j].x - zeilePunkte[j - 1].x;
          if (dx < -SCHWELLENWERT && letztR !== "rueck") { zRueck++; letztR = "rueck"; }
          else if (dx > SCHWELLENWERT && letztR !== "vor") { zVorwaerts++; letztR = "vor"; }
        }
        return {
          zeileIndex: i,
          ruecksprueunge: zRueck,
          vorwaertssprueunge: zVorwaerts,
          dauerMs: zeilenDauer,
        };
      }
    );

    return {
      ruecksprueungeProZeile:
        Math.round((ruecksprueunge / ZEILEN_ANZAHL) * 10) / 10,
      vorwaertssprueungeProZeile:
        Math.round((vorwaertssprueunge / ZEILEN_ANZAHL) * 10) / 10,
      lesegeschwindigkeitWPM: 0,
      blinzelrateProMinute: blinzelrate,
      lesetempoRuhig,
      zeilenverluste,
      rohdaten: this.rohdaten,
      zeilenAnalyse,
    };
  }

  private leeresErgebnis(): TrackingErgebnis {
    return {
      ruecksprueungeProZeile: 0,
      vorwaertssprueungeProZeile: 0,
      lesegeschwindigkeitWPM: 0,
      blinzelrateProMinute: -1,  // -1 = nicht gemessen (kein Tracking)
      lesetempoRuhig: true,
      zeilenverluste: 0,
      rohdaten: [],
      zeilenAnalyse: [],
    };
  }
}
