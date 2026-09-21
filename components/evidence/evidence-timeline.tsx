import Image from "next/image";

import { EvidenceBadge } from "@/components/evidence/evidence-badge";
import { EVIDENCE_OBSERVATION_LABELS, type PublicEvidenceItem } from "@/lib/domain/evidence";
import { formatPublicDate } from "@/lib/format";

function badgeForStatus(status: PublicEvidenceItem["verificationStatus"]) {
  if (status === "verified_independent") return "verified" as const;
  if (status === "corroborated") return "corroborated" as const;
  if (status === "disputed") return "disputed" as const;
  return "community" as const;
}

export function EvidenceTimeline({ evidence }: { evidence: PublicEvidenceItem[] }) {
  if (evidence.length === 0) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8" data-testid="public-evidence-empty">
        <h2 className="text-2xl font-semibold tracking-tight">No public community evidence yet</h2>
        <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
          Community observations are kept separate from the official record and appear here only when they meet Public Receipt&apos;s publication rules.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-5" data-testid="public-evidence-timeline">
      {evidence.map((item, index) => (
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7" key={`${item.submittedAt}-${index}`}>
          <div className="flex flex-wrap gap-2">
            <EvidenceBadge type={badgeForStatus(item.verificationStatus)} />
            {item.verificationStatus === "community_report" ? <EvidenceBadge type="unverified" /> : null}
          </div>
          <p className="mt-5 text-xl font-semibold">{EVIDENCE_OBSERVATION_LABELS[item.observationType]}</p>
          {item.description ? <p className="mt-3 whitespace-pre-wrap break-words leading-7">{item.description}</p> : null}
          {item.imageUrl ? (
            <Image alt="Approved community evidence" className="mt-5 h-auto max-h-[32rem] w-full rounded-xl object-cover" height={item.imageHeight ?? 900} src={item.imageUrl} width={item.imageWidth ?? 1200} />
          ) : null}
          <dl className="mt-5 grid gap-3 border-t border-[var(--border)] pt-5 text-sm sm:grid-cols-2">
            <div><dt className="text-[var(--muted)]">Approximate location</dt><dd className="mt-1 font-medium">{[item.locality, item.areaCouncil].filter(Boolean).join(", ")}</dd></div>
            <div><dt className="text-[var(--muted)]">Submitted</dt><dd className="mt-1 font-medium">{formatPublicDate(item.submittedAt)}</dd></div>
          </dl>
          <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
            {item.verificationStatus === "community_report" ? "This approved community report has not been independently verified." : "This evidence is shown with its current verification classification."}
          </p>
        </article>
      ))}
    </div>
  );
}
