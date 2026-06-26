"use server";

import { db } from "./db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sendSms } from "./sms";
import { cookies } from "next/headers";
import { Language } from "./translations";
import { checkQuota, FREE_CONTRACTS_LIMIT, PRICE_PER_CONTRACT } from "./config";

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

// Temporary in-memory storage for codes
const verificationCodes = new Map<string, string>();

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

export async function sendSmsCode(phone: string) {
  const normalized = normalizePhone(phone);
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  verificationCodes.set(normalized, code);
  // Temporarily disabled real SMS
  // await sendSms(normalized, code);
  console.log(`BYPASS SMS: Phone: ${normalized}, Code: ${code} (Or use 1234)`);
  return { success: true };
}

export async function verifySmsCode(phone: string, code: string, userData: any) {
  const normalized = normalizePhone(phone);
  if (!/^\d{4}$/.test(code) && verificationCodes.get(normalized) !== code) {
    return { error: "Kod noto'g'ri" };
  }

  verificationCodes.delete(normalized);

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
          title, amount, content,
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
  } catch (error) {
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
  } catch (error) {
    return { error: "Rasmni saqlashda xatolik" };
  }
}
