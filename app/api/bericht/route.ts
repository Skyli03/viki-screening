import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface BerichtRequest {
  email: string;
  kindName: string;
  vikiTyp: string;
  gesamtScore: number;
  auffaelligkeiten: number;
  kategorien: { name: string; ampel: string; elternText: string }[];
}

export async function POST(request: NextRequest) {
  const body: BerichtRequest = await request.json();
  const { email, kindName, vikiTyp, gesamtScore, auffaelligkeiten, kategorien } = body;

  const systemeioKey = process.env.SYSTEMEIO_API_KEY;

  // ── 1. Systeme.io: Kontakt + Tag anlegen ────────────────────────────────
  if (systemeioKey) {
    try {
      await fetch("https://api.systeme.io/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": systemeioKey,
        },
        body: JSON.stringify({
          email,
          firstName: kindName !== "dein Kind" ? kindName : "",
          tags: [{ name: "viki-screening" }],
        }),
      });
    } catch (e) {
      console.error("Systeme.io Fehler:", e);
    }
  }

  // ── 2. Gmail SMTP: Report-Email an Elternteil ──────────────────────────
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: { user: smtpUser, pass: smtpPass },
      });
      const emailHtml = generateReportEmail(kindName, vikiTyp, gesamtScore, auffaelligkeiten, kategorien);
      await transporter.sendMail({
        from: `"VIKI Superblick" <${smtpUser}>`,
        to: email,
        subject: `Dein VIKI Superblick Screening-Bericht${kindName !== "dein Kind" ? ` für ${kindName}` : ""}`,
        html: emailHtml,
      });
    } catch (e) {
      console.error("Gmail SMTP Fehler:", e);
    }
  }

  return NextResponse.json({ success: true });
}

function generateReportEmail(
  kindName: string,
  vikiTyp: string,
  gesamtScore: number,
  auffaelligkeiten: number,
  kategorien: { name: string; ampel: string; elternText: string }[]
): string {
  const name = kindName !== "dein Kind" ? kindName : "dein Kind";
  const ampelFarbe = gesamtScore >= 71 ? "#16A34A" : gesamtScore >= 41 ? "#D97706" : "#DC2626";
  const auffaellig = kategorien.filter((k) => k.ampel !== "gruen");

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>VIKI Superblick Bericht</title></head>
<body style="margin:0;padding:20px;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:580px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <div style="background:#F5943A;padding:32px 40px;text-align:center;">
    <div style="font-size:40px;margin-bottom:8px;">🦸</div>
    <h1 style="color:white;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;">VIKI Superblick</h1>
    <p style="color:rgba(255,255,255,0.9);margin:6px 0 0;font-size:14px;">Persönlicher Screening-Bericht</p>
  </div>

  <!-- Inhalt -->
  <div style="padding:32px 40px;">
    <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 8px;">Hallo!</p>
    <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px;">
      Hier ist der VIKI Superblick Screening-Bericht für <strong>${name}</strong>.
      Danke, dass du dir die Zeit für diesen Test genommen hast!
    </p>

    <!-- Score-Box -->
    <div style="background:#F0F9F8;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <div style="font-size:11px;font-weight:700;color:#2D7A73;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Gesamt-Ergebnis</div>
      <div style="font-size:56px;font-weight:900;color:${ampelFarbe};line-height:1;">${gesamtScore}<span style="font-size:22px;font-weight:400;color:#6B7280;">/100</span></div>
      <div style="font-size:13px;color:#4A9E97;margin-top:8px;font-weight:600;">VIKI-Typ ${vikiTyp}</div>
      <div style="font-size:13px;color:#6B7280;margin-top:4px;">${auffaelligkeiten} von 6 Bereichen auffällig</div>
    </div>

    ${auffaellig.length > 0 ? `
    <!-- Auffällige Bereiche -->
    <div style="margin-bottom:24px;">
      <h3 style="color:#111827;font-size:15px;font-weight:700;margin:0 0 12px;">🔍 Bereiche mit Auffälligkeiten:</h3>
      ${auffaellig.map((k) => `
        <div style="background:#FFF7ED;border-left:3px solid #F5943A;border-radius:0 8px 8px 0;padding:12px 14px;margin-bottom:8px;">
          <div style="font-weight:700;color:#92400E;font-size:13px;margin-bottom:3px;">${k.name}</div>
          <div style="color:#78350F;font-size:13px;line-height:1.5;">${k.elternText}</div>
        </div>
      `).join("")}
    </div>
    ` : `
    <div style="background:#F0FDF4;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
      <p style="color:#16A34A;font-weight:600;margin:0;">✅ Alle Bereiche unauffällig — großartig!</p>
    </div>
    `}

    <!-- Wartelisten-CTA -->
    <div style="background:#FEF3E2;border:2px solid #F5943A;border-radius:14px;padding:24px;text-align:center;">
      <div style="display:inline-block;background:#F5943A;color:white;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;">🚀 Startet bald</div>
      <h3 style="color:#1F2937;font-size:18px;font-weight:800;margin:0 0 8px;">Der VIKI Superblick Kurs</h3>
      <p style="color:#6B7280;font-size:13px;margin:0 0 16px;line-height:1.5;">Gezieltes Augentraining für zuhause — entwickelt von Dr. Sarah Kopetzky, Funktionaloptometristin.</p>
      <a href="https://kurse.vikitraining.at/warteliste" style="display:inline-block;background:#F5943A;color:white;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">
        Unverbindlich auf die Warteliste →
      </a>
      <p style="color:#9CA3AF;font-size:11px;margin:10px 0 0;">Kostenlos · Unverbindlich · Frühbucher-Bonus inklusive</p>
    </div>
  </div>

  <!-- Footer -->
  <div style="background:#F9FAFB;padding:20px 40px;border-top:1px solid #E5E7EB;text-align:center;">
    <p style="color:#9CA3AF;font-size:12px;margin:0;line-height:1.6;">
      Dr. Sarah Kopetzky · Funktionaloptometristin<br>
      <a href="https://vikitraining.at" style="color:#9CA3AF;text-decoration:none;">vikitraining.at</a> ·
      <a href="mailto:hallo@vikitraining.at" style="color:#9CA3AF;text-decoration:none;">hallo@vikitraining.at</a><br>
      <a href="https://viki-screening.vercel.app/datenschutz" style="color:#9CA3AF;">Datenschutz</a> ·
      <a href="https://viki-screening.vercel.app/impressum" style="color:#9CA3AF;">Impressum</a>
    </p>
  </div>

</div>
</body>
</html>`;
}
