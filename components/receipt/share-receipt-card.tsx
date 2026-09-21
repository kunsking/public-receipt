import { CheckCircle2 } from "lucide-react";

import type { ReceiptShareData } from "@/lib/share/receipt-share";

export function ShareReceiptCard({ data }: { data: ReceiptShareData }) {
  return (
    <article
      aria-label={`Share preview for ${data.receiptId}`}
      className="relative overflow-hidden rounded-[1.75rem] border border-[#d4d0c7] bg-[#fffdf8] p-6 shadow-sm sm:p-9"
      data-testid="share-receipt-card"
    >
      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-2 bg-[var(--official)]" />
      <div className="ml-2">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-dashed border-[#c8c3b8] pb-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--official)]">
              PUBLIC RECEIPT
            </p>
            <p className="mt-2 break-all font-mono text-xs font-semibold text-[var(--muted)]">
              {data.receiptId}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--official-soft)] px-3 py-2 text-xs font-bold tracking-[0.06em] text-[var(--official)]">
            <CheckCircle2 aria-hidden="true" className="size-4" /> OFFICIAL RECORD
          </span>
        </div>

        <h2 className="mt-7 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
          {data.title}
        </h2>
        <p className="mt-4 text-sm font-medium leading-6 text-[var(--muted)]">{data.location}</p>
        <p className="mt-8 text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
          {data.allocation}
        </p>

        <div className="mt-8 border-t border-dashed border-[#c8c3b8] pt-5">
          <p className="text-xs font-bold uppercase tracking-[0.13em] text-[var(--muted)]">
            Implementation evidence
          </p>
          <p className="mt-3 text-sm font-bold leading-6 tracking-[0.04em]">
            {data.evidenceState}
          </p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Every public project deserves a public receipt.
          </p>
        </div>
      </div>
    </article>
  );
}
