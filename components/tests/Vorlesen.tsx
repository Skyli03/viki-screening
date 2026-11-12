"use client";
import { useState } from "react";
import type { LeseErgebnis } from "@/lib/screening-types";
import { Achtungbox, Auswahl, Frageblock, Infobox, SchrittKopf, WeiterKnopf } from "@/components/ui";

interface Props {
  kindName: string;
  onFertig: (ergebnis: LeseErgebnis) => void;
}

export default function Vorlesen({ kindName, onFertig }: Props) {
  const [phase, setPhase] = useState<"anleitung" | "bewertung">("anleitung");
  const [fluessig, setFluessig] = useState<boolean | null>(null);
  const [zeile, setZeile] = useState<boolean | null>(null);
  const [finger, setFinger] = useState<boolean | null>(null);
  const [haltung, setHaltung] = useState<LeseErgebnis["haltung"] | null>(null);

  if (phase === "anleitung") {
    return (
      <div>
        <SchrittKopf emoji="📖" titel="Vorlesen" unter={`${kindName} liest dir 1 Minute aus einem Buch vor, das es kennt. Du schaust einfach zu.`} />
        <div className="space-y-4 mb-6">
          <Infobox>💡 Beim Vorlesen sieht man am besten, wie die Augen Zeile für Zeile arbeiten: mit echtem Papier, echtem Abstand und echtem Licht.</Infobox>
          <Achtungbox titel="👀 Darauf achtest du:">
            <ul className="space-y-1">
              <li>• Liest {kindName} flüssig oder holprig?</li>
              <li>• Geht die Zeile verloren, werden Wörter übersprungen?</li>
              <li>• Hilft der Finger beim Mitlesen?</li>
              <li>• Ist der Kopf sehr nah am Buch oder schief?</li>
            </ul>
          </Achtungbox>
          <p className="text-sm text-gray-500 text-center">Kein Druck, kein Üben vorher. Es geht nur ums Zuschauen.</p>
        </div>
        <WeiterKnopf onClick={() => setPhase("bewertung")}>{kindName} hat vorgelesen → Beobachtung eintragen</WeiterKnopf>
      </div>
    );
  }

  const fertig = fluessig !== null && zeile !== null && finger !== null && haltung !== null;

  return (
    <div>
      <SchrittKopf emoji="📋" titel="Was hast du beobachtet?" />
      <div className="space-y-4 mb-6">
        <Frageblock frage={`Wie hat ${kindName} gelesen?`}>
          <div className="grid grid-cols-2 gap-2">
            <Auswahl label="Flüssig und sicher" ton="gut" aktiv={fluessig === true} onClick={() => setFluessig(true)} />
            <Auswahl label="Holprig, mit Mühe" ton="mittel" aktiv={fluessig === false} onClick={() => setFluessig(false)} />
          </div>
        </Frageblock>
        <Frageblock frage="Ging die Zeile verloren oder wurden Wörter übersprungen?">
          <div className="grid grid-cols-2 gap-2">
            <Auswahl label="Nein, kaum" ton="gut" aktiv={zeile === false} onClick={() => setZeile(false)} />
            <Auswahl label="Ja, mehrmals" ton="mittel" aktiv={zeile === true} onClick={() => setZeile(true)} />
          </div>
        </Frageblock>
        <Frageblock frage="Hat der Finger beim Mitlesen geholfen?">
          <div className="grid grid-cols-2 gap-2">
            <Auswahl label="Nein" ton="gut" aktiv={finger === false} onClick={() => setFinger(false)} />
            <Auswahl label="Ja" ton="mittel" aktiv={finger === true} onClick={() => setFinger(true)} />
          </div>
        </Frageblock>
        <Frageblock frage="Abstand und Kopfhaltung?">
          <Auswahl label="Unauffällig" sub="Etwa eine Unterarmlänge Abstand, Kopf gerade" ton="gut" aktiv={haltung === "unauffaellig"} onClick={() => setHaltung("unauffaellig")} />
          <Auswahl label="Auffällig" sub="Sehr nah am Buch, Kopf schief oder Abstand wechselt ständig" ton="mittel" aktiv={haltung === "auffaellig"} onClick={() => setHaltung("auffaellig")} />
        </Frageblock>
      </div>
      <WeiterKnopf
        disabled={!fertig}
        onClick={() => fertig && onFertig({ fluessig: fluessig!, zeile_verloren: zeile!, finger: finger!, haltung: haltung! })}
      >
        Weiter →
      </WeiterKnopf>
    </div>
  );
}
