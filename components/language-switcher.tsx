"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const labels: Record<string, string> = {
  en: "EN",
  de: "DE",
  fr: "FR",
  es: "ES",
};

export function LanguageSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm text-zinc-600">
      <span className="sr-only">Language</span>
      <select
        className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 font-medium text-zinc-800 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
        value={locale}
        onChange={(e) => {
          router.replace(pathname, { locale: e.target.value });
        }}
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>
            {labels[l] ?? l.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
