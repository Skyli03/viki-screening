"use client";
import { useState, useRef, useEffect } from "react";

interface Props {
  kindName: string;
  onWeiter: () => void;
}

export default function KameraCheck({ kindName, onWeiter }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<"erklaerung" | "kamera">("erklaerung");
  const [status, setStatus] = useState<"warten" | "ok" | "fehler">("warten");
  const [fehlerText, setFehlerText] = useState("");

  useEffect(() => {
    if (phase !== "kamera") return;
    kameraStarten();
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
    };
  }, [phase]);

  async function kameraStarten() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStatus("ok");
      }
    } catch (e) {
      setStatus("fehler");
      const err = e as { name?: string };
      if (err.name === "NotAllowedError") {
        setFehlerText("Du hast die Kamera-Erlaubnis nicht erteilt. Bitte klicke oben in der Browser-Leiste auf das Kamera-Symbol und erlaube den Zugriff.");
      } else if (err.name === "NotFoundError") {
        setFehlerText("Keine Kamera gefunden. Bitte stelle sicher, dass dein Laptop oder Computer eine eingebaute oder angesteckte Kamera hat.");
      } else {
        setFehlerText("Die Kamera konnte nicht gestartet werden. Bitte schließe andere Programme die die Kamera nutzen (z.B. Zoom) und lade die Seite neu.");
      }
    }
  }

  if (phase === "erklaerung") {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">📷</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Kamera einrichten</h2>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
          Der Lesetest misst die Augenbewegungen von <strong>{kindName}</strong> über die Kamera.
          Das Bild bleibt ausschließlich auf deinem Gerät — es wird <strong>nichts gespeichert oder übertragen</strong>.
        </p>
        <div className="bg-orange-50 rounded-xl p-5 max-w-md mx-auto mb-8 text-left">
          <p className="font-semibold text-gray-900 mb-3">💡 So gelingt der Test am besten:</p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✔️ Helles Licht von vorne (kein Gegenlicht)</li>
            <li>✔️ {kindName} sitzt ca. 50–60 cm vom Bildschirm entfernt</li>
            <li>✔️ Gesicht gut sichtbar, Bildschirm auf Augenhöhe</li>
            <li>✔️ Ruhige Umgebung ohne Ablenkungen</li>
          </ul>
        </div>
        <button
          onClick={() => setPhase("kamera")}
          className="bg-primary hover:bg-primary-dark text-white font-bold text-xl px-10 py-4 rounded-xl transition-colors shadow-md"
        >
          Kamera starten →
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="text-5xl mb-4">📷</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Kamera wird geprüft</h2>
      <p className="text-gray-600 mb-8">
        Stelle sicher, dass <strong>{kindName}</strong> gut beleuchtet ist und das Gesicht klar sichtbar ist.
      </p>

      {/* Kamera-Vorschau */}
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video max-w-md mx-auto mb-6">
        <video
          ref={videoRef}
          className="w-full h-full object-cover scale-x-[-1]"
          muted
          playsInline
        />
        {status === "warten" && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-4xl mb-2 animate-pulse">📷</div>
              <p>Kamera wird gestartet...</p>
            </div>
          </div>
        )}
      </div>

      {status === "fehler" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left max-w-md mx-auto">
          <div className="font-semibold text-red-800 mb-1">⚠️ Kamera nicht verfügbar</div>
          <p className="text-red-700 text-sm">{fehlerText}</p>
          <button
            onClick={kameraStarten}
            className="mt-3 text-sm font-semibold text-red-700 underline"
          >
            Nochmal versuchen
          </button>
        </div>
      )}

      {status === "ok" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 max-w-md mx-auto">
          <p className="text-green-800 font-semibold">✅ Kamera funktioniert!</p>
          <p className="text-green-700 text-sm mt-1">
            Stelle sicher, dass {kindName} gut beleuchtet ist und das Gesicht klar zu sehen ist.
          </p>
        </div>
      )}

      {/* Anleitung */}
      <div className="bg-orange-50 rounded-xl p-5 max-w-md mx-auto mb-8 text-left">
        <p className="font-semibold text-gray-900 mb-3">💡 So gelingt der Test am besten:</p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✔️ Helles Licht von vorne (kein Gegenlicht)</li>
          <li>✔️ {kindName} sitzt ca. 60 cm vom Bildschirm entfernt</li>
          <li>✔️ Gesicht gut sichtbar in der Kamera</li>
          <li>✔️ Ruhige Umgebung ohne Ablenkungen</li>
        </ul>
      </div>

      <button
        onClick={onWeiter}
        disabled={status !== "ok"}
        className="bg-primary hover:bg-primary-dark text-white font-bold text-xl px-10 py-4 rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Weiter zum Lesetest →
      </button>
    </div>
  );
}
