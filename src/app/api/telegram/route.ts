import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const TOKEN = () => process.env.TELEGRAM_BOT_TOKEN!;

function normalizePhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("998") && d.length >= 11) return d.slice(0, 12);
  if (d.startsWith("0") && d.length === 10) return "998" + d.slice(1);
  if (d.length === 9) return "998" + d;
  return d;
}

async function tg(method: string, body: object) {
  await fetch(`https://api.telegram.org/bot${TOKEN()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** Show /start welcome with a single "Share phone" contact button */
async function sendWelcome(chatId: number) {
  await tg("sendMessage", {
    chat_id: chatId,
    text:
      "Salom! *Smart-Shartnoma* botiga xush kelibsiz.\n\n" +
      "Ro'yxatdan o'tish kodini olish uchun quyidagi tugmani bosing:",
    parse_mode: "Markdown",
    reply_markup: {
      keyboard: [
        [{ text: "📱 Telefon raqamni ulashish", request_contact: true }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
}

async function sendCode(chatId: number, phone: string) {
  const record = await db.phoneVerification.findUnique({ where: { phone } });

  if (!record) {
    await tg("sendMessage", {
      chat_id: chatId,
      text:
        `*${phone}* raqami uchun tasdiqlash kodi topilmadi.\n\n` +
        `Avval saytda ro'yxatdan o'tishni boshlang:\nhttps://smart-shartnoma.vercel.app/register`,
      parse_mode: "Markdown",
      reply_markup: { remove_keyboard: true },
    });
    return;
  }

  if (record.expiresAt < new Date()) {
    await tg("sendMessage", {
      chat_id: chatId,
      text: "Kodning muddati tugagan. Iltimos, saytda qayta kod so'rang.",
      reply_markup: { remove_keyboard: true },
    });
    return;
  }

  await tg("sendMessage", {
    chat_id: chatId,
    text:
      `✅ *Smart-Shartnoma* tasdiqlash kodingiz:\n\n` +
      `\`${record.code}\`\n\n` +
      `_Kod 10 daqiqa ichida amal qiladi._`,
    parse_mode: "Markdown",
    reply_markup: { remove_keyboard: true },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;
    if (!message?.chat?.id) return NextResponse.json({ ok: true });

    const chatId: number = message.chat.id;

    // User shared contact via button
    if (message.contact?.phone_number) {
      const phone = normalizePhone(message.contact.phone_number);
      await sendCode(chatId, phone);
      return NextResponse.json({ ok: true });
    }

    const text: string = message.text?.trim() ?? "";

    if (text === "/start" || text === "") {
      await sendWelcome(chatId);
      return NextResponse.json({ ok: true });
    }

    // User typed a phone number manually (fallback)
    const phone = normalizePhone(text);
    if (phone.length >= 9 && /^\d+$/.test(phone)) {
      await sendCode(chatId, phone);
    } else {
      await sendWelcome(chatId);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}

// One-time webhook registration: GET /api/telegram with x-setup-secret header
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-setup-secret");
  if (!secret || secret !== process.env.TELEGRAM_SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const webhookUrl = `${process.env.NEXTAUTH_URL}/api/telegram`;
  const res = await fetch(`https://api.telegram.org/bot${TOKEN()}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl }),
  });
  return NextResponse.json(await res.json());
}
