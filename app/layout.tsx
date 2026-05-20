import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIKI Superblick — Kostenloser Sehtest für dein Kind",
  description: "Finde in 15 Minuten heraus, ob dein Kind visuelle Verarbeitungsprobleme hat. Kostenloser Online-Test von vikitraining.at",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
