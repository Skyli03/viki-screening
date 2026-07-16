"use client";
import { useState } from "react";
import type { StiftReiseErgebnis } from "@/lib/screening-types";

interface Props {
  kindName: string;
  onFertig: (ergebnis: StiftReiseErgebnis) => void;
}

type PursuitBewegung = { richtung: string; beschreibung: string; animation: string };

const BEWEGUNGEN: PursuitBewegung[] = [
  {
    richtung: "Links ↔ Rechts",
    beschreibung: "Schulterbreite des Kindes · auf Augenhöhe",
    animation: "stift-lr",
  },
  {
    richtung: "Diagonal ↗ ↙",
    beschreibung: "Von unten links nach oben rechts — und zurück",
    animation: "stift-diag1",
  },
  {
    richtung: "Diagonal ↙ ↗",
    beschreibung: "Von oben links nach unten rechts — und zurück",
    animation: "stift-diag2",
  },
];

const ANIMATION_CSS = `
  @keyframes stift-lr   { 0%,100%{transform:translateX(-90px)} 50%{transform:translateX(90px)} }
  @keyframes stift-diag1 { 0%,100%{transform:translate(-70px,50px)} 50%{transform:translate(70px,-50px)} }
  @keyframes stift-diag2 { 0%,100%{transform:translate(-70px,-50px)} 50%{transform:translate(70px,50px)} }
  @keyframes stift-nah  { 0%,100%{transform:scale(0.5);opacity:0.6} 50%{transform:scale(1.8);opacity:1} }
`;

type Phase = "anleitung" | "bewegungen" | "bewertung_stift" | "nahfern_anleitung" | "nahfern" | "bewertung_nahfern";

export default function StiftReiseEltern({ kindName, onFertig }: Props) {
  const [phase, setPhase] = useState<Phase>("anleitung");
  const [aktBewegung, setAktBewegung] = useState(0);
  const [folgt, setFolgt] = useState<StiftReiseErgebnis["folgt"] | null>(null);
  const [kopfMitbewegt, setKopfMitbewegt] = useState<boolean | null>(null);
  const [konvergenzNahFern, setKonvergenzNahFern] = useState<StiftReiseErgebnis["konvergenz_nahfern"] | null>(null);

  function naechsteBewegung() {
    if (aktBewegung < BEWEGUNGEN.length - 1) {
      setAktBewegung(prev => prev + 1);
    } else {
      setPhase("bewertung_stift");
    }
  }

  function stiftBewertungFertig() {
    if (!folgt || kopfMitbewegt === null) return;
    setPhase("nahfern_anleitung");
  }

  function abschicken() {
    if (!folgt || kopfMitbewegt === null || !konvergenzNahFern) return;
    onFertig({ folgt, kopf_mitbewegt: kopfMitbewegt, konvergenz_nahfern: konvergenzNahFern });
  }

  // ─── Anleitung ────────────────────────────────────────────────────────────────
  if (phase === "anleitung") {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">✏️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Stift-Reise</h2>
        <p className="text-sm text-gray-500 mb-1">Kann {kindName} einem Stift nur mit den Augen folgen?</p>
        <p className="text-xs font-semibold mb-6" style={{ color: "#8DCDC5" }}>Muster und Geschwindigkeit beobachten</p>

        <div className="bg-white rounded-2xl border-2 p-6 mb-5 text-left max-w-lg mx-auto" style={{ borderColor: "#8DCDC5" }}>
          <p className="font-semibold text-gray-900 mb-4">So geht es:</p>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#F5943A" }}>1</span>
              <span>Halte einen <strong>Stift</strong> ca. <strong>30–40 cm</strong> vor das Gesicht von {kindName}. {kindName} folgt <strong>nur mit den Augen</strong>, Kopf bleibt still.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#F5943A" }}>2</span>
              <span>Du siehst gleich das <strong>Muster</strong> der Bewegung. Bewege den Stift <strong>langsam und gleichmäßig</strong> — ca. 2–3× pro Übung.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#F5943A" }}>3</span>
              <span>Du führst <strong>3 Bewegungen</strong> durch — dann noch eine <strong>separate Nah-Fern-Übung</strong>.</span>
            </li>
          </ol>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-lg mx-auto mb-6 text-sm text-amber-800 text-left">
          <p className="font-semibold mb-2">🔍 Auffällig ist:</p>
          <ul className="space-y-1 text-sm">
            <li>• Augen folgen ruckartig statt fließend</li>
            <li>• {kindName} bewegt den Kopf mit (statt nur die Augen)</li>
            <li>• {kindName} verliert den Stift und sucht ihn wieder</li>
          </ul>
        </div>

        <button
          onClick={() => setPhase("bewegungen")}
          className="w-full max-w-lg text-white font-bold text-xl py-4 rounded-xl shadow-md"
          style={{ background: "#F5943A" }}
        >
          Los geht's →
        </button>
      </div>
    );
  }

  // ─── Bewegungen (Smooth Pursuit) ─────────────────────────────────────────────
  if (phase === "bewegungen") {
    const bew = BEWEGUNGEN[aktBewegung];
    return (
      <div>
        <style>{ANIMATION_CSS}</style>

        <div className="text-center mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Bewegung {aktBewegung + 1} von {BEWEGUNGEN.length}</p>
          <h3 className="text-xl font-bold text-gray-900">{bew.richtung}</h3>
          <p className="text-sm text-gray-500 mt-1">{bew.beschreibung}</p>
        </div>

        {/* Animations-Vorschau — nur Stift, kein Quadrat */}
        <div className="rounded-2xl overflow-hidden mb-5 mx-auto max-w-sm flex items-center justify-center" style={{ height: "180px", background: "#E4F5F3" }}>
          <div
            style={{
              fontSize: "48px",
              animation: `${bew.animation} 4s ease-in-out infinite`,
              display: "inline-block",
            }}
          >
            ✏️
          </div>
        </div>

        <div className="flex gap-3 mb-3">
          {BEWEGUNGEN.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-2 rounded-full"
              style={{ background: i <= aktBewegung ? "#F5943A" : "#E5E7EB" }}
            />
          ))}
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 mb-5 text-xs text-teal-800 text-center">
          Führe diese Bewegung 2–3× durch, dann weiter.
        </div>

        <button
          onClick={naechsteBewegung}
          className="w-full text-white font-bold text-xl py-4 rounded-xl shadow-md"
          style={{ background: aktBewegung < BEWEGUNGEN.length - 1 ? "#8DCDC5" : "#F5943A" }}
        >
          {aktBewegung < BEWEGUNGEN.length - 1 ? "Nächste Bewegung →" : "Fertig → Bewertung"}
        </button>
      </div>
    );
  }

  // ─── Bewertung Stift (Smooth Pursuit) ────────────────────────────────────────
  if (phase === "bewertung_stift") {
    return (
      <div>
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">📋</div>
          <h3 className="text-xl font-bold text-gray-900">Was hast du beobachtet?</h3>
          <p className="text-sm text-gray-400 mt-1">Links-Rechts und Diagonal-Bewegungen</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm">
          <p className="font-semibold text-sm text-gray-900 mb-3">Wie sind die Augen von {kindName} dem Stift gefolgt?</p>
          <div className="space-y-2">
            {([
              { val: "fluessig", label: "Flüssig und gleichmäßig", sub: "Augen gleiten mit dem Stift — keine Ruckler", color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC" },
              { val: "ruckelig_mit_pausen", label: "Ruckelig / mit Pausen", sub: "Augen springen von Punkt zu Punkt statt zu gleiten", color: "#D97706", bg: "#FFFBEB", border: "#FCD34D" },
              { val: "verliert_stift", label: "Verliert den Stift", sub: "Augen springen weg und suchen den Stift wieder", color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5" },
            ] as const).map(opt => (
              <button key={opt.val} onClick={() => setFolgt(opt.val)}
                className="w-full p-3 rounded-xl border-2 text-left transition-all"
                style={folgt === opt.val ? { background: opt.bg, borderColor: opt.border } : { borderColor: "#E5E7EB" }}>
                <div className="font-semibold text-sm" style={{ color: opt.color }}>{opt.label}</div>
                <div className="text-xs text-gray-500">{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 shadow-sm">
          <p className="font-semibold text-sm text-gray-900 mb-3">Hat {kindName} den Kopf mitbewegt?</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { val: false, label: "Nein — Kopf blieb still", color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC" },
              { val: true, label: "Ja — Kopf folgte mit", color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5" },
            ] as const).map(opt => (
              <button key={String(opt.val)} onClick={() => setKopfMitbewegt(opt.val)}
                className="p-3 rounded-xl border-2 text-sm font-semibold transition-all"
                style={kopfMitbewegt === opt.val ? { background: opt.bg, borderColor: opt.border, color: opt.color } : { borderColor: "#E5E7EB", color: "#374151" }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={stiftBewertungFertig}
          disabled={!folgt || kopfMitbewegt === null}
          className="w-full text-white font-bold text-xl py-4 rounded-xl shadow-md disabled:opacity-40"
          style={{ background: "#F5943A" }}
        >
          Weiter zur Nah-Fern-Übung →
        </button>
      </div>
    );
  }

  // ─── Nah-Fern Anleitung ───────────────────────────────────────────────────────
  if (phase === "nahfern_anleitung") {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">🔭</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Nah-Fern-Übung</h2>
        <p className="text-sm text-gray-500 mb-6">Drehen beide Augen gleichmäßig ein?</p>

        <div className="bg-white rounded-2xl border-2 p-6 mb-5 text-left max-w-lg mx-auto" style={{ borderColor: "#8DCDC5" }}>
          <p className="font-semibold text-gray-900 mb-4">So geht es:</p>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#F5943A" }}>1</span>
              <span>Halte den Stift ca. <strong>40 cm</strong> vor die Augen von {kindName} — auf Augenhöhe, geradeaus.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#F5943A" }}>2</span>
              <span>Bewege den Stift <strong>langsam auf die Nase zu</strong> (bis ca. 5–10 cm) — dann wieder zurück. <strong>2–3× wiederholen.</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#F5943A" }}>3</span>
              <span>Beobachte <strong>beide Augen genau</strong>: Drehen sie sich gleichmäßig ein?</span>
            </li>
          </ol>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-lg mx-auto mb-6 text-sm text-amber-800 text-left">
          <p className="font-semibold mb-2">🔍 Worauf du achtest:</p>
          <ul className="space-y-1 text-sm">
            <li>• Drehen <strong>beide</strong> Augen gleichmäßig nach innen ein?</li>
            <li>• Ist ein Auge <strong>langsamer</strong> oder bleibt es zurück?</li>
            <li>• <strong>Ruckeln</strong> die Augen beim Eindrehen?</li>
            <li>• Kann {kindName} den Stift <strong>nicht gut fixieren</strong>?</li>
          </ul>
        </div>

        <button
          onClick={() => setPhase("nahfern")}
          className="w-full max-w-lg text-white font-bold text-xl py-4 rounded-xl shadow-md"
          style={{ background: "#F5943A" }}
        >
          Übung durchführen →
        </button>
      </div>
    );
  }

  // ─── Nah-Fern Durchführen ─────────────────────────────────────────────────────
  if (phase === "nahfern") {
    return (
      <div>
        <style>{ANIMATION_CSS}</style>

        <div className="text-center mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Nah-Fern</p>
          <h3 className="text-xl font-bold text-gray-900">Nah ↔ Fern</h3>
          <p className="text-sm text-gray-500 mt-1">Stift auf die Nase zu — dann wieder zurück</p>
        </div>

        <div className="rounded-2xl overflow-hidden mb-5 mx-auto max-w-sm flex items-center justify-center" style={{ height: "180px", background: "#E4F5F3" }}>
          <div
            style={{
              fontSize: "48px",
              animation: "stift-nah 4s ease-in-out infinite",
              display: "inline-block",
            }}
          >
            ✏️
          </div>
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 mb-5 text-xs text-teal-800 text-center">
          Führe die Nah-Fern-Bewegung 2–3× durch und beobachte beide Augen.
        </div>

        <button
          onClick={() => setPhase("bewertung_nahfern")}
          className="w-full text-white font-bold text-xl py-4 rounded-xl shadow-md"
          style={{ background: "#F5943A" }}
        >
          Fertig → Bewertung
        </button>
      </div>
    );
  }

  // ─── Bewertung Nah-Fern ───────────────────────────────────────────────────────
  return (
    <div>
      <div className="text-center mb-5">
        <div className="text-4xl mb-2">📋</div>
        <h3 className="text-xl font-bold text-gray-900">Wie haben die Augen von {kindName} eingedreht?</h3>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 shadow-sm">
        <p className="font-semibold text-sm text-gray-900 mb-3">Beim Annähern des Stifts an die Nase:</p>
        <div className="space-y-2">
          {([
            {
              val: "gleichmaessig",
              label: "Beide Augen drehen gleichmäßig ein",
              sub: "Beide Augen folgen dem Stift gleichmäßig zur Nase",
              color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC",
            },
            {
              val: "ein_auge_langsamer",
              label: "Ein Auge ist langsamer / bleibt zurück",
              sub: "Ein Auge folgt schlechter — das andere eilt vor",
              color: "#D97706", bg: "#FFFBEB", border: "#FCD34D",
            },
            {
              val: "ruckelt",
              label: "Augen ruckeln beim Eindrehen",
              sub: "Bewegung ist nicht fließend sondern ruckartig",
              color: "#D97706", bg: "#FFFBEB", border: "#FCD34D",
            },
            {
              val: "kann_nicht_fixieren",
              label: "Kann den Stift nicht gut fixieren",
              sub: "Kind blinzelt stark weg, schaut daneben oder klagt über Doppelbilder",
              color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5",
            },
          ] as const).map(opt => (
            <button key={opt.val} onClick={() => setKonvergenzNahFern(opt.val)}
              className="w-full p-3 rounded-xl border-2 text-left transition-all"
              style={konvergenzNahFern === opt.val ? { background: opt.bg, borderColor: opt.border } : { borderColor: "#E5E7EB" }}>
              <div className="font-semibold text-sm" style={{ color: opt.color }}>{opt.label}</div>
              <div className="text-xs text-gray-500">{opt.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={abschicken}
        disabled={!konvergenzNahFern}
        className="w-full text-white font-bold text-xl py-4 rounded-xl shadow-md disabled:opacity-40"
        style={{ background: "#F5943A" }}
      >
        Weiter →
      </button>
    </div>
  );
}
