import { Suspense } from "react";
import { getLanguage, getUser, getContractQuota } from "@/lib/actions";
import { NewContractClient } from "@/components/new-contract-client";
import { redirect } from "next/navigation";

export default async function NewContractPage() {
  const [lang, user, quota] = await Promise.all([getLanguage(), getUser(), getContractQuota()]);
  if (!user) redirect("/login");
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center text-muted-foreground">Yuklanmoqda...</div>}>
      <NewContractClient lang={lang} creatorPhone={user.phone} quota={quota} />
    </Suspense>
  );
}
