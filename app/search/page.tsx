type SearchPageProps = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  return (
    <section className="py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--official)]">Search</p>
      <h1 className="mt-2 text-3xl font-semibold">Searching public records</h1>
      <p className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--muted)]">
        {q ? `Query: “${q}”` : "No query supplied."}
      </p>
      <p className="mt-4 text-sm text-[var(--muted)]">Natural-language interpretation and deterministic project retrieval are implemented in M2.</p>
    </section>
  );
}
