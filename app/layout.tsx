import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import CookieHinweis from "./components/CookieHinweis";

export const metadata: Metadata = {
  title: "Kostenloser Augen-Check für dein Kind | VIKI Training",
  description: "Erste Orientierung in ca. 10–12 Minuten: Spielt die Zusammenarbeit der Augen beim Lesen deines Kindes eine Rolle? Kostenloser Online-Augen-Check von VIKI Training, keine Diagnose.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-white min-h-screen antialiased">
        {children}
        <CookieHinweis />
        <Analytics />
      </body>
    </html>
  );
}
