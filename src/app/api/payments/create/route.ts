import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  CLICK_SERVICE_ID, CLICK_MERCHANT_ID,
  PAYME_MERCHANT_ID, PRICE_PER_CONTRACT, BASE_URL,
} from "@/lib/config";

async function getSessionUser() {
  const store = await cookies();
  const userId = store.get("user_session")?.value;
  if (!userId) return null;
  return db.user.findUnique({ where: { id: userId } });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { provider } = await req.json() as { provider: "click" | "payme" };
  if (provider !== "click" && provider !== "payme") {
    return NextResponse.json({ error: "invalid_provider" }, { status: 400 });
  }

  const orderId = `PAY-${Date.now()}-${user.id.slice(-8)}`;

  await db.payment.create({
    data: { userId: user.id, orderId, amount: PRICE_PER_CONTRACT, provider, status: "PENDING" },
  });

  console.log(`[PAYMENT] New payment intent | orderId=${orderId} provider=${provider} userId=${user.id}`);

  let url: string;

  if (provider === "click") {
    const params = new URLSearchParams({
      service_id:        CLICK_SERVICE_ID,
      merchant_id:       CLICK_MERCHANT_ID,
      amount:            String(PRICE_PER_CONTRACT),
      transaction_param: orderId,
      return_url:        `${BASE_URL}/contracts/new?payment=success&provider=click`,
    });
    url = `https://my.click.uz/services/pay?${params}`;
  } else {
    // Payme: summa tiynda (1 UZS = 100 tiyin)
    const b64 = Buffer.from(
      `m=${PAYME_MERCHANT_ID};ac.order_id=${orderId};a=${PRICE_PER_CONTRACT * 100}`
    ).toString("base64");
    url = `https://checkout.paycom.uz/${b64}`;
  }

  return NextResponse.json({ orderId, url });
}
