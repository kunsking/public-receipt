"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import type { SearchInterpretation } from "@/lib/ai/schemas";
import type { SearchProjectResult } from "@/lib/data/search";
import { FCT_AREA_COUNCILS, PROJECT_SECTORS } from "@/lib/domain/constants";
import { formatNaira } from "@/lib/format";

interface SearchApiResponse {
  interpretation: SearchInterpretation;
  results: SearchProjectResult[];
  meta: {
    count: number;
    coverage: "selected_fct_2026";
    fallbackUsed: boolean;
    message?: string;
  };
}

const SECTOR_LABELS: Record<string, string> = {
  healthcare: "Healthcare",
  education: "Education",
  roads_transport: "Roads & transport",
  water_sanitation: "Water & sanitation",
  community_infrastructure: "Community infrastructure",
  other: "Other",
};

function resultHeading(interpretation: SearchInterpretation): string {
  const parts = [
    interpretation.sector ? SECTOR_LABELS[interpretation.sector] : null,
    interpretation.areaCouncil ? `in ${interpretation.areaCouncil}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : "Matching public records";
}

export function SearchExperience({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [response, setResponse] = useState<SearchApiResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(initialQuery));
  const [error, setError] = useState<string | null>(null);
  const [areaFilter, setAreaFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [sort, setSort] = useState<"relevant" | "amount_desc">("relevant");

  useEffect(() => {
    if (!initialQuery) return;

    const controller = new AbortController();

    void fetch("/api/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: initialQuery }),
      signal: controller.signal,
    })
      .then(async (result) => {
        const payload = (await result.json()) as SearchApiResponse | { error?: string };
        if (!result.ok || !("results" in payload)) {
          throw new Error("error" in payload && payload.error ? payload.error : "Search failed.");
        }
        setResponse(payload);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "Search failed.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [initialQuery]);

  const visibleResults = useMemo(() => {
    const filtered = (response?.results ?? []).filter(
      (result) =>
        (!areaFilter || result.areaCouncil === areaFilter) &&
        (!sectorFilter || result.sector === sectorFilter),
    );

    return sort === "amount_desc"
      ? [...filtered].sort((left, right) => (right.amount ?? -1) - (left.amount ?? -1))
      : filtered;
  }, [areaFilter, response, sectorFilter, sort]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function chooseClarification(scope: "fct" | "amac") {
    const clarified = initialQuery.replace(
      /\bAbuja\b/gi,
      scope === "fct" ? "Federal Capital Territory" : "AMAC",
    );
    router.push(`/search?q=${encodeURIComponent(clarified)}`);
  }

  return (
    <section className="mx-auto max-w-4xl py-8 sm:py-12">
      <Link className="text-sm font-medium text-[var(--muted)] underline-offset-4 hover:underline" href="/">
        ← Public Receipt
      </Link>

      <form className="mt-6" onSubmit={submitSearch}>
        <label className="block text-sm font-semibold" htmlFor="search-query">
          Search public records
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="search-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={300}
            placeholder="Ask about a project, place or public service…"
            className="min-h-14 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-base shadow-sm"
          />
          <button className="min-h-14 rounded-xl bg-[var(--foreground)] px-6 font-semibold text-white" type="submit">
            Find a Receipt
          </button>
        </div>
      </form>

      {loading ? (
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6" aria-live="polite" aria-busy="true">
          <p className="text-lg font-semibold">Searching public records…</p>
          <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <li>✓ Interpreting place, service and budget year</li>
            <li>✓ Checking the verified 2026 FCT index</li>
            <li>Finding receipts…</li>
          </ul>
        </div>
      ) : null}

      {error ? (
        <div className="mt-8 rounded-2xl border border-[var(--caution)] bg-[var(--surface)] p-6" role="alert">
          <h1 className="text-2xl font-semibold">We couldn&apos;t interpret that question.</h1>
          <p className="mt-3 text-[var(--muted)]">Try a place and service, such as “Healthcare in Bwari.”</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="min-h-11 rounded-lg bg-[var(--foreground)] px-4 text-sm font-semibold text-white" onClick={() => router.refresh()} type="button">
              Try again
            </button>
            <Link className="grid min-h-11 place-items-center rounded-lg border border-[var(--border)] px-4 text-sm font-semibold" href="/">
              Search another place
            </Link>
          </div>
        </div>
      ) : null}

      {response?.interpretation.needsClarification ? (
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6" role="status">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--official)]">One detail first</p>
          <h1 className="mt-2 text-2xl font-semibold">{response.interpretation.clarificationQuestion}</h1>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button className="min-h-11 rounded-lg bg-[var(--foreground)] px-5 font-semibold text-white" onClick={() => chooseClarification("fct")} type="button">
              All FCT
            </button>
            <button className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-5 font-semibold" onClick={() => chooseClarification("amac")} type="button">
              AMAC
            </button>
          </div>
        </div>
      ) : null}

      {response && !response.interpretation.needsClarification && response.results.length > 0 ? (
        <div className="mt-8">
          <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--official)]">Search results</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{resultHeading(response.interpretation)}</h1>
              <p className="mt-2 text-[var(--muted)]" aria-live="polite">
                {visibleResults.length} matching public {visibleResults.length === 1 ? "record" : "records"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm" aria-label="Recognised search parameters">
              {response.interpretation.areaCouncil ? <span className="search-chip">Location: {response.interpretation.areaCouncil}</span> : null}
              {response.interpretation.sector ? <span className="search-chip">Sector: {SECTOR_LABELS[response.interpretation.sector]}</span> : null}
              {response.interpretation.year ? <span className="search-chip">Budget year: {response.interpretation.year}</span> : null}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <label className="text-sm font-medium">
              Area Council
              <select className="mt-1 min-h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3" value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)}>
                <option value="">All areas</option>
                {FCT_AREA_COUNCILS.map((area) => <option key={area} value={area}>{area}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">
              Sector
              <select className="mt-1 min-h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3" value={sectorFilter} onChange={(event) => setSectorFilter(event.target.value)}>
                <option value="">All sectors</option>
                {PROJECT_SECTORS.map((sector) => <option key={sector} value={sector}>{SECTOR_LABELS[sector]}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">
              Sort
              <select className="mt-1 min-h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3" value={sort} onChange={(event) => setSort(event.target.value as "relevant" | "amount_desc")}>
                <option value="relevant">Most relevant</option>
                <option value="amount_desc">Highest allocation</option>
              </select>
            </label>
          </div>

          {visibleResults.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2" data-testid="project-results">
              {visibleResults.map((result) => (
                <article className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm" key={result.id} data-testid="project-card">
                  <span className="w-fit rounded-full bg-[var(--official-soft)] px-3 py-1 text-xs font-bold tracking-[0.08em] text-[var(--official)]">OFFICIAL RECORD</span>
                  <h2 className="mt-4 text-xl font-semibold leading-snug">{result.plainLanguageTitle ?? result.officialTitle}</h2>
                  {result.amount !== null ? <p className="mt-4 text-2xl font-semibold tabular-nums">{formatNaira(result.amount)}</p> : null}
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div><dt className="text-[var(--muted)]">Area Council</dt><dd className="mt-1 font-medium">{result.areaCouncil ?? "FCT"}</dd></div>
                    <div><dt className="text-[var(--muted)]">Sector</dt><dd className="mt-1 font-medium">{SECTOR_LABELS[result.sector]}</dd></div>
                  </dl>
                  <p className="mt-4 text-xs font-medium text-[var(--muted)]">{result.receiptId}</p>
                  <Link className="mt-5 grid min-h-11 place-items-center rounded-lg border border-[var(--foreground)] px-4 text-sm font-semibold" href={`/receipt/${result.receiptId}`}>
                    View Receipt
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-xl border border-[var(--border)] bg-white p-5 text-[var(--muted)]">No records match these filters. Clear a filter to see the original results.</p>
          )}
        </div>
      ) : null}

      {response && !response.interpretation.needsClarification && response.results.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8" role="status" data-testid="no-results">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--caution)]">No matching verified record is currently indexed.</p>
          <h1 className="mt-3 text-3xl font-semibold">We couldn&apos;t find a match</h1>
          <p className="mt-4 text-[var(--muted)]">We don&apos;t currently have enough indexed information to answer this query.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="grid min-h-11 place-items-center rounded-lg bg-[var(--foreground)] px-4 text-sm font-semibold text-white" href="/">Search again</Link>
            <Link className="grid min-h-11 place-items-center rounded-lg border border-[var(--border)] px-4 text-sm font-semibold" href="/search?q=projects%20in%20FCT">Browse another area</Link>
            <Link className="grid min-h-11 place-items-center rounded-lg border border-[var(--border)] px-4 text-sm font-semibold" href="/search?q=projects%20in%20FCT">Broaden sector</Link>
          </div>
          <p className="mt-7 border-t border-[var(--border)] pt-5 text-sm leading-6 text-[var(--muted)]">
            No result does not mean no government project exists. It means Public Receipt does not currently have a matching verified record in this prototype dataset.
          </p>
        </div>
      ) : null}

      {response?.meta.fallbackUsed ? (
        <p className="mt-5 text-xs text-[var(--muted)]">Search interpreted with Public Receipt&apos;s deterministic index rules.</p>
      ) : null}
    </section>
  );
}
