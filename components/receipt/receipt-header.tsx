import { MapPin } from "lucide-react";

import { EvidenceBadge } from "@/components/evidence/evidence-badge";
import {
  getReceiptDisplayTitle,
  getReceiptLocation,
  type PublicReceipt,
} from "@/lib/domain/receipt";
import { formatNaira } from "@/lib/format";

export function ReceiptHeader({ receipt }: { receipt: PublicReceipt }) {
  const location = getReceiptLocation(receipt);

  return (
    <header className="border-b border-[var(--border)] pb-8 sm:pb-10">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--official)]">Public Receipt</p>
      <p className="mt-3 break-all font-mono text-sm font-semibold tracking-wide text-[var(--muted)]">
        {receipt.receiptId}
      </p>
      <h1 className="mt-6 max-w-4xl text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-5xl">
        {getReceiptDisplayTitle(receipt)}
      </h1>
      <div className="mt-6 flex items-start gap-2 text-[var(--muted)]">
        <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <div>
          {location.isPossibleMatch ? (
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--caution)]">
              Possible location match
            </p>
          ) : null}
          <p className="font-medium text-[var(--foreground)]">{location.primary}</p>
          {location.secondary ? <p className="mt-0.5 text-sm">{location.secondary}</p> : null}
        </div>
      </div>
      <p className="mt-7 text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">
        {receipt.amount === null ? "Amount not specified" : formatNaira(receipt.amount)}
      </p>
      <div className="mt-6">
        <EvidenceBadge type="official" />
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        Supported directly by an authoritative government source. This does not confirm release, spending or delivery.
      </p>
    </header>
  );
}
