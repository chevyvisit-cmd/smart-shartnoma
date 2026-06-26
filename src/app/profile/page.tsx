import { db } from "@/lib/db";
import { getUser, getLanguage } from "@/lib/actions";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/profile-client";

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const contracts = await db.contract.findMany({
    where: {
      OR: [
        { creatorId: user.id },
        { recipientId: user.id },
      ]
    },
    orderBy: { createdAt: "desc" },
  });

  const lang = await getLanguage();

  return <ProfileClient user={user} contracts={contracts} lang={lang} />;
}
