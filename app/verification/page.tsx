import type { Metadata } from "next";

import { EvidenceBadge } from "@/components/evidence/evidence-badge";
import type { EvidenceBadgeType } from "@/lib/domain/receipt";

export const metadata: Metadata = { title: "How verification works" };

const LABELS: Array<{ type: EvidenceBadgeType; copy: string }> = [
  { type: "official", copy: "Information taken directly from an authoritative government source." },
  { type: "verified", copy: "Independent evidence that has been validated." },
  { type: "corroborated", copy: "Multiple independent observations materially support the same finding." },
  { type: "community", copy: "Submitted by a community member but not independently verified." },
  { type: "unverified", copy: "There is not enough evidence to support the claim." },
  { type: "disputed", copy: "Credible sources materially conflict." },
];

export default function VerificationPage() {
  return (
    <section className="mx-auto max-w-4xl py-8 sm:py-12">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--official)]">Trust model</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">How Public Receipt handles evidence</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
        Official records, independent evidence and community observations remain visibly separate. These labels describe evidence state, not political scores or delivery ratings.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {LABELS.map((label) => (
          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6" key={label.type}>
            <EvidenceBadge type={label.type} />
            <p className="mt-4 leading-7 text-[var(--muted)]">{label.copy}</p>
          </article>
        ))}
      </div>
      <blockquote className="mt-8 border-l-4 border-[var(--official)] py-2 pl-5 text-xl font-semibold">
        Public Receipt shows uncertainty instead of hiding it.
      </blockquote>
    </section>
  );
}
