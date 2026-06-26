import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { CLICK_SECRET_KEY, CLICK_SERVICE_ID } from "@/lib/config";

function md5(str: string) {
  return crypto.createHash("md5").update(str).digest("hex");
}

// Click callback formatida javob
function clickResp(
  click_trans_id: string,
  merchant_trans_id: string,
  error: number,
  error_note: string,
  extra?: Record<string, unknown>
) {
  return NextResponse.json({
    click_trans_id,
    merchant_trans_id,
    error,
    error_note,
    ...extra,
  });
}

export async function POST(req: NextRequest) {
  // Click form-encoded yoki JSON yuboradi
  let body: Record<string, string>;
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    body = await req.json();
  } else {
    const text = await req.text();
    body = Object.fromEntries(new URLSearchParams(text));
  }

  const {
    click_trans_id,
    service_id,
    merchant_trans_id: orderId,
    merchant_prepare_id,
    amount,
    action,
    sign_time,
    sign_string,
    error: click_error,
  } = body;

  console.log(`[CLICK CALLBACK] action=${action} orderId=${orderId} click_trans_id=${click_trans_id}`);

  // Imzo tekshiruvi
  let expectedSign: string;
  if (action === "0") {
    expectedSign = md5(
      click_trans_id + service_id + CLICK_SECRET_KEY + orderId + amount + action + sign_time
    );
  } else {
    expectedSign = md5(
      click_trans_id + service_id + CLICK_SECRET_KEY + orderId + merchant_prepare_id + amount + action + sign_time
    );
  }

  if (expectedSign !== sign_string) {
    console.warn(`[CLICK CALLBACK] Invalid sign | orderId=${orderId}`);
    return clickResp(click_trans_id, orderId, -1, "Invalid sign");
  }

  if (service_id !== CLICK_SERVICE_ID) {
    return clickResp(click_trans_id, orderId, -1, "Invalid service_id");
  }

  const payment = await db.payment.findUnique({ where: { orderId } });
  if (!payment) {
    return clickResp(click_trans_id, orderId, -6, "Order not found");
  }

  // action=0: Tayyorlik tekshiruvi
  if (action === "0") {
    if (click_error && parseInt(click_error) < 0) {
      await db.payment.update({ where: { orderId }, data: { status: "FAILED" } });
      console.log(`[CLICK CALLBACK] Payment failed | orderId=${orderId}`);
      return clickResp(click_trans_id, orderId, parseInt(click_error), "Payment error");
    }

    if (payment.status === "SUCCESS") {
      return clickResp(click_trans_id, orderId, -4, "Already paid", { merchant_prepare_id: payment.id });
    }

    return clickResp(click_trans_id, orderId, 0, "Success", { merchant_prepare_id: payment.id });
  }

  // action=1: To'lovni tasdiqlash
  if (action === "1") {
    if (click_error && parseInt(click_error) < 0) {
      await db.payment.update({ where: { orderId }, data: { status: "CANCELLED" } });
      console.log(`[CLICK CALLBACK] Payment cancelled | orderId=${orderId}`);
      return clickResp(click_trans_id, orderId, parseInt(click_error), "Cancelled");
    }

    if (payment.status === "SUCCESS") {
      return clickResp(click_trans_id, orderId, -4, "Already paid", { merchant_confirm_id: payment.id });
    }

    // To'lovni muvaffaqiyatli deb belgilab, kredit qo'shamiz
    await db.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId },
        data: { status: "SUCCESS", transactionId: click_trans_id, performTime: new Date() },
      });
      await tx.user.update({
        where: { id: payment.userId },
        data: { paidContractCredits: { increment: 1 } },
      });
    });

    console.log(`[CLICK CALLBACK] Payment SUCCESS | orderId=${orderId} userId=${payment.userId}`);
    return clickResp(click_trans_id, orderId, 0, "Success", { merchant_confirm_id: payment.id });
  }

  return clickResp(click_trans_id, orderId, -8, "Invalid action");
}
