import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const tierKeys = ["fast", "standard", "premium"] as const;

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Pricing");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        {t("title")}
      </h1>
      <p className="mt-2 text-zinc-600">
        {t.rich("intro", {
          fast: (chunks) => (
            <strong className="font-medium text-zinc-800">{chunks}</strong>
          ),
          addon: (chunks) => (
            <strong className="font-medium text-zinc-800">{chunks}</strong>
          ),
        })}
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {tierKeys.map((key) => (
          <li
            key={key}
            className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {t(`tiers.${key}.badge`)}
            </p>
            <p className="mt-2 text-lg font-semibold text-zinc-900">
              {t(`tiers.${key}.name`)}
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-700">
              {t(`tiers.${key}.model`)}
            </p>
            <p className="mt-2 text-sm text-zinc-600">{t(`tiers.${key}.blurb`)}</p>
            <p className="mt-4 text-sm font-semibold text-zinc-900">
              {t(`tiers.${key}.price`)}
            </p>
            <Link
              href={key === "fast" ? "/generate" : "#flux-pack"}
              className="mt-4 inline-flex w-fit rounded-full border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
            >
              {t(`tiers.${key}.cta`)}
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-16 scroll-mt-24 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6">
        <h2 className="text-lg font-semibold text-zinc-900">
          {t("addonSectionTitle")}
        </h2>
        <p className="mt-2 text-sm text-zinc-600">{t("addonSectionBody")}</p>
        <ul className="mt-6 space-y-4">
          <li
            id="addon"
            className="scroll-mt-24 rounded-xl border border-zinc-200 bg-white p-4"
          >
            <p className="font-medium text-zinc-900">
              {t("addons.fastTopUp.name")}
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              {t("addons.fastTopUp.desc")}
            </p>
            <span className="mt-3 inline-block text-xs font-medium text-zinc-500">
              {t("addonPlaceholder")}
            </span>
          </li>
          <li
            id="flux-pack"
            className="scroll-mt-24 rounded-xl border border-zinc-200 bg-white p-4"
          >
            <p className="font-medium text-zinc-900">
              {t("addons.hdPack.name")}
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              {t("addons.hdPack.desc")}
            </p>
            <span className="mt-3 inline-block text-xs font-medium text-zinc-500">
              {t("addonPlaceholder")}
            </span>
          </li>
        </ul>
      </section>

      <Link
        href="/generate"
        className="mt-10 inline-block text-sm font-medium text-zinc-900 underline underline-offset-4"
      >
        {t("backToGenerate")}
      </Link>
    </div>
  );
}
