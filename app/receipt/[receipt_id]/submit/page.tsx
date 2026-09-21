import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AddEvidenceFlow } from "@/components/evidence/add-evidence-flow";
import { getPublicReceiptByReceiptId } from "@/lib/data/receipts";
import { getReceiptDisplayTitle } from "@/lib/domain/receipt";

type SubmitPageProps = { params: Promise<{ receipt_id: string }> };

export const metadata: Metadata = { title: "Add community evidence" };

export default async function SubmitEvidencePage({ params }: SubmitPageProps) {
  const { receipt_id: receiptId } = await params;
  const receipt = await getPublicReceiptByReceiptId(receiptId);
  if (!receipt) notFound();

  return (
    <main className="mx-auto max-w-3xl pb-12">
      <Link className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] underline-offset-4 hover:underline" href={`/receipt/${receipt.receiptId}`}>
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to receipt
      </Link>
      <header className="my-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--community)]">Community evidence</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">I know this project</h1>
        <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">Share what you observed. Your contribution will remain separate from the official record.</p>
      </header>
      <AddEvidenceFlow defaultAreaCouncil={receipt.areaCouncil} projectTitle={getReceiptDisplayTitle(receipt)} receiptId={receipt.receiptId} />
    </main>
  );
}
