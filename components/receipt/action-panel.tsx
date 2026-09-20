import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import type { PublicReceipt } from "@/lib/domain/receipt";

export function ActionPanel({ receipt }: { receipt: PublicReceipt }) {
  const searchQuery = [receipt.sector.replaceAll("_", " "), receipt.areaCouncil]
    .filter(Boolean)
    .join(" in ");

  return (
    <nav aria-label="Receipt actions" className="flex flex-col gap-3 sm:flex-row">
      <a
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--foreground)] px-5 text-sm font-semibold text-white"
        href={receipt.source.sourceUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        View official source <ExternalLink aria-hidden="true" className="size-4" />
      </a>
      <Link
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-semibold"
        href={`/search?q=${encodeURIComponent(searchQuery)}`}
      >
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to search results
      </Link>
    </nav>
  );
}
