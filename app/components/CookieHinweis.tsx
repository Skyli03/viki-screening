"use client";
import { useEffect, useState } from "react";

export default function CookieHinweis() {
  const [sichtbar, setSichtbar] = useState(false);

  useEffect(() => {
    const bestaetigt = localStorage.getItem("cookieHinweisBestaetigt");
    if (!bestaetigt) setSichtbar(true);
  }, []);

  function bestaetigen() {
    localStorage.setItem("cookieHinweisBestaetigt", "true");
    setSichtbar(false);
  }

  if (!sichtbar) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 px-4 pb-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <p className="text-sm text-gray-600 leading-relaxed flex-1">
          Diese Seite verwendet <strong>keine Tracking-Cookies</strong>. Wir speichern nur technisch notwendige Daten lokal in deinem Browser, damit der Test funktioniert. Mehr dazu in unserer{" "}
          <a href="/datenschutz" className="underline font-semibold" style={{ color: "#F5943A" }}>
            Datenschutzerklärung
          </a>.
        </p>
        <button
          onClick={bestaetigen}
          className="shrink-0 rounded-full px-5 py-2 text-sm font-bold text-white"
          style={{ background: "#F5943A" }}
        >
          Verstanden
        </button>
      </div>
    </div>
  );
}
