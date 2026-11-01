import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-6xl">🔎</p>
      <h1 className="mt-4 text-2xl font-bold">{t.notFound.title}</h1>
      <p className="mt-2 text-muted">{t.notFound.text}</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-brand px-5 py-2 font-medium text-brand-ink">
        {t.notFound.back}
      </Link>
    </div>
  );
}
