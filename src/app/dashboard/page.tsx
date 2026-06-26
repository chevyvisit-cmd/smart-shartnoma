import { db } from "@/lib/db";
import { getUser, getLanguage, getContractQuota } from "@/lib/actions";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const [contracts, quota, lang] = await Promise.all([
    db.contract.findMany({
      where: { OR: [{ creatorId: user.id }, { recipientId: user.id }] },
      orderBy: { createdAt: "desc" },
    }),
    getContractQuota(),
    getLanguage(),
  ]);

  const stats = {
    total: contracts.length,
    pending: contracts.filter(c => c.status === "PENDING").length,
    signed: contracts.filter(c => c.status === "SIGNED").length,
  };

  return <DashboardClient contracts={contracts} stats={stats} quota={quota} lang={lang} />;
}
