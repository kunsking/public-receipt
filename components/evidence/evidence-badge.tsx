import { AlertTriangle, CheckCircle2, CircleHelp, Users } from "lucide-react";

import type { EvidenceBadgeType } from "@/lib/domain/receipt";

const BADGES: Record<
  EvidenceBadgeType,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  official: {
    label: "OFFICIAL RECORD",
    className: "bg-[var(--official-soft)] text-[var(--official)]",
    icon: CheckCircle2,
  },
  verified: {
    label: "VERIFIED EVIDENCE",
    className: "bg-[var(--official-soft)] text-[var(--official)]",
    icon: CheckCircle2,
  },
  corroborated: {
    label: "CORROBORATED COMMUNITY EVIDENCE",
    className: "bg-sky-50 text-[var(--community)]",
    icon: Users,
  },
  community: {
    label: "COMMUNITY REPORTED",
    className: "bg-sky-50 text-[var(--community)]",
    icon: Users,
  },
  unverified: {
    label: "UNVERIFIED",
    className: "bg-amber-50 text-[var(--caution)]",
    icon: CircleHelp,
  },
  disputed: {
    label: "DISPUTED",
    className: "bg-red-50 text-[var(--disputed)]",
    icon: AlertTriangle,
  },
};

export function EvidenceBadge({ type }: { type: EvidenceBadgeType }) {
  const badge = BADGES[type];
  const Icon = badge.icon;

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold tracking-[0.08em] ${badge.className}`}
    >
      <Icon aria-hidden="true" className="size-4" strokeWidth={2.4} />
      {badge.label}
    </span>
  );
}
