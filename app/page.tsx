import Link from "next/link";

const suggestions = [
  "Healthcare in Bwari",
  "Roads in Kuje",
  "Schools in AMAC",
  "Water in Gwagwalada",
];

export default function HomePage() {
  return (
    <section className="mx-auto max-w-3xl py-10 sm:py-16">
      <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--official)]">
        Every public project deserves a public receipt.
      </p>
      <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
        What did government promise your community?
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
        Search public budget records in plain language and see the evidence behind every answer.
      </p>

      <form action="/search" className="mt-10" method="get">
        <label className="sr-only" htmlFor="q">Ask about a project, place or public service</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="q"
            name="q"
            maxLength={300}
            placeholder="Ask about a project, place or public service…"
            className="min-h-14 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-base shadow-sm"
          />
          <button
            type="submit"
            className="min-h-14 rounded-xl bg-[var(--foreground)] px-6 font-medium text-white"
          >
            Find a Receipt
          </button>
        </div>
      </form>

      <div className="mt-8">
        <p className="text-sm font-medium">Try asking:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Link
              key={suggestion}
              href={`/search?q=${encodeURIComponent(suggestion)}`}
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm"
            >
              {suggestion}
            </Link>
          ))}
        </div>
      </div>

      <aside className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-sm font-semibold">Hackathon prototype coverage</p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          Selected 2026 Federal Government projects in the FCT.
        </p>
      </aside>
    </section>
  );
}
