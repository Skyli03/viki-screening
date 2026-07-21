import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface BerichtRequest {
  email: string;
  kindName: string;
  vikiTyp: string;
  gesamtScore: number;
  auffaelligkeiten: number;
  kategorien: { name: string; ampel: string; elternText: string }[];
  musterHinweise?: { titel: string; text: string; staerke: string }[];
  blinzelinfo?: { label: string; ampel: string; elternText: string };
}

const AMPEL_LABEL: Record<string, string> = {
  gruen: "✅ Unauffällig",
  gelb:  "🟡 Auffällig",
  rot:   "🔴 Förderbedarf",
};

const AMPEL_COLOR: Record<string, string> = {
  gruen: "#16A34A",
  gelb:  "#D97706",
  rot:   "#DC2626",
};

export async function POST(request: NextRequest) {
  const body: BerichtRequest = await request.json();
  const { email, kindName, vikiTyp, gesamtScore, auffaelligkeiten, kategorien, musterHinweise, blinzelinfo } = body;

  const systemeioKey = process.env.SYSTEMEIO_API_KEY;
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
      const emailHtml = generateReportEmail(kindName, vikiTyp, gesamtScore, auffaelligkeiten, kategorien, musterHinweise ?? [], blinzelinfo);
      await transporter.sendMail({
        from: `"VIKI Superblick" <${smtpUser}>`,
        to: email,
        subject: `Dein VIKI Superblick Bericht${kindName !== "dein Kind" ? ` für ${kindName}` : ""}`,
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
  kategorien: { name: string; ampel: string; elternText: string }[],
  musterHinweise: { titel: string; text: string; staerke: string }[],
  blinzelinfo?: { label: string; ampel: string; elternText: string }
): string {
  const name = kindName !== "dein Kind" ? kindName : "dein Kind";
  const ampelFarbe = gesamtScore >= 71 ? "#16A34A" : gesamtScore >= 41 ? "#D97706" : "#DC2626";
  const ampelLabel = gesamtScore >= 71 ? "Unauffällig" : gesamtScore >= 41 ? "Auffällig" : "Förderbedarf";
  const auffaellig = kategorien.filter(k => k.ampel !== "gruen");
  const unauffaellig = kategorien.filter(k => k.ampel === "gruen");

  const kategorienHtml = kategorien.map(k => `
    <div style="border-left:4px solid ${AMPEL_COLOR[k.ampel] ?? "#9CA3AF"};padding:12px 16px;margin-bottom:12px;background:#FAFAFA;border-radius:0 8px 8px 0;">
      <div style="font-weight:700;font-size:13px;color:#111827;margin-bottom:4px;">
        ${AMPEL_LABEL[k.ampel] ?? ""} &nbsp; ${k.name}
      </div>
      <div style="font-size:13px;color:#374151;line-height:1.6;">${k.elternText}</div>
    </div>
  `).join("");

  const musterHtml = musterHinweise.length > 0 ? `
    <div style="margin-bottom:24px;">
      <h3 style="color:#111827;font-size:15px;font-weight:700;margin:0 0 12px;">🔎 Erkannte Muster</h3>
      ${musterHinweise.map(m => `
        <div style="background:${m.staerke === "stark" ? "#FEF2F2" : "#FFF7ED"};border:1px solid ${m.staerke === "stark" ? "#FCA5A5" : "#FED7AA"};border-radius:10px;padding:14px 16px;margin-bottom:10px;">
          <div style="font-weight:700;font-size:13px;color:${m.staerke === "stark" ? "#991B1B" : "#92400E"};margin-bottom:5px;">
            ${m.staerke === "stark" ? "⚠️" : "💡"} ${m.titel}
          </div>
          <div style="font-size:13px;color:${m.staerke === "stark" ? "#7F1D1D" : "#78350F"};line-height:1.6;">${m.text}</div>
        </div>
      `).join("")}
    </div>
  ` : "";

  const blinzelHtml = blinzelinfo ? `
    <div style="background:#F0F9FF;border:1px solid #BAE6FD;border-radius:10px;padding:14px 16px;margin-bottom:24px;">
      <div style="font-weight:700;font-size:13px;color:#0369A1;margin-bottom:4px;">
        👁️ Blinzelverhalten am Bildschirm — ${blinzelinfo.label}
      </div>
      <div style="font-size:13px;color:#0C4A6E;line-height:1.6;">${blinzelinfo.elternText}</div>
    </div>
  ` : "";

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>VIKI Superblick Bericht</title></head>
<body style="margin:0;padding:20px;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <div style="background:#F5943A;padding:32px 40px;text-align:center;">
    <div style="font-size:40px;margin-bottom:8px;">🦸</div>
    <h1 style="color:white;margin:0;font-size:24px;font-weight:800;">VIKI Superblick</h1>
    <p style="color:rgba(255,255,255,0.9);margin:6px 0 0;font-size:14px;">Persönlicher Screening-Bericht</p>
  </div>

  <div style="padding:32px 40px;">
    <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 6px;">Hallo!</p>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Hier ist der vollständige VIKI Superblick Screening-Bericht für <strong>${name}</strong>.
      Danke, dass du dir die Zeit für diesen Test genommen hast — und dafür, dass du genau hinschaust.
    </p>

    <!-- Gesamt-Score -->
    <div style="background:#F9FAFB;border:2px solid ${ampelFarbe};border-radius:14px;padding:20px 24px;text-align:center;margin-bottom:28px;">
      <div style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Gesamt-Ergebnis</div>
      <div style="font-size:52px;font-weight:900;color:${ampelFarbe};line-height:1;">${gesamtScore}<span style="font-size:20px;font-weight:400;color:#9CA3AF;">/100</span></div>
      <div style="display:inline-block;background:${ampelFarbe};color:white;font-size:12px;font-weight:700;padding:4px 14px;border-radius:20px;margin-top:10px;">${ampelLabel}</div>
      <div style="font-size:13px;color:#6B7280;margin-top:8px;">${auffaelligkeiten} von 6 Bereichen auffällig · VIKI-Typ ${vikiTyp}</div>
    </div>

    ${musterHtml}

    <!-- Alle Bereiche -->
    <div style="margin-bottom:28px;">
      <h3 style="color:#111827;font-size:15px;font-weight:700;margin:0 0 14px;">Auswertung — alle 6 Bereiche</h3>
      ${kategorienHtml}
    </div>

    ${auffaellig.length === 0 ? `
    <div style="background:#F0FDF4;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
      <p style="color:#16A34A;font-weight:600;margin:0;">✅ Alle 6 Bereiche unauffällig — großartig!</p>
    </div>
    ` : ""}

    <!-- Was jetzt? -->
    <div style="background:#FEF3E2;border:1px solid #FED7AA;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <h3 style="color:#92400E;font-size:15px;font-weight:700;margin:0 0 10px;">Was tun mit diesen Ergebnissen?</h3>
      <ol style="margin:0;padding-left:18px;font-size:13px;color:#78350F;line-height:1.8;">
        <li>Lies den Bericht in Ruhe durch — du wirst jetzt verstehen, warum manche Dinge für dein Kind schwieriger sind.</li>
        <li>Bei Auffälligkeiten unterstützt gezieltes Visualtraining inkl. Reflexintegration — es schafft die neuromotorische Basis für müheloses Lesen &amp; entspanntes Lernen.</li>
      </ol>
    </div>

    <!-- CTA -->
    <div style="background:#FEF3E2;border:2px solid #F5943A;border-radius:14px;padding:24px;text-align:center;">
      <div style="display:inline-block;background:#F5943A;color:white;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;">🚀 Startet bald</div>
      <h3 style="color:#1F2937;font-size:18px;font-weight:800;margin:0 0 8px;">Der VIKI Superblick Kurs</h3>
      <p style="color:#6B7280;font-size:13px;margin:0 0 16px;line-height:1.5;">
        Mit Visualtraining die Basis für müheloses Lesen &amp; entspanntes Lernen legen — entwickelt von Dr. Sarah Kopetzky, Funktionaloptometristin.
      </p>
      <a href="https://kurse.vikitraining.at/superblick-kurs" target="_blank" style="display:inline-block;background:#F5943A;color:white;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;mso-padding-alt:0;line-height:48px;">
        Kurs ansehen →
      </a>
    </div>
  </div>

  <!-- Disclaimer -->
  <div style="padding:0 40px 24px;">
    <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:16px 18px;">
      <p style="font-size:11px;font-weight:700;color:#374151;margin:0 0 6px;">⚠️ Rechtlicher Hinweis</p>
      <p style="font-size:11px;color:#6B7280;line-height:1.6;margin:0 0 8px;">
        Der VIKI Superblick Screening-Test dient ausschließlich der <strong>unverbindlichen Erstorientierung</strong> und stellt <strong>keine medizinische oder optometrische Diagnose</strong> dar. Die Ergebnisse basieren auf Elternbeobachtung und können Fehler enthalten. Eine professionelle Untersuchung kann durch dieses Tool nicht ersetzt werden. Bei deutlichen Auffälligkeiten (rote Bereiche) wird eine Vorstellung bei einem Funktionaloptometristen empfohlen.
      </p>
      <p style="font-size:11px;color:#6B7280;line-height:1.6;margin:0;">
        <strong>Datenschutz:</strong> Testergebnisse werden nicht auf Servern gespeichert. Deine E-Mail wird nur für diesen Bericht und VIKI-Informationen genutzt. Abmeldung jederzeit: <a href="mailto:hallo@vikitraining.at" style="color:#9CA3AF;">hallo@vikitraining.at</a>
      </p>
    </div>
  </div>

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
