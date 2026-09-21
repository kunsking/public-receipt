import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { EvidenceTimeline } from "@/components/evidence/evidence-timeline";
import { getPublicEvidenceByReceiptId } from "@/lib/data/evidence";
import { getPublicReceiptByReceiptId } from "@/lib/data/receipts";
import { getReceiptDisplayTitle } from "@/lib/domain/receipt";

type EvidencePageProps = { params: Promise<{ receipt_id: string }> };

export const metadata: Metadata = { title: "Community evidence" };

export default async function ReceiptEvidencePage({ params }: EvidencePageProps) {
  const { receipt_id: receiptId } = await params;
  const [receipt, evidence] = await Promise.all([
    getPublicReceiptByReceiptId(receiptId),
    getPublicEvidenceByReceiptId(receiptId),
  ]);
  if (!receipt || !evidence) notFound();

  return (
    <main className="mx-auto max-w-4xl pb-12">
      <Link className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] underline-offset-4 hover:underline" href={`/receipt/${receipt.receiptId}`}>
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to receipt
      </Link>
      <header className="my-8 border-b border-[var(--border)] pb-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--community)]">Community evidence</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">What has the community observed?</h1>
        <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">Public observations for {getReceiptDisplayTitle(receipt)}. These remain separate from the official budget record.</p>
      </header>
      <EvidenceTimeline evidence={evidence} />
      <Link className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--foreground)] px-5 text-sm font-semibold text-white" href={`/receipt/${receipt.receiptId}/submit`}>I know this project</Link>
    </main>
  );
}
