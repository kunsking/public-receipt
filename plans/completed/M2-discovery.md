# M2 — Discovery

## Status

Complete on 20 September 2026.

## Objective

Let a citizen ask a normal-language question and receive only matching records from the hosted 50-project Supabase dataset. M2 ends at discovery: home, interpretation, deterministic retrieval, results, clarification and no-results states.

## M1 dependencies

- Hosted Supabase project linked and migrated.
- One official source document, 50 verified projects and 50 matching source references.
- Public read RLS for projects and provenance; anonymous civic-record writes denied.
- Generated `projects.search_text` column with a GIN trigram index.
- Typed project repository and canonical domain constants.
- `.env.local` ignored and untracked.
- `docs/CODEX_MASTER_BUILD_BRIEF.md` remains canonical and byte-identical to `docs/build-brief.md`.

## Files to change

- `app/page.tsx`
- `app/search/page.tsx`
- `app/api/search/route.ts`
- `app/globals.css`
- `components/search/search-experience.tsx`
- `lib/ai/fallback-query.ts`
- `lib/ai/interpret-query.ts`
- `lib/ai/prompts.ts`
- `lib/ai/schemas.ts`
- `lib/data/search.ts`
- `next.config.ts`, `package.json`, `playwright.config.ts`, `vitest.config.ts`
- `scripts/verify-hosted-m2.ts`
- M2 unit/integration/E2E tests and Playwright configuration
- this completed plan

No migration or seed-data change is planned.

## API contract

`POST /api/search` accepts `{ "query": string }`, validated before interpretation with a non-empty 300-character maximum.

A successful response contains the complete validated interpretation, typed project summaries, and `{ count, coverage: "selected_fct_2026", fallbackUsed }`. A clarification response contains no project rows. A no-result response contains no substitute rows and the message `No matching verified record is currently indexed.` Invalid input returns a safe 400 response; unexpected retrieval failure returns a safe 500 response without secrets.

## Query interpretation rules

- Interpret only; never answer the civic question or generate project information.
- Normalize `AMAC` and `Abuja Municipal` to `Abuja Municipal Area Council`.
- Map health, school, road, water and infrastructure language only to the fixed taxonomy.
- Default the year to 2026 because prototype coverage is explicitly 2026-only.
- Preserve unknown concepts as search terms.
- Treat bare `Abuja` as ambiguous between the full FCT and AMAC and ask for clarification.
- Validate model output with strict Zod schemas.
- Read the model from `OPENAI_MODEL`; keep `OPENAI_API_KEY` and all model calls server-only.
- Reject inputs longer than 300 characters before any model call.

## Deterministic search strategy

Apply filters to `projects` in this order: budget year, exact area council, exact sector, normalized text terms, data confidence. Terms use Supabase query methods against `search_text`; no raw SQL or LLM reranking is used. Results are stable, database-backed project summaries sorted by relevance rules and receipt ID, with optional deterministic highest-allocation sorting in the UI.

## Fallback behaviour

When AI is disabled, unconfigured, refuses, times out or returns invalid output, a deterministic parser recognizes all FCT area councils, AMAC aliases, required sector keywords, four-digit years and remaining safe text terms. The UI and API disclose fallback use without blocking access to public records. A bare `Abuja` still triggers clarification. Unknown terms constrain database retrieval so nonsense queries cannot become broad fabricated matches.

## Tests

- Zod request and interpretation schema acceptance/rejection.
- AMAC normalization, invalid enums and 300-character limit.
- Required deterministic parser phrases and ambiguous Abuja.
- Mocked repository filtering for area, sector, combined filters and no results.
- Mandatory `₦50 billion dragon hospital in Bwari` no-hallucination path.
- API contract tests without live AI.
- Hosted read-only searches against the 50 existing records.
- Playwright golden discovery and impossible-query journeys.
- Mobile QA at 390×844 and 320×568, keyboard/accessibility checks and overflow assertions.
- Existing M0/M1 tests plus lint, typecheck, unit/integration tests and production build.

## Acceptance criteria

- Homepage copy, suggestions and prototype notice match the approved brief.
- Natural-language input produces a validated interpretation.
- Results originate exclusively from hosted Supabase project rows.
- A known query displays an expected receipt ID, exact allocation and correct receipt link.
- Area and sector filters are usable.
- AMAC aliases normalize correctly.
- Bare Abuja returns the required All FCT / AMAC clarification.
- AI failure falls back deterministically.
- Impossible/nonsense searches show the mandatory no-results caveat and no project card.
- Mobile and accessibility checks pass.
- All quality gates and relevant Playwright tests pass.

## Known limitations

- Coverage remains the selected 50-record 2026 FCT prototype subset; it is not a complete FCT or national inventory.
- No reliable Kuje record is present, so the approved Kuje suggestion intentionally demonstrates honest no-results handling.
- Plain-language titles are absent from the current seed, so result cards fall back to official titles.
- Search is structured text filtering, not semantic/vector search.
- Without server-side OpenAI configuration, deterministic parsing is used.
- Receipt detail, project-scoped Q&A, evidence submission, moderation and sharing remain deferred to later milestones.

## Completion record

- Implemented `/`, `/search` and `POST /api/search`; no M3 route or receipt-detail UI was added.
- Added strict Zod request/interpretation contracts and a server-only OpenAI Responses API interpreter using `OPENAI_MODEL`. Hosted configuration did not include the optional OpenAI variables, so verification exercised the deterministic fallback.
- Added deterministic area, sector, year and safe text-term filtering over hosted `projects` rows.
- Hosted verification confirmed 50 searchable projects. `Roads in Kwali` returned `PR-NG-FCT-2026-000001` at NGN 140,000,000; `Healthcare in Gwagwalada` returned 10 records.
- AMAC normalized to `Abuja Municipal Area Council`; bare Abuja returned the required clarification.
- The mandatory `₦50 billion dragon hospital in Bwari` query returned zero records.
- No migration or seed record was changed.
- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 50 tests across 9 files.
- `pnpm test:e2e`: pass, 15 tests across desktop, 390×844 and 320×568.
- `pnpm build`: pass.
