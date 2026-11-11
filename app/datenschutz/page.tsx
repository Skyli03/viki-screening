export default function Datenschutz() {
  return (
    <div className="min-h-screen" style={{ background: "#F0ECE7" }}>
      <header className="bg-white shadow-sm py-2 px-6">
        <div className="max-w-3xl mx-auto">
          <a href="/"><img src="/logo.png" alt="VIKI Training" className="h-14 w-auto" /></a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Datenschutzerklärung</h1>
          <p className="text-sm text-gray-500 mb-8">Stand: November 2026 · Gemäß DSGVO (EU) 2016/679</p>

          <div className="space-y-8 text-gray-700 text-sm leading-relaxed">

            <div>
              <h2 className="font-bold text-gray-900 text-base mb-2">1. Verantwortliche Person</h2>
              <p>Dr. Sarah Kopetzky · vikitraining.at · WTG 18 GmbH · Wiedtalgasse 18 · 4694 Ohlsdorf · hallo@vikitraining.at</p>
            </div>

            <div>
              <h2 className="font-bold text-gray-900 text-base mb-2">2. Welche Daten wir verarbeiten</h2>
              <p className="mb-2">Im Rahmen des kostenlosen Augen-Checks verarbeiten wir folgende Daten:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li><strong>Vorname des Kindes, Schulstufe und Antworten im Check</strong> — werden während des Checks nur lokal in deinem Browser gespeichert. Die Auswertung passiert ebenfalls in deinem Browser.</li>
                <li><strong>Ergebnisbericht</strong> — nur wenn du den vollständigen Bericht per E-Mail anforderst, werden der Vorname deines Kindes und die Auswertung an unseren Server übermittelt, um daraus die Bericht-E-Mail zu erstellen und an dich zu senden (siehe Punkt 3). Wir legen dafür keine eigene Datenbank an.</li>
                <li><strong>E-Mail-Adresse</strong> — wenn du den vollständigen Bericht anforderst, wird deine E-Mail-Adresse (ohne Namen und ohne Ergebnisse deines Kindes) an unseren E-Mail-Marketing-Dienst systeme.io übermittelt (siehe Punkt 4).</li>
              </ul>
              <p className="mt-2">Die Ergebnisse des Checks betreffen die Entwicklung deines Kindes und können als Gesundheitsdaten gelten. Wir verarbeiten sie deshalb nur mit deiner ausdrücklichen Einwilligung (Art. 6 Abs. 1 lit. a und Art. 9 Abs. 2 lit. a DSGVO), die du beim Anfordern des Berichts erteilst.</p>
            </div>

            <div>
              <h2 className="font-bold text-gray-900 text-base mb-2">3. Versand des Berichts (Google)</h2>
              <p>Die Bericht-E-Mail wird über unser E-Mail-Postfach bei Google (Google Workspace / Gmail, Google Ireland Ltd.) verschickt. Dabei verarbeitet Google den Inhalt der E-Mail (Vorname des Kindes, Ergebnisse) und deine E-Mail-Adresse. Eine Kopie der gesendeten E-Mail kann in unserem Postfach verbleiben. Google ist unter dem EU-U.S. Data Privacy Framework zertifiziert.</p>
              <p className="mt-2">Rechtsgrundlage: deine Einwilligung (Art. 6 Abs. 1 lit. a, Art. 9 Abs. 2 lit. a DSGVO). Du kannst sie jederzeit per E-Mail an hallo@vikitraining.at widerrufen.</p>
            </div>

            <div>
              <h2 className="font-bold text-gray-900 text-base mb-2">4. E-Mail-Marketing (systeme.io)</h2>
              <p>Wenn du den Bericht anforderst und einwilligst, wird deine E-Mail-Adresse an systeme.io (Frankreich/EU) übermittelt und dort gespeichert. Du erhältst dann hilfreiche Informationen rund um visuelle Wahrnehmung, Lernen und Angebote von VIKI Training. Du kannst dich jederzeit über den Abmeldelink in jeder E-Mail abmelden.</p>
              <p className="mt-2">Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</p>
            </div>

            <div>
              <h2 className="font-bold text-gray-900 text-base mb-2">5. Hosting und Nutzungsstatistik (Vercel)</h2>
              <p>Diese Website wird über Vercel Inc. (San Francisco, USA) gehostet. Vercel verarbeitet beim Aufruf der Seite technische Daten (IP-Adresse, Browsertyp, Zeitstempel). Außerdem nutzen wir Vercel Web Analytics, um anonym zu zählen, wie oft Seiten aufgerufen werden. Dabei werden keine Cookies gesetzt und keine Profile über einzelne Besucher*innen erstellt. Vercel ist unter dem EU-U.S. Data Privacy Framework zertifiziert.</p>
              <p className="mt-2">Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am sicheren Betrieb und an der Verbesserung der Website)</p>
            </div>

            <div>
              <h2 className="font-bold text-gray-900 text-base mb-2">6. Deine Rechte</h2>
              <p>Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und auf Widerruf deiner Einwilligung mit Wirkung für die Zukunft. Wende dich dazu an: <a href="mailto:hallo@vikitraining.at" className="underline" style={{ color: "#F5943A" }}>hallo@vikitraining.at</a></p>
              <p className="mt-2">Du hast außerdem das Recht, Beschwerde bei der österreichischen Datenschutzbehörde einzulegen: <a href="https://www.dsb.gv.at" className="underline" style={{ color: "#F5943A" }}>dsb.gv.at</a></p>
            </div>

            <div>
              <h2 className="font-bold text-gray-900 text-base mb-2">7. Cookies</h2>
              <p>Diese Website verwendet keine Tracking-Cookies. Es werden ausschließlich technisch notwendige Daten im Browser-Speicher abgelegt: die Daten des Checks im sessionStorage (wird beim Schließen des Tabs automatisch gelöscht) und, ob du den Hinweis zu Cookies bestätigt hast (localStorage).</p>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <a href="/" className="text-sm font-semibold" style={{ color: "#F5943A" }}>← Zurück zum Augen-Check</a>
          </div>
        </div>
      </main>
    </div>
  );
}
