"use client";
import { useMemo } from "react";
import type { ZeilenAnalyse } from "@/lib/eyetracking";

interface Props {
  zeilenAnalyse: ZeilenAnalyse[];
  ruecksprueungeProZeile: number;
  verfuegbar: boolean;
}

// ─── Layout-Konstanten ────────────────────────────────────────────────────────
const VB_W = 520;       // SVG viewBox Breite
const X0 = 54;          // Spuranfang (links)
const X1 = 462;         // Spurende (rechts)
const SPUR_B = X1 - X0; // Spurbreite
const ZH = 46;          // Höhe pro Zeile
const R_DOT = 4.5;      // Radius Fixationspunkt
const FONT = "system-ui, -apple-system, sans-serif";

type Fixation = { x: number; regression: boolean };

// ─── Fixationspositionen generieren (deterministisch) ─────────────────────────
function generiereFixationen(vorwaerts: number, rueck: number): Fixation[] {
  const total = vorwaerts + rueck;

  if (total === 0) {
    // Keine Daten: zwei Punkte
    return [
      { x: X0 + 20, regression: false },
      { x: X1 - 20, regression: false },
    ];
  }

  // Auf max. 12 Events skalieren damit der Chart übersichtlich bleibt
  const MAX = 12;
  const sk = total > MAX ? MAX / total : 1;
  const sV = Math.max(2, Math.round(vorwaerts * sk));
  const sR = Math.min(Math.max(sV - 1, 0), Math.round(rueck * sk));

  const vSchritt = SPUR_B / Math.max(sV, 1);
  const rSchritt = vSchritt * 0.55;

  // Rücksprünge gleichmäßig verteilt — deterministisch
  const rueckSet = new Set<number>();
  for (let i = 0; i < sR; i++) {
    rueckSet.add(Math.floor((i + 0.65) * (sV + sR) / Math.max(sR, 1)));
  }

  const fixes: Fixation[] = [{ x: X0 + 10, regression: false }];
  let x = X0 + 10;
  let vi = 0;
  for (let i = 0; i < sV + sR; i++) {
    const isR = rueckSet.has(i);
    x = isR
      ? Math.max(X0 + vSchritt * 0.4, x - rSchritt)
      : Math.min(X1 - 10, x + vSchritt);
    if (!isR) vi++;
    fixes.push({ x, regression: isR });
  }
  void vi;
  return fixes;
}

// ─── Eine Zeile rendern ───────────────────────────────────────────────────────
function ZeileRow({
  label,
  vorwaerts,
  rueck,
  yTop,
  ideal = false,
}: {
  label: string;
  vorwaerts: number;
  rueck: number;
  yTop: number;
  ideal?: boolean;
}) {
  const cy = yTop + ZH / 2 - 4;
  const fixes = useMemo(
    () => generiereFixationen(vorwaerts, rueck),
    [vorwaerts, rueck]
  );

  return (
    <g>
      {/* Hintergrundbalken */}
      <rect
        x={X0} y={yTop + 4}
        width={SPUR_B} height={ZH - 8}
        rx={4}
        fill={ideal ? "#F0FDF4" : "#F9FAFB"}
        stroke={ideal ? "#BBF7D0" : "#E5E7EB"}
        strokeWidth={1}
      />

      {/* Simulierte Textzeile (Wort-Shapes) */}
      {[36, 62, 50, 44, 68, 42, 55, 38].map((w, wi) => (
        <rect
          key={wi}
          x={X0 + 10 + [0, 44, 114, 172, 224, 300, 350, 413][wi]}
          y={cy + 9}
          width={w}
          height={3}
          rx={1.5}
          fill={ideal ? "#86EFAC" : "#D1D5DB"}
          opacity={0.7}
        />
      ))}

      {/* Sakkaden-Linien */}
      {fixes.slice(1).map((fix, i) => {
        const prev = fixes[i];
        const isR = fix.regression;
        return (
          <line
            key={i}
            x1={prev.x} y1={cy}
            x2={fix.x} y2={cy}
            stroke={isR ? "#EF4444" : ideal ? "#22C55E" : "#5BBDB5"}
            strokeWidth={isR ? 2.5 : 2}
            strokeDasharray={isR ? "5,3" : undefined}
            strokeLinecap="round"
          />
        );
      })}

      {/* Fixationspunkte */}
      {fixes.map((fix, i) => (
        <circle
          key={i}
          cx={fix.x} cy={cy}
          r={fix.regression ? R_DOT + 1 : R_DOT}
          fill={fix.regression ? "#EF4444" : ideal ? "#16A34A" : "#4A9E97"}
          stroke="white" strokeWidth={1.5}
        />
      ))}

      {/* Label links */}
      <text
        x={X0 - 6} y={cy + 4}
        textAnchor="end"
        fontSize={10}
        fill="#9CA3AF"
        fontFamily={FONT}
      >
        {label}
      </text>

      {/* Regressions-Badge rechts */}
      {rueck > 0 && (
        <text
          x={X1 + 10} y={cy + 4}
          fontSize={10}
          fill={rueck >= 3 ? "#DC2626" : "#F59E0B"}
          fontFamily={FONT}
          fontWeight="700"
        >
          ↩{rueck}
        </text>
      )}
      {rueck === 0 && (
        <text
          x={X1 + 10} y={cy + 4}
          fontSize={10}
          fill="#22C55E"
          fontFamily={FONT}
        >
          ✓
        </text>
      )}
    </g>
  );
}

// ─── Ideal-Daten (für Vergleich) ─────────────────────────────────────────────
const IDEAL: { v: number; r: number }[] = [
  { v: 8, r: 0 },
  { v: 7, r: 1 },
];

// ─── Hauptkomponente ─────────────────────────────────────────────────────────
export default function SakkadenVisualisierung({
  zeilenAnalyse,
  ruecksprueungeProZeile,
  verfuegbar,
}: Props) {
  // Wenn kein Tracking verfügbar: nichts anzeigen
  if (!verfuegbar) {
    return null;
  }

  // Beurteilung der Rücksprunghäufigkeit
  const rkpz = ruecksprueungeProZeile;
  const qualitaet =
    rkpz <= 1.0 ? "gut" :
    rkpz <= 2.0 ? "leicht auffällig" :
    rkpz <= 3.0 ? "auffällig" : "stark auffällig";
  const qualFarbe =
    rkpz <= 1.0 ? "#16A34A" :
    rkpz <= 2.0 ? "#D97706" :
    "#DC2626";

  // y-Positionen berechnen
  const Y_LEGENDE = 16;
  const Y_LINES_START = 48;   // erste Kindzeile
  const Y_IDEAL_HEADER = Y_LINES_START + 6 * ZH + 16;
  const Y_IDEAL_START = Y_IDEAL_HEADER + 22;
  const VB_H = Y_IDEAL_START + 2 * ZH + 20;

  const zeilen = zeilenAnalyse.length > 0 ? zeilenAnalyse : [];

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          👁️ Sakkaden-Visualisierung
        </p>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${qualFarbe}20`, color: qualFarbe }}
        >
          {qualitaet}
        </span>
      </div>

      {/* SVG */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        width="100%"
        style={{ display: "block" }}
        aria-label="Sakkaden-Visualisierung der Augenbewegungen"
      >
        {/* ── Legende ── */}
        <g transform={`translate(${X0}, ${Y_LEGENDE})`}>
          <circle cx={8} cy={6} r={4} fill="#4A9E97" stroke="white" strokeWidth={1.5} />
          <line x1={14} y1={6} x2={30} y2={6} stroke="#5BBDB5" strokeWidth={2} strokeLinecap="round" />
          <circle cx={36} cy={6} r={4} fill="#4A9E97" stroke="white" strokeWidth={1.5} />
          <text x={42} y={10} fontSize={10} fill="#6B7280" fontFamily={FONT}>Vorwärtssakkade</text>

          <circle cx={148} cy={6} r={5} fill="#EF4444" stroke="white" strokeWidth={1.5} />
          <line x1={154} y1={6} x2={170} y2={6} stroke="#EF4444" strokeWidth={2.5} strokeDasharray="5,3" strokeLinecap="round" />
          <circle cx={176} cy={6} r={5} fill="#EF4444" stroke="white" strokeWidth={1.5} />
          <text x={182} y={10} fontSize={10} fill="#6B7280" fontFamily={FONT}>Rücksprung (Regression)</text>

          <text x={330} y={10} fontSize={9} fill="#9CA3AF" fontFamily={FONT}>Punkt = Fixation</text>
        </g>

        {/* ── "Gemessene Augenbewegungen" Abschnitt ── */}
        <text
          x={X0} y={Y_LINES_START - 8}
          fontSize={11} fontWeight="600"
          fill="#374151" fontFamily={FONT}
        >
          📊 Gemessene Augenbewegungen
        </text>

        {zeilen.map((z, i) => (
          <ZeileRow
            key={i}
            label={`Z${i + 1}`}
            vorwaerts={z.vorwaertssprueunge}
            rueck={z.ruecksprueunge}
            yTop={Y_LINES_START + i * ZH}
          />
        ))}

        {/* Gesamt-Regression-Anzeige */}
        <text
          x={X0} y={Y_LINES_START + 6 * ZH + 12}
          fontSize={10} fill="#9CA3AF" fontFamily={FONT}
        >
          Ø Rücksprünge/Zeile:{" "}
          <tspan fontWeight="700" fill={qualFarbe}>
            {rkpz.toFixed(1)}
          </tspan>
          {"  "}
          <tspan fill="#D1D5DB">|</tspan>
          {"  "}↩ = Rücksprung (Auge liest Stelle nochmals)
        </text>

        {/* ── Trennlinie ── */}
        <line
          x1={X0} y1={Y_IDEAL_HEADER - 8}
          x2={X1} y2={Y_IDEAL_HEADER - 8}
          stroke="#E5E7EB" strokeWidth={1} strokeDasharray="4,4"
        />

        {/* ── "Ideales Muster" Abschnitt ── */}
        <text
          x={X0} y={Y_IDEAL_HEADER + 14}
          fontSize={11} fontWeight="600"
          fill="#15803D" fontFamily={FONT}
        >
          ✅ So sieht ein flüssiger Lesefluss aus (Vergleich)
        </text>

        {IDEAL.map((d, i) => (
          <ZeileRow
            key={i}
            label={`Z${i + 1}`}
            vorwaerts={d.v}
            rueck={d.r}
            yTop={Y_IDEAL_START + i * ZH}
            ideal
          />
        ))}

        <text
          x={X0} y={Y_IDEAL_START + 2 * ZH + 14}
          fontSize={10} fill="#9CA3AF" fontFamily={FONT}
        >
          Ideal: wenige Rücksprünge, gleichmäßige Vorwärtsbewegung, keine großen Sprünge
        </text>
      </svg>

      {/* Erläuterung unter dem Chart */}
      <div className="mt-3 text-xs text-gray-500 space-y-1">
        <p>
          <strong>Was du siehst:</strong> Jeder Punkt ist eine Fixation — eine kurze Pause, in der das Auge
          Buchstaben aufnimmt. Teal-Linien (→) sind normale Vorwärtssakkaden. Rote gestrichelte Linien (↩)
          sind Rücksprünge, bei denen das Auge eine Stelle nochmals liest.
        </p>
        <p className="text-gray-400">
          Gemessen mit kamerabasiertem Iris-Tracking (FaceMesh). Für klinische Diagnostik empfiehlt sich
          ein professionelles Eye-Tracking-System.
        </p>
      </div>
    </div>
  );
}
