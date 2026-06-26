import { db } from "@/lib/db";
import { getUser, getLanguage } from "@/lib/actions";
import { notFound, redirect } from "next/navigation";
import { ContractClient } from "@/components/contract-client";

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  const lang = await getLanguage();

  if (!user) {
    redirect("/login");
  }

  const contract = await db.contract.findUnique({
    where: { id },
    include: {
      creator: true,
      recipient: true,
    }
  });

  if (!contract) {
    notFound();
  }

  return (
    <ContractClient
      contract={contract}
      currentUserId={user.id}
      lang={lang}
    />
  );
}
