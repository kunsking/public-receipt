# M5 — Community Evidence

## Status

Complete on 21 September 2026.

## Objective

Let a citizen submit a structured observation about one canonical Public Receipt while preserving the official record and evidence hierarchy. Every new submission must be created server-side as `community_report / pending / false`, remain absent from public evidence and Trusted AI until publication rules are met, and never change project or source data.

## Existing schema dependencies

- Reuse the M1 `evidence_submissions`, `evidence_media` and `verification_events` tables; do not create a parallel evidence system.
- Add an M5 migration that evolves the legacy evidence columns into the approved observation, moderation, visibility, approximate-location and processed-media contract.
- Keep RLS enabled. Anonymous and authenticated clients retain read-only access only to evidence where `moderation_status = approved` and `public_visibility = true`; no direct evidence or civic-record writes are granted.
- Add a server-only database function that atomically creates the evidence row, initial verification event and optional media row while assigning all trust state itself. Execution is restricted to the service role.
- Create or reconcile the private `evidence-private` storage bucket with a 5 MB limit and JPEG, PNG and WebP allowlist. Do not add a public storage-read policy.

## Upload architecture

1. The browser sends `multipart/form-data` containing only the observation fields and optional image.
2. The Route Handler validates the receipt ID and canonical project before processing content.
3. Zod validates observation type, description, Area Council, locality and optional approximate coordinates. Client-supplied trust or moderation fields are ignored because they are not part of the accepted schema.
4. Optional image bytes are size-checked, decoded with Sharp, checked against the allowed decoded formats, auto-oriented, resized within a bounded envelope and re-encoded without metadata.
5. A UUID-derived storage path is generated independently of the user filename and the processed bytes are uploaded to the private bucket.
6. A service-role-only RPC atomically inserts the submission, creation event and optional media metadata with the mandatory initial state.
7. If storage succeeds but the database operation fails, the endpoint attempts to remove the orphaned object and returns the safe failure contract.

## Security controls

- Maximum 500-character plain-text description; HTML-like markup is rejected and Markdown is never rendered.
- Canonical enum validation for observation type and Area Council; bounded locality and latitude/longitude validation.
- Maximum raw image size 5 MB, accepted declared MIME and independently decoded JPEG/PNG/WebP format, bounded dimensions, safe UUID filename and metadata-stripping re-encode.
- Early content-length protection where available, server validation for every field and no browser-controlled project ID, state, visibility, storage path or media metadata.
- Admin credentials stay server-only. API errors never expose secrets, storage paths, database errors or internal identifiers.
- Existing project, source document and source-reference rows are never updated by the submission path.

## Moderation and evidence-state rules

- Initial state is always `verification_status = community_report`, `moderation_status = pending`, `public_visibility = false`.
- The initial verification event records `previous_status = null`, `new_status = community_report`, `reason = citizen_submission` and `review_method = submission`.
- No M5 workflow can automatically set `corroborated`, `verified_independent`, `approved` or public visibility.
- Observation labels remain cautious: started, appears completed, appears incomplete, cannot locate or other. They never become a project delivery conclusion.

## Public visibility and AI rules

- `/receipt/[receipt_id]/evidence` loads only approved, public evidence and exposes no reporter identity, exact coordinates, storage path, moderation notes or internal identifiers.
- Pending/private submissions do not change receipt evidence counts and do not appear on the timeline.
- Approved media is displayed only through short-lived signed URLs created server-side after the evidence row passes public eligibility filters.
- M4 receives only the existing public evidence summary; pending descriptions and counts remain excluded.

## UI and routes

- Add `/receipt/[receipt_id]/submit` with a compact five-state client flow: observation, photo/description, approximate location, review and confirmation.
- Add `POST /api/receipt/[receipt_id]/evidence` for validated multipart submission.
- Add `/receipt/[receipt_id]/evidence` for the public timeline and required empty state.
- Make `I know this project` / `Share what you observed.` the primary community action on the receipt and link the evidence summary to the public timeline.
- Confirmation shows `COMMUNITY REPORTED`, `UNVERIFIED` and `PENDING REVIEW` and does not imply public publication.

## Tests

- Validation tests for observation, Area Council, text limits, HTML rejection, coordinates and malformed/unknown receipts.
- Upload-security tests for JPEG, PNG and WebP; PDF/executable/fake-image/oversize rejection; decoded-format enforcement; metadata removal; resize bounds and filename isolation.
- Repository/API tests proving exact initial state, malicious state-field isolation, creation-event values, cleanup on database failure and no official-record mutation.
- Public timeline tests proving pending/private evidence is hidden and approved/public evidence is renderable without private fields.
- Trusted AI isolation test proving a pending allegation cannot enter its context or public counts.
- Responsive Playwright evidence journey across desktop, tablet, 390×844 and 320×568, plus mocked image upload and invalid-file behaviour where stable.
- Full M0–M4 regression suite, lint, typecheck, production build and hosted M5 verification.

## Acceptance criteria

- All three required routes work and the receipt exposes the approved community CTA.
- Valid text-only and optional-image submissions are accepted; unsafe payloads are rejected safely.
- Processed images contain no retained EXIF metadata and use generated storage paths.
- Database and API independently enforce `community_report / pending / false`.
- Pending evidence remains absent from public timeline, receipt summary and M4 context.
- Approved/public fixtures can appear with only safe public fields and signed media access.
- Project, source document, source reference, title and amount remain unchanged after submission.
- The hosted migration and private bucket are verified without weakening RLS.
- All required automated quality gates pass and M6 is not started.

## Known limitations

- No moderator dashboard, citizen account, automatic verification, corroboration engine, face recognition, map or precise public location.
- Anonymous request protection is bounded validation and upload limits rather than a distributed rate limiter.
- Confirmation is the submitter's only view of a pending private report.

## Completion record

- Evolved the existing M1 evidence tables in the hosted database and added observation, moderation, visibility, approximate-location, processed-media and verification-event fields without creating a parallel evidence model.
- Ran the linked hosted migration dry-run successfully, then applied `202609210001_m5_community_evidence.sql`. A subsequent hosted verification confirmed the migration and storage configuration are active.
- Added the private `evidence-private` bucket with a 5 MB limit and JPEG, PNG and WebP allowlist. Public object access remains disabled; eligible images are exposed only through short-lived server-created signed URLs.
- Added a service-role-only database function and server submission service that force every new record to `community_report / pending / false`, create the initial verification event, attach optional media and clean up an uploaded object if the database write fails.
- Added receipt-scoped submission and public timeline routes, the `I know this project` CTA, a structured four-step review flow and the required cautious trust labels and confirmation state.
- Added strict field validation and safe image handling: declared and decoded format enforcement, 5 MB input/output limits, dimension bounds, auto-orientation, resizing, UUID-derived storage names and metadata-stripping re-encoding.
- Hosted verification submitted an image-bearing pending allegation through the real service, confirmed the exact initial state and event, downloaded and inspected the processed image, proved the report was invisible to anonymous reads and the M4 public context, proved anonymous direct inserts were denied, and confirmed project/source rows were unchanged. The temporary verification record and object were removed afterward.
- Public repository tests prove pending/private evidence is excluded and approved/public evidence can be returned with safe fields and signed media only. No reporter identity, exact coordinate, storage path, moderation note or internal identifier is exposed.
- Upload and submission coverage includes JPEG, PNG, WebP, fake image, PDF, executable-like payload, oversize input, MIME mismatch, resize bounds, metadata removal, malicious trust-state fields, atomic failure cleanup and official-record integrity.
- `pnpm lint`: pass with no warnings.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 137 tests across 22 files.
- `pnpm test:e2e --workers=1`: pass, 40 tests across desktop, tablet, 390×844 and 320×568 projects. The M5 flow includes invalid-file handling, classification review, confirmation, official amount integrity, pending-evidence invisibility and overflow checks.
- `pnpm build`: pass, including the evidence API, submission page and public timeline page.
- M6 was not started.
