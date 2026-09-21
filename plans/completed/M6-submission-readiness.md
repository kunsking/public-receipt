# M6 — Share, Polish & Submission Readiness

## Status

Complete on 21 September 2026.

## Objective

Prepare the existing M0–M5 vertical slice for hackathon judging without expanding product scope. The final build must make the source-backed receipt easy to understand, demonstrate, share, run, inspect and deploy while preserving the rule `NO SOURCE, NO CLAIM` and every existing civic record.

The supplied M6 execution brief ends mid-sentence in its SEO metadata section. This plan implements every complete requirement supplied and uses the approved master build brief for established M6 completion conventions; it does not invent missing product scope.

## Existing feature inventory

- Hosted Supabase contains one source document, 50 verified 2026 FCT project records and 50 primary source references.
- Discovery supports natural-language interpretation, deterministic fallback, filters, clarification and honest no-results states.
- Canonical server-rendered receipt and source pages preserve official wording, provenance, allocation, geography and evidence uncertainty.
- Receipt-scoped Trusted AI provides deterministic and optionally model-assisted answers within a strict allowlisted context.
- Community evidence supports validated structured observations, safe optional image processing, private storage and pending/private initial state.
- `/data`, `/verification`, `/explore`, `/community`, global navigation, manifest and baseline responsive Playwright coverage already exist, but Explore and My Community are placeholders and sharing is not implemented.

## Share implementation

- Add `/receipt/[receipt_id]/share` as a server-rendered receipt preview derived only from the canonical receipt repository.
- Add a restrained `ShareReceiptCard` showing identity, receipt ID, title, location, allocation, `OFFICIAL RECORD` and the canonical implementation-evidence state.
- Add a small client-side share action component using the Native Share API where available and a clipboard fallback with an accessible status message.
- Add a receipt-page share action and a share action on the evidence confirmation screen.
- Implement `GET /api/receipt/[receipt_id]/card` only if Next.js image generation is stable in the current architecture. The share page and copy/native share path remain the priority.

## PWA and identity work

- Refine manifest name, description, colours, display and icon declarations.
- Add a simple receipt/check application mark using framework-supported static metadata assets.
- Confirm viewport metadata permits normal mobile zoom and sets an appropriate theme colour.
- Do not add advanced offline caching or a service worker.

## Final UX polish

- Restore the approved homepage identity and supporting copy.
- Replace suggestions with three or four queries verified against the hosted 50-record dataset, including `Roads in Kwali` and `Healthcare in Gwagwalada`.
- Add the receipt share action without weakening the community-evidence or source actions.
- Remove unfinished Explore and My Community destinations from primary navigation, replacing them with direct Search, About the Data and How Verification Works journeys.
- Preserve required no-results and no-evidence caveats and audit public error states for safe language.
- Review `/data` for coverage, source, selection methodology, traceability and limitations; retain the prominent budget distinction.
- Review `/verification` for the six canonical labels and required closing statement.
- Fix clear heading, label, focus, touch-target or semantic defects without redesigning the approved hierarchy.

## Production QA

- Re-run seed validation and hosted M1/M2/M3/M5 verification where they remain non-destructive and relevant.
- Check optional OpenAI configuration by presence only; perform the four live demo questions only if enabled credentials exist, otherwise document the limitation honestly.
- Verify the evidence demo flow without leaving test evidence or storage objects in the hosted database.
- Verify malformed/unknown receipts, no results, invalid upload, unavailable AI and submission-failure contracts through existing and expanded automated tests.
- Run lint, typecheck, unit/integration tests, production build and the complete Playwright suite serially across 1440×900, 768×1024, 390×844 and 320×568.
- Confirm no horizontal overflow and no regressions to M0–M5.

## README work

- Replace the obsolete M1 README with a submission-ready project overview.
- Include the problem, solution, track, demo, screenshots, architecture, trust model, technology, AI usage, data source, prototype coverage, limitations, privacy, local setup, environment variables, testing, deployment and future roadmap.
- Keep secret values out of documentation and retain `.env.local` as ignored.

## Demo preparation

- Update `docs/demo-script.md` around the verified demo receipt `PR-NG-FCT-2026-000001` and a 90–150 second judge journey.
- Include exact safe responses, evidence classification and cleanup notes.
- Ensure suggested searches and displayed figures match hosted data.

## Screenshots and submission assets

- Capture final homepage, discovery, receipt, source, evidence submission/confirmation and share views using the real hosted dataset after the UI is stable.
- Store lightweight submission screenshots under `docs/screenshots/` with descriptive names and reference them from the README.
- Avoid fabricated content, heavy decorative assets and screenshots containing secrets or private evidence.

## Acceptance criteria

- A judge can search, open a real receipt, inspect provenance, ask safe receipt-scoped questions, add clearly unverified evidence and open/share the receipt through one coherent mobile journey.
- Share preview values come only from the stored receipt and never imply delivery without evidence.
- Native sharing degrades to a working copy-link path.
- Manifest, app identity, global metadata and viewport configuration are valid.
- Homepage suggestions return real strong matches from the hosted dataset.
- Navigation contains no placeholder destinations.
- `/data` and `/verification` communicate the approved coverage and trust vocabulary.
- README, demo script and screenshots make the project inspectable and runnable.
- M0–M5 behaviours, hosted records, RLS and pending-evidence isolation remain intact.
- All quality gates and responsive Playwright tests pass.

## Deferred items

- Nationwide ingestion, maps, WhatsApp, USSD, Pidgin, multilingual voice and native apps.
- User accounts, public reporter profiles and full moderator administration.
- Vector search, automated verification, political scoring and analytics dashboards.
- Live procurement, fund-release and expenditure integrations.
- Advanced offline support, push notifications and complex branding.

## Completion record

- Added `/receipt/[receipt_id]/share` with a source-derived preview containing receipt identity, project title, location, allocation, `OFFICIAL RECORD` and the canonical public implementation-evidence state.
- Added Native Share API support, accessible copy-link fallback and downloadable image-card action. Added `GET /api/receipt/[receipt_id]/card`, which renders a 1200×630 PNG using only canonical receipt data and cautious public evidence state.
- Added receipt and evidence-confirmation share actions. Unknown/malformed share and card routes reuse the safe receipt-not-found contract or return a minimal 404 response.
- Added dynamic share metadata, Open Graph/Twitter card metadata, a complete manifest, static theme viewport metadata and a generated receipt/check application icon. Mobile zoom remains enabled by the framework default viewport.
- Restored the approved homepage identity and replaced zero-result prototype prompts with four hosted-data-verified suggestions: Roads in Kwali (1), Healthcare in Gwagwalada (10), Schools in Bwari (8) and Water in Kwali (1).
- Removed placeholder Explore and My Community destinations from primary navigation. Home, Search, About the Data and How Verification Works are now directly reachable on desktop and mobile.
- Expanded `/data` with record-selection and source-traceability explanations while preserving the prominent `Budgeted ≠ Released ≠ Spent ≠ Completed.` distinction. `/verification` already contained all six canonical labels and the required closing statement.
- Fixed a global CSS cascade defect discovered during screenshot review that made some link-button text invisible. Utility colours now correctly override inherited anchor colour while existing visible-focus styles remain intact.
- Replaced the obsolete M1 README with submission-ready problem, solution, demo, screenshots, architecture, trust, stack, AI, data, privacy, setup, testing, deployment, limitations and roadmap documentation.
- Added a 90–150 second demo script and a reproducible screenshot capture utility. Captured seven lightweight real-data views under `docs/screenshots/`; the evidence confirmation capture uses a mocked write and leaves no hosted row or object.
- Added a minimum GitHub Actions quality workflow covering frozen dependency install, lint, typecheck, unit/integration tests and production build.
- Hosted QA reconfirmed one source document, 50 projects, 50 source references, the exact ₦140,000,000 demo allocation, read-only public civic access and denied anonymous protected writes. The no-hallucination query returned zero results.
- Hosted evidence QA reconfirmed the private bucket, `community_report / pending / false`, pending public/AI isolation, metadata stripping and official-record integrity. Its disposable row and object were removed automatically.
- Optional live OpenAI configuration was absent. The amount, completion, sensitive-accusation and prompt-injection demo questions were therefore verified through the established deterministic receipt-scoped path; CI remains independent of live model calls.
- `pnpm seed:validate`: pass, 50 records.
- `pnpm lint`: pass with no warnings.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 141 tests across 24 files.
- `pnpm build`: pass, including manifest, icon, share page and dynamic PNG route.
- `pnpm test:e2e --workers=1`: pass, 44 tests across 1440×900, 768×1024, 390×844 and 320×568. Final smoke/PWA assertions were additionally rerun across all four viewports after the full suite.
- No migration, seed row or verified civic record changed in M6.

## Remaining limitations

- No canonical production URL was configured in `.env.local`, so final production-URL deployment QA could not be performed. The production build and deployment instructions are complete.
- Live OpenAI provider verification was not possible because `ENABLE_AI`, `OPENAI_API_KEY` and `OPENAI_MODEL` were absent; safe deterministic answers remain demo-ready.
- Native sharing depends on browser/OS support. Copy link is the tested fallback.
- To avoid a runtime font download in the generated PNG renderer, the image card spells the allocation prefix as `NGN`; the interactive receipt and share preview retain the canonical `₦` formatting.
- The supplied M6 execution brief ended mid-SEO-description sentence, so no missing post-section scope was inferred beyond the approved master build brief.
