import type { Metadata } from "next";
import { SearchResults } from "@/components/SearchResults";
import { parseSearchParams } from "@/lib/catalog";
import { fill } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = parseSearchParams(await searchParams);
  const { t } = await getI18n();
  return { title: q ? fill(t.search.resultsFor, { q }) : t.search.allProducts };
}

export default async function SearchPage({ searchParams }: Props) {
  return <SearchResults params={parseSearchParams(await searchParams)} basePath="/search" />;
}
