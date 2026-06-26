import { getUser, getLanguage, getPendingContracts, getRecentContractUpdates } from "@/lib/actions";
import { HeaderClient } from "./header-client";

export async function Header() {
  const user = await getUser();
  const lang = await getLanguage();
  const [pendingContracts, recentUpdates] = user
    ? await Promise.all([getPendingContracts(), getRecentContractUpdates()])
    : [[], []];

  return (
    <HeaderClient
      user={user}
      lang={lang}
      pendingContracts={pendingContracts}
      recentUpdates={recentUpdates}
    />
  );
}
