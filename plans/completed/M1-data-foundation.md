# M1 — Data Foundation

## Status

Operationally complete on 20 September 2026.

## Objective

Establish the hosted data foundation for Public Receipt using verified 2026 Federal Budget records for Nigeria's Federal Capital Territory, without beginning M2 discovery work.

## Hosted activation

- Initial migration dry-run completed successfully.
- `202609200001_m1_data_foundation.sql` applied successfully to the linked hosted Supabase project.
- Seed validation passed for all 50 canonical records before import.
- The existing importer completed without skipped or malformed rows.
- Hosted record counts verified through the server/admin client:
  - source documents: 1
  - projects: 50
  - project source references: 50
- Demo receipt `PR-NG-FCT-2026-000001` retrieved through `getProjectByReceiptId` using the public data-access path.
- The demo receipt's primary source was retrieved through `getProjectSource`.

## Security and RLS verification

- Public clients can read the intended civic project and provenance records.
- An anonymous project-insert probe was denied.
- No probe record was persisted.
- Server/admin operations use `SUPABASE_SECRET_KEY`, with a temporary fallback for legacy `SUPABASE_SERVICE_ROLE_KEY` deployments.
- Browser configuration remains limited to `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `.env.local` remains ignored and untracked.

## Documentation

- The approved `docs/CODEX_MASTER_BUILD_BRIEF.md` is preserved as supplied.
- `docs/build-brief.md` is restored as an exact copy so the milestone path referenced by the repository remains valid.

## Verification commands

```text
pnpm seed:validate  PASS — 50 records
pnpm m1:verify      PASS — hosted counts, demo receipt and RLS
pnpm lint           PASS
pnpm typecheck      PASS
pnpm test           PASS — 25 tests
pnpm build          PASS
```

## Known limitations

- Prototype coverage is a curated 50-record FCT subset of the 2026 appropriation data, not a complete national budget index.
- A budget record does not establish release, expenditure, procurement, implementation or completion.
- Community evidence submission and moderation remain intentionally deferred to later milestones.
- M2 discovery/search work has not started.
