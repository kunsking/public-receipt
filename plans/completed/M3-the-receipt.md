# M3 — The Receipt

## Status

Complete on 21 September 2026.

## Objective

Turn every M2 search result into a server-rendered, source-backed Public Receipt that clearly separates the official budget record from implementation evidence. M3 includes receipt detail, source provenance, verification vocabulary and accurate prototype-data documentation. It does not include M4 AI Q&A or later evidence workflows.

## M1 and M2 dependencies

- The hosted Supabase project contains one source document, 50 verified projects and 50 primary source references.
- Public RLS permits read-only access to projects, provenance and reviewed evidence while civic-record writes remain protected.
- `getProjectByReceiptId`, `getProjectSource`, canonical receipt validation and `formatNaira` are established.
- M2 result cards link to `/receipt/[receipt_id]` and retain their existing search behaviour.
- The verified CSV, hosted data and M1 migration remain unchanged.
- `docs/CODEX_MASTER_BUILD_BRIEF.md` remains canonical and byte-identical to `docs/build-brief.md`.

## Implemented files

- `app/receipt/[receipt_id]/page.tsx`
- `app/receipt/[receipt_id]/source/page.tsx`
- `app/receipt/[receipt_id]/not-found.tsx`
- `app/verification/page.tsx`
- `app/data/page.tsx`
- receipt and evidence components under `components/`
- `lib/data/receipts.ts`
- `lib/domain/receipt.ts`
- `scripts/verify-hosted-m3.ts`
- M3 unit and responsive E2E tests
- this completed plan

No migration or seed-data change was made.

## Receipt data contract

`getPublicReceiptByReceiptId(receiptId, client?)` validates route input before querying, then assembles the stored project, its primary source reference and a safe public evidence summary. It returns `null` for malformed, unknown or source-less records and never generates authoritative fields.

The public result contains project identity, title fields, allocation, institution hierarchy, geography and confidence values; source document title, publisher, publication date, budget year, page, section, immutable excerpt, URL and index date; plus community, corroborated, verified-independent and disputed evidence counts.

## Trust and fallback rules

- Official budget data and implementation evidence remain visually and semantically separate.
- Display title falls back from reviewed plain-language title to immutable official title.
- Missing plain-language description omits the explanation section.
- Responsible institution falls back `agency → department → ministry → Not specified in indexed record`.
- Community plus area council is preferred for location; area council alone remains sufficient.
- Medium/low location confidence displays `Possible location match`.
- Missing optional source page/section is omitted without breaking provenance.
- With no visible evidence, all summary counts are zero and the canonical no-evidence state and mandatory caveat are displayed.
- Source classifications retained in excerpts are documentary wording, not delivery status.

## Routes and rendering

- `/receipt/[receipt_id]` validates untrusted params, loads through the canonical data layer, generates safe dynamic metadata and calls `notFound()` for malformed or unknown IDs.
- `/receipt/[receipt_id]/source` uses the same loader and renders the immutable source excerpt and safe external source link.
- `/verification` documents the six canonical evidence labels.
- `/data` documents the 50-record prototype coverage, primary source, budget meaning and limitations.
- Receipt and source pages are server-rendered text with no embedded PDF or unnecessary client bundle.

## Verification completed

- Known, unknown, malformed and source-less receipt retrieval.
- Primary source join and immutable excerpt mapping.
- Plain-title, institution, location and missing-page fallbacks.
- Empty and reviewed evidence summaries.
- Trust test preventing unsupported implementation-status output.
- Hosted source-integrity verification for `PR-NG-FCT-2026-000001`.
- Hosted read-only checks for demo, healthcare and missing-optional-field records.
- Golden search → receipt → source → receipt journey and safe not-found journey.
- No-horizontal-overflow checks at 390×844, 320×568, 768×1024 and 1440×900.

## Known limitations

- The 50 records remain a curated 2026 FCT subset, not full national or FCT coverage.
- Plain-language titles and descriptions are absent from the current seed, so official titles are used and explanation sections are omitted.
- Public implementation evidence is currently empty; M3 shows the truthful no-evidence state.
- The original source landing page can be temporarily unavailable even though retained provenance remains visible.
- Next.js streaming renders the route-specific safe not-found UI with a `noindex` directive, but may retain HTTP 200 after streaming has begun.
- Project-scoped AI, evidence submission/moderation and generated sharing remain deferred to later milestones.

## Completion record

- Implemented the canonical receipt loader, receipt detail, provenance page, route-specific not-found state, evidence explainer and current-data page.
- Hosted verification confirmed `PR-NG-FCT-2026-000001` at ₦140,000,000 with source page `PDF 994; printed page 963` and an empty evidence summary.
- Hosted healthcare receipt `PR-NG-FCT-2026-000028` and optional-field fallback receipt `PR-NG-FCT-2026-000002` passed.
- No migration, civic-data or seed-data write occurred.
- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 63 tests across 11 files.
- `pnpm test:e2e`: pass, 28 tests across all four required viewports.
- `pnpm build`: pass.
