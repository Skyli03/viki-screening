"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// SmoothPursuit — 3 Phasen nach ENWAKO-Protokoll
// Sarah Kopetzky: "Ich mache zuerst jedes Auge einzeln, dann gemeinsam.
//  Ab 5½ Jahren sollten Bewegungen fließend sein."

interface Props {
  onFertig: (result: { abweichung: number }) => void;
}

type Phase =
  | "anleitung"
  | "lauft_r"      // Rechtes Auge alleine
  | "pause_r"      // Kurze Pause, dann Links
  | "lauft_l"      // Linkes Auge alleine
  | "pause_l"      // Kurze Pause, dann Bino
  | "lauft_bino"   // Beide Augen
  | "bewertung"
  | "fertig";

type Augenbewegung = "fluessig" | "leicht_ruckelnd" | "stark_ruckelnd";

function Rakete() {
  return <div style={{ fontSize: "42px", lineHeight: 1, userSelect: "none" }}>🚀</div>;
}

function RaketeAnimation({
  dauer,
  onFertig,
}: { dauer: number; onFertig: () => void }) {
  const [countdown, setCountdown] = useState<number>(3);
  const [zielX, setZielX] = useState(15);
  const [zielY, setZielY] = useState(45);
  const animRef = useRef<number | undefined>(undefined);
  const cdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(Date.now());
  const richtungX = useRef(1);
  const richtungY = useRef(0.3);

  function bewegen() {
    const elapsed = (Date.now() - startRef.current) / 1000;
    if (elapsed >= dauer) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      onFertig();
      return;
    }
    setZielX((prev) => {
      const neu = prev + richtungX.current * 0.5;
      if (neu >= 85 || neu <= 10) richtungX.current *= -1;
      return Math.max(10, Math.min(85, neu));
    });
    if (Math.random() < 0.003) richtungY.current *= -1;
    setZielY((prev) => {
      const neu = prev + richtungY.current * 0.2;
      if (neu >= 75 || neu <= 20) richtungY.current *= -1;
      return Math.max(20, Math.min(75, neu));
    });
    animRef.current = requestAnimationFrame(bewegen);
  }

  useEffect(() => {
    // Countdown 3→2→1→0, dann Animation starten
    let cd = 3;
    cdRef.current = setInterval(() => {
      cd -= 1;
      setCountdown(cd);
      if (cd <= 0) {
        if (cdRef.current) clearInterval(cdRef.current);
        startRef.current = Date.now();
        bewegen();
      }
    }, 1000);
    return () => {
      if (cdRef.current) clearInterval(cdRef.current);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {/* Animationsfeld — volle Breite */}
      <div
        className="relative bg-gray-900 rounded-2xl overflow-hidden select-none w-full"
        style={{ height: "220px" }}
      >
        {countdown > 0 ? (
          /* Countdown-Overlay */
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-8xl font-black" style={{ color: "#F5943A" }}>{countdown}</div>
            <p className="text-sm mt-3 font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
              Kind vor Bildschirm positionieren…
            </p>
          </div>
        ) : (
          <div
            className="absolute transition-none"
            style={{
              left: `${zielX}%`,
              top: `${zielY}%`,
              transform: "translate(-50%, -50%)",
              filter: "drop-shadow(0 0 10px rgba(245,148,58,0.9))",
            }}
          >
            <Rakete />
          </div>
        )}
      </div>
      {/* Kamera liegendes Rechteck darunter */}
      <KameraVorschau />
    </div>
  );
}

// Kleine Kamera-Vorschau damit Eltern die Augen des Kindes sehen können
// (besonders wenn Monitor an der Wand ist)
function KameraVorschau() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [aktiv, setAktiv] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: { ideal: 320 }, height: { ideal: 240 } }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        setAktiv(true);
      })
      .catch(() => setAktiv(false));

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // srcObject setzen sobald Video-Element im DOM ist (nach aktiv=true)
  useEffect(() => {
    if (aktiv && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [aktiv]);

  return (
    <div
      className="rounded-2xl overflow-hidden bg-gray-800 w-full flex flex-col"
      style={{ height: "300px" }}
    >
      {aktiv ? (
        <>
          <video
            ref={videoRef}
            muted
            playsInline
            style={{ width: "100%", flex: 1, objectFit: "contain", background: "#111827", transform: "scaleX(-1)" }}
          />
          <div style={{ padding: "2px 4px", textAlign: "center", fontSize: "9px", color: "rgba(255,255,255,0.6)" }}>
            👁️ Augen deines Kindes beobachten
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-row items-center justify-center gap-3" style={{ padding: "8px" }}>
          <span style={{ fontSize: "24px" }}>👀</span>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
            Beobachte direkt die Augen deines Kindes
          </span>
        </div>
      )}
    </div>
  );
}

export default function SmoothPursuit({ onFertig }: Props) {
  const [phase, setPhase] = useState<Phase>("anleitung");
  const [bewertungR, setBewertungR] = useState<Augenbewegung | null>(null);
  const [bewertungL, setBewertungL] = useState<Augenbewegung | null>(null);
  const [bewertungBino, setBewertungBino] = useState<Augenbewegung | null>(null);
  const [kopfR, setKopfR] = useState<boolean | null>(null);
  const [kopfL, setKopfL] = useState<boolean | null>(null);
  const [kopfBino, setKopfBino] = useState<boolean | null>(null);

  function berechneAbweichung(): number {
    const bewMap: Record<Augenbewegung, number> = { fluessig: 15, leicht_ruckelnd: 55, stark_ruckelnd: 90 };
    const vals = [bewertungR, bewertungL, bewertungBino]
      .filter(Boolean)
      .map(v => bewMap[v!]);
    const mittel = vals.reduce((a, b) => a + b, 0) / vals.length;
    // Kopfbewegung erhöht die Abweichung
    const kopfBonus = [kopfR, kopfL, kopfBino].filter(Boolean).length * 10;
    return Math.min(90, Math.round(mittel + kopfBonus));
  }

  function abschliessen() {
    if (!bewertungBino) return;
    const abweichung = berechneAbweichung();
    setTimeout(() => onFertig({ abweichung }), 600);
    setPhase("fertig");
  }

  const BeobachtungsHinweis = ({ auge }: { auge: string }) => (
    <div className="mb-3 px-4 py-3 rounded-xl text-sm" style={{ background: "#E4F5F3", color: "#2D7A73" }}>
      <p className="font-semibold mb-1">👀 Beobachte das <strong>{auge}</strong> Auge:</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
        <span>• Ruckeln die Augen?</span>
        <span>• Bewegt sich der Kopf mit?</span>
        <span>• Verliert das Auge die Rakete?</span>
        <span>• Grimassen / Stirnrunzeln?</span>
      </div>
    </div>
  );

  function BewertungsBlock({
    bewertung, onBewertung, kopf, onKopf
  }: {
    bewertung: Augenbewegung | null;
    onBewertung: (v: Augenbewegung) => void;
    kopf: boolean | null;
    onKopf: (v: boolean) => void;
  }) {
    const opts: { v: Augenbewegung; emoji: string; label: string; detail: string }[] = [
      { v: "fluessig",        emoji: "😊", label: "Flüssig und gleichmäßig", detail: "Auge folgte sauber, kein Ruckeln" },
      { v: "leicht_ruckelnd", emoji: "🤔", label: "Leicht ruckelnd",          detail: "Gelegentliches Springen oder Nachkorrigieren" },
      { v: "stark_ruckelnd",  emoji: "😟", label: "Stark ruckelnd / verloren",detail: "Auge verlor die Rakete, große Sprünge" },
    ];
    return (
      <div className="bg-white rounded-2xl border-2 p-5" style={{ borderColor: "#8DCDC5" }}>
        <p className="font-semibold text-gray-900 mb-3">Augenbewegung:</p>
        <div className="flex flex-col gap-2 mb-4">
          {opts.map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => onBewertung(o.v)}
              className="p-3 rounded-xl border-2 text-left flex items-start gap-3 transition-all"
              style={bewertung === o.v
                ? { borderColor: "#8DCDC5", background: "#E4F5F3" }
                : { borderColor: "#E5E7EB" }
              }
            >
              <span className="text-xl flex-shrink-0">{o.emoji}</span>
              <div>
                <div className="text-sm font-semibold text-gray-900">{o.label}</div>
                <div className="text-xs text-gray-500">{o.detail}</div>
              </div>
            </button>
          ))}
        </div>
        <p className="font-semibold text-gray-900 mb-2 text-sm">Kopf mitbewegt?</p>
        <div className="flex gap-3">
          {([false, true] as const).map((v) => (
            <button
              key={String(v)}
              type="button"
              onClick={() => onKopf(v)}
              className="flex-1 p-2 rounded-xl border-2 text-sm font-semibold transition-all"
              style={kopf === v
                ? { borderColor: "#8DCDC5", background: "#E4F5F3", color: "#1D6E68" }
                : { borderColor: "#E5E7EB", color: "#374151" }
              }
            >
              {v ? "Ja, Kopf bewegte sich" : "Nein, Kopf still"}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const NochUnsicherHinweis = () => (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
      <p className="font-semibold text-sm text-amber-900 mb-2">💡 Noch unsicher? So kannst du es nochmals direkt beobachten:</p>
      <p className="text-sm text-amber-800">
        Stell dich deinem Kind gegenüber. Bewege einen Finger langsam von links nach rechts auf Augenhöhe — etwa 40 cm vor dem Gesicht deines Kindes. Das Kind folgt dem Finger nur mit den Augen.
      </p>
      <p className="text-sm text-amber-800 mt-2">
        👉 <strong>Worauf du achtest:</strong> Folgen die Augen dem Finger <strong>flüssig</strong>, oder ruckeln sie, springen vor und zurück oder verlieren den Finger?
      </p>
    </div>
  );

  // ── Anleitung ─────────────────────────────────────────────────────────────
  if (phase === "anleitung") {
    return (
      <div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-4">
          <p className="font-semibold text-blue-900 mb-3">🚀 Augenfolgebewegungen — 3 Phasen</p>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>Ablauf:</strong> Erst das rechte Auge alleine, dann das linke, dann beide zusammen.</p>
            <p>Das Kind folgt der Rakete <strong>nur mit den Augen</strong> — Kopf bleibt still.</p>
            <p>Du hältst dabei locker eine Hand vor das jeweils andere Auge.</p>
            <p className="text-xs text-blue-600">Ab 5½ Jahren sollten die Augenbewegungen fließend sein.</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-xs text-amber-800">
          📹 <strong>Kamera-Tipp:</strong> Unten rechts in der Raketen-Animation siehst du das Gesicht deines Kindes —
          so kannst du die Augenbewegungen gut beobachten, auch wenn du hinter oder neben dem Bildschirm stehst.
        </div>
        <button
          onClick={() => setPhase("lauft_r")}
          className="w-full text-white font-bold py-4 rounded-xl text-lg"
          style={{ background: "#F5943A" }}
        >
          Starten — Rechtes Auge →
        </button>
      </div>
    );
  }

  // ── Rechtes Auge ─────────────────────────────────────────────────────────
  if (phase === "lauft_r") {
    return (
      <div>
        <div className="text-center text-sm font-bold mb-2" style={{ color: "#F5943A" }}>
          Phase 1/3 — Rechtes Auge
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-sm text-amber-800">
          <strong>Jetzt:</strong> Halte locker die Hand vor das <strong>linke</strong> Auge des Kindes.
          Das rechte Auge folgt alleine der Rakete.
        </div>
        <BeobachtungsHinweis auge="rechte" />
        <RaketeAnimation dauer={10} onFertig={() => setPhase("pause_r")} />
      </div>
    );
  }

  if (phase === "pause_r") {
    return (
      <div>
        <div className="text-center text-sm font-bold mb-3" style={{ color: "#F5943A" }}>
          Phase 1/3 — Rechtes Auge bewerten
        </div>
        <NochUnsicherHinweis />
        <BewertungsBlock
          bewertung={bewertungR} onBewertung={setBewertungR}
          kopf={kopfR} onKopf={setKopfR}
        />
        <button
          onClick={() => { if (bewertungR && kopfR !== null) setPhase("lauft_l"); }}
          disabled={!bewertungR || kopfR === null}
          className="w-full mt-4 text-white font-bold py-3 rounded-xl disabled:opacity-40"
          style={{ background: "#F5943A" }}
        >
          Weiter — Linkes Auge →
        </button>
      </div>
    );
  }

  // ── Linkes Auge ──────────────────────────────────────────────────────────
  if (phase === "lauft_l") {
    return (
      <div>
        <div className="text-center text-sm font-bold mb-2" style={{ color: "#F5943A" }}>
          Phase 2/3 — Linkes Auge
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-sm text-amber-800">
          <strong>Jetzt:</strong> Halte locker die Hand vor das <strong>rechte</strong> Auge des Kindes.
          Das linke Auge folgt alleine der Rakete.
        </div>
        <BeobachtungsHinweis auge="linke" />
        <RaketeAnimation dauer={10} onFertig={() => setPhase("pause_l")} />
      </div>
    );
  }

  if (phase === "pause_l") {
    return (
      <div>
        <div className="text-center text-sm font-bold mb-3" style={{ color: "#F5943A" }}>
          Phase 2/3 — Linkes Auge bewerten
        </div>
        <NochUnsicherHinweis />
        <BewertungsBlock
          bewertung={bewertungL} onBewertung={setBewertungL}
          kopf={kopfL} onKopf={setKopfL}
        />
        <button
          onClick={() => { if (bewertungL && kopfL !== null) setPhase("lauft_bino"); }}
          disabled={!bewertungL || kopfL === null}
          className="w-full mt-4 text-white font-bold py-3 rounded-xl disabled:opacity-40"
          style={{ background: "#F5943A" }}
        >
          Weiter — Beide Augen →
        </button>
      </div>
    );
  }

  // ── Binokulare Phase ──────────────────────────────────────────────────────
  if (phase === "lauft_bino") {
    return (
      <div>
        <div className="text-center text-sm font-bold mb-2" style={{ color: "#F5943A" }}>
          Phase 3/3 — Beide Augen
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3 text-sm text-green-800">
          <strong>Jetzt:</strong> Keine Hand mehr. <strong>Beide Augen</strong> folgen gemeinsam der Rakete.
        </div>
        <BeobachtungsHinweis auge="beide" />
        <RaketeAnimation dauer={12} onFertig={() => setPhase("bewertung")} />
      </div>
    );
  }

  if (phase === "bewertung") {
    return (
      <div>
        <div className="text-center text-sm font-bold mb-3" style={{ color: "#F5943A" }}>
          Phase 3/3 — Beide Augen bewerten
        </div>
        <NochUnsicherHinweis />
        <BewertungsBlock
          bewertung={bewertungBino} onBewertung={setBewertungBino}
          kopf={kopfBino} onKopf={setKopfBino}
        />
        <button
          onClick={abschliessen}
          disabled={!bewertungBino || kopfBino === null}
          className="w-full mt-4 text-white font-bold py-3 rounded-xl disabled:opacity-40"
          style={{ background: "#F5943A" }}
        >
          Augenfolge-Test abschließen →
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-10">
      <div className="text-5xl mb-3">✅</div>
      <p className="font-bold text-gray-900">Augenfolge-Test abgeschlossen!</p>
    </div>
  );
}
