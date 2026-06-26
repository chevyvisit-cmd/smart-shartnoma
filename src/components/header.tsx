import { getUser, getLanguage, getPendingContracts } from "@/lib/actions";
import { HeaderClient } from "./header-client";

export async function Header() {
  const user = await getUser();
  const lang = await getLanguage();
  const pendingContracts = user ? await getPendingContracts() : [];

  return <HeaderClient user={user} lang={lang} pendingContracts={pendingContracts} />;
}
