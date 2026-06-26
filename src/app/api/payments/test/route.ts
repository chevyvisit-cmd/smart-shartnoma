import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function POST() {
  const store = await cookies();
  const userId = store.get("user_session")?.value;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  await db.user.update({
    where: { id: userId },
    data: { paidContractCredits: { increment: 1 } },
  });

  console.log(`[TEST PAYMENT] +1 kredit | userId=${userId}`);
  return NextResponse.json({ success: true });
}
