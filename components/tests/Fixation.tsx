"use client";
import { useState, useEffect, useCallback } from "react";

interface Props {
  onFertig: (result: { reaktionszeit: number; genauigkeit: number }) => void;
}

export default function Fixation({ onFertig }: Props) {
  const [punkte, setPunkte] = useState<{ x: number; y: number; id: number }[]>([]);
  const [zeiten, setZeiten] = useState<number[]>([]);
  const [treffer, setTreffer] = useState(0);
  const [runde, setRunde] = useState(0);
  const [erschienZeit, setErschienZeit] = useState(0);
  const RUNDEN = 10;

  const naechsterPunkt = useCallback(() => {
    const x = 15 + Math.random() * 70;
    const y = 15 + Math.random() * 70;
    setPunkte([{ x, y, id: Date.now() }]);
    setErschienZeit(Date.now());
  }, []);

  useEffect(() => {
    const t = setTimeout(naechsterPunkt, 800);
    return () => clearTimeout(t);
  }, [naechsterPunkt]);

  // Leertaste als Alternative zur Maus
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" && punkte.length > 0) {
        e.preventDefault();
        klick(punkte[0].id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [punkte, erschienZeit, zeiten, treffer, runde]);

  function klick(id: number) {
    const reaktion = Date.now() - erschienZeit;
    setZeiten((prev) => [...prev, reaktion]);
    setTreffer((t) => t + 1);
    const naechste = runde + 1;
    setRunde(naechste);
    setPunkte([]);
    if (naechste >= RUNDEN) {
      const alle = [...zeiten, reaktion];
      const mittel = alle.reduce((a, b) => a + b, 0) / alle.length;
      setTimeout(() => onFertig({ reaktionszeit: mittel, genauigkeit: (treffer + 1) / RUNDEN }), 500);
    } else {
      setTimeout(naechsterPunkt, 600);
    }
  }

  function daneben() {
    setRunde((r) => {
      const naechste = r + 1;
      if (naechste >= RUNDEN) {
        const mittel = zeiten.length ? zeiten.reduce((a, b) => a + b, 0) / zeiten.length : 999;
        setTimeout(() => onFertig({ reaktionszeit: mittel, genauigkeit: treffer / RUNDEN }), 500);
      } else {
        setPunkte([]);
        setTimeout(naechsterPunkt, 600);
      }
      return naechste;
    });
  }

  return (
    <div>
      <div className="text-center mb-3 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "#E4F5F3", color: "#4A9E97" }}>
        👆 Klicke so schnell wie möglich auf den Superheldenstern 🌟 — oder drücke die <strong>Leertaste</strong>!
      </div>
      <div className="flex justify-between text-sm text-gray-500 mb-3">
        <span>Runde {Math.min(runde + 1, RUNDEN)} / {RUNDEN}</span>
        <span>Getroffen: {treffer}</span>
      </div>
      <div
        className="relative bg-gray-900 rounded-2xl overflow-hidden cursor-crosshair"
        style={{ height: "400px" }}
        onClick={daneben}
      >
        {punkte.map((p) => (
          <button
            key={p.id}
            onClick={(e) => { e.stopPropagation(); klick(p.id); }}
            className="absolute flex items-center justify-center text-white text-3xl animate-pulse"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              transform: "translate(-50%, -50%)",
              width: "72px", height: "72px",
              background: "rgba(245,148,58,0.85)",
              borderRadius: "50%",
              border: "3px solid #F5943A",
            }}
          >
            🌟
          </button>
        ))}
        {punkte.length === 0 && runde < RUNDEN && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-lg">
            Warte auf den nächsten Stern... ✨
          </div>
        )}
        {runde >= RUNDEN && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
            ✅ Fertig!
          </div>
        )}
      </div>
    </div>
  );
}
