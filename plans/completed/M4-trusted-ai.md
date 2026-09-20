# M4 — Trusted AI

## Status

Complete on 21 September 2026.

## Objective

Add receipt-scoped questions and answers that use only the canonical Public Receipt, retained official source and visible evidence summary. M4 must never use external knowledge as civic fact, must degrade safely without OpenAI configuration and must not begin M5 community evidence.

## Preserved dependencies

- M1 hosted data remains one source document, 50 projects and 50 primary source references.
- M2 discovery, clarification and no-result behaviour remain unchanged.
- M3 receipt, provenance, evidence-state, not-found and responsive behaviour remain unchanged.
- No migration, seed-data or civic-record write is required.
- `.env.local` remains ignored and server secrets remain outside the browser bundle.

## Files to change

- `app/api/receipt/[receipt_id]/ask/route.ts`
- `app/receipt/[receipt_id]/page.tsx`
- `components/ai/receipt-question.tsx`
- `components/ai/trusted-answer.tsx`
- `lib/ai/answer-receipt-question.ts`
- `lib/ai/config.ts`
- `lib/ai/prompts.ts`
- `lib/ai/schemas.ts`
- relevant unit, integration and responsive Playwright tests
- this plan, moved to `plans/completed/M4-trusted-ai.md` at completion

## API contract

`POST /api/receipt/[receipt_id]/ask` accepts only `{ question: string }`. The question is trimmed, must contain 1–300 characters and cannot provide system instructions or arbitrary context. Malformed or unknown receipt IDs are rejected before model invocation.

Successful answers contain only the strict `ReceiptAnswer` fields: `state`, `answer`, `basis`, `caveat` and `sourceRequired`. Validation failures return `invalid_question`; missing receipts return `receipt_not_found`; unavailable or invalid model output returns `answer_unavailable`. Stack traces, configuration and raw provider errors are never returned.

## Trusted context and answer strategy

- Load every request with `getPublicReceiptByReceiptId`.
- Build an explicit allowlisted context object containing receipt fields, official source fields and evidence counts only.
- Handle clear sensitive questions before any model call.
- Answer simple stored facts deterministically: amount, budget year, institution, source and project code.
- Return deterministic safe answers for completion, project-existence, contractor and false-premise/prompt-injection questions.
- For other questions, use the server-only OpenAI Responses API with Zod Structured Outputs when `ENABLE_AI=true` and both OpenAI environment variables exist.
- Validate the model result again locally, reject unavailable evidence-basis types and never enable web or other tools.
- When AI is unavailable and no deterministic answer applies, return the graceful `answer_unavailable` contract while leaving the receipt fully usable.

## UI

Add a compact supporting section after receipt evidence and before actions. It has a persistent label, 300-character limit, approved suggested questions, evidence-led loading copy, accessible error/status messaging and one answer at a time. `TrustedAnswer` displays the state label, answer, evidence basis, caveat and an internal source CTA when required. The experience does not resemble persistent chat.

## Tests

- Question and structured-answer schema acceptance/rejection.
- Exact allowlisted context shape and preservation of amount, excerpt and evidence zeros.
- Deterministic supported amount/source/code/institution answers.
- Unknown completion, partial contractor, sensitive accusation and prompt-injection safety.
- Mocked valid, malformed and unsupported model outputs; no live provider dependency in CI.
- Route validation, receipt-not-found and unavailable contracts with the model/data layer mocked.
- Receipt UI rendering and trusted answer hierarchy.
- Playwright receipt Q&A journey for amount, completion and sensitive questions.
- AI-unavailable UI journey and mobile overflow checks at 390×844 and 320×568, while retaining the existing tablet and desktop suite.

## Acceptance criteria

- Receipt-scoped Q&A works without sending receipt context from the browser.
- Supported stored facts remain exact and source-backed.
- Unsupported implementation questions remain unknown.
- Sensitive questions never accuse or name individuals.
- Prompt injection cannot widen the context or change the trust rules.
- Invalid model output never reaches the UI.
- Receipt and source pages remain usable without AI.
- M0–M3 tests plus lint, typecheck, unit/integration tests, production build and relevant Playwright tests pass.

## Known limitations

- Questions are independent; there is no conversation history or memory.
- Deterministic fallback intentionally covers only a small approved question set.
- Current public evidence summaries contain counts rather than evidence descriptions, so they cannot establish a specific delivery fact.
- In-process request protection is not a durable distributed rate limiter; strict validation and scoped prompting are the M4 baseline.
- Evidence submission, moderation, share generation and all M5+ work remain deferred.

## Completion record

- Added receipt-scoped `POST /api/receipt/[receipt_id]/ask`, with strict 300-character request validation, canonical receipt loading and safe `invalid_question`, `receipt_not_found` and `answer_unavailable` responses.
- Added a strict Zod answer contract for supported, partial, unknown and sensitive states, including typed evidence bases, caveats and source-CTA requirements.
- Added an explicit allowlisted model context containing only the canonical project, retained official source and public evidence counts. No arbitrary database rows, unrelated records or configuration enter the model request.
- Centralized server-only OpenAI enablement behind `ENABLE_AI`, `OPENAI_API_KEY` and `OPENAI_MODEL`; model calls use the Responses API with Zod Structured Outputs, disabled storage and no external tools.
- Added deterministic exact answers for allocation, budget year, responsible institution, source and project code; implementation, completion and funds-flow questions return safe unknown answers when unsupported.
- Added deterministic sensitive and prompt-injection handling. The sensitive theft test returns no name or accusation; false-premise completion and outside-knowledge prompts remain unknown and receipt-scoped.
- Added the compact receipt question UI after evidence and before actions, with persistent labelling, accessible status/error handling, one answer at a time, evidence basis, caveats and official-source CTA.
- Hosted receipt access remained active during browser verification: `PR-NG-FCT-2026-000001` returned the exact ₦140,000,000 allocation and retained official source. No migration, civic dataset or hosted write was made.
- The local environment did not contain enabled OpenAI configuration, so live provider verification was not performed. Deterministic receipt answers and mocked structured model output were verified; unhandled questions produced the graceful unavailable state while the receipt and source remained usable.
- `pnpm lint`: pass with no warnings.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 101 tests across 16 files.
- `pnpm test:e2e`: pass, 36 tests across desktop, tablet, 390×844 and 320×568 projects.
- `pnpm build`: pass.
