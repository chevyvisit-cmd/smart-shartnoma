import { getLanguage } from "@/lib/actions";
import { LoginClient } from "@/components/login-client";

export default async function LoginPage() {
  const lang = await getLanguage();
  return <LoginClient lang={lang} />;
}
