import { getLanguage, getUser } from "@/lib/actions";
import { LoginClient } from "@/components/login-client";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const [lang, user] = await Promise.all([getLanguage(), getUser()]);
  if (user) redirect("/dashboard");
  return <LoginClient lang={lang} />;
}
