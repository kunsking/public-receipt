import type { Metadata } from "next";

import { SearchExperience } from "@/components/search/search-experience";

export const metadata: Metadata = { title: "Search" };

type SearchPageProps = { searchParams: Promise<{ q?: string | string[] }> };

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = Array.isArray(q) ? q[0] ?? "" : q;
  return <SearchExperience key={query} initialQuery={query} />;
}
