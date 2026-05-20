"use client";
import { useState, useEffect, useRef } from "react";

interface Props {
  onFertig: (result: { ergebnis: "normal" | "auffaellig" | "stark_auffaellig" }) => void;
}

type Phase = "anleitung" | "animation" | "bewertung" | "fertig";

export default function VergenzTest({ onFertig }: Props) {
  const [phase, setPhase] = useState<Phase>("anleitung");
  const [animSchritt, setAnimSchritt] = useState(0);
  const [kameraAktiv, setKameraAktiv] = useState(false);
  const [auswahl, setAuswahl] = useState<"normal" | "auffaellig" | "stark_auffaellig" | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Kamera automatisch starten wenn Animation beginnt
  // (Erlaubnis wurde bereits in KameraCheck erteilt)
  useEffect(() => {
    if (phase !== "animation") return;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: 320, height: 240 }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        setKameraAktiv(true);
      })
      .catch(() => {
        // Ohne Kamera weitermachen — kein Fehler für User
        setKameraAktiv(false);
      });

    return () => kameraBeenden();
  }, [phase]);

  // srcObject setzen sobald Video-Element im DOM ist
  useEffect(() => {
    if (kameraAktiv && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [kameraAktiv]);

  function animationStarten() {
    // Sofort zur Animation-Phase wechseln — Countdown läuft auf dunklem Hintergrund
    setPhase("animation");
    setCountdown(3);
    let cd = 3;
    const cdInterval = setInterval(() => {
      cd -= 1;
      if (cd <= 0) {
        clearInterval(cdInterval);
        setCountdown(null);
        setAnimSchritt(0);
        // Animation: 0→100 (nah) → 0 (fern) → 100 (nah) = 3 Durchläufe = ~18 Sek
        let schritt = 0;
        animRef.current = setInterval(() => {
          schritt += 1;
          setAnimSchritt(schritt);
          if (schritt >= 300) {
            if (animRef.current) clearInterval(animRef.current);
            setTimeout(() => {
              kameraBeenden();
              setKameraAktiv(false);
              setPhase("bewertung");
            }, 600);
          }
        }, 60); // 18 Sekunden Gesamtdauer (3 Durchläufe × 6 Sek)
      } else {
        setCountdown(cd);
      }
    }, 1000);
  }

  function kameraBeenden() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      if (animRef.current) clearInterval(animRef.current);
      kameraBeenden();
    };
  }, []);

  function abschicken() {
    if (!auswahl) return;
    setPhase("fertig");
    setTimeout(() => onFertig({ ergebnis: auswahl }), 800);
  }

  // Oszillation: 0–100 vorwärts, 100–200 rückwärts, 200–300 vorwärts
  const phase100 = animSchritt % 200;
  const normiert = phase100 <= 100 ? phase100 : 200 - phase100; // 0→100→0→100...
  const punktGroesse = 30 + normiert * 0.6;
  const punktOpacity = animSchritt < 5 ? animSchritt / 5 : 1;

  if (phase === "anleitung") {
    return (
      <div>
        <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-5 mb-5">
          <p className="text-sm font-semibold text-teal-800 mb-3">
            👀 Dieser Test prüft, ob beide Augen beim Nahsehen zusammenarbeiten (Konvergenz).
          </p>
          <div className="space-y-3 text-sm text-teal-700">
            <div className="flex gap-3">
              <span className="text-lg">1️⃣</span>
              <span>Setze dein Kind <strong>gerade vor den Bildschirm</strong>, ca. 50 cm Abstand.</span>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">2️⃣</span>
              <span>Gleich erscheint ein Punkt, der sich langsam annähert. <strong>Das Kind schaut den Punkt an.</strong></span>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">3️⃣</span>
              <span>Du beobachtest dabei die <strong>Augen deines Kindes</strong>. Die Kamera zeigt dir dein Kind auf dem Bildschirm.</span>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">4️⃣</span>
              <span>Achte: Folgen <strong>beide Augen gleichmäßig</strong>? Oder weicht ein Auge aus?</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
          <strong>Was ist Konvergenz?</strong> Beim Lesen müssen beide Augen nach innen rotieren, um auf nahen Text zu fokussieren. Gelingt das nicht, verschwimmen Buchstaben oder erscheinen doppelt — auch wenn die Sehschärfe beim Augenarzt normal war.
        </div>

        <button
          onClick={animationStarten}
          className="w-full text-white font-bold py-4 rounded-xl text-lg"
          style={{ background: "#F5943A" }}
        >
          Test starten →
        </button>
      </div>
    );
  }

  if (phase === "animation") {
    return (
      <div>
        <div
          className="text-center mb-3 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: "#E4F5F3", color: "#4A9E97" }}
        >
          👀 Beobachte jetzt die <strong>Augen deines Kindes</strong> — folgen beide gleichmäßig dem Punkt?
        </div>

        <div className="flex gap-3">
          {/* Animationsfeld */}
          <div
            className="relative bg-gray-900 rounded-2xl overflow-hidden flex-1"
            style={{ height: "300px" }}
          >
            {countdown !== null ? (
              /* Countdown auf dunklem Hintergrund */
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-8xl font-black" style={{ color: "#F5943A" }}>{countdown}</div>
                <p className="text-sm mt-3 font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Kind vor Bildschirm positionieren…</p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: `${75 - normiert * 0.35}%`,
                    transform: "translate(-50%, -50%)",
                    width: `${punktGroesse}px`,
                    height: `${punktGroesse}px`,
                    borderRadius: "50%",
                    background: "#F5943A",
                    opacity: punktOpacity,
                    boxShadow: `0 0 ${punktGroesse * 0.5}px rgba(245,148,58,0.6)`,
                  }}
                />
                {/* Nase-Markierung */}
                <div style={{ position: "absolute", left: "50%", bottom: "10px", transform: "translateX(-50%)", color: "#6B7280", fontSize: "10px" }}>
                  ▲ Nase
                </div>
                {/* Fortschrittsbalken */}
                <div style={{ position: "absolute", bottom: 0, left: 0, height: "3px", width: `${(animSchritt / 300) * 100}%`, background: "#8DCDC5", transition: "width 60ms linear" }} />
              </>
            )}
          </div>

          {/* Kamera PIP */}
          {kameraAktiv ? (
            <div className="rounded-2xl overflow-hidden bg-gray-800 flex-shrink-0 flex flex-col" style={{ width: "110px", height: "300px" }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "100%", flex: 1, objectFit: "cover", transform: "scaleX(-1)" }}
              />
              <div style={{ padding: "4px", textAlign: "center", fontSize: "9px", color: "rgba(255,255,255,0.6)" }}>
                👁️ Dein Kind
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-800 flex-shrink-0 flex flex-col items-center justify-center gap-2 text-center"
              style={{ width: "110px", height: "300px", padding: "8px" }}>
              <span style={{ fontSize: "28px" }}>👀</span>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", lineHeight: 1.3 }}>
                Schau direkt auf die Augen deines Kindes
              </span>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-2">
          {animSchritt < 100 ? "Punkt nähert sich… 👀" : animSchritt < 200 ? "Punkt zieht sich zurück…" : "Nochmal nähern… fast fertig!"}
        </p>
      </div>
    );
  }

  if (phase === "bewertung") {
    return (
      <div>
        {/* Alternativ-Beobachtungstipp */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
          <p className="font-semibold text-sm text-amber-900 mb-2">💡 Noch unsicher? So kannst du es nochmals direkt beobachten:</p>
          <div className="space-y-2 text-sm text-amber-800">
            <p>Stell dich gegenüber deinem Kind auf. Halte einen Finger vor seine Nasenspitze und bewege ihn langsam Richtung Nase (bis auf ca. 10 cm Abstand) und anschließend wieder zurück (auf ca. 30 cm Abstand). Wiederhole das Ganze 2–3×.</p>
            <p>👉 <strong>Worauf du achtest:</strong> Drehen sich beide Augen gleichmäßig nach innen zur Nase, wenn der Finger näher kommt? Oder weicht ein Auge aus bzw. bewegt sich nicht richtig mit?</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 p-5" style={{ borderColor: "#8DCDC5" }}>
          <p className="font-semibold text-gray-900 mb-2 text-center text-lg">
            Was hast du beobachtet?
          </p>
          <p className="text-sm text-gray-500 text-center mb-5">
            Wie haben sich die Augen deines Kindes verhalten, als der Punkt sich annäherte?
          </p>

          <div className="flex flex-col gap-3 mb-5">
            {[
              {
                wert: "normal" as const,
                emoji: "😊",
                titel: "Beide Augen folgten gleichmäßig",
                detail: "Die Augen bewegten sich symmetrisch nach innen, ohne abzuweichen.",
              },
              {
                wert: "auffaellig" as const,
                emoji: "🤔",
                titel: "Ein Auge wich manchmal aus",
                detail: "Manchmal sprang ein Auge weg oder blinzelte häufiger. Kind wirkte angestrengt.",
              },
              {
                wert: "stark_auffaellig" as const,
                emoji: "😟",
                titel: "Deutliches Ausweichen / Doppelbilder",
                detail: "Ein Auge wich klar aus, Kind schaute weg oder meldete Doppelbilder.",
              },
            ].map((opt) => (
              <button
                key={opt.wert}
                onClick={() => setAuswahl(opt.wert)}
                className="p-4 rounded-xl border-2 text-left transition-all flex gap-3 items-start"
                style={
                  auswahl === opt.wert
                    ? { borderColor: "#8DCDC5", background: "#E4F5F3" }
                    : { borderColor: "#E5E7EB" }
                }
              >
                <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{opt.titel}</div>
                  <div className="text-xs text-gray-500 mt-1">{opt.detail}</div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={abschicken}
            disabled={auswahl === null}
            className="w-full text-white font-bold py-3 rounded-xl disabled:opacity-40"
            style={{ background: "#F5943A" }}
          >
            Weiter →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <div className="text-5xl mb-3">✅</div>
      <p className="font-bold text-gray-900">Konvergenztest abgeschlossen!</p>
    </div>
  );
}
