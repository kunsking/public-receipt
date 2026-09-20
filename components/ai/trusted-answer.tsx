import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleHelp } from "lucide-react";

import type { ReceiptAnswer } from "@/lib/ai/schemas";

const STATE_LABELS: Record<ReceiptAnswer["state"], string> = {
  supported: "SUPPORTED BY OFFICIAL RECORD",
  partial: "PARTIALLY SUPPORTED",
  unknown: "NOT ESTABLISHED BY AVAILABLE EVIDENCE",
  sensitive: "NOT ESTABLISHED BY AVAILABLE EVIDENCE",
};

export function TrustedAnswer({
  answer,
  receiptId,
}: {
  answer: ReceiptAnswer;
  receiptId: string;
}) {
  const supported = answer.state === "supported";
  const StateIcon = supported ? CheckCircle2 : CircleHelp;

  return (
    <section aria-labelledby="receipt-answer-heading" className="mt-6 rounded-2xl border border-[var(--border)] bg-[#f3f1eb] p-5 sm:p-6" data-testid="trusted-answer">
      <p className={`inline-flex items-center gap-2 text-xs font-bold tracking-[0.1em] ${supported ? "text-[var(--official)]" : "text-[var(--caution)]"}`}>
        <StateIcon aria-hidden="true" className="size-4 shrink-0" />
        {STATE_LABELS[answer.state]}
      </p>

      <h3 className="mt-5 text-xl font-semibold" id="receipt-answer-heading">Answer</h3>
      <p className="mt-2 max-w-3xl leading-7">{answer.answer}</p>

      {answer.basis.length > 0 ? (
        <div className="mt-6 border-t border-[var(--border)] pt-5">
          <h4 className="text-sm font-semibold">Based on</h4>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            {answer.basis.map((basis, index) => (
              <li className="flex items-start gap-2" key={`${basis.type}-${basis.label}-${index}`}>
                <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--official)]" />
                {basis.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {answer.caveat ? (
        <p className="mt-5 border-l-2 border-[var(--caution)] pl-4 text-sm leading-6 text-[var(--muted)]">
          {answer.caveat}
        </p>
      ) : null}

      {answer.sourceRequired ? (
        <Link
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--foreground)] bg-[var(--surface)] px-4 text-sm font-semibold"
          href={`/receipt/${receiptId}/source`}
        >
          View official source <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      ) : null}
    </section>
  );
}
