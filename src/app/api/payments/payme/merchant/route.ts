import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PAYME_SECRET_KEY, PRICE_PER_CONTRACT } from "@/lib/config";

// Payme error kodlari
const ERR = {
  PARSE:       { code: -32700, message: "Parse error" },
  METHOD:      { code: -32601, message: "Method not found" },
  INVALID:     { code: -32602, message: "Invalid params" },
  INTERNAL:    { code: -32603, message: "Internal error" },
  ORDER:       { code: -31050, message: "Order not found" },
  AMOUNT:      { code: -31001, message: "Invalid amount" },
  ALREADY:     { code: -31099, message: "Transaction already exists" },
  PERFORM:     { code: -31008, message: "Transaction is already performed" },
  CANCEL:      { code: -31007, message: "Transaction already cancelled" },
  NOT_FOUND:   { code: -31003, message: "Transaction not found" },
  AUTH:        { code: -32504, message: "Incorrect authentication credentials" },
} as const;

function rpcError(id: unknown, err: { code: number; message: string }) {
  return NextResponse.json({ jsonrpc: "2.0", id, error: { code: err.code, message: { uz: err.message } } });
}

function rpcOk(id: unknown, result: Record<string, unknown>) {
  return NextResponse.json({ jsonrpc: "2.0", id, result });
}

function checkAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization") ?? "";
  const expected = "Basic " + Buffer.from(`Payme:${PAYME_SECRET_KEY}`).toString("base64");
  return authHeader === expected;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: ERR.AUTH.code, message: ERR.AUTH.message } },
      { status: 401 }
    );
  }

  let body: { jsonrpc: string; method: string; params: Record<string, unknown>; id: unknown };
  try {
    body = await req.json();
  } catch {
    return rpcError(null, ERR.PARSE);
  }

  const { method, params, id } = body;
  console.log(`[PAYME] method=${method} params=${JSON.stringify(params)}`);

  // Barcha metodlar uchun order_id kerak
  const orderId = (params?.account as Record<string, string>)?.order_id
    ?? (params?.id as string | undefined);

  switch (method) {

    case "CheckPerformTransaction": {
      const payment = await db.payment.findUnique({ where: { orderId: orderId ?? "" } });
      if (!payment) return rpcError(id, ERR.ORDER);

      const expectedTiyin = PRICE_PER_CONTRACT * 100;
      if (Number(params.amount) !== expectedTiyin) return rpcError(id, ERR.AMOUNT);

      return rpcOk(id, { allow: true });
    }

    case "CreateTransaction": {
      const payment = await db.payment.findUnique({ where: { orderId: orderId ?? "" } });
      if (!payment) return rpcError(id, ERR.ORDER);

      const expectedTiyin = PRICE_PER_CONTRACT * 100;
      if (Number(params.amount) !== expectedTiyin) return rpcError(id, ERR.AMOUNT);

      if (payment.status === "SUCCESS") return rpcError(id, ERR.PERFORM);
      if (payment.status === "CANCELLED") return rpcError(id, ERR.CANCEL);

      // Tranzaksiya ID ni saqlash
      const transId = String(params.id);
      if (payment.transactionId && payment.transactionId !== transId) {
        return rpcError(id, ERR.ALREADY);
      }

      await db.payment.update({
        where: { orderId: payment.orderId },
        data: { transactionId: transId, status: "PENDING" },
      });

      return rpcOk(id, {
        create_time: payment.createdAt.getTime(),
        transaction:  payment.id,
        state:        1,
      });
    }

    case "PerformTransaction": {
      const transId = String(params.id ?? "");
      const payment = await db.payment.findFirst({ where: { transactionId: transId } });
      if (!payment) return rpcError(id, ERR.NOT_FOUND);
      if (payment.status === "CANCELLED") return rpcError(id, ERR.CANCEL);

      if (payment.status === "SUCCESS") {
        return rpcOk(id, {
          transaction:  payment.id,
          perform_time: payment.performTime?.getTime() ?? Date.now(),
          state:        2,
        });
      }

      const now = new Date();
      await db.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "SUCCESS", performTime: now },
        });
        await tx.user.update({
          where: { id: payment.userId },
          data: { paidContractCredits: { increment: 1 } },
        });
      });

      console.log(`[PAYME] PerformTransaction SUCCESS | transId=${transId} userId=${payment.userId}`);
      return rpcOk(id, { transaction: payment.id, perform_time: now.getTime(), state: 2 });
    }

    case "CancelTransaction": {
      const transId = String(params.id ?? "");
      const payment = await db.payment.findFirst({ where: { transactionId: transId } });
      if (!payment) return rpcError(id, ERR.NOT_FOUND);
      if (payment.status === "SUCCESS") return rpcError(id, ERR.PERFORM);

      await db.payment.update({
        where: { id: payment.id },
        data: { status: "CANCELLED" },
      });

      console.log(`[PAYME] CancelTransaction | transId=${transId}`);
      return rpcOk(id, { transaction: payment.id, cancel_time: Date.now(), state: -1 });
    }

    case "CheckTransaction": {
      const transId = String(params.id ?? "");
      const payment = await db.payment.findFirst({ where: { transactionId: transId } });
      if (!payment) return rpcError(id, ERR.NOT_FOUND);

      const stateMap: Record<string, number> = { PENDING: 1, SUCCESS: 2, CANCELLED: -1, FAILED: -2 };
      return rpcOk(id, {
        create_time:  payment.createdAt.getTime(),
        perform_time: payment.performTime?.getTime() ?? 0,
        cancel_time:  payment.status === "CANCELLED" ? payment.updatedAt.getTime() : 0,
        transaction:  payment.id,
        state:        stateMap[payment.status] ?? 1,
        reason:       null,
      });
    }

    case "GetStatement": {
      const from = new Date(Number(params.from));
      const to   = new Date(Number(params.to));
      const payments = await db.payment.findMany({
        where: { provider: "payme", createdAt: { gte: from, lte: to } },
      });
      const stateMap: Record<string, number> = { PENDING: 1, SUCCESS: 2, CANCELLED: -1, FAILED: -2 };
      return rpcOk(id, {
        transactions: payments.map((p) => ({
          id:           p.transactionId,
          time:         p.createdAt.getTime(),
          amount:       PRICE_PER_CONTRACT * 100,
          account:      { order_id: p.orderId },
          create_time:  p.createdAt.getTime(),
          perform_time: p.performTime?.getTime() ?? 0,
          cancel_time:  p.status === "CANCELLED" ? p.updatedAt.getTime() : 0,
          transaction:  p.id,
          state:        stateMap[p.status] ?? 1,
          reason:       null,
        })),
      });
    }

    default:
      return rpcError(id, ERR.METHOD);
  }
}
