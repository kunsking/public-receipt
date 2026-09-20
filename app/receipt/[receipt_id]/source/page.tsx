import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { getPublicReceiptByReceiptId } from "@/lib/data/receipts";
import { formatNaira, formatPublicDate } from "@/lib/format";

type SourcePageProps = { params: Promise<{ receipt_id: string }> };

const loadReceipt = cache(getPublicReceiptByReceiptId);

export async function generateMetadata({ params }: SourcePageProps): Promise<Metadata> {
  const { receipt_id: receiptId } = await params;
  const receipt = await loadReceipt(receiptId);
  if (!receipt) notFound();
  return { title: `Official source — ${receiptId}` };
}

export default async function ReceiptSourcePage({ params }: SourcePageProps) {
  const { receipt_id: receiptId } = await params;
  const receipt = await loadReceipt(receiptId);
  if (!receipt) notFound();

  const details = [
    ["Publisher", receipt.source.publisher],
    ["Publication date", receipt.source.publicationDate ? formatPublicDate(receipt.source.publicationDate) : null],
    ["Budget year", String(receipt.source.budgetYear)],
    ["Project code", receipt.projectCode],
    ["Amount", receipt.amount === null ? null : formatNaira(receipt.amount)],
    ["Source page", receipt.source.sourcePage],
    ["Source section", receipt.source.sourceSection],
    ["Source URL", receipt.source.sourceUrl],
    ["Date indexed", formatPublicDate(receipt.source.indexedAt)],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  return (
    <article className="mx-auto max-w-4xl pb-10">
      <Link className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] underline-offset-4 hover:underline" href={`/receipt/${receipt.receiptId}`}>
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to receipt
      </Link>

      <header className="mt-8 border-b border-[var(--border)] pb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--official)]">Official source</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">{receipt.source.documentTitle}</h1>
        <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
          This page preserves the provenance behind {receipt.receiptId}. It shows what the official budget source says, without turning that record into a claim about delivery.
        </p>
      </header>

      <section aria-labelledby="source-details-heading" className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8">
        <h2 className="text-2xl font-semibold" id="source-details-heading">Source details</h2>
        <dl className="mt-5 divide-y divide-[var(--border)]">
          {details.map(([label, value]) => (
            <div className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6" key={label}>
              <dt className="text-sm text-[var(--muted)]">{label}</dt>
              <dd className={`${label === "Source URL" ? "break-all" : "break-words"} font-medium`}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="wording-heading" className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--muted)]">Original project wording</p>
        <h2 className="mt-2 text-xl font-semibold leading-snug" id="wording-heading">{receipt.officialTitle}</h2>
      </section>

      <section aria-labelledby="excerpt-heading" className="mt-6 overflow-hidden rounded-2xl border border-[#cfc8b9] bg-[#eee8dc]">
        <div className="border-b border-[#cfc8b9] px-5 py-4 sm:px-8">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em]" id="excerpt-heading">Original record</h2>
        </div>
        <blockquote className="whitespace-pre-wrap break-words p-5 font-mono text-sm leading-7 sm:p-8 sm:text-base" data-testid="source-excerpt">
          {receipt.source.sourceExcerpt}
        </blockquote>
      </section>

      <p className="mt-5 rounded-xl border border-[var(--border)] p-4 text-sm leading-6 text-[var(--muted)]">
        Source classifications such as “NEW” or “ONGOING” are preserved as documentary wording. They are not proof that work began or was completed.
      </p>

      <a
        className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--foreground)] px-5 text-sm font-semibold text-white"
        href={receipt.source.sourceUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        Open original document <ExternalLink aria-hidden="true" className="size-4" />
      </a>
    </article>
  );
}
