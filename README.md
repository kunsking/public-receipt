# Public Receipt

**Every public project deserves a public receipt.**

Public Receipt is an AI-assisted civic-information product that helps citizens ask what government promised their community, inspect the official record behind the answer, distinguish that record from community evidence, and take an informed next step.

## Current milestone

**M1 — Data Foundation**

The repository includes the M0 application shell plus the Supabase schema, read-only public policies, typed civic-data access layer, validated import tooling and a 50-record official 2026 FCT seed dataset.

## Requirements

- Node.js >= 20.9
- pnpm

## Setup

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

## Quality gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Or:

```bash
pnpm quality
```

Validate the canonical civic-data seed before importing it:

```bash
pnpm seed:validate
pnpm seed:import
```

## Product trust rule

**No source, no claim.**

AI may help interpret queries and explain verified records. It must not invent civic facts.

## Prototype coverage

The M1 prototype covers 50 selected 2026 Federal Government budget records in Nigeria's Federal Capital Territory. See `docs/data-methodology.md` for the source, selection method and limitations.
