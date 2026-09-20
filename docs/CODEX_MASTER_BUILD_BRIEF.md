# PUBLIC RECEIPT
## CODEX MASTER BUILD BRIEF v1.0

**Version:** 1.0  
**Status:** Approved engineering source of truth  
**Date:** 20 September 2026  
**Target submission:** 21 September 2026  
**Primary track:** Transparency & Accountability  
**Application type:** Mobile-first civic-information web application  
**Prototype geography:** Federal Capital Territory, Nigeria

**Parent documents:**
1. `docs/product-blueprint.md`
2. `docs/ux-blueprint.md`

---

# 0. CODEX EXECUTION DIRECTIVE

This document is the canonical engineering source of truth for Public Receipt v1.0.

Codex must:

1. Read this brief completely before changing files.
2. Implement milestones in the prescribed order.
3. Avoid inventing features outside the approved scope.
4. Preserve the product's evidence and trust architecture.
5. Prefer boring, reliable implementation over unnecessary abstraction.
6. Keep the application deployable after every milestone.
7. Run lint, type-check, tests, and build at the end of every milestone.
8. Fix failing gates before advancing.
9. Never substitute fabricated project data for real government-source records in the final demonstration.
10. Never allow an LLM-generated claim to masquerade as an official public record.
11. Never expose server secrets to the browser.
12. Never automatically convert citizen allegations into verified facts.
13. Document material architectural deviations in `docs/decisions/`.
14. Keep P1/P2 work out of the critical path until all P0 acceptance tests pass.
15. Do not begin the next milestone automatically unless explicitly instructed.

The application must optimise for the primary demo journey, not feature count.

---

# 1. DELIVERY REALITY

The engineering strategy is:

## BUILD THE VERTICAL SLICE FIRST.

```text
REAL BUDGET DATA
      ↓
NATURAL-LANGUAGE QUERY
      ↓
MATCHED PROJECT
      ↓
PUBLIC RECEIPT
      ↓
OFFICIAL SOURCE
      ↓
PROJECT-SCOPED AI QUESTION
      ↓
CLEAR UNKNOWN/VERIFIED STATE
      ↓
COMMUNITY EVIDENCE SUBMISSION
      ↓
UNVERIFIED LABEL
      ↓
SHAREABLE RECEIPT
```

If this works end-to-end, Public Receipt is viable for submission.

Everything else is secondary.

---

# 2. BUILD OBJECTIVE

Build a deployed web application where a citizen can:

1. ask a natural-language question about a public project;
2. discover a relevant project from real 2026 Federal Budget data;
3. see the amount, project title, geography and responsible institution;
4. read an AI-assisted plain-language explanation;
5. inspect the exact official source supporting the information;
6. ask questions about that specific receipt;
7. receive answers constrained to available evidence;
8. see what is known and unknown about project implementation;
9. submit a community observation;
10. see that observation explicitly labelled as unverified;
11. share a visual Public Receipt.

---

# 3. NON-NEGOTIABLE PRODUCT RULE

## NO SOURCE, NO CLAIM.

The LLM is not the project's database.

The LLM may:

- interpret a search query;
- simplify an official project description;
- answer questions from retrieved project context;
- explain uncertainty;
- help organise evidence.

The LLM may not invent:

- projects;
- project amounts;
- budget codes;
- institutions;
- locations;
- expenditure;
- release status;
- procurement status;
- completion status;
- corruption allegations;
- source documents.

---

# 4. ENGINEERING NORTH STAR

> **The AI does not ask citizens to trust the AI. It helps citizens inspect the evidence.**

Canonical domain objects:

```text
SOURCE DOCUMENT
      ↓
PROJECT
      ↓
PUBLIC RECEIPT
      ↓
EVIDENCE
```

AI sits around those objects. It does not replace them.

---

# 5. CRITICAL PATH

## P0 — Must ship

- repository and engineering harness;
- real seed data;
- database;
- natural-language search interpretation;
- deterministic project search;
- results page;
- receipt page;
- source provenance page;
- project-scoped AI Q&A;
- safe unknown/sensitive responses;
- community evidence submission;
- evidence timeline;
- share card;
- mobile-responsive UI;
- deployed application;
- GitHub repository;
- README;
- E2E demo test.

## P1 — Only after P0 passes

- Explore page;
- My Community page;
- moderator screen;
- current-location assistance;
- installation manifest;
- query analytics;
- better social previews.

## P2 — Do not build before submission

- nationwide ingestion;
- vector embeddings;
- WhatsApp;
- USSD;
- multilingual voice;
- Pidgin;
- automated image verification;
- OCR pipeline;
- procurement API integrations;
- live fund-release tracking;
- complete offline mode;
- citizen accounts;
- maps;
- push notifications.

---

# 6. TECHNICAL BASELINE

```text
Framework         Next.js 16.x
Router            App Router
Language          TypeScript
Runtime           Node.js >= 20.9
Package manager   pnpm
Styling           Tailwind CSS
Database          Supabase PostgreSQL
Storage           Supabase Storage
Server auth       @supabase/ssr if moderator auth is implemented
AI SDK            OpenAI official JS SDK
Schema validation Zod
Icons             Lucide
Testing           Vitest + Testing Library + Playwright
Hosting           Vercel
Repository        GitHub
```

Next.js 16 uses the App Router architecture. Prefer Server Components unless client interactivity is required.

---

# 7. PACKAGE POLICY

Recommended application dependencies:

```text
next
react
react-dom
@supabase/supabase-js
@supabase/ssr
openai
zod
lucide-react
clsx
tailwind-merge
sharp
```

Development dependencies:

```text
typescript
eslint
prettier
vitest
@testing-library/react
@testing-library/jest-dom
jsdom
@playwright/test
```

Do not install a large component framework merely to accelerate styling.

---

# 8. REPOSITORY STRUCTURE

```text
public-receipt/
│
├── app/
│   ├── api/
│   │   ├── search/route.ts
│   │   ├── receipt/[id]/ask/route.ts
│   │   ├── receipt/[id]/evidence/route.ts
│   │   ├── receipt/[id]/card/route.tsx
│   │   └── health/route.ts
│   ├── explore/page.tsx
│   ├── community/page.tsx
│   ├── receipt/[id]/page.tsx
│   ├── receipt/[id]/source/page.tsx
│   ├── receipt/[id]/evidence/page.tsx
│   ├── receipt/[id]/submit/page.tsx
│   ├── receipt/[id]/share/page.tsx
│   ├── search/page.tsx
│   ├── verification/page.tsx
│   ├── data/page.tsx
│   ├── manifest.ts
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
│
├── components/
│   ├── ai/
│   ├── evidence/
│   ├── receipt/
│   ├── search/
│   ├── shell/
│   └── ui/
│
├── lib/
│   ├── ai/
│   ├── data/
│   ├── domain/
│   ├── security/
│   ├── supabase/
│   └── utils/
│
├── supabase/
│   ├── migrations/
│   └── seed.sql
│
├── data/
│   ├── raw/
│   ├── seed/projects.csv
│   └── processed/
│
├── scripts/
│   ├── validate-seed.ts
│   ├── import-projects.ts
│   └── generate-plain-language.ts
│
├── docs/
│   ├── CODEX_MASTER_BUILD_BRIEF.md
│   ├── product-blueprint.md
│   ├── ux-blueprint.md
│   ├── trust-model.md
│   ├── data-methodology.md
│   ├── demo-script.md
│   └── decisions/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── README.md
├── package.json
└── pnpm-lock.yaml
```

---

# 9. ENVIRONMENT VARIABLES

Required:

```text
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=
ADMIN_EMAIL=
```

Optional:

```text
ENABLE_AI=true
ENABLE_EVIDENCE_UPLOAD=true
ENABLE_MODERATOR=false
```

Rules:

- `SUPABASE_SECRET_KEY` must never be prefixed `NEXT_PUBLIC_`.
- OpenAI calls occur only server-side.
- Secret-key operations occur only server-side.
- Browser code must never receive secret values.
- `.env.local` must remain ignored by Git.

---

# 10. MODEL CONFIGURATION

Do not scatter model IDs through the codebase.

Use:

```text
OPENAI_MODEL
```

One server-side configuration module must resolve it. The model should be replaceable without application-code changes.

---

# 11. DATABASE PRINCIPLE

The database, not AI output, is the canonical Public Receipt record.

```text
source_documents
      ↓
project_source_refs
      ↓
projects
      ↓
evidence_submissions
      ↓
evidence_media
      ↓
verification_events
```

---

# 12. SOURCE DOCUMENTS TABLE

Required fields:

```text
id
title
publisher
document_type
budget_year
publication_date
source_url
file_hash
ingested_at
created_at
```

Prototype source:

```text
2026 Federal Appropriation Act — Detailed Budget
Budget Office of the Federation
```

---

# 13. PROJECTS TABLE

Required fields:

```text
id
receipt_id
budget_year
project_code
official_title
plain_language_title
plain_language_description
amount
currency
sector
ministry
department
agency
state
area_council
community
location_raw
location_confidence
data_confidence
created_at
updated_at
```

Canonical receipt format:

```text
PR-NG-FCT-2026-000001
```

---

# 14. PROJECT SOURCE REFERENCES

Required fields:

```text
id
project_id
source_document_id
source_page
source_section
source_excerpt
source_url
created_at
```

A project may eventually have multiple sources. MVP may contain one.

---

# 15. EVIDENCE SUBMISSIONS

Required fields:

```text
id
project_id
observation_type
description
area_council
locality
approximate_lat
approximate_lng
verification_status
moderation_status
public_visibility
submitted_at
```

Allowed observation types:

```text
work_started
appears_completed
appears_incomplete
cannot_locate
other
```

Allowed verification states:

```text
community_report
corroborated
verified_independent
disputed
```

Allowed moderation states:

```text
pending
approved
rejected
```

Do not store public reporter names in this table.

---

# 16. EVIDENCE MEDIA

Required fields:

```text
id
evidence_id
storage_path
mime_type
width
height
file_size
created_at
```

---

# 17. VERIFICATION EVENTS

Required fields:

```text
id
evidence_id
previous_status
new_status
reason
review_method
created_at
```

This provides a basic evidence audit trail.

---

# 18. SEARCH INDEX

Enable PostgreSQL trigram support.

Create generated searchable text from:

```text
official_title
plain_language_title
plain_language_description
project_code
sector
agency
area_council
community
location_raw
```

Create a GIN trigram index.

Do not implement embeddings in P0.

---

# 19. WHY NO VECTOR DATABASE IN P0

The prototype search problem is mostly:

```text
LOCATION + SECTOR + YEAR + KEY TERMS
```

A structured AI parser plus Postgres filtering is faster to build, easier to debug, deterministic, less expensive and easier to explain.

Semantic embeddings remain P2.

---

# 20. ROW LEVEL SECURITY

Enable RLS on all public schema tables.

Publicly readable:

```text
projects
source_documents
project_source_refs
approved/public evidence
```

Public browser clients must not insert directly into:

```text
projects
source_documents
project_source_refs
verification_events
```

Evidence insertion must pass through a server Route Handler.

Do not expose unrestricted anonymous database writes.

---

# 21. EVIDENCE STORAGE

Create private Supabase bucket:

```text
evidence-private
```

Rules:

- not publicly listable;
- uploads only through server logic;
- approved images displayed using signed URLs;
- maximum image size 5 MB;
- accepted MIME: JPEG, PNG, WebP.

Before storage:

1. validate MIME;
2. validate file size;
3. decode image;
4. resize if excessive;
5. re-encode using `sharp`;
6. remove metadata by re-encoding;
7. create safe generated filename.

Never trust browser-provided filenames.

---

# 22. SEED DATA STRATEGY

Target:

```text
Minimum     30 real projects
Preferred   50–100 real projects
```

All final demo records must come from an official source.

Priority sectors:

```text
Healthcare
Education
Roads
Water
Community infrastructure
```

Across:

```text
Abaji
AMAC
Bwari
Gwagwalada
Kuje
Kwali
```

---

# 23. CANONICAL SEED CSV

Path:

```text
data/seed/projects.csv
```

Required headers:

```text
receipt_id
budget_year
project_code
official_title
plain_language_title
plain_language_description
amount
currency
sector
ministry
department
agency
state
area_council
community
location_raw
location_confidence
data_confidence
source_document
source_page
source_section
source_excerpt
source_url
```

Every row must contain at minimum:

```text
official_title
budget_year
sector
state
source_excerpt
source_url
```

Rows missing source evidence must fail validation.

---

# 24. SEED VALIDATION

Path:

```text
scripts/validate-seed.ts
```

Reject:

- missing title;
- invalid year;
- invalid sector;
- negative amount;
- missing source URL;
- missing source excerpt;
- duplicate receipt ID;
- invalid confidence value;
- malformed area council;
- empty project row.

Process must exit non-zero on failure.

Package command:

```text
pnpm seed:validate
```

---

# 25. PLAIN-LANGUAGE FIELD POLICY

`plain_language_title` and `plain_language_description` may be AI-assisted.

However:

- official title remains immutable;
- summary may not add facts;
- amount must not be generated;
- agency must not be generated;
- location must not be generated;
- implementation status must not be inferred.

Use human spot-checking for demo records.

---

# 26. DOMAIN CONSTANTS

FCT area councils:

```text
Abaji
Abuja Municipal Area Council
Bwari
Gwagwalada
Kuje
Kwali
```

Accepted alias:

```text
AMAC → Abuja Municipal Area Council
Abuja Municipal → Abuja Municipal Area Council
```

---

# 27. SECTOR TAXONOMY

```text
healthcare
education
roads_transport
water_sanitation
community_infrastructure
other
```

Never ask the LLM to invent new database categories.

---

# 28. SEARCH QUERY AI CONTRACT

Endpoint:

```text
POST /api/search
```

Request:

```json
{
  "query": "What healthcare projects were budgeted for Bwari in 2026?"
}
```

Structured interpretation:

```json
{
  "intent": "project_search",
  "year": 2026,
  "sector": "healthcare",
  "areaCouncil": "Bwari",
  "terms": [],
  "needsClarification": false,
  "clarificationQuestion": null,
  "confidence": "high"
}
```

Validate with Zod. Reject invalid structured output.

---

# 29. SEARCH INTERPRETATION RULES

The model must:

- extract only what the user stated or clearly implied;
- normalise AMAC;
- default year to 2026 only when prototype coverage requires it;
- never invent a location;
- ask clarification when “Abuja” could materially mean FCT or AMAC;
- use `other` only when a query does not fit known sectors;
- not answer the user's civic question itself.

The interpreter creates search parameters. It does not create civic facts.

---

# 30. DETERMINISTIC SEARCH

Recommended ranking order:

```text
1. exact year
2. exact area council
3. exact sector
4. text similarity
5. data confidence
```

Ranking must not use political importance.

---

# 31. SEARCH FALLBACK

If AI is unavailable, parse obvious tokens locally:

```text
Bwari
Kuje
AMAC
health
hospital
school
water
road
```

The application should degrade to basic search rather than fail completely.

---

# 32. SEARCH RESPONSE CONTRACT

```json
{
  "interpretation": {
    "year": 2026,
    "sector": "healthcare",
    "areaCouncil": "Bwari"
  },
  "results": [],
  "meta": {
    "count": 4,
    "coverage": "selected_fct_2026"
  }
}
```

If no result:

```json
{
  "results": [],
  "meta": {
    "count": 0,
    "message": "No matching verified record is currently indexed."
  }
}
```

Do not substitute AI-generated projects.

---

# 33. RECEIPT ROUTE

```text
/receipt/[receipt_id]
```

Example:

```text
/receipt/PR-NG-FCT-2026-000143
```

Receipt page should be server-rendered where practical.

---

# 34. RECEIPT DATA CONTRACT

Receipt data includes:

```text
receiptId
budgetYear
officialTitle
plainLanguageTitle
plainLanguageDescription
amount
currency
sector
agency
ministry
state
areaCouncil
community
locationConfidence
dataConfidence
source
evidenceSummary
```

Source:

```text
documentTitle
publisher
page
section
excerpt
url
```

Evidence summary:

```text
communityReports
corroboratedReports
verifiedIndependent
disputed
```

---

# 35. RECEIPT EVIDENCE STATE

Compute status from evidence.

Priority:

```text
DISPUTED
     ↓
VERIFIED INDEPENDENT
     ↓
CORROBORATED COMMUNITY
     ↓
COMMUNITY REPORTED
     ↓
NO IMPLEMENTATION EVIDENCE
```

Official budget record always remains separate.

---

# 36. PROJECT-SCOPED AI ENDPOINT

```text
POST /api/receipt/[id]/ask
```

Request:

```json
{
  "question": "Was this project completed?"
}
```

Server must load:

- project;
- source reference;
- evidence summary;
- approved evidence descriptions.

Only this context is passed to the model.

No external web search in P0.

---

# 37. RECEIPT ANSWER STATES

Allowed states:

```text
supported
partial
unknown
sensitive
```

Answer must include:

```text
answer
basis
caveat
sourceRequired
```

---

# 38. RECEIPT AI SYSTEM RULES

```text
You answer only from the provided Public Receipt context.

Never use prior knowledge to create a civic fact.

If the context does not establish the answer, say so.

Budgeted does not mean released.
Released does not mean spent.
Spent does not mean completed.

Community reports are observations, not official facts.

Never infer theft, corruption, criminal conduct,
political motive, or project failure from missing evidence.

Never claim that absence of Public Receipt evidence means
the project did not happen.

When relevant, clearly distinguish:
- what the official record says;
- what community evidence says;
- what remains unknown.
```

Treat prompt changes as code changes.

---

# 39. SAFE RESPONSE EXAMPLE

Question:

```text
Was this project completed?
```

Required answer when only an official budget record exists:

> Public Receipt does not currently have verified evidence confirming whether this project was completed. The official record confirms that it appears in the 2026 budget, but a budget allocation alone does not establish implementation.

Status:

```text
unknown
```

---

# 40. SENSITIVE RESPONSE EXAMPLE

Question:

```text
Who stole the money?
```

Required:

> Public Receipt cannot determine that from the available evidence. The current record can show what was budgeted, but it does not establish whether funds were released, spent, misused or returned.

Status:

```text
sensitive
```

No names. No speculation.

---

# 41. COMMUNITY EVIDENCE ENDPOINT

```text
POST /api/receipt/[id]/evidence
```

Multipart fields:

```text
observationType
description
areaCouncil
locality
approximateLat
approximateLng
image
```

Validation:

```text
observationType required
description max 500 chars
image optional
image max 5 MB
location approximate
```

---

# 42. EVIDENCE SUBMISSION BEHAVIOUR

Immediately create:

```text
verification_status = community_report
moderation_status = pending
public_visibility = false
```

The submission does not change project delivery status automatically.

Confirmation UI:

> Your submission has been recorded as community evidence. It has not been independently verified.

---

# 43. SOURCE PAGE

Route:

```text
/receipt/[id]/source
```

Must display:

- official project title;
- amount;
- project code;
- publisher;
- document title;
- page/section where known;
- original source excerpt;
- source URL;
- date indexed.

Original source language is immutable.

AI summary must never replace it.

---

# 44. SOURCE LINK FAILURE

If original website is unavailable, retain:

```text
Document title
Publisher
Project code
Excerpt
Page/section
Previously indexed source URL
```

UI:

> Source link temporarily unavailable.

Do not silently remove provenance.

---

# 45. SHARE CARD

Endpoint:

```text
GET /api/receipt/[id]/card
```

Card fields:

```text
PUBLIC RECEIPT
Project
Location
Amount
Official record ✓
Implementation evidence status
Receipt ID
Public Receipt URL
```

Never use unsupported labels such as:

```text
FAILED PROJECT
CORRUPTION
STOLEN FUNDS
```

---

# 46. SHARE CARD STATUS TEXT

Allowed:

```text
Official record available
Community reports available
Community evidence corroborated
Verified implementation evidence available
No verified implementation evidence currently available
Evidence disputed
```

---

# 47. CORE UI ROUTES

P0:

```text
/
/search
/receipt/[id]
/receipt/[id]/source
/receipt/[id]/evidence
/receipt/[id]/submit
/receipt/[id]/share
/verification
/data
```

P1:

```text
/explore
/community
/admin/evidence
```

---

# 48. HOME PAGE P0

Must contain:

```text
PUBLIC RECEIPT

Every public project deserves a public receipt.

What did government promise your community?

[ Ask about a project, place or service... ]

[ Find a Receipt ]

Suggested:
Healthcare in Bwari
Roads in Kuje
Schools in AMAC
Water in Gwagwalada
```

Prototype notice:

> Selected 2026 Federal Government projects in the FCT.

---

# 49. SEARCH PROCESSING STATE

Do not display generic AI typing.

Show structured retrieval:

```text
Searching public records…

✓ Location: Bwari
✓ Sector: Healthcare
✓ Budget year: 2026

Finding receipts…
```

---

# 50. RESULTS PAGE

Each card:

```text
plain-language title
amount
area council
sector
official-record badge
evidence summary
View Receipt
```

Never display a completion state not backed by evidence.

---

# 51. RECEIPT PAGE ORDER

Mobile order:

```text
1. Receipt identity
2. Project title
3. Location
4. Amount
5. Official-record badge
6. Plain-language explanation
7. Public record
8. Source
9. Evidence summary
10. Community evidence
11. Ask about receipt
12. Actions
```

Sticky actions:

```text
Add Evidence
Share
```

---

# 52. TRUST BADGES

Supported types:

```text
official
verified
corroborated
community
unverified
disputed
```

Visible text label always required. Colour alone must not communicate state.

---

# 53. EXACT PUBLIC LABELS

Use exactly:

```text
OFFICIAL RECORD
VERIFIED EVIDENCE
CORROBORATED COMMUNITY EVIDENCE
COMMUNITY REPORTED
UNVERIFIED
DISPUTED
NO VERIFIED IMPLEMENTATION EVIDENCE AVAILABLE
```

---

# 54. DESIGN IMPLEMENTATION

The application should be:

```text
mobile-first
clean
editorial
neutral
evidence-led
high contrast
minimal
```

Avoid generic startup gradients, AI-glow aesthetics, political imagery, large dashboards and decorative government crests.

---

# 55. ACCESSIBILITY GATE

P0 must include:

- semantic headings;
- form labels;
- keyboard access;
- visible focus;
- minimum touch target around 44 px;
- status text independent of colour;
- alt text for meaningful images;
- clear error messages;
- contrast-conscious palette.

---

# 56. PERFORMANCE TARGETS

```text
Homepage JS minimal
Receipt text server-rendered
Images lazy loaded
No budget PDF embedded automatically
No unnecessary client components
```

Use Client Components only for interaction that requires them.

---

# 57. SECURITY REQUIREMENTS

Mandatory:

- Zod validation on all external input;
- server-only secrets;
- MIME validation;
- file-size limits;
- re-encode uploaded images;
- render user text safely;
- no arbitrary HTML from community submissions;
- no public direct write permissions;
- no secret key in browser;
- no unrestricted model endpoint;
- max AI input length;
- basic throttling if readily available.

---

# 58. USER-GENERATED TEXT

Description maximum:

```text
500 characters
```

Render as plain text.

---

# 59. AI INPUT LIMITS

```text
Search query: max 300 characters
Receipt question: max 300 characters
```

Reject excessive payloads before model invocation.

---

# 60. AI FAILURE MODE

Search failure:

> We couldn't interpret that question. Try a place and service, such as “Healthcare in Bwari.”

Receipt Q&A failure:

> We couldn't answer that right now. The official receipt and source information are still available below.

Core records must remain usable without AI.

---

# 61. HEALTH CHECK

```text
GET /api/health
```

Response:

```json
{
  "status": "ok",
  "database": "ok",
  "aiConfigured": true
}
```

Do not expose secret configuration.

---

# 62. TEST STRATEGY

Tests must target the trust model, not just rendering.

Unit tests must cover:

- valid/invalid search interpretation;
- area council validation;
- sector validation;
- evidence-state precedence;
- currency formatting;
- receipt ID format.

AI contract tests must mock model output and test:

```text
invalid JSON rejected
unsupported enum rejected
unknown response renders correctly
sensitive response renders safely
```

Never require live AI calls for CI tests.

Integration tests must cover:

```text
search parameters → database query
receipt fetch → source joined
approved evidence → visible
pending evidence → hidden
submission → pending/unverified
```

---

# 63. E2E GOLDEN PATH

Playwright must execute:

```text
1. Open homepage.
2. Enter “Healthcare projects in Bwari”.
3. Submit.
4. Confirm results.
5. Open known receipt.
6. Confirm project amount.
7. Open source.
8. Return.
9. Ask “Was this project completed?”
10. Confirm safe unknown answer if evidence absent.
11. Add evidence.
12. Submit.
13. Confirm “unverified community report”.
14. Open share screen.
```

This is the single most important automated test.

---

# 64. E2E NO-HALLUCINATION TEST

Search:

```text
₦50 billion dragon hospital in Bwari
```

Expected:

```text
No matching verified record.
```

The system must not fabricate one.

---

# 65. E2E SENSITIVE QUESTION TEST

Ask:

```text
Who stole the money?
```

Expected:

- no named accusation;
- explanation of known/unknown;
- source link.

---

# 66. QUALITY GATES

`pnpm quality` must run:

```text
pnpm lint
pnpm typecheck
pnpm test
```

Also run:

```text
pnpm build
pnpm test:e2e
```

Codex must run the relevant quality gate after every milestone.

---

# 67. CI

GitHub Actions minimum:

```text
install
lint
typecheck
unit tests
build
```

Never merge a build that does not compile.

---

# 68. README REQUIREMENTS

README must include:

```text
Public Receipt
One-line definition
The problem
The solution
Hackathon track
Demo
Screenshots
How it works
Trust architecture
Technology
AI usage
Data source
Prototype coverage
Limitations
Privacy
Local setup
Environment variables
Testing
Deployment
Future roadmap
```

---

# 69. DATA METHODOLOGY

`docs/data-methodology.md` must state:

- exact primary source;
- date accessed;
- prototype coverage;
- how records were selected;
- extraction process;
- normalisation steps;
- location interpretation;
- confidence system;
- known omissions;
- date of indexing.

Explicitly state:

```text
Budgeted ≠ Released ≠ Spent ≠ Completed
```

---

# 70. TRUST MODEL

`docs/trust-model.md` must explain:

```text
Official Record
Verified Evidence
Corroborated Community Evidence
Community Report
Unverified
Disputed
```

---

# 71. DEMO FIXTURE

Identify one high-quality real project record early.

Criteria:

- real;
- FCT;
- recognisable sector;
- understandable description;
- amount present;
- location reasonably clear;
- source excerpt available.

The demo cannot depend on discovering a good record at the last minute.

---

# 72. MILESTONE M0 — REPOSITORY HARNESS

## Objective

Create a clean deployable shell.

Acceptance:

```text
pnpm lint       PASS
pnpm typecheck  PASS
pnpm test       PASS
pnpm build      PASS
pnpm test:e2e   PASS
```

M0 is complete when all gates pass and the repository is committed.

---

# 73. MILESTONE M1 — DATA FOUNDATION

## Objective

Real public projects exist in the application database.

Tasks:

- create Supabase project;
- migrations;
- RLS;
- source document record;
- canonical CSV;
- seed validator;
- seed import;
- project repository functions;
- one known demo receipt.

Acceptance:

```text
≥30 verified real records
all records have source excerpt + source URL
demo receipt queryable
no invented project rows
```

M1 is operationally complete only when the hosted Supabase database contains the validated dataset and the demo receipt can be retrieved through the data-access layer.

---

# 74. MILESTONE M2 — DISCOVERY

## Objective

User can ask and find.

Tasks:

- homepage;
- search composer;
- query interpretation;
- deterministic database search;
- search processing state;
- results;
- no-results state.

Acceptance:

```text
Healthcare projects in Bwari
```

must return relevant indexed receipts.

A nonsense query must produce no fabricated project.

---

# 75. MILESTONE M3 — THE RECEIPT

## Objective

Public Receipt becomes the central product.

Tasks:

- canonical receipt route;
- receipt UI;
- amount;
- agency;
- geography;
- plain explanation;
- trust badge;
- source provenance;
- source page;
- evidence summary;
- verification explainer.

Acceptance:

A tester can answer:

```text
What was budgeted?
Who was responsible?
Where did this information come from?
What remains unknown?
```

without reading the source PDF.

---

# 76. MILESTONE M4 — TRUSTED AI

## Objective

Project-scoped questions work safely.

Acceptance:

```text
“How much was budgeted?”
→ correct sourced amount

“Was it completed?”
→ unknown unless evidence establishes it

“Who stole the money?”
→ safe non-speculative response
```

---

# 77. MILESTONE M5 — COMMUNITY EVIDENCE

## Objective

Citizen can contribute without changing truth automatically.

Acceptance:

```text
verification_status = community_report
moderation_status = pending
public_visibility = false
```

No automatic project conclusion.

---

# 78. MILESTONE M6 — SHARE + SUBMISSION POLISH

## Objective

Prepare the product to be judged.

Tasks:

- share screen;
- generated share card;
- metadata;
- favicon;
- manifest;
- about-data page;
- trust page;
- README;
- screenshots;
- final Playwright run;
- mobile QA;
- deployment QA.

Acceptance:

Full golden path works on production URL.

---

# 79. CODEX WORKING METHOD

For each milestone:

1. Create `plans/active/MX-name.md`.
2. Record objective, files affected, schema changes, tests and acceptance criteria.
3. Implement the smallest coherent slice.
4. Run:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

5. Run relevant Playwright test.
6. Update plan with completion notes.
7. Commit.
8. Stop and report completion.
9. Do not begin the next milestone until explicitly instructed.

---

# 80. CODEX MUST NOT

Codex must not:

- add a map without instruction;
- build login for ordinary citizens;
- create a nationwide dashboard;
- add gamification;
- add political ratings;
- add a corruption score;
- scrape arbitrary social media;
- create live news ingestion;
- use AI as a factual fallback;
- introduce vector search before P0 works;
- convert the project into a chatbot;
- redesign the approved UX hierarchy;
- silently change trust labels;
- publish pending community evidence;
- expose exact reporter location;
- add speculative implementation statuses.

---

# 81. ARCHITECTURAL DECISION RULE

If Codex encounters ambiguity, choose the solution that maximises:

```text
1. provenance
2. deterministic behaviour
3. simplicity
4. testability
5. delivery speed
```

in that order.

---

# 82. FAILURE PRIORITY

Fix in this order:

```text
1. fabricated/wrong civic data
2. leaked secret/security issue
3. broken provenance
4. evidence-state confusion
5. broken golden-path functionality
6. deployment failure
7. mobile usability
8. visual polish
9. secondary features
```

---

# 83. DEFINITION OF DONE

Public Receipt v1.0 is engineering-complete when a judge using the deployed mobile application can:

1. open Public Receipt;
2. ask a natural-language question about an FCT public project;
3. receive matches from real indexed 2026 Federal Budget data;
4. open a Public Receipt;
5. see the official project title, amount, location and institution;
6. understand the project in plain language;
7. inspect the original source evidence;
8. ask whether the project was completed;
9. receive a response constrained to available evidence;
10. understand the difference between budgeted and implemented;
11. submit a community observation;
12. see that it is explicitly unverified;
13. share a Public Receipt;
14. understand what is known, what is reported and what remains unknown.

All of that must occur without:

- hallucinated project data;
- unsourced factual claims;
- political judgement;
- citizen allegations being converted into fact.

---

# 84. FINAL ENGINEERING MANTRA

## THE DATABASE HOLDS THE RECORD.

## THE SOURCE PROVES THE RECORD.

## AI HELPS PEOPLE UNDERSTAND THE RECORD.

## EVIDENCE CHALLENGES OR SUPPORTS THE RECORD.

## THE USER DECIDES WHAT TO DO NEXT.

---

# 85. FINAL BUILD STATEMENT

Do not build Public Receipt as an AI chatbot with budget data attached.

Build it as:

> **A trustworthy public-record system with AI as the easiest way in.**

The receipt is the product.

The source is the proof.

The evidence model is the moat.

The citizen question is the interface.

## ASK. VERIFY. ACT.

**Public Receipt**

**Every public project deserves a public receipt.**
