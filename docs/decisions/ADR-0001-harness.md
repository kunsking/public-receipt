# ADR-0001: Repository Harness

## Status
Accepted

## Decision
Use Next.js 16 App Router, strict TypeScript, Tailwind, Vitest and Playwright with a mobile-first application shell.

## Rationale
The hackathon needs a small, testable vertical slice. The shell intentionally contains no product data and no AI behaviour in M0.

## Consequences
Data, search, receipts and evidence are added as explicit later milestones without changing the basic route/layout architecture.
