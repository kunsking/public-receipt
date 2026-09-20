"use client";

import { FormEvent, useRef, useState } from "react";
import { Search } from "lucide-react";

import { TrustedAnswer } from "@/components/ai/trusted-answer";
import {
  RECEIPT_QUESTION_MAX_LENGTH,
  receiptAnswerSchema,
  type ReceiptAnswer,
} from "@/lib/ai/schemas";

const SUGGESTED_QUESTIONS = [
  "How much was budgeted?",
  "Who is responsible?",
  "What does the official record say?",
  "Was this project completed?",
] as const;

const UNAVAILABLE_MESSAGE =
  "Public Receipt couldn't answer that safely right now. The official record and source information remain available below.";

export function ReceiptQuestion({ receiptId }: { receiptId: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<ReceiptAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const answerRegion = useRef<HTMLDivElement>(null);

  async function ask(nextQuestion: string) {
    const trimmed = nextQuestion.trim();
    if (!trimmed) {
      setError("Ask a question about this receipt.");
      return;
    }

    setQuestion(nextQuestion);
    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const response = await fetch(`/api/receipt/${encodeURIComponent(receiptId)}/ask`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        const errorCode =
          typeof payload === "object" && payload !== null && "error" in payload
            ? String(payload.error)
            : "answer_unavailable";
        if (errorCode === "invalid_question") {
          throw new Error("Ask a question between 1 and 300 characters.");
        }
        throw new Error(UNAVAILABLE_MESSAGE);
      }

      setAnswer(receiptAnswerSchema.parse(payload));
      requestAnimationFrame(() => answerRegion.current?.focus());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : UNAVAILABLE_MESSAGE);
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(question);
  }

  return (
    <section aria-labelledby="ask-receipt-heading" className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7" data-testid="receipt-question">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--official)]">Receipt question</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight" id="ask-receipt-heading">Ask about this receipt</h2>
      <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
        Ask about the project, allocation, institution, source or available evidence.
      </p>

      <form className="mt-6" onSubmit={submit}>
        <label className="block text-sm font-semibold" htmlFor="receipt-question-input">
          Your question
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
          <textarea
            aria-describedby={`receipt-question-help${error ? " receipt-question-error" : ""}`}
            className="min-h-24 flex-1 resize-y rounded-xl border border-[var(--border)] bg-white px-4 py-3 leading-6 shadow-sm"
            disabled={loading}
            id="receipt-question-input"
            maxLength={RECEIPT_QUESTION_MAX_LENGTH}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about this project…"
            required
            value={question}
          />
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--foreground)] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            <Search aria-hidden="true" className="size-4" />
            {loading ? "Checking…" : "Check this receipt"}
          </button>
        </div>
        <div className="mt-2 flex items-start justify-between gap-4 text-xs text-[var(--muted)]" id="receipt-question-help">
          <span>Answers are limited to this receipt and its evidence.</span>
          <span className="shrink-0 tabular-nums">{question.length}/{RECEIPT_QUESTION_MAX_LENGTH}</span>
        </div>
      </form>

      <div className="mt-6">
        <p className="text-sm font-semibold">Suggested questions</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((suggestion) => (
            <button
              className="min-h-11 rounded-full border border-[var(--border)] bg-white px-4 text-left text-sm hover:border-[var(--foreground)] disabled:opacity-60"
              disabled={loading}
              key={suggestion}
              onClick={() => void ask(suggestion)}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div aria-live="polite" className="mt-5 min-h-6 text-sm">
        {loading ? <p>Checking this receipt…</p> : null}
        {error ? <p className="text-[var(--disputed)]" id="receipt-question-error" role="alert">{error}</p> : null}
      </div>

      <div ref={answerRegion} tabIndex={-1}>
        {answer ? <TrustedAnswer answer={answer} receiptId={receiptId} /> : null}
      </div>
    </section>
  );
}
