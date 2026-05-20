"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface Props {
  onFertig: (result: { reaktionszeit: number; trefferquote: number }) => void;
}

const RUNDEN = 12;
const POSITIONEN = [
  { x: "8%", y: "20%" }, { x: "88%", y: "20%" }, { x: "8%", y: "75%" }, { x: "88%", y: "75%" },
  { x: "15%", y: "45%" }, { x: "82%", y: "45%" }, { x: "45%", y: "12%" }, { x: "45%", y: "82%" },
  { x: "20%", y: "25%" }, { x: "76%", y: "65%" }, { x: "70%", y: "18%" }, { x: "22%", y: "70%" },
];

export default function PeripheresSehen({ onFertig }: Props) {
  const [phase, setPhase] = useState<"bereit" | "countdown" | "warten" | "aktiv" | "verpasst" | "fertig">("bereit");
  const [countdown, setCountdown] = useState(3);
  const [runde, setRunde] = useState(0);
  const [treffer, setTreffer] = useState(0);
  const [zeiten, setZeiten] = useState<number[]>([]);
  const [stimulusPos, setStimulusPos] = useState<{ x: string; y: string } | null>(null);
  const erschienRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const phaseRef = useRef(phase);
  const stimulusPosRef = useRef(stimulusPos);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { stimulusPosRef.current = stimulusPos; }, [stimulusPos]);

  const naechsteRunde = useCallback((aktRunde: number, aktTreffer: number, aktZeiten: number[]) => {
    if (aktRunde >= RUNDEN) {
      const mittel = aktZeiten.length ? aktZeiten.reduce((a, b) => a + b, 0) / aktZeiten.length : 2000;
      setTimeout(() => onFertig({ reaktionszeit: mittel, trefferquote: aktTreffer / RUNDEN }), 500);
      setPhase("fertig");
      return;
    }
    setPhase("warten");
    setStimulusPos(null);
    const delay = 1000 + Math.random() * 1500;
    timeoutRef.current = setTimeout(() => {
      const pos = POSITIONEN[aktRunde % POSITIONEN.length];
      setStimulusPos(pos);
      erschienRef.current = Date.now();
      setPhase("aktiv");
      timeoutRef.current = setTimeout(() => {
        setStimulusPos(null);
        setPhase("verpasst");
        setTimeout(() => {
          setPhase("warten");
          naechsteRunde(aktRunde + 1, aktTreffer, aktZeiten);
          setRunde(aktRunde + 1);
        }, 600);
      }, 1800);
    }, delay);
  }, [onFertig]);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  // Leertaste
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" && phaseRef.current === "aktiv" && stimulusPosRef.current) {
        e.preventDefault();
        stimulusKlick();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zeiten, treffer, runde]);

  function starten() {
    setPhase("countdown");
    setCountdown(3);
    let c = 3;
    const iv = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(iv);
        setRunde(0);
        setTreffer(0);
        setZeiten([]);
        naechsteRunde(0, 0, []);
      }
    }, 1000);
  }

  function stimulusKlick() {
    if (phaseRef.current !== "aktiv" || !stimulusPosRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const reaktion = Date.now() - erschienRef.current;
    const neueZeiten = [...zeiten, reaktion];
    const neueTreffer = treffer + 1;
    setTreffer(neueTreffer);
    setZeiten(neueZeiten);
    setStimulusPos(null);
    const naechste = runde + 1;
    setRunde(naechste);
    naechsteRunde(naechste, neueTreffer, neueZeiten);
  }

  return (
    <div>
      {/* Anleitung oben — immer sichtbar während Spiel */}
      {(phase === "warten" || phase === "aktiv") && (
        <div className="text-center mb-3 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "#E4F5F3", color: "#4A9E97" }}>
          👁️ Schau auf den <strong>weißen Punkt</strong> in der Mitte — klicke auf ⚡ wenn du ihn siehst, oder drücke die <strong>Leertaste</strong>!
          <span className="ml-3 text-gray-400">Runde {Math.min(runde + 1, RUNDEN)} / {RUNDEN}</span>
        </div>
      )}

      <div
        className="relative bg-gray-900 rounded-2xl overflow-hidden select-none"
        style={{ height: "380px" }}
      >
        {/* Fixationspunkt Mitte */}
        {(phase === "warten" || phase === "aktiv") && (
          <div className="absolute w-6 h-6 bg-white rounded-full shadow-lg"
            style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} />
        )}

        {/* Verpasst-Feedback */}
        {phase === "verpasst" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-red-400 opacity-80 animate-pulse">
              Ups! 👀
            </span>
          </div>
        )}

        {/* Peripherer Stimulus */}
        {stimulusPos && (
          <button
            onClick={stimulusKlick}
            className="absolute text-3xl"
            style={{
              left: stimulusPos.x, top: stimulusPos.y,
              transform: "translate(-50%, -50%)",
              animation: "ping 0.8s ease-in-out infinite",
              background: "none", border: "none", cursor: "pointer",
            }}
          >
            ⚡
          </button>
        )}

        {/* Startscreen */}
        {phase === "bereit" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white p-6">
              <p className="text-lg mb-1 font-semibold">Superhelden-Radar 📡</p>
              <p className="text-sm text-gray-300 mb-6">
                Schau immer auf den <strong>weißen Punkt</strong> in der Mitte.<br />
                Sobald am Rand ein ⚡ aufleuchtet — drauf klicken<br />
                oder die <strong>Leertaste</strong> drücken!
              </p>
              <button onClick={starten} className="text-white font-bold px-8 py-3 rounded-xl text-lg" style={{ background: "#F5943A" }}>
                Starten →
              </button>
            </div>
          </div>
        )}

        {/* Countdown */}
        {phase === "countdown" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <p className="text-gray-400 mb-2 text-sm">Schau auf den Mittelpunkt…</p>
              <div className="text-8xl font-black" style={{ color: "#F5943A" }}>{countdown}</div>
            </div>
          </div>
        )}

        {phase === "fertig" && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
            ✅ Super gemacht!
          </div>
        )}
      </div>
    </div>
  );
}
