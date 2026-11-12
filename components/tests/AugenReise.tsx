"use client";
import { useState } from "react";
import VideoEmbed from "@/components/VideoEmbed";
import type { AugenReiseErgebnis } from "@/lib/screening-types";
import { Achtungbox, Auswahl, Frageblock, Infobox, SchrittKopf, WeiterKnopf } from "@/components/ui";

interface Props {
  kindName: string;
  onFertig: (ergebnis: AugenReiseErgebnis) => void;
}

// Folgebewegung + Blicksprünge in einer Übung, ohne Timer:
// Eltern geben selbst das Tempo vor und sagen "links"/"rechts" an.

export default function AugenReise({ kindName, onFertig }: Props) {
  const [phase, setPhase] = useState<"anleitung" | "bewertung">("anleitung");
  const [folgen, setFolgen] = useState<AugenReiseErgebnis["folgen"] | null>(null);
  const [springen, setSpringen] = useState<AugenReiseErgebnis["springen"] | null>(null);
  const [kopf, setKopf] = useState<boolean | null>(null);

  if (phase === "anleitung") {
    return (
      <div>
        <SchrittKopf emoji="🚀" titel="Augen-Reise" unter={`Zwei kurze Teile. ${kindName} bewegt nur die Augen, der Kopf bleibt still.`} />
        <div className="space-y-4 mb-6">
          <Infobox>💡 Beim Lesen gleiten die Augen die Zeile entlang und springen von Wort zu Wort. Sind diese Bewegungen ungenau, geht die Zeile leichter verloren.</Infobox>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="font-semibold text-gray-900 mb-2">Teil 1: Dem Stift folgen</p>
            <VideoEmbed src="/videos/augenbewegung.mp4" />
            <p className="text-gray-700">Führe einen Stift in etwa 30 cm Abstand langsam von links nach rechts und schräg von unten links nach oben rechts, jeweils 2× hin und her. {kindName} folgt nur mit den Augen.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="font-semibold text-gray-900 mb-2">Teil 2: Blicksprünge</p>
            <VideoEmbed src="/videos/blicksprung.mp4" />
            <p className="text-gray-700">Halte zwei Stifte etwa schulterbreit auseinander, auf Augenhöhe. Sag abwechselnd „links“ und „rechts“, insgesamt 6×. {kindName} springt mit den Augen zum genannten Stift.</p>
          </div>

          <Achtungbox titel="👀 Darauf achtest du:">
            <ul className="space-y-1">
              <li>• Gleiten die Augen ruhig mit oder ruckeln sie?</li>
              <li>• Landen die Augen direkt auf dem Stift oder suchen sie nach?</li>
              <li>• Bewegt sich der Kopf mit?</li>
            </ul>
          </Achtungbox>
        </div>
        <WeiterKnopf onClick={() => setPhase("bewertung")}>Erledigt → Beobachtung eintragen</WeiterKnopf>
      </div>
    );
  }

  const fertig = folgen !== null && springen !== null && kopf !== null;

  return (
    <div>
      <SchrittKopf emoji="📋" titel="Was hast du beobachtet?" />
      <div className="space-y-4 mb-6">
        <Frageblock frage="Teil 1: Wie sind die Augen dem Stift gefolgt?">
          <Auswahl label="Ruhig und gleichmäßig" ton="gut" aktiv={folgen === "fluessig"} onClick={() => setFolgen("fluessig")} />
          <Auswahl label="Ruckelig, mit kleinen Pausen" ton="mittel" aktiv={folgen === "ruckelig"} onClick={() => setFolgen("ruckelig")} />
          <Auswahl label="Haben den Stift verloren und gesucht" ton="stark" aktiv={folgen === "verliert"} onClick={() => setFolgen("verliert")} />
        </Frageblock>
        <Frageblock frage="Teil 2: Wie genau haben die Augen den Stift getroffen?">
          <Auswahl label="Direkt und genau" ton="gut" aktiv={springen === "praezise"} onClick={() => setSpringen("praezise")} />
          <Auswahl label="Etwas zu weit, dann kleine Korrektur" ton="mittel" aktiv={springen === "korrigiert"} onClick={() => setSpringen("korrigiert")} />
          <Auswahl label="Mehrere kleine Bewegungen, bis sie ankommen" ton="stark" aktiv={springen === "sucht"} onClick={() => setSpringen("sucht")} />
        </Frageblock>
        <Frageblock frage="Hat sich der Kopf mitbewegt?">
          <div className="grid grid-cols-2 gap-2">
            <Auswahl label="Nein, blieb still" ton="gut" aktiv={kopf === false} onClick={() => setKopf(false)} />
            <Auswahl label="Ja, ging mit" ton="mittel" aktiv={kopf === true} onClick={() => setKopf(true)} />
          </div>
        </Frageblock>
        <p className="text-sm text-gray-500 text-center">Unsicher? Wähl das, was am ehesten gepasst hat.</p>
      </div>
      <WeiterKnopf disabled={!fertig} onClick={() => fertig && onFertig({ folgen: folgen!, springen: springen!, kopf_mitbewegt: kopf! })}>
        Weiter →
      </WeiterKnopf>
    </div>
  );
}
