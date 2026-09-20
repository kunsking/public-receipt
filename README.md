# Public Receipt

**Every public project deserves a public receipt.**

Public Receipt is an AI-assisted civic-information product that helps citizens ask what government promised their community, inspect the official record behind the answer, distinguish that record from community evidence, and take an informed next step.

## Current milestone

**M0 — Repository Harness**

This repository currently contains the engineering shell only. Real budget records enter in M1.

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

## Product trust rule

**No source, no claim.**

AI may help interpret queries and explain verified records. It must not invent civic facts.

## Prototype coverage

The hackathon target is selected 2026 Federal Government projects in Nigeria's Federal Capital Territory. Data ingestion begins in M1.
