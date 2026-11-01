import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SearchResults } from "@/components/SearchResults";
import { getCategory, parseSearchParams } from "@/lib/catalog";
import { getI18n } from "@/lib/i18n/server";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, t } = await getI18n();
  const cat = getCategory((await params).slug, lang);
  return { title: cat?.name ?? t.category.fallback };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lang, t } = await getI18n();
  const cat = getCategory(slug, lang);
  if (!cat) notFound();
  return (
    <>
      <div className="bg-hero text-nav-ink">
        <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-4 py-6">
          <span className="text-5xl">{cat.emoji}</span>
          <div>
            <nav className="text-xs opacity-80">
              <Link href="/" className="hover:underline">
                {t.category.home}
              </Link>{" "}
              › {cat.name}
            </nav>
            <h1 className="font-display text-3xl font-bold">{cat.name}</h1>
            <p className="opacity-85">{cat.description}</p>
          </div>
        </div>
      </div>
      <SearchResults params={parseSearchParams(await searchParams)} basePath={`/category/${slug}`} lockedCategory={slug} />
    </>
  );
}
