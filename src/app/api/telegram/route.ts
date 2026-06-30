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
  const res = await fetch(`https://api.telegram.org/bot${TOKEN()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

/* ── Generate / refresh OTP ────────────────────────────────── */
async function upsertOtp(phone: string): Promise<string> {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  await db.phoneVerification.upsert({
    where: { phone },
    update: { code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    create: { phone, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
  });
  return code;
}

/* ── Inline keyboards ───────────────────────────────────────── */

const MAIN_MENU_KEYBOARD = {
  inline_keyboard: [
    [{ text: "📄 Shartnoma nima?",           callback_data: "what" }],
    [{ text: "❓ Nima uchun kerak?",           callback_data: "why"  }],
    [{ text: "⚙️ Qanday ishlaydi?",           callback_data: "how"  }],
    [{ text: "✅ Kod olish / Kirish",          callback_data: "code" }],
  ],
};

const BACK_AND_CODE_KEYBOARD = {
  inline_keyboard: [[
    { text: "⬅️ Orqaga", callback_data: "menu" },
    { text: "✅ Kod olish", callback_data: "code" },
  ]],
};

const CODE_ACTIONS_KEYBOARD = {
  inline_keyboard: [[
    { text: "🔄 Kodni yangilash", callback_data: "code" },
    { text: "🏠 Asosiy menyu",    callback_data: "menu" },
  ]],
};

/* ── 1. Main menu ───────────────────────────────────────────── */
async function sendMainMenu(chatId: number, firstName = "", editMsgId?: number) {
  const name = firstName ? ` ${firstName}` : "";
  const text =
    `Salom${name}! 👋\n\n` +
    `*Smart-Shartnoma* — JShShIR va telefon raqam orqali qonuniy elektron shartnomalar tuzish platformasi.\n\n` +
    `Bo'limni tanlang:`;

  if (editMsgId) {
    await tg("editMessageText", {
      chat_id: chatId, message_id: editMsgId,
      text, parse_mode: "Markdown",
      reply_markup: MAIN_MENU_KEYBOARD,
    });
  } else {
    await tg("sendMessage", {
      chat_id: chatId,
      text, parse_mode: "Markdown",
      reply_markup: MAIN_MENU_KEYBOARD,
    });
  }
}

/* ── 2. Info sections ───────────────────────────────────────── */
const SECTION_TEXT: Record<string, string> = {
  what:
    `📄 *Shartnoma nima?*\n\n` +
    `Shartnoma — ikki yoki undan ortiq tomon o'rtasida tuzilgan *yozma kelishuv*. ` +
    `Qonun kuchiga ega hujjat bo'lib, har bir tomoning huquq va majburiyatlarini belgilaydi.\n\n` +
    `Smart-Shartnoma orqali:\n` +
    `• Elektron shartnoma tuzasiz\n` +
    `• SMS-OTP orqali ikki tomon imzolaydi\n` +
    `• Hujjat qonuniy kuchga ega bo'ladi\n` +
    `• Istalgan vaqt yuklab olish mumkin`,
  why:
    `❓ *Nima uchun shartnoma kerak?*\n\n` +
    `⚖️ *Huquqiy himoya* — nizo yuzaga kelsa sud dalili\n\n` +
    `💳 *To'lov kafolati* — narx va muddat oldindan belgilanadi\n\n` +
    `📋 *Aniq majburiyatlar* — kim, nima, qachon — hujjatda\n\n` +
    `🤝 *Ishonchli hamkorlik* — professional munosabat`,
  how:
    `⚙️ *Qanday ishlaydi?*\n\n` +
    `1️⃣ *Ro'yxatdan o'ting* — JShShIR va telefon bilan\n\n` +
    `2️⃣ *Shartnoma matnini tanlang* — shablon yoki o'zingizniki\n\n` +
    `3️⃣ *Ikkinchi tomonga yuboring* — telefon yoki ID orqali\n\n` +
    `4️⃣ *SMS-OTP tasdiqlash* — ikki tomon tasdiqlaydi\n\n` +
    `5️⃣ *Elektron imzo* — qonuniy kuchga kiradi\n\n` +
    `6️⃣ *Tarix va nazorat* — istalgan vaqt ko'rish, yuklab olish`,
};

async function sendSection(chatId: number, key: string, editMsgId?: number) {
  const text = SECTION_TEXT[key];
  if (!text) return;
  if (editMsgId) {
    await tg("editMessageText", {
      chat_id: chatId, message_id: editMsgId,
      text, parse_mode: "Markdown",
      reply_markup: BACK_AND_CODE_KEYBOARD,
    });
  } else {
    await tg("sendMessage", {
      chat_id: chatId, text, parse_mode: "Markdown",
      reply_markup: BACK_AND_CODE_KEYBOARD,
    });
  }
}

/* ── 3. Ask user to share phone ─────────────────────────────── */
async function sendCodeRequest(chatId: number, editMsgId?: number) {
  // Remove inline keyboard from previous message
  if (editMsgId) {
    await tg("editMessageReplyMarkup", {
      chat_id: chatId, message_id: editMsgId,
      reply_markup: { inline_keyboard: [] },
    });
  }
  // Send new message with ReplyKeyboard contact button + inline back
  await tg("sendMessage", {
    chat_id: chatId,
    text: "Telefon raqamingizni ulashing — bot tasdiqlash kodini yuboradi:\n\n_Yoki /menu yozing — asosiy menyuga qaytish_",
    parse_mode: "Markdown",
    reply_markup: {
      keyboard: [[{ text: "📱 Telefon raqamni ulashish", request_contact: true }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
}

/* ── 4. Handle phone → send OTP ────────────────────────────── */
async function handlePhone(chatId: number, rawPhone: string) {
  const phone = normalizePhone(rawPhone);

  if (phone.length < 9 || !/^\d+$/.test(phone)) {
    await sendCodeRequest(chatId);
    return;
  }

  const registeredUser = await db.user.findFirst({
    where: { OR: [{ phone }, { phone: "+" + phone }] },
  });

  // Save Telegram chatId so future OTPs are also sent via Telegram
  if (registeredUser && registeredUser.telegramChatId !== String(chatId)) {
    await db.user.update({
      where: { id: registeredUser.id },
      data: { telegramChatId: String(chatId) },
    });
  }

  const record = await db.phoneVerification.findUnique({ where: { phone } });

  if (!registeredUser && !record) {
    await tg("sendMessage", {
      chat_id: chatId,
      text:
        `*${phone}* raqami hali ro'yxatdan o'tmagan.\n\n` +
        `Avval saytda ro'yxatdan o'ting:`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🌐 Ro'yxatdan o'tish", url: "https://smart-shartnoma.vercel.app/register" }],
          [{ text: "🏠 Asosiy menyu", callback_data: "menu" }],
        ],
      },
    });
    return;
  }

  // Generate new code if: no record, expired, or registered user requesting fresh login
  const code = await upsertOtp(phone);

  await tg("sendMessage", {
    chat_id: chatId,
    text:
      `✅ *Smart-Shartnoma* tasdiqlash kodingiz:\n\n` +
      `\`${code}\`\n\n` +
      `_Kodni saytdagi maydoniga kiriting. Kod 10 daqiqa amal qiladi._`,
    parse_mode: "Markdown",
    reply_markup: {
      ...CODE_ACTIONS_KEYBOARD,
      remove_keyboard: true,
    },
  });
}

/* ── Webhook handler ────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    /* ── Callback query (inline button press) ── */
    if (body?.callback_query) {
      const q      = body.callback_query;
      const chatId = q.message.chat.id as number;
      const msgId  = q.message.message_id as number;
      const data   = q.data as string;
      const name   = q.message.chat.first_name as string ?? "";

      await tg("answerCallbackQuery", { callback_query_id: q.id });

      if (data === "menu") {
        await sendMainMenu(chatId, name, msgId);
      } else if (data === "code") {
        await sendCodeRequest(chatId, msgId);
      } else if (SECTION_TEXT[data]) {
        await sendSection(chatId, data, msgId);
      }

      return NextResponse.json({ ok: true });
    }

    /* ── Regular message ── */
    const message = body?.message;
    if (!message?.chat?.id) return NextResponse.json({ ok: true });

    const chatId    = message.chat.id as number;
    const firstName = (message.chat.first_name as string) ?? "";
    const text      = (message.text?.trim() ?? "") as string;

    // Contact shared via button
    if (message.contact?.phone_number) {
      await handlePhone(chatId, message.contact.phone_number as string);
      return NextResponse.json({ ok: true });
    }

    // Commands
    if (text === "/start" || text === "/menu" || !text) {
      await sendMainMenu(chatId, firstName);
      return NextResponse.json({ ok: true });
    }

    // Manual phone number typed
    const phone = normalizePhone(text);
    if (phone.length >= 9 && /^\d+$/.test(phone)) {
      await handlePhone(chatId, text);
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
