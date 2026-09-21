import Link from "next/link";
import { CheckCircle2, Minus, Users } from "lucide-react";

import {
  hasVerifiedImplementationEvidence,
  NO_IMPLEMENTATION_EVIDENCE,
  NO_IMPLEMENTATION_EVIDENCE_CAVEAT,
  type EvidenceSummary as EvidenceSummaryData,
} from "@/lib/domain/receipt";

export function EvidenceSummary({
  summary,
  receiptId,
}: {
  summary: EvidenceSummaryData;
  receiptId?: string;
}) {
  const verified = hasVerifiedImplementationEvidence(summary);
  const communityEvidence = summary.corroboratedReports + summary.communityReports;

  return (
    <section aria-labelledby="delivery-heading" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--muted)]">Implementation evidence</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight" id="delivery-heading">
        What do we know about delivery?
      </h2>

      <dl className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
        <div className="flex items-center justify-between gap-4 py-4">
          <dt className="font-medium">Official record</dt>
          <dd className="flex items-center gap-2 text-sm text-[var(--official)]">
            <CheckCircle2 aria-hidden="true" className="size-4" /> Budget entry found
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-4">
          <dt className="font-medium">Independent evidence</dt>
          <dd className="flex items-center gap-2 text-right text-sm text-[var(--muted)]">
            <Minus aria-hidden="true" className="size-4 shrink-0" />
            {summary.verifiedIndependent > 0
              ? `${summary.verifiedIndependent} verified`
              : "None connected"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-4">
          <dt className="font-medium">Community evidence</dt>
          <dd className="flex items-center gap-2 text-right text-sm text-[var(--muted)]">
            <Users aria-hidden="true" className="size-4 shrink-0" />
            {communityEvidence > 0
              ? `${communityEvidence} connected`
              : "No community evidence yet"}
          </dd>
        </div>
      </dl>

      <div className="mt-6 rounded-xl bg-[#f3f1eb] p-5">
        <p className="text-xs font-bold uppercase tracking-[0.13em] text-[var(--muted)]">Current evidence state</p>
        <p className="mt-3 max-w-xl text-lg font-bold leading-snug tracking-[0.04em]" data-testid="implementation-state">
          {verified ? "VERIFIED IMPLEMENTATION EVIDENCE CONNECTED" : NO_IMPLEMENTATION_EVIDENCE}
        </p>
        {!verified ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            {NO_IMPLEMENTATION_EVIDENCE_CAVEAT}
          </p>
        ) : null}
        {summary.disputed ? (
          <p className="mt-3 text-sm font-semibold text-[var(--disputed)]">Some connected evidence is disputed.</p>
        ) : null}
      </div>

      {communityEvidence === 0 ? (
        <div className="mt-7">
          <h3 className="text-lg font-semibold">No community evidence yet</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Community observations will appear separately from the official government record.
          </p>
        </div>
      ) : null}
      {receiptId ? (
        <Link
          className="mt-6 inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-semibold"
          href={`/receipt/${receiptId}/evidence`}
        >
          View all community evidence
        </Link>
      ) : null}
    </section>
  );
}
