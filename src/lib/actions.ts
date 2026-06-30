"use server";

import { db } from "./db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Language } from "./translations";
import { checkQuota, FREE_CONTRACTS_LIMIT, PRICE_PER_CONTRACT } from "./config";

async function sendTelegramOtp(chatId: string, code: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: `✅ *Smart-Shartnoma* tasdiqlash kodi:\n\n\`${code}\`\n\n_Kod 10 daqiqa amal qiladi._`,
      parse_mode: "Markdown",
    }),
  }).catch(() => {});
}

class PaymentRequiredError extends Error {
  constructor() { super("payment_required"); }
}

// Normalize to "998XXXXXXXXX" (12 digits, no +)
// Handles: +998XXXXXXXXX, 998XXXXXXXXX, 0XXXXXXXXX, XXXXXXXXX
function normalizePhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("998") && d.length >= 11) return d.slice(0, 12);
  if (d.startsWith("0") && d.length === 10) return "998" + d.slice(1);
  if (d.length === 9) return "998" + d;
  return d;
}

// Search by phone covering old (+998...) and new (998...) DB formats
async function findUserByPhone(phone: string) {
  const n = normalizePhone(phone);
  return db.user.findFirst({
    where: { OR: [{ phone: n }, { phone: "+" + n }, { phone: phone.trim() }] },
  });
}

// OTP expiry duration in minutes
const OTP_TTL_MINUTES = 10;

// ID generator — no confusable chars (0/O, 1/I/L removed)
const ID_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
function randomSegment(len = 8): string {
  let s = "";
  for (let i = 0; i < len; i++) s += ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)];
  return s;
}
function generateUid(): string { return "USR-" + randomSegment(); }
function generateCid(): string { return "SHT-" + randomSegment(); }

export async function getLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  return (cookieStore.get("app_lang")?.value as Language) || "uz";
}

export async function setLanguage(lang: Language) {
  const cookieStore = await cookies();
  cookieStore.set("app_lang", lang, { path: "/", maxAge: 60 * 60 * 24 * 365 }); // 1 year
  revalidatePath("/");
}

export async function getUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_session")?.value;
  if (!userId) return null;

  return db.user.findUnique({
    where: { id: userId },
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("user_session");
  redirect("/");
}

export async function sendSmsCode(
  phone: string,
  email?: string,
): Promise<{ success: true; isExistingUser: boolean } | { error: string }> {
  const normalized = normalizePhone(phone);

  // Server-side phone validation
  const digits = normalized.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 12) {
    return { error: "Telefon raqami noto'g'ri (9–12 ta raqam)" };
  }

  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  const isExistingUser = !!(await findUserByPhone(normalized));

  await db.phoneVerification.upsert({
    where: { phone: normalized },
    update: { code, expiresAt },
    create: { phone: normalized, code, expiresAt },
  });

  // Send email
  if (email) {
    try {
      const { sendEmail } = await import("./email");
      await sendEmail(email, code);
    } catch {
      console.log(`Email unavailable. Phone: ${normalized}, Code: ${code}`);
    }
  }

  // Also send via Telegram if user has chatId saved
  const existingUser = await findUserByPhone(normalized);
  // @ts-expect-error — telegramChatId exists after prisma generate (IDE cache stale)
  if (existingUser?.telegramChatId) {
    // @ts-expect-error -- telegramChatId added via prisma generate
    await sendTelegramOtp(existingUser.telegramChatId, code);
  }

  return { success: true, isExistingUser };
}

// ── Login flow (existing users only) ────────────────────────

export async function sendLoginCode(
  phone: string,
  method: "gmail" | "telegram",
  email?: string,
): Promise<{ success: true } | { error: string }> {
  const normalized = normalizePhone(phone);
  const user = await findUserByPhone(normalized);

  if (!user) {
    return { error: "Bu telefon raqami ro'yxatdan o'tmagan. Avval ro'yxatdan o'ting." };
  }

  const code = Math.floor(1000 + Math.random() * 9000).toString();
  await db.phoneVerification.upsert({
    where: { phone: normalized },
    update: { code, expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000) },
    create: { phone: normalized, code, expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000) },
  });

  if (method === "gmail") {
    const targetEmail = email || user.email;
    if (!targetEmail) return { error: "Email manzil topilmadi" };
    try {
      const { sendEmail } = await import("./email");
      await sendEmail(targetEmail, code);
    } catch {
      console.log(`Email unavailable. Phone: ${normalized}, Code: ${code}`);
    }
  } else {
    // @ts-expect-error — telegramChatId exists after prisma generate (IDE cache stale)
    if (!user.telegramChatId) {
      return { error: "Telegram bot bilan bog'lanmagan. Avval @SmartShartnoma_bot ni ishga tushiring." };
    }
    // @ts-expect-error
    await sendTelegramOtp(user.telegramChatId, code);
  }

  return { success: true };
}

export async function verifyLoginCode(
  phone: string,
  code: string,
): Promise<{ success: true } | { error: string }> {
  const normalized = normalizePhone(phone);
  const record = await db.phoneVerification.findUnique({ where: { phone: normalized } });
  const devBypass = process.env.NODE_ENV !== "production" && code === "1234";
  const codeMatch = record && record.code === code && record.expiresAt > new Date();

  if (!devBypass && !codeMatch) {
    return { error: "Kod noto'g'ri yoki muddati tugagan" };
  }

  await db.phoneVerification.deleteMany({ where: { phone: normalized } });

  const user = await findUserByPhone(normalized);
  if (!user) return { error: "Foydalanuvchi topilmadi" };

  const cookieStore = await cookies();
  cookieStore.set("user_session", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return { success: true };
}

// ── Registration OTP verification ────────────────────────────

export async function verifySmsCode(phone: string, code: string, userData: { name: string; phone: string; pinfl: string; email?: string }) {
  const normalized = normalizePhone(phone);

  const record = await db.phoneVerification.findUnique({ where: { phone: normalized } });

  const devBypass = process.env.NODE_ENV !== "production" && code === "1234";
  const codeMatch = record && record.code === code && record.expiresAt > new Date();

  if (!devBypass && !codeMatch) {
    return { error: "Kod noto'g'ri yoki muddati tugagan" };
  }

  await db.phoneVerification.deleteMany({ where: { phone: normalized } });

  try {
    const existing = await findUserByPhone(normalized);

    const user = existing ?? await db.user.create({
      data: { uid: generateUid(), name: userData.name, phone: normalized, pinfl: userData.pinfl },
    });

    const cookieStore = await cookies();
    cookieStore.set("user_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    const msg  = (e as { message?: string })?.message ?? "";
    if (code === "P2002" || msg.includes("pinfl")) {
      return { error: "Bu JShShIR allaqachon ro'yxatdan o'tgan" };
    }
    if (msg.includes("phone")) {
      return { error: "Bu telefon raqami allaqachon ro'yxatdan o'tgan" };
    }
    return { error: "Saqlashda xatolik yuz berdi. Qayta urinib ko'ring." };
  }
}


export async function getContractQuota() {
  const user = await getUser();
  if (!user) return null;
  return {
    freeUsed:    user.freeContractsUsed,
    freeLimit:   FREE_CONTRACTS_LIMIT,
    paidCredits: user.paidContractCredits,
    price:       PRICE_PER_CONTRACT,
  };
}

export async function createContract(formData: FormData) {
  const title        = formData.get("title") as string;
  const amountInput  = formData.get("amount");
  const amount       = amountInput ? parseFloat(amountInput as string) : 0;
  const content      = formData.get("content") as string;
  const type         = (formData.get("type") as string) || "KONTRAKT";
  const recipientPhone = (formData.get("recipientPhone") as string)?.trim() || null;
  const recipientPinfl = (formData.get("recipientPinfl") as string)?.trim() || null;
  const termsRaw     = formData.get("terms") as string;

  const user = await getUser();
  if (!user) return { error: "Sessiya muddati tugagan. Iltimos, qayta kiring." };

  const recipient = recipientPhone
    ? await findUserByPhone(recipientPhone)
    : recipientPinfl
    ? await db.user.findFirst({ where: { pinfl: recipientPinfl } })
    : null;

  if ((recipientPhone || recipientPinfl) && !recipient) {
    return { error: "Mijoz topilmadi. Avval ro'yxatdan o'tishi kerak." };
  }

  try {
    await db.$transaction(async (tx) => {
      const fresh = await tx.user.findUniqueOrThrow({ where: { id: user.id } });
      const quota = checkQuota(fresh.freeContractsUsed, fresh.paidContractCredits);

      if (!quota.allowed) throw new PaymentRequiredError();

      await tx.contract.create({
        data: {
          cid: generateCid(),
          title, amount, content, type,
          terms: termsRaw || "[]",
          creatorId: user.id,
          recipientId: recipient?.id ?? null,
          recipientPhone: recipientPhone,
          recipientPinfl: recipientPinfl,
          status: recipient ? "SENT" : "PENDING",
          sentAt: recipient ? new Date() : null,
        },
      });

      if (quota.type === "free") {
        await tx.user.update({ where: { id: user.id }, data: { freeContractsUsed: { increment: 1 } } });
        console.log(`[CONTRACT] Free slot used | userId=${user.id} used=${fresh.freeContractsUsed + 1}/${FREE_CONTRACTS_LIMIT}`);
      } else {
        await tx.user.update({ where: { id: user.id }, data: { paidContractCredits: { decrement: 1 } } });
        console.log(`[CONTRACT] Paid credit used | userId=${user.id} remaining=${fresh.paidContractCredits - 1}`);
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    if (e instanceof PaymentRequiredError) {
      return { error: "payment_required" as const, price: PRICE_PER_CONTRACT };
    }
    console.error("Contract creation error:", e);
    return { error: "Shartnoma saqlanmadi" };
  }
}

export async function acceptContract(contractId: string) {
  const user = await getUser();
  if (!user) return { error: "Iltimos, avval tizimga kiring" };

  const contract = await db.contract.findUnique({ where: { id: contractId } });
  if (!contract) return { error: "Shartnoma topilmadi" };
  if (contract.recipientId !== user.id) return { error: "Ruxsat yo'q" };
  if (contract.status !== "SENT") return { error: "Bu shartnoma imzolanishi mumkin emas" };

  await db.contract.update({
    where: { id: contractId },
    data: { status: "ACCEPTED", acceptedAt: new Date() },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function sendContract(contractId: string, recipientPhone?: string, recipientPinfl?: string) {
  const user = await getUser();
  if (!user) return { error: "Iltimos, avval tizimga kiring" };

  const contract = await db.contract.findUnique({ where: { id: contractId } });
  if (!contract) return { error: "Shartnoma topilmadi" };
  if (contract.creatorId !== user.id) return { error: "Ruxsat yo'q" };
  if (contract.status !== "PENDING") return { error: "Bu shartnoma allaqachon yuborilgan yoki yopilgan" };

  if (!recipientPhone && !recipientPinfl) return { error: "Telefon raqami yoki JShShIR kiriting" };

  const recipient = recipientPhone
    ? await findUserByPhone(recipientPhone)
    : await db.user.findUnique({ where: { pinfl: recipientPinfl! } });

  if (!recipient) return { error: "Foydalanuvchi topilmadi. Avval ro'yxatdan o'tishi kerak." };
  if (recipient.id === user.id) return { error: "O'zingizga yuborib bo'lmaydi" };

  await db.contract.update({
    where: { id: contractId },
    data: {
      status: "SENT",
      recipientId: recipient.id,
      recipientPhone: recipientPhone || null,
      recipientPinfl: recipientPinfl || null,
      sentAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/contracts/${contractId}`);
  return { success: true };
}

export async function getPendingContracts() {
  const user = await getUser();
  if (!user) return [];

  return db.contract.findMany({
    where: { recipientId: user.id, status: "SENT" },
    select: {
      id: true, cid: true, title: true, amount: true, content: true, terms: true, sentAt: true,
      creator: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { sentAt: "desc" },
  });
}

export async function acceptSentContract(contractId: string) {
  const user = await getUser();
  if (!user) return { error: "Iltimos, avval tizimga kiring" };

  const contract = await db.contract.findUnique({ where: { id: contractId } });
  if (!contract) return { error: "Shartnoma topilmadi" };
  if (contract.recipientId !== user.id) return { error: "Ruxsat yo'q" };
  if (contract.status !== "SENT") return { error: "Bu shartnoma qabul qilinishi mumkin emas" };

  await db.contract.update({
    where: { id: contractId },
    data: { status: "ACCEPTED", acceptedAt: new Date() },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function rejectContract(contractId: string, reason?: string) {
  const user = await getUser();
  if (!user) return { error: "Iltimos, avval tizimga kiring" };

  const contract = await db.contract.findUnique({ where: { id: contractId } });
  if (!contract) return { error: "Shartnoma topilmadi" };
  if (contract.recipientId !== user.id) return { error: "Ruxsat yo'q" };
  if (contract.status !== "SENT") return { error: "Bu shartnoma rad etilishi mumkin emas" };

  await db.contract.update({
    where: { id: contractId },
    data: { status: "REJECTED", rejectedAt: new Date(), rejectionReason: reason || null },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function getRecentContractUpdates() {
  const user = await getUser();
  if (!user) return [];

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return db.contract.findMany({
    where: {
      creatorId: user.id,
      OR: [
        { status: "ACCEPTED", acceptedAt: { gte: since } },
        { status: "REJECTED", rejectedAt: { gte: since } },
      ],
    },
    select: {
      id: true,
      title: true,
      status: true,
      acceptedAt: true,
      rejectedAt: true,
      rejectionReason: true,
      recipient: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function updateProfile(name: string) {
  const user = await getUser();
  if (!user) return { error: "Avval tizimga kiring" };
  if (!name.trim()) return { error: "Ism bo'sh bo'lishi mumkin emas" };

  try {
    await db.user.update({
      where: { id: user.id },
      data: { name: name.trim() }
    });
    revalidatePath("/profile");
    return { success: true };
  } catch {
    return { error: "Ma'lumotlarni saqlashda xatolik" };
  }
}

export async function updateProfileImage(imageUrl: string) {
  const user = await getUser();
  if (!user) return { error: "Avval tizimga kiring" };

  try {
    await db.user.update({
      where: { id: user.id },
      data: { image: imageUrl }
    });
    revalidatePath("/profile");
    return { success: true };
  } catch {
    return { error: "Rasmni saqlashda xatolik" };
  }
}
