import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";

export async function SiteHeader({ locale }: { locale: string }) {
  const t = await getTranslations("Nav");

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3.5">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-zinc-900"
        >
          {t("brand")}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-zinc-600">
            <Link href="/generate" className="hover:text-zinc-900">
              {t("generate")}
            </Link>
            <Link href="/pricing" className="hover:text-zinc-900">
              {t("pricing")}
            </Link>
          </nav>
          <LanguageSwitcher locale={locale} />
        </div>
      </div>
    </header>
  );
}
