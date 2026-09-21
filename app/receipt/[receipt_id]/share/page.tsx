import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cache } from "react";

import { ShareActions } from "@/components/receipt/share-actions";
import { ShareReceiptCard } from "@/components/receipt/share-receipt-card";
import { getPublicReceiptByReceiptId } from "@/lib/data/receipts";
import { getReceiptShareData } from "@/lib/share/receipt-share";

type SharePageProps = { params: Promise<{ receipt_id: string }> };

const loadReceipt = cache(getPublicReceiptByReceiptId);

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { receipt_id: receiptId } = await params;
  const receipt = await loadReceipt(receiptId);
  if (!receipt) notFound();
  const shareData = getReceiptShareData(receipt);
  const cardPath = `/api/receipt/${receipt.receiptId}/card`;

  return {
    title: `Share ${receipt.receiptId}`,
    description: `${shareData.title} — ${shareData.allocation}, ${shareData.location}.`,
    openGraph: {
      title: `Public Receipt — ${receipt.receiptId}`,
      description: `${shareData.title} — ${shareData.allocation}.`,
      images: [{ url: cardPath, width: 1200, height: 630, alt: `Public Receipt ${receipt.receiptId}` }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Public Receipt — ${receipt.receiptId}`,
      description: `${shareData.title} — ${shareData.allocation}.`,
      images: [cardPath],
    },
  };
}

export default async function ShareReceiptPage({ params }: SharePageProps) {
  const { receipt_id: receiptId } = await params;
  const receipt = await loadReceipt(receiptId);
  if (!receipt) notFound();
  const shareData = getReceiptShareData(receipt);

  return (
    <main className="mx-auto max-w-3xl pb-12">
      <Link
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--muted)] underline-offset-4 hover:underline"
        href={`/receipt/${receipt.receiptId}`}
      >
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to receipt
      </Link>
      <header className="my-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--official)]">
          Share this receipt
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
          A public record made easy to share.
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
          This preview uses only the stored project record and its current public evidence state.
        </p>
      </header>
      <ShareReceiptCard data={shareData} />
      <ShareActions receiptId={receipt.receiptId} title={shareData.title} />
      <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
        A budget record confirms an appropriation entry. It does not by itself prove release, spending or completion.
      </p>
    </main>
  );
}
