"use client";
import { useState } from "react";
import type { BuchLeseErgebnis } from "@/lib/screening-types";

interface Props {
  kindName: string;
  onFertig: (ergebnis: BuchLeseErgebnis) => void;
}

type Phase = "anleitung" | "lesen" | "beobachtung" | "monokular";

export default function BuchLesetest({ kindName, onFertig }: Props) {
  const [phase, setPhase] = useState<Phase>("anleitung");

  // Beobachtungen
  const [verliert_zeile, setVerliertZeile] = useState<boolean | null>(null);
  const [ueberspringt_woerter, setUeberspringtWoerter] = useState<boolean | null>(null);
  const [benutzt_finger, setBenutztFinger] = useState<boolean | null>(null);
  const [viele_fehler, setVieleFehler] = useState<boolean | null>(null);
  const [fluessig, setFluessig] = useState<boolean | null>(null);
  const [leseabstand, setLeseabstand] = useState<BuchLeseErgebnis["leseabstand"] | null>(null);
  const [kopfhaltung, setKopfhaltung] = useState<BuchLeseErgebnis["kopfhaltung"] | null>(null);
  const [monokular, setMonokular] = useState<BuchLeseErgebnis["monokular"] | null>(null);

  function beobachtungFertig() {
    if (verliert_zeile === null || fluessig === null || leseabstand === null || kopfhaltung === null) return;
    setPhase("monokular");
  }

  function abschicken() {
    if (!monokular) return;
    onFertig({
      verliert_zeile: verliert_zeile ?? false,
      ueberspringt_woerter: ueberspringt_woerter ?? false,
      benutzt_finger: benutzt_finger ?? false,
      viele_fehler_bekannte_woerter: viele_fehler ?? false,
      fluessig: fluessig ?? true,
      leseabstand: leseabstand ?? "normal",
      kopfhaltung: kopfhaltung ?? "gerade",
      monokular,
    });
  }

  if (phase === "anleitung") {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">📚</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesetest — Buch</h2>
        <p className="text-sm text-gray-500 mb-6">{kindName} liest aus einem eigenen Buch — du beobachtest.</p>

        <div className="bg-white rounded-2xl border-2 p-6 mb-5 text-left max-w-lg mx-auto" style={{ borderColor: "#8DCDC5" }}>
          <p className="font-semibold text-gray-900 mb-4">So geht es:</p>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#F5943A" }}>1</span>
              <span>Hol ein <strong>Buch</strong>, das {kindName} kennt. Wähle eine Seite mit ein paar Absätzen.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#F5943A" }}>2</span>
              <span>{kindName} liest ca. <strong>1–2 Minuten laut vor</strong>. Kein Druck — so gut es geht.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#F5943A" }}>3</span>
              <span><strong>Beobachte</strong> dabei: Augen, Haltung, Abstand zum Buch, Fehler.</span>
            </li>
          </ol>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-lg mx-auto mb-6 text-left text-sm text-amber-800">
          <p className="font-semibold mb-2">👀 Worauf du achtest:</p>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <span>• Verliert {kindName} die Zeile?</span>
            <span>• Benutzt {kindName} den Finger?</span>
            <span>• Überspringt {kindName} Wörter?</span>
            <span>• Wie weit ist das Buch weg?</span>
            <span>• Viele Fehler bei bekannten Wörtern?</span>
            <span>• Hält {kindName} den Kopf schief?</span>
          </div>
        </div>

        <button
          onClick={() => setPhase("lesen")}
          className="w-full max-w-lg text-white font-bold text-xl py-4 rounded-xl shadow-md"
          style={{ background: "#F5943A" }}
        >
          Jetzt lesen lassen →
        </button>
      </div>
    );
  }

  if (phase === "lesen") {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">📖</div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">{kindName} liest gerade …</h2>

        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 max-w-lg mx-auto mb-6 text-left text-sm text-teal-800">
          <p className="font-semibold mb-3">Jetzt beobachten:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2"><span>👁️</span><span>Folgen die Augen der Zeile oder springen sie?</span></div>
            <div className="flex items-center gap-2"><span>☝️</span><span>Benutzt {kindName} den Finger zum Zeigen?</span></div>
            <div className="flex items-center gap-2"><span>📏</span><span>Wie weit hält {kindName} das Buch? Sehr nah? Weit weg?</span></div>
            <div className="flex items-center gap-2"><span>🔄</span><span>Hält {kindName} den Kopf gerade oder schief/verdreht?</span></div>
            <div className="flex items-center gap-2"><span>❌</span><span>Wie viele Fehler bei eigentlich bekannten Wörtern?</span></div>
          </div>
        </div>

        <button
          onClick={() => setPhase("beobachtung")}
          className="w-full max-w-lg text-white font-bold text-xl py-4 rounded-xl shadow-md"
          style={{ background: "#8DCDC5" }}
        >
          ✅ {kindName} hat gelesen → Ergebnis eingeben
        </button>
      </div>
    );
  }

  if (phase === "beobachtung") {
    const alleAusgefuellt = verliert_zeile !== null && fluessig !== null && leseabstand !== null && kopfhaltung !== null;

    return (
      <div>
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">📋</div>
          <h2 className="text-xl font-bold text-gray-900">Was hast du beobachtet?</h2>
        </div>

        <div className="space-y-4">
          {/* Lesefluss */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="font-semibold text-sm text-gray-900 mb-2">Wie hat {kindName} gelesen?</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { val: true, label: "Flüssig und sicher", color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC" },
                { val: false, label: "Holprig / mit Mühe", color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5" },
              ] as const).map(opt => (
                <button key={String(opt.val)} onClick={() => setFluessig(opt.val)}
                  className="p-3 rounded-xl border-2 text-sm font-semibold transition-all"
                  style={fluessig === opt.val ? { background: opt.bg, borderColor: opt.border, color: opt.color } : { borderColor: "#E5E7EB", color: "#374151" }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zeile verlieren */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="font-semibold text-sm text-gray-900 mb-2">Hat {kindName} die Zeile verloren oder Wörter übersprungen?</p>
            <div className="grid grid-cols-2 gap-2">
              {([{ val: false, label: "Nein / kaum" }, { val: true, label: "Ja, deutlich" }] as const).map(opt => (
                <button key={String(opt.val)} onClick={() => { setVerliertZeile(opt.val); setUeberspringtWoerter(opt.val); }}
                  className="p-3 rounded-xl border-2 text-sm font-semibold transition-all"
                  style={verliert_zeile === opt.val
                    ? { background: opt.val ? "#FEF2F2" : "#F0FDF4", borderColor: opt.val ? "#FCA5A5" : "#86EFAC", color: opt.val ? "#DC2626" : "#16A34A" }
                    : { borderColor: "#E5E7EB", color: "#374151" }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Finger */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="font-semibold text-sm text-gray-900 mb-2">Finger zum Zeilen-Verfolgen benutzt?</p>
            <div className="grid grid-cols-2 gap-2">
              {([{ val: false, label: "Nein" }, { val: true, label: "Ja" }] as const).map(opt => (
                <button key={String(opt.val)} onClick={() => setBenutztFinger(opt.val)}
                  className="p-3 rounded-xl border-2 text-sm font-semibold transition-all"
                  style={benutzt_finger === opt.val
                    ? { background: opt.val ? "#FEF2F2" : "#F0FDF4", borderColor: opt.val ? "#FCA5A5" : "#86EFAC", color: opt.val ? "#DC2626" : "#16A34A" }
                    : { borderColor: "#E5E7EB", color: "#374151" }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fehler */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="font-semibold text-sm text-gray-900 mb-2">Viele Fehler bei eigentlich bekannten Wörtern?</p>
            <div className="grid grid-cols-2 gap-2">
              {([{ val: false, label: "Nein / wenige" }, { val: true, label: "Ja, auffällig viele" }] as const).map(opt => (
                <button key={String(opt.val)} onClick={() => setVieleFehler(opt.val)}
                  className="p-3 rounded-xl border-2 text-sm font-semibold transition-all"
                  style={viele_fehler === opt.val
                    ? { background: opt.val ? "#FEF2F2" : "#F0FDF4", borderColor: opt.val ? "#FCA5A5" : "#86EFAC", color: opt.val ? "#DC2626" : "#16A34A" }
                    : { borderColor: "#E5E7EB", color: "#374151" }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Leseabstand */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="font-semibold text-sm text-gray-900 mb-2">Abstand zum Buch?</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { val: "normal", label: "Normal (30–40 cm)" },
                { val: "zu_nah", label: "Zu nah (unter 20 cm)" },
                { val: "zu_weit", label: "Zu weit (über 50 cm)" },
                { val: "wechselnd", label: "Wechselt ständig" },
              ] as const).map(opt => (
                <button key={opt.val} onClick={() => setLeseabstand(opt.val)}
                  className="p-3 rounded-xl border-2 text-sm font-semibold transition-all"
                  style={leseabstand === opt.val
                    ? { background: "#FEF3E2", borderColor: "#F5943A", color: "#92400E" }
                    : { borderColor: "#E5E7EB", color: "#374151" }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Kopfhaltung */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="font-semibold text-sm text-gray-900 mb-2">Kopfhaltung beim Lesen?</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { val: "gerade", label: "Kopf gerade" },
                { val: "schief_oder_verdreht", label: "Kopf schief / Buch verdreht" },
              ] as const).map(opt => (
                <button key={opt.val} onClick={() => setKopfhaltung(opt.val)}
                  className="p-3 rounded-xl border-2 text-sm font-semibold transition-all"
                  style={kopfhaltung === opt.val
                    ? { background: opt.val === "gerade" ? "#F0FDF4" : "#FEF2F2", borderColor: opt.val === "gerade" ? "#86EFAC" : "#FCA5A5", color: opt.val === "gerade" ? "#16A34A" : "#DC2626" }
                    : { borderColor: "#E5E7EB", color: "#374151" }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={beobachtungFertig}
          disabled={!alleAusgefuellt}
          className="w-full mt-5 text-white font-bold text-xl py-4 rounded-xl shadow-md disabled:opacity-40"
          style={{ background: "#F5943A" }}
        >
          Weiter zum Augen-Vergleich →
        </button>
      </div>
    );
  }

  // Phase monokular
  return (
    <div>
      <div className="text-center mb-5">
        <div className="flex justify-center mb-3">
          <svg viewBox="0 0 100 50" width="90" height="45" xmlns="http://www.w3.org/2000/svg">
            {/* Linkes Auge: offen */}
            <ellipse cx="25" cy="25" rx="18" ry="11" fill="none" stroke="#8DCDC5" strokeWidth="2.5"/>
            <circle cx="25" cy="25" r="5" fill="#8DCDC5"/>
            <circle cx="27" cy="23" r="2" fill="white"/>
            {/* Rechtes Auge: abgedeckt */}
            <ellipse cx="75" cy="25" rx="18" ry="11" fill="none" stroke="#D1D5DB" strokeWidth="2.5"/>
            <line x1="59" y1="15" x2="91" y2="35" stroke="#EE6B85" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Augen-Vergleich</h2>
        <p className="text-sm text-gray-500 mt-1">Wie liest {kindName} mit nur einem Auge?</p>
      </div>

      <div className="bg-white rounded-2xl border-2 p-5 mb-5 text-left" style={{ borderColor: "#8DCDC5" }}>
        <p className="font-semibold text-gray-900 mb-3">So geht es:</p>
        <ol className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2"><span className="font-bold" style={{ color: "#F5943A" }}>1.</span><span>Decke {kindName} das <strong>linke Auge</strong> sanft mit der Hand ab. {kindName} liest einen <strong>anderen, ähnlichen Abschnitt</strong> im Buch.</span></li>
          <li className="flex gap-2"><span className="font-bold" style={{ color: "#F5943A" }}>2.</span><span>Dann das <strong>rechte Auge</strong> — wieder ein neuer Abschnitt.</span></li>
          <li className="flex gap-2"><span className="font-bold" style={{ color: "#F5943A" }}>3.</span><span>Vergleiche: Wird es <strong>ruhiger und flüssiger</strong>?</span></li>
        </ol>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 shadow-sm">
        <p className="font-semibold text-sm text-gray-900 mb-3">Ergebnis des Augen-Vergleichs:</p>
        <div className="space-y-2">
          {([
            { val: "besser", label: "Ja — mit einem Auge ist der Lesefluss ruhiger / flüssiger", color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5", sub: "Wichtiges Zeichen: Beide Augen arbeiten nicht gut als Team" },
            { val: "gleich", label: "Gleich — kein Unterschied", color: "#D97706", bg: "#FFFBEB", border: "#FCD34D", sub: "Kein klares binokulares Signal" },
            { val: "schlechter", label: "Schlechter — mit beiden Augen liest es besser", color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC", sub: "Beide Augen arbeiten gut zusammen" },
            { val: "nicht_getestet", label: "Konnte ich nicht testen", color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB", sub: "" },
          ] as const).map(opt => (
            <button key={opt.val} onClick={() => setMonokular(opt.val)}
              className="w-full p-3 rounded-xl border-2 text-left transition-all"
              style={monokular === opt.val ? { background: opt.bg, borderColor: opt.border } : { borderColor: "#E5E7EB" }}>
              <div className="text-sm font-semibold" style={{ color: opt.color }}>{opt.label}</div>
              {opt.sub && <div className="text-xs text-gray-500 mt-0.5">{opt.sub}</div>}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={abschicken}
        disabled={!monokular}
        className="w-full text-white font-bold text-xl py-4 rounded-xl shadow-md disabled:opacity-40"
        style={{ background: "#F5943A" }}
      >
        Weiter →
      </button>
    </div>
  );
}
