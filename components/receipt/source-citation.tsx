import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import type { PublicReceipt } from "@/lib/domain/receipt";

export function SourceCitation({ receipt }: { receipt: PublicReceipt }) {
  return (
    <section aria-labelledby="source-heading" className="rounded-2xl border border-[var(--border)] bg-[var(--official)] p-5 text-white sm:p-7">
      <div className="flex items-start gap-3">
        <BookOpen aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/70">Source</p>
          <h2 className="mt-2 text-xl font-semibold leading-snug" id="source-heading">
            {receipt.source.documentTitle}
          </h2>
        </div>
      </div>
      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-white/65">Publisher</dt>
          <dd className="mt-1 font-medium">{receipt.source.publisher}</dd>
        </div>
        {receipt.source.sourcePage ? (
          <div>
            <dt className="text-white/65">Page</dt>
            <dd className="mt-1 font-medium">{receipt.source.sourcePage}</dd>
          </div>
        ) : null}
      </dl>
      <Link
        className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-[var(--official)]"
        href={`/receipt/${receipt.receiptId}/source`}
      >
        View official source <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </section>
  );
}
