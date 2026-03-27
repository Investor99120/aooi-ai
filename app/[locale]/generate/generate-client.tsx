"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useState } from "react";
import type { ModelId } from "@/lib/ai/types";

type Tier = "fast" | "hd";

const tierToModel: Record<Tier, ModelId> = {
  fast: "banana",
  hd: "flux_dev",
};

export function GenerateClient() {
  const t = useTranslations("Generate");
  const [tier, setTier] = useState<Tier>("fast");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const model = tierToModel[tier];

    if (tier === "hd") {
      setMessage(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        code?: string;
      };
      setMessage(data.message ?? `HTTP ${res.status}`);
    } catch {
      setMessage(t("networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {t("title")}
        </h1>
        <p className="mt-2 text-zinc-600">
          {t.rich("intro", {
            fast: (chunks) => (
              <strong className="font-medium text-zinc-800">{chunks}</strong>
            ),
            pricing: (chunks) => (
              <Link
                href="/pricing#flux-pack"
                className="mx-1 font-medium text-zinc-900 underline underline-offset-4"
              >
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setTier("fast");
            setMessage(null);
          }}
          className={`rounded-xl border p-4 text-left transition ${
            tier === "fast"
              ? "border-zinc-900 bg-zinc-900 text-white shadow-md"
              : "border-zinc-200 bg-white hover:border-zinc-300"
          }`}
        >
          <p className="text-sm font-medium">{t("tierFastTitle")}</p>
          <p
            className={`mt-1 text-sm ${tier === "fast" ? "text-zinc-300" : "text-zinc-600"}`}
          >
            {t("tierFastBody")}
          </p>
        </button>
        <button
          type="button"
          onClick={() => {
            setTier("hd");
            setMessage(null);
          }}
          className={`rounded-xl border p-4 text-left transition ${
            tier === "hd"
              ? "border-amber-600 bg-amber-50 ring-1 ring-amber-600/20"
              : "border-zinc-200 bg-white hover:border-zinc-300"
          }`}
        >
          <p className="text-sm font-medium text-zinc-900">{t("tierHdTitle")}</p>
          <p className="mt-1 text-sm text-zinc-600">{t("tierHdBody")}</p>
        </button>
      </div>

      {tier === "hd" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-5 text-sm text-amber-950">
          <p className="font-medium">{t("hdPanelTitle")}</p>
          <p className="mt-2 text-amber-900/90">{t("hdPanelBody")}</p>
          <Link
            href="/pricing#flux-pack"
            className="mt-4 inline-flex rounded-full bg-amber-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-amber-800"
          >
            {t("hdCta")}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-zinc-800">{t("promptLabel")}</span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder={t("promptPlaceholder")}
              className="resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              maxLength={4000}
            />
          </label>
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="inline-flex w-fit items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t("submitting") : t("submit")}
          </button>
          {message ? (
            <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
              {message}
            </p>
          ) : null}
        </form>
      )}

      <Link
        href="/"
        className="text-sm font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
