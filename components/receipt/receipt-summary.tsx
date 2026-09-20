import type { PublicReceipt } from "@/lib/domain/receipt";

export function ReceiptSummary({ receipt }: { receipt: PublicReceipt }) {
  if (!receipt.plainLanguageDescription?.trim()) return null;

  return (
    <section aria-labelledby="summary-heading" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--muted)]">Plain-language explanation</p>
      <h2 className="mt-2 text-xl font-semibold" id="summary-heading">What this budget entry describes</h2>
      <p className="mt-3 leading-7 text-[var(--muted)]">{receipt.plainLanguageDescription}</p>
    </section>
  );
}
