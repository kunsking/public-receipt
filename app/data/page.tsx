import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About the data" };

export default function DataPage() {
  return (
    <article className="mx-auto max-w-4xl py-8 sm:py-12">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--official)]">Data methodology</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">About the Data</h1>

      <section className="mt-10 border-t border-[var(--border)] pt-8">
        <h2 className="text-2xl font-semibold">Prototype coverage</h2>
        <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">Selected 2026 Federal Government projects in the Federal Capital Territory.</p>
        <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-sm text-[var(--muted)]">Current indexed dataset</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">50 verified project records</p>
        </div>
      </section>

      <section className="mt-10 border-t border-[var(--border)] pt-8">
        <h2 className="text-2xl font-semibold">Primary source</h2>
        <p className="mt-3 leading-7 text-[var(--muted)]">2026 Federal Appropriation Act Details, published by the Budget Office of the Federation. Every indexed project retains a source excerpt and reference.</p>
      </section>

      <section className="mt-10 border-t border-[var(--border)] pt-8">
        <h2 className="text-2xl font-semibold">How records were selected</h2>
        <p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">
          The prototype reviews FCT-related rows in the official Act, checks each candidate in its document context and retains records with a traceable title, amount, responsible institution context, source page and usable location. It prioritises healthcare, education, roads, water and community infrastructure.
        </p>
      </section>

      <section className="mt-10 border-t border-[var(--border)] pt-8">
        <h2 className="text-2xl font-semibold">Source traceability</h2>
        <p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">
          Each receipt preserves the official wording, project code, source excerpt, PDF and printed page reference where available, publisher and indexed source URL. Plain-language fields never replace that retained record.
        </p>
      </section>

      <section className="mt-10 border-t border-[var(--border)] pt-8">
        <h2 className="text-2xl font-semibold">What “budgeted” means</h2>
        <p className="mt-3 leading-7 text-[var(--muted)]">A budget allocation is not proof that money was released or spent, procurement occurred, work began, or work was completed.</p>
        <p className="mt-6 rounded-2xl bg-[var(--foreground)] p-6 text-xl font-bold text-white sm:text-2xl">Budgeted ≠ Released ≠ Spent ≠ Completed.</p>
      </section>

      <section className="mt-10 border-t border-[var(--border)] pt-8">
        <h2 className="text-2xl font-semibold">Limitations</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-[var(--muted)]">
          <li>This is a curated FCT subset, not full national coverage.</li>
          <li>Complete fund-release data is not connected.</li>
          <li>Complete procurement data is not integrated.</li>
          <li>Community evidence is not yet comprehensive.</li>
          <li>Normalised locations may carry confidence levels.</li>
        </ul>
        <div className="mt-7 flex flex-wrap gap-5">
          <Link className="font-semibold text-[var(--official)] underline underline-offset-4" href="/verification">Read the verification model</Link>
          <a className="font-semibold text-[var(--official)] underline underline-offset-4" href="https://budgetoffice.gov.ng/index.php/2026-appropriation-act-details" rel="noopener noreferrer" target="_blank">Open the official source</a>
        </div>
      </section>
    </article>
  );
}
