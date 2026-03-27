import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Home");
  const tNav = await getTranslations("Nav");

  return (
    <main className="mx-auto flex min-h-[85vh] max-w-2xl flex-col justify-center gap-10 px-6 py-20">
      <div>
        <p className="text-sm font-medium text-zinc-500">{tNav("brand")}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-zinc-600">
          {t.rich("lead", {
            fast: (chunks) => (
              <strong className="font-medium text-zinc-800">{chunks}</strong>
            ),
            pricing: (chunks) => (
              <Link
                href="/pricing#flux-pack"
                className="font-medium text-zinc-900 underline underline-offset-4"
              >
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/generate"
          className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          {t("ctaGenerate")}
        </Link>
        <Link
          href="/pricing"
          className="rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
        >
          {t("ctaPricing")}
        </Link>
      </div>
    </main>
  );
}
