export default function Impressum() {
  return (
    <div className="min-h-screen" style={{ background: "#F0ECE7" }}>
      <header className="bg-white shadow-sm py-2 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="/"><img src="/logo.png" alt="VIKI Training" className="h-14 w-auto" /></a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Impressum</h1>

          <p className="text-sm text-gray-500 mb-6">Angaben gemäß § 5 ECG (E-Commerce-Gesetz)</p>

          <div className="space-y-6 text-gray-700">
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Betreiberin</h2>
              <p>Dr. Sarah Kopetzky</p>
              <p>Funktionaloptometristin & Visualtrainerin</p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Unternehmensträger</h2>
              <p>WTG 18 GmbH</p>
              <p>Wiedtalgasse 18</p>
              <p>4694 Ohlsdorf, Österreich</p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Kontakt</h2>
              <p>E-Mail: <a href="mailto:hallo@vikitraining.at" className="underline" style={{ color: "#F5943A" }}>hallo@vikitraining.at</a></p>
              <p>Website: <a href="https://vikitraining.at" className="underline" style={{ color: "#F5943A" }}>vikitraining.at</a></p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Berufsbezeichnung</h2>
              <p>Funktionaloptometristin, Visualtrainerin, ENWAKO-Therapeutin</p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-1">UID-Nummer</h2>
              <p>ATU 77517849</p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Haftungsausschluss</h2>
              <p className="text-sm leading-relaxed">
                Dieses Tool dient ausschließlich der orientierenden Selbsteinschätzung und ersetzt keine professionelle augenärztliche oder optometrische Untersuchung. Bei Verdacht auf Sehprobleme wende dich bitte an eine Fachperson.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Urheberrecht</h2>
              <p className="text-sm leading-relaxed">
                Alle Inhalte dieser Website (Texte, Grafiken, Logos) sind urheberrechtlich geschützt. Eine Verwendung ohne ausdrückliche schriftliche Genehmigung ist untersagt.
              </p>
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
