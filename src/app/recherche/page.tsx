import type { Metadata } from "next";
import { SearchResults } from "@/components/SearchResults";
import { parseSearchParams } from "@/lib/catalog";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = parseSearchParams(await searchParams);
  return { title: q ? `Résultats pour « ${q} »` : "Tous les produits" };
}

export default async function SearchPage({ searchParams }: Props) {
  return <SearchResults params={parseSearchParams(await searchParams)} basePath="/recherche" />;
}
