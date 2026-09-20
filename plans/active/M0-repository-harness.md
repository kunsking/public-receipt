# M0 — Repository Harness

## Objective
Create a clean, deployable Next.js harness for Public Receipt before product/data functionality begins.

## Scope
- Next.js App Router structure
- TypeScript strict mode
- Tailwind CSS foundation
- responsive app shell
- environment contract
- health endpoint
- Vitest and Playwright configuration
- baseline unit and E2E smoke tests
- lint/typecheck/test/build scripts
- documentation skeleton

## Out of scope
- Supabase schema/data
- AI integration
- real project records
- evidence uploads
- receipt domain implementation

## Acceptance criteria
- `pnpm install` completes in a network-enabled environment
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm test` passes
- `pnpm build` passes
- homepage renders the approved Public Receipt proposition
- `/api/health` returns non-secret configuration state

## Execution note
This scaffold was generated in an environment where registry access was unavailable, so dependency-backed quality commands could not be executed here. Run the commands above immediately after installing dependencies in Codex/local development.
