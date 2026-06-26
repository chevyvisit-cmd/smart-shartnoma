import { getLanguage } from "@/lib/actions";
import { translations } from "@/lib/translations";

export default async function AboutPage() {
  const lang = await getLanguage();
  const t = translations[lang].about;

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4 md:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-black tracking-tight text-center mb-16">{t.title}</h1>
        
        <div className="grid gap-8 md:grid-cols-2">
          {t.steps.map((step, i) => (
            <div key={i} className="rounded-[32px] border border-white/10 bg-background/40 p-8 backdrop-blur-2xl shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black mb-6">
                {i + 1}
              </div>
              <h3 className="text-xl font-black mb-4">{step.title}</h3>
              <p className="text-muted-foreground font-medium">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
