"use client";
import { useState } from "react";
import VideoEmbed from "@/components/VideoEmbed";
import type { DoppeltAbstand, KonvergenzErgebnis, KonvergenzZeichen } from "@/lib/screening-types";
import { Achtungbox, Auswahl, Frageblock, Infobox, SchrittKopf, WeiterKnopf } from "@/components/ui";

interface Props {
  kindName: string;
  onFertig: (ergebnis: KonvergenzErgebnis) => void;
}

const ZEICHEN: { id: KonvergenzZeichen; label: string }[] = [
  { id: "schaut_weg", label: "Mein Kind hat weggeschaut oder stark geblinzelt" },
  { id: "anstrengend", label: "Mein Kind fand die Übung anstrengend" },
];

export default function StiftUebung({ kindName, onFertig }: Props) {
  const [phase, setPhase] = useState<"anleitung" | "bewertung">("anleitung");
  const [augen, setAugen] = useState<KonvergenzErgebnis["augen"] | null>(null);
  const [doppelt, setDoppelt] = useState<DoppeltAbstand | null>(null);
  const [zeichen, setZeichen] = useState<KonvergenzZeichen[]>([]);

  function toggle(id: KonvergenzZeichen) {
    setZeichen(z => (z.includes(id) ? z.filter(x => x !== id) : [...z, id]));
  }

  if (phase === "anleitung") {
    return (
      <div>
        <SchrittKopf emoji="✏️" titel="Stift-Übung" unter="Wie gut arbeiten beide Augen in der Nähe zusammen?" />
        <div className="space-y-4 mb-6">
          <Infobox>💡 Beim Lesen schauen beide Augen gemeinsam auf denselben Buchstaben und drehen sich dafür leicht nach innen. Klappt diese Teamarbeit nicht gut, kann Lesen schnell anstrengend werden.</Infobox>
          <VideoEmbed src="/videos/konvergenz.mp4" />
          <ol className="space-y-2 text-gray-700">
            <li><strong>1.</strong> Klebe einen kleinen Sticker auf die Stiftspitze oder mal einen kleinen Buchstaben drauf. So hat {kindName} etwas Genaues zum Anschauen.</li>
            <li><strong>2.</strong> Halte den Stift etwa 30 cm vor die Nase von {kindName}, auf Augenhöhe.</li>
            <li><strong>3.</strong> Sag vorher: „Schau auf den Sticker und sag sofort Stopp, wenn du zwei Stifte siehst.“</li>
            <li><strong>4.</strong> Führe den Stift langsam Richtung Nase. Bei „Stopp“ hältst du den Stift still und misst den Abstand von der Stiftspitze bis zur Nase. Dann wieder zurück. Das Ganze 3×.</li>
          </ol>
          <p className="text-sm text-gray-600">📏 <strong>Hinweis:</strong> Am einfachsten geht das mit einem Lineal aus der Schultasche. Kein Lineal zur Hand? Nimm eine Bankkarte: Die kurze Seite ist gut 5 cm lang, die lange Seite gut 8,5 cm. Auf den Millimeter kommt es nicht an.</p>
          <Achtungbox titel="👀 Darauf achtest du:">
            <ul className="space-y-1">
              <li>• Gehen beide Augen gleichmäßig nach innen?</li>
              <li>• Rutscht ein Auge nach außen weg?</li>
              <li>• Ab welchem Abstand sieht {kindName} zwei Stifte? Ganz nah vor der Nase ist das normal.</li>
            </ul>
          </Achtungbox>
          <p className="text-sm text-gray-500 text-center">Tipp: Lies dir alles durch, leg dann das Handy weg und mach die Übung.</p>
        </div>
        <WeiterKnopf onClick={() => setPhase("bewertung")}>Erledigt → Beobachtung eintragen</WeiterKnopf>
      </div>
    );
  }

  return (
    <div>
      <SchrittKopf emoji="📋" titel="Was hast du beobachtet?" />
      <div className="space-y-4 mb-6">
        <Frageblock frage={`Wie sind die Augen von ${kindName} dem Stift gefolgt?`}>
          <Auswahl label="Beide gleichmäßig nach innen" ton="gut" aktiv={augen === "gleichmaessig"} onClick={() => setAugen("gleichmaessig")} />
          <Auswahl label="Ein Auge ist kurz ausgewichen" sub="Kurz nach außen gerutscht, dann wieder mitgegangen" ton="mittel" aktiv={augen === "weicht_kurz_aus"} onClick={() => setAugen("weicht_kurz_aus")} />
          <Auswahl label="Ein Auge ist deutlich ausgewichen" sub="Klar nach außen weggegangen oder konnte gar nicht folgen" ton="stark" aktiv={augen === "weicht_deutlich_aus"} onClick={() => setAugen("weicht_deutlich_aus")} />
        </Frageblock>
        <Frageblock frage={`Ab wann hat ${kindName} zwei Stifte gesehen?`}>
          <Auswahl label="Gar nicht oder erst ganz nah" sub="Näher als ca. 6 cm (etwa die kurze Seite einer Bankkarte). Das ist normal." ton="gut" aktiv={doppelt === "nah_oder_nie"} onClick={() => setDoppelt("nah_oder_nie")} />
          <Auswahl label="Etwas früher" sub="Ca. 6–10 cm" ton="mittel" aktiv={doppelt === "daumen_bis_hand"} onClick={() => setDoppelt("daumen_bis_hand")} />
          <Auswahl label="Schon weit weg" sub="Mehr als ca. 10 cm (deutlich weiter als die lange Seite einer Bankkarte)" ton="stark" aktiv={doppelt === "weit"} onClick={() => setDoppelt("weit")} />
          <Auswahl label="Weiß nicht" sub="Mein Kind konnte es nicht sagen" aktiv={doppelt === "unklar"} onClick={() => setDoppelt("unklar")} />
        </Frageblock>
        <Frageblock frage="Ist dir noch etwas aufgefallen? (Mehrfachauswahl, darf auch leer bleiben)">
          {ZEICHEN.map(z => (
            <Auswahl key={z.id} label={z.label} ton="mittel" aktiv={zeichen.includes(z.id)} onClick={() => toggle(z.id)} />
          ))}
        </Frageblock>
      </div>
      <WeiterKnopf disabled={!augen || !doppelt} onClick={() => augen && doppelt && onFertig({ augen, doppelt, zeichen })}>Weiter →</WeiterKnopf>
    </div>
  );
}
