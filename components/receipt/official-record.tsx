import type { PublicReceipt } from "@/lib/domain/receipt";
import { getResponsibleInstitution } from "@/lib/domain/receipt";
import { formatNaira } from "@/lib/format";

const SECTOR_LABELS: Record<PublicReceipt["sector"], string> = {
  healthcare: "Healthcare",
  education: "Education",
  roads_transport: "Roads & transport",
  water_sanitation: "Water & sanitation",
  community_infrastructure: "Community infrastructure",
};

export function OfficialRecord({ receipt }: { receipt: PublicReceipt }) {
  const rows = [
    ["Budget year", String(receipt.budgetYear)],
    ["Amount", receipt.amount === null ? "Not specified in indexed record" : formatNaira(receipt.amount)],
    ["Project code", receipt.projectCode ?? "Not specified in indexed record"],
    ["Sector", SECTOR_LABELS[receipt.sector]],
    ["Responsible institution", getResponsibleInstitution(receipt)],
    ["Location in source", receipt.locationRaw],
    ["Data confidence", receipt.dataConfidence],
  ];

  return (
    <section aria-labelledby="record-heading" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--official)]">Official record</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight" id="record-heading">Public record details</h2>
      <dl className="mt-6 divide-y divide-[var(--border)]">
        {rows.map(([label, value]) => (
          <div className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6" key={label}>
            <dt className="text-sm text-[var(--muted)]">{label}</dt>
            <dd className="break-words font-medium capitalize">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
