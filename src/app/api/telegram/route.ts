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

/* ── Main menu ──────────────────────────────────────────────── */
async function sendMainMenu(chatId: number, firstName = "") {
  const name = firstName ? ` ${firstName}` : "";
  await tg("sendMessage", {
    chat_id: chatId,
    text:
      `Salom${name}! 👋\n\n` +
      `*Smart-Shartnoma* — JShShIR va telefon raqam orqali qonuniy elektron shartnomalar tuzish platformasi.\n\n` +
      `Quyidan bo'limni tanlang:`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "📄 Shartnoma nima?", callback_data: "what" }],
        [{ text: "❓ Nima uchun kerak?", callback_data: "why" }],
        [{ text: "⚙️ Qanday ishlaydi?", callback_data: "how" }],
        [{ text: "✅ Ro'yxatdan o'tish kodi olish", callback_data: "code" }],
      ],
    },
  });
}

/* ── Section texts ──────────────────────────────────────────── */
const SECTIONS: Record<string, { text: string; emoji: string }> = {
  what: {
    emoji: "📄",
    text:
      `*Shartnoma nima?*\n\n` +
      `Shartnoma — ikki yoki undan ortiq tomon o'rtasida tuzilgan *yozma kelishuv*. ` +
      `U qonun kuchiga ega hujjat bo'lib, har bir tomoning huquq va majburiyatlarini belgilaydi.\n\n` +
      `Smart-Shartnoma orqali siz:\n` +
      `• Elektron shartnoma tuzasiz\n` +
      `• SMS-OTP orqali ikki tomon imzolaydi\n` +
      `• Hujjat qonuniy kuchga ega bo'ladi\n` +
      `• Istalgan vaqt yuklab olish mumkin`,
  },
  why: {
    emoji: "❓",
    text:
      `*Nima uchun shartnoma kerak?*\n\n` +
      `⚖️ *Huquqiy himoya* — nizo yuzaga kelsa, sud dalili bo'lib xizmat qiladi\n\n` +
      `💳 *To'lov kafolati* — ish narxi va muddati oldindan belgilanadi\n\n` +
      `📋 *Aniq majburiyatlar* — kim, nima, qachon qilishi hujjatda ko'rsatiladi\n\n` +
      `🤝 *Ishonchli hamkorlik* — professional munosabat o'rnatiladi`,
  },
  how: {
    emoji: "⚙️",
    text:
      `*Qanday ishlaydi?*\n\n` +
      `1️⃣ *Ro'yxatdan o'ting* — JShShIR va telefon raqam bilan\n\n` +
      `2️⃣ *Shartnoma matnini tanlang* — tayyor shablon yoki o'zingiznikini yozing\n\n` +
      `3️⃣ *Ikkinchi tomonga yuboring* — telefon raqami yoki ID orqali\n\n` +
      `4️⃣ *SMS-OTP tasdiqlash* — ikki tomon ham tasdiqlaydi\n\n` +
      `5️⃣ *Elektron imzo* — shartnoma qonuniy kuchga ega bo'ladi\n\n` +
      `6️⃣ *Tarix va nazorat* — istalgan vaqt ko'rish va yuklab olish`,
  },
};

async function sendSection(chatId: number, key: string, messageId?: number) {
  const s = SECTIONS[key];
  if (!s) return;
  const body = {
    chat_id: chatId,
    text: s.text,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "⬅️ Orqaga", callback_data: "menu" },
          { text: "✅ Kod olish", callback_data: "code" },
        ],
      ],
    },
  };
  if (messageId) {
    await tg("editMessageText", { ...body, message_id: messageId });
  } else {
    await tg("sendMessage", body);
  }
}

/* ── Code request: show phone share button ──────────────────── */
async function sendCodeRequest(chatId: number, messageId?: number) {
  if (messageId) {
    // Remove inline keyboard from the previous message first
    await tg("editMessageReplyMarkup", {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: { inline_keyboard: [] },
    });
  }
  await tg("sendMessage", {
    chat_id: chatId,
    text: "Telefon raqamingizni ulashing — bot tasdiqlash kodini yuboradi:",
    reply_markup: {
      keyboard: [[{ text: "📱 Telefon raqamni ulashish", request_contact: true }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
}

/* ── Send OTP code to user ──────────────────────────────────── */
async function sendOtpCode(chatId: number, rawPhone: string) {
  const phone = normalizePhone(rawPhone);
  const record = await db.phoneVerification.findUnique({ where: { phone } });

  if (!record) {
    await tg("sendMessage", {
      chat_id: chatId,
      text:
        `*${phone}* raqami uchun faol tasdiqlash kodi topilmadi.\n\n` +
        `Avval saytda ro'yxatdan o'tishni boshlang 👇`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "🌐 Saytga o'tish", url: "https://smart-shartnoma.vercel.app/register" }]],
      },
    });
    return;
  }

  if (record.expiresAt < new Date()) {
    await tg("sendMessage", {
      chat_id: chatId,
      text: "⏱ Kodning muddati tugagan. Saytda qayta kod so'rang.",
      reply_markup: {
        inline_keyboard: [[{ text: "🌐 Saytga o'tish", url: "https://smart-shartnoma.vercel.app/register" }]],
      },
    });
    return;
  }

  await tg("sendMessage", {
    chat_id: chatId,
    text:
      `✅ *Smart-Shartnoma* tasdiqlash kodingiz:\n\n` +
      `\`${record.code}\`\n\n` +
      `_Kodni saytdagi maydoniga kiriting. Kod 10 daqiqa amal qiladi._`,
    parse_mode: "Markdown",
    reply_markup: { remove_keyboard: true },
  });
}

/* ── Webhook handler ────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Callback from inline keyboard button
    if (body?.callback_query) {
      const q = body.callback_query;
      const chatId: number = q.message.chat.id;
      const msgId: number = q.message.message_id;
      const data: string = q.data;

      await tg("answerCallbackQuery", { callback_query_id: q.id });

      if (data === "menu") {
        await tg("editMessageText", {
          chat_id: chatId,
          message_id: msgId,
          text:
            `*Smart-Shartnoma* — JShShIR va telefon raqam orqali qonuniy elektron shartnomalar tuzish platformasi.\n\n` +
            `Quyidan bo'limni tanlang:`,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "📄 Shartnoma nima?", callback_data: "what" }],
              [{ text: "❓ Nima uchun kerak?", callback_data: "why" }],
              [{ text: "⚙️ Qanday ishlaydi?", callback_data: "how" }],
              [{ text: "✅ Ro'yxatdan o'tish kodi olish", callback_data: "code" }],
            ],
          },
        });
      } else if (data === "code") {
        await sendCodeRequest(chatId, msgId);
      } else if (SECTIONS[data]) {
        await sendSection(chatId, data, msgId);
      }

      return NextResponse.json({ ok: true });
    }

    const message = body?.message;
    if (!message?.chat?.id) return NextResponse.json({ ok: true });

    const chatId: number = message.chat.id;
    const firstName: string = message.chat.first_name ?? "";

    // User shared contact via button tap
    if (message.contact?.phone_number) {
      await sendOtpCode(chatId, message.contact.phone_number);
      return NextResponse.json({ ok: true });
    }

    const text: string = message.text?.trim() ?? "";

    if (text === "/start" || !text) {
      await sendMainMenu(chatId, firstName);
      return NextResponse.json({ ok: true });
    }

    // User typed a phone number manually (fallback)
    const phone = normalizePhone(text);
    if (phone.length >= 9 && /^\d+$/.test(phone)) {
      await sendOtpCode(chatId, phone);
    } else {
      await sendMainMenu(chatId, firstName);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}

/* ── One-time webhook setup ─────────────────────────────────── */
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
