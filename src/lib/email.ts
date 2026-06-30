import nodemailer from "nodemailer";

export async function sendEmail(to: string, code: string): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.log(`[EMAIL] GMAIL_USER or GMAIL_APP_PASSWORD not set. To: ${to}, Code: ${code}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"Smart-Shartnoma" <${user}>`,
    to,
    subject: `Tasdiqlash kodi: ${code}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f4f7f4;border-radius:16px">
        <h2 style="color:#1a3d2d;margin:0 0 4px;font-size:22px">Smart<span style="color:#22c55e">Shartnoma</span></h2>
        <p style="color:#666;margin:0 0 28px;font-size:13px">Tasdiqlash kodi</p>

        <div style="background:#fff;border-radius:12px;padding:28px 32px;text-align:center;border:1px solid #e2e8e2">
          <p style="margin:0 0 10px;font-size:13px;color:#888">Kirish uchun kodingiz:</p>
          <div style="font-size:44px;font-weight:900;letter-spacing:14px;color:#1a3d2d;line-height:1">${code}</div>
          <p style="margin:12px 0 0;font-size:11px;color:#aaa">Kod 10 daqiqa amal qiladi</p>
        </div>

        <p style="margin:24px 0 0;font-size:12px;color:#aaa;text-align:center">
          Agar siz so'ramagan bo'lsangiz, bu xatni e'tiborsiz qoldiring.<br/>
          Smart-Shartnoma © ${new Date().getFullYear()}
        </p>
      </div>`,
  });
}
