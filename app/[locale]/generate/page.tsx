import { setRequestLocale } from "next-intl/server";
import { GenerateClient } from "./generate-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function GeneratePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-6 py-16">
      <GenerateClient />
    </div>
  );
}
