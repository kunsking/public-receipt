import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { EvidenceSummary } from "@/components/evidence/evidence-summary";
import { ActionPanel } from "@/components/receipt/action-panel";
import { OfficialRecord } from "@/components/receipt/official-record";
import { ReceiptHeader } from "@/components/receipt/receipt-header";
import { ReceiptSummary } from "@/components/receipt/receipt-summary";
import { SourceCitation } from "@/components/receipt/source-citation";
import { getPublicReceiptByReceiptId } from "@/lib/data/receipts";

type ReceiptPageProps = { params: Promise<{ receipt_id: string }> };

const loadReceipt = cache(getPublicReceiptByReceiptId);

export async function generateMetadata({ params }: ReceiptPageProps): Promise<Metadata> {
  const { receipt_id: receiptId } = await params;
  const receipt = await loadReceipt(receiptId);

  if (!receipt) notFound();

  return {
    title: receipt.receiptId,
    description: `${receipt.officialTitle} — an official ${receipt.budgetYear} budget record indexed by Public Receipt.`,
  };
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const { receipt_id: receiptId } = await params;
  const receipt = await loadReceipt(receiptId);
  if (!receipt) notFound();

  return (
    <article className="mx-auto max-w-5xl pb-10">
      <Link className="text-sm font-medium text-[var(--muted)] underline-offset-4 hover:underline" href="/search?q=projects%20in%20FCT">
        ← Search public records
      </Link>

      <div className="mt-8 rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-8 lg:p-10">
        <ReceiptHeader receipt={receipt} />

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.65fr)]">
          {receipt.plainLanguageDescription?.trim() ? (
            <div className="lg:col-start-1">
              <ReceiptSummary receipt={receipt} />
            </div>
          ) : null}
          <div className="lg:col-start-1">
            <OfficialRecord receipt={receipt} />
          </div>
          <aside className="lg:col-start-2 lg:row-start-1 lg:sticky lg:top-6">
            <SourceCitation receipt={receipt} />
          </aside>
          <div className="lg:col-start-1">
            <EvidenceSummary summary={receipt.evidenceSummary} />
          </div>
          <aside className="lg:col-start-2">
            <div className="rounded-2xl border border-[var(--border)] p-5 text-sm leading-6 text-[var(--muted)]">
              <p className="font-semibold text-[var(--foreground)]">Budget record, not a delivery rating</p>
              <p className="mt-2">Budgeted ≠ Released ≠ Spent ≠ Completed.</p>
              <Link className="mt-3 inline-block font-semibold text-[var(--official)] underline underline-offset-4" href="/verification">
                How verification works
              </Link>
            </div>
          </aside>
        </div>

        <div className="mt-8 border-t border-[var(--border)] pt-8">
          <ActionPanel receipt={receipt} />
        </div>
      </div>
    </article>
  );
}
