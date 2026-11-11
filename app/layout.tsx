import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import CookieHinweis from "./components/CookieHinweis";

export const metadata: Metadata = {
  title: "VIKI Superblick — Kostenloser Augen-Check für dein Kind",
  description: "Erste Orientierung in 15 Minuten: Spielen visuelle Schwierigkeiten beim Lesen und Lernen deines Kindes eine Rolle? Kostenloser Online-Augen-Check von vikitraining.at",
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
