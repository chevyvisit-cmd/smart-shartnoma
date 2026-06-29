import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function normalizePhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("998") && d.length >= 11) return d.slice(0, 12);
  if (d.startsWith("0") && d.length === 10) return "998" + d.slice(1);
  if (d.length === 9) return "998" + d;
  return d;
}

async function sendMessage(chatId: number, text: string, parseMode = "Markdown") {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;
    if (!message?.text || !message?.chat?.id) {
      return NextResponse.json({ ok: true });
    }

    const chatId: number = message.chat.id;
    const text: string = message.text.trim();

    if (text === "/start") {
      await sendMessage(
        chatId,
        "Salom\\! *Smart\\-Shartnoma* botiga xush kelibsiz\\.\n\n" +
          "Ro'yxatdan o'tish kodini olish uchun *telefon raqamingizni* yuboring\\.\n" +
          "Masalan: `\\+998901234567`",
        "MarkdownV2",
      );
      return NextResponse.json({ ok: true });
    }

    // Try to parse as phone number
    const phone = normalizePhone(text);
    if (phone.length < 9 || !/^\d+$/.test(phone)) {
      await sendMessage(
        chatId,
        "Telefon raqami noto'g'ri formatda\\.\n\nMasalan: `\\+998901234567`",
        "MarkdownV2",
      );
      return NextResponse.json({ ok: true });
    }

    const record = await db.phoneVerification.findUnique({ where: { phone } });

    if (!record) {
      await sendMessage(
        chatId,
        `*${phone}* raqami uchun tasdiqlash kodi topilmadi\\.\n\nAvval saytda ro'yxatdan o'tishni boshlang:\nhttps://smart\\-shartnoma\\.vercel\\.app/register`,
        "MarkdownV2",
      );
      return NextResponse.json({ ok: true });
    }

    if (record.expiresAt < new Date()) {
      await sendMessage(
        chatId,
        "Kodning muddati tugagan\\. Iltimos, saytda qayta kod so'rang\\.",
        "MarkdownV2",
      );
      return NextResponse.json({ ok: true });
    }

    await sendMessage(
      chatId,
      `✅ *Smart\\-Shartnoma* tasdiqlash kodingiz:\n\n` +
        `\`${record.code}\`\n\n` +
        `_Kod 10 daqiqa ichida amal qiladi\\._`,
      "MarkdownV2",
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook error:", err);
    // Always return 200 so Telegram doesn't retry endlessly
    return NextResponse.json({ ok: true });
  }
}

// One-time webhook setup: GET /api/telegram?setup=1
// Only works with TELEGRAM_SETUP_SECRET header
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-setup-secret");
  if (!secret || secret !== process.env.TELEGRAM_SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });

  const webhookUrl = `${process.env.NEXTAUTH_URL}/api/telegram`;
  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl }),
  });
  const data = await res.json();
  return NextResponse.json(data);
}
