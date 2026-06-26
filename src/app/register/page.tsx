import { getLanguage } from "@/lib/actions";
import { RegisterClient } from "@/components/register-client";

export default async function RegisterPage() {
  const lang = await getLanguage();
  return <RegisterClient lang={lang} />;
}
