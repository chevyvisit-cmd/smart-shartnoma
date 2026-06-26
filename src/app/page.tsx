import { getUser, getLanguage } from "@/lib/actions";
import { HomeClient } from "@/components/home-client";

export default async function Home() {
  const user = await getUser();
  const lang = await getLanguage();
  
  return <HomeClient isAuthenticated={!!user} lang={lang} />;
}
