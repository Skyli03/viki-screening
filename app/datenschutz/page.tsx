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
          <p className="text-sm text-gray-500 mb-8">Stand: April 2026 · Gemäß DSGVO (EU) 2016/679</p>

          <div className="space-y-8 text-gray-700 text-sm leading-relaxed">

            <div>
              <h2 className="font-bold text-gray-900 text-base mb-2">1. Verantwortliche Person</h2>
              <p>Dr. Sarah Kopetzky · vikitraining.at · WTG 18 GmbH · Wiedtalgasse 18 · 4694 Ohlsdorf · hallo@vikitraining.at</p>
            </div>

            <div>
              <h2 className="font-bold text-gray-900 text-base mb-2">2. Welche Daten wir verarbeiten</h2>
              <p className="mb-2">Im Rahmen des kostenlosen Sehtests verarbeiten wir folgende Daten:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li><strong>Vorname des Kindes</strong> — nur lokal im Browser gespeichert, wird nicht übertragen</li>
                <li><strong>Schulstufe</strong> — nur lokal im Browser gespeichert</li>
                <li><strong>Testergebnisse</strong> — werden ausschließlich lokal im Browser verarbeitet und nicht auf unseren Servern gespeichert</li>
                <li><strong>E-Mail-Adresse</strong> — wenn du den vollständigen Bericht anforderst, wird deine E-Mail-Adresse an unseren E-Mail-Marketing-Dienst systeme.io (EU) übermittelt.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-gray-900 text-base mb-2">3. E-Mail-Marketing (systeme.io)</h2>
              <p>Wenn du deine E-Mail-Adresse eingibst, um den vollständigen Bericht zu erhalten, stimmst du zu, dass diese Adresse an systeme.io (Frankreich/EU) übermittelt und dort gespeichert wird. Du erhältst dann den Bericht sowie hilfreiche Informationen rund um das Thema visuelle Verarbeitung bei Kindern. Du kannst dich jederzeit über den Abmeldelink in jeder E-Mail abmelden.</p>
              <p className="mt-2">Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</p>
            </div>

            <div>
              <h2 className="font-bold text-gray-900 text-base mb-2">4. Hosting</h2>
              <p>Diese Website wird über Vercel Inc. (San Francisco, USA) gehostet. Vercel verarbeitet beim Aufruf der Seite technische Daten (IP-Adresse, Browsertyp, Zeitstempel). Vercel ist unter dem EU-U.S. Data Privacy Framework zertifiziert.</p>
            </div>

            <div>
              <h2 className="font-bold text-gray-900 text-base mb-2">5. Deine Rechte</h2>
              <p>Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit. Wende dich dazu an: <a href="mailto:hallo@vikitraining.at" className="underline" style={{ color: "#F5943A" }}>hallo@vikitraining.at</a></p>
              <p className="mt-2">Du hast außerdem das Recht, Beschwerde bei der österreichischen Datenschutzbehörde einzulegen: <a href="https://www.dsb.gv.at" className="underline" style={{ color: "#F5943A" }}>dsb.gv.at</a></p>
            </div>

            <div>
              <h2 className="font-bold text-gray-900 text-base mb-2">6. Cookies</h2>
              <p>Diese Website verwendet keine Tracking-Cookies. Es werden ausschließlich technisch notwendige Session-Daten im Browser-Speicher (sessionStorage) abgelegt, die beim Schließen des Tabs automatisch gelöscht werden.</p>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <a href="/" className="text-sm font-semibold" style={{ color: "#F5943A" }}>← Zurück zum Sehtest</a>
          </div>
        </div>
      </main>
    </div>
  );
}
