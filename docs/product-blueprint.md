# PUBLIC RECEIPT
## Product Blueprint v1.0

**Version:** 1.0  
**Status:** Build-ready hackathon blueprint  
**Primary Challenge Track:** Transparency & Accountability  
**Product Type:** AI-powered civic information PWA  
**Initial Market:** Nigeria  
**Prototype Geography:** Federal Capital Territory (FCT), Nigeria  
**Prototype Data:** Selected projects from the 2026 Federal Appropriation Act

---

# 1. Product Definition

## Working Name
**Public Receipt**

## Product Proposition
**See what government promised your community. See the evidence. Take action.**

## Campaign Line
**Every public project deserves a public receipt.**

## Primary CTA
**Find your receipt.**

## One-Sentence Product Definition
Public Receipt is an AI-powered civic information platform that turns complex government budget records into simple, location-specific answers that citizens can trace to an official source, compare with real-world evidence, and act on.

## Core User Promise
A citizen should not need to understand budget codes, know the responsible ministry, download a large appropriation document, or understand government terminology to answer:

> **“What did government promise my community?”**

---

# 2. The Problem

Public-budget information is technically public, but often not practically accessible.

A typical citizen must:
1. Know that the relevant document exists.
2. Locate the correct government website.
3. Find and download the correct budget document.
4. Search a potentially very large document.
5. Understand institutional terminology and project descriptions.
6. Determine whether a project relates to their community.
7. Identify the responsible government institution.
8. Determine what was budgeted.
9. Find separate evidence about implementation.
10. Work out what they can do if reality does not match the public record.

Public Receipt does **not** position itself as another project-monitoring database.

Its core problem is narrower:

> **How can an ordinary citizen interrogate the public record as easily as asking a question, understand the answer, see exactly where it came from, compare the official record with available evidence, and know what to do next?**

---

# 3. Product Thesis

Public Receipt transforms:

**Government documents → civic intelligence → understandable evidence → citizen action.**

Core loop:

## ASK → FIND → UNDERSTAND → VERIFY → ACT

---

# 4. Product Principles

## Source Before Summary
AI-generated explanations never replace the original record. Every material claim derived from a government document must be linked to its source.

## Evidence Before Accusation
Public Receipt does not conclude corruption, fraud, theft, abandonment or misconduct merely because implementation evidence is unavailable.

Use:
**“No verified implementation evidence available.”**

## Location Before Abstraction
Information becomes meaningful when citizens can relate it to a community, area council/LGA, state, school, hospital, road, water facility, market, or other recognisable local infrastructure.

## Plain Language Before Bureaucracy
Official project descriptions remain available verbatim, with an additional plain-language explanation.

## Action Before Information Overload
Every relevant project record should end with:

> **What can I do next?**

---

# 5. Target Users

## Primary User — Everyday Citizen
Someone who wants to know what publicly funded project or service has been promised to their community but does not understand government budgeting systems.

Typical questions:
- “What road projects are planned around me?”
- “Was money budgeted for this health centre?”
- “What schools are being renovated in Bwari?”
- “How much was allocated for this project?”

## Secondary User — Community Advocate
Community leaders, youth organisations, women's groups, residents' associations and local organisers seeking credible information for engagement with public institutions.

## Secondary User — Journalist / CSO / Researcher
Needs source provenance, searchable records, structured project information, community observations, shareable receipts, and clear separation between verified and unverified information.

## Internal User — Verifier / Moderator
Reviews citizen evidence, harmful content, geographic classification, report-project links, verification states, duplicates and abuse.

---

# 6. Core Jobs to Be Done

### JTBD 01 — Discover
**When I want to know what government plans to do in my community, help me find relevant projects without requiring me to understand budget documents.**

### JTBD 02 — Understand
**When I find a government project, explain it in language I can understand without changing the meaning of the official record.**

### JTBD 03 — Verify
**When someone says a project exists, is completed or has been abandoned, show me what is actually documented and what evidence exists.**

### JTBD 04 — Contribute
**When I know something about a project, let me contribute useful evidence safely.**

### JTBD 05 — Act
**When the available evidence raises a question, tell me which legitimate next steps are available.**

---

# 7. MVP Scope

## Prototype Geography
**Federal Capital Territory, Nigeria**

Recognised area councils:
- Abaji
- Abuja Municipal Area Council
- Bwari
- Gwagwalada
- Kuje
- Kwali

---

# 8. Prototype Dataset

## Primary Source
**2026 Federal Appropriation Act — Detailed Budget**

## Dataset
Curated, verified subset of real FCT public projects.

Priority sectors:
1. Healthcare
2. Education
3. Roads / Transport
4. Water / Sanitation
5. Community Infrastructure

Prototype copy:

> **Prototype coverage: selected 2026 federal projects in the Federal Capital Territory.**

---

# 9. Core User Journey

1. User lands on homepage.
2. User asks a natural-language question.
3. System interprets the query.
4. System searches trusted project records.
5. Matching projects are displayed.
6. User opens a Public Receipt.
7. User inspects official source and evidence.
8. User takes action.

---

# 10. The Public Receipt

Every project has a structured record containing:
- Project title
- Plain-language explanation
- Location
- Budget year
- Amount in budget
- Responsible institution
- Budget code
- Official record status
- Implementation evidence status
- Community reports
- Source
- Receipt ID

Example:
`PR-NG-FCT-2026-000143`

---

# 11. Evidence Architecture

## Class A — Official Record
**✓ OFFICIAL RECORD**

## Class B — Verified Independent Evidence
**✓ VERIFIED EVIDENCE**

## Class C — Corroborated Community Evidence
**◉ CORROBORATED COMMUNITY EVIDENCE**

## Class D — Community Report
**○ COMMUNITY REPORTED**

## Class E — Unverified Claim
**? UNVERIFIED**

## Class F — Disputed
**! DISPUTED**

---

# 12. Trust Rule

## NO SOURCE, NO CLAIM.

The system must not answer factual budget questions from the LLM's internal knowledge.

Relevant factual responses must derive from retrieved Public Receipt records and their source evidence.

When evidence is unavailable:

> **“I couldn't find enough verified information to answer that.”**

Hallucination is product failure.

---

# 13. AI Architecture

AI supports the information journey. It is not the source of truth.

Functions:
1. Natural-language retrieval
2. Plain-language translation
3. Question answering from retrieved context
4. Query clarification
5. Evidence organisation

AI cannot autonomously assign final verification status for sensitive claims.

---

# 14. AI Safety Rules

The AI must never:
- accuse an individual of corruption;
- claim money was stolen;
- declare a project abandoned solely from absence of evidence;
- transform a citizen allegation into fact;
- invent budget figures;
- invent sources;
- invent project locations;
- infer political motives;
- rate political actors;
- expose reporter identities;
- present AI interpretation as an official government statement.

Safe alternative:

> “The official budget contains this allocation. Public Receipt currently has no verified evidence confirming implementation.”

---

# 15. Community Evidence Submission

Observation options:
- Work has started
- Work appears completed
- Work appears incomplete
- I cannot locate the project
- Something else

Users may add:
- optional photograph
- short description
- approximate location

Confirmation:

> **Evidence received**

> Your submission is community evidence. It will not be presented as verified until it passes review or receives sufficient corroboration.

---

# 16. Citizen Safety & Privacy

Requirements:
- Privacy by default
- Minimal personal data
- Approximate public location
- EXIF stripping where feasible
- Moderation of free-text reports
- No automatic public accusations

---

# 17. Action Layer

Project pages should support:
- View official source
- Add evidence
- Share this receipt
- Ask for information
- Contact responsible institution

---

# 18. Shareable Public Receipt

Designed primarily for:
- WhatsApp
- X
- Facebook
- Instagram
- community groups
- journalists

Share cards must never overstate implementation status.

---

# 19. Information Architecture

Primary:
- Home
- Explore
- My Community
- About the Data

Secondary:
- Add Evidence
- How Verification Works

---

# 20. MVP Screens

1. Landing / Home
2. Search / AI Query
3. Search Results
4. Public Receipt Detail
5. Source Evidence
6. Ask About This Receipt
7. Community Evidence
8. Add Evidence
9. Submission Confirmation
10. Share Receipt
11. Verification Explainer
12. About the Data

---

# 21. UX Tone

Public Receipt should feel:
- Calm
- Neutral
- Evidence-led
- Simple
- Non-partisan
- Non-accusatory
- Human

---

# 22. Visual Direction

Suggested identity:
- Primary: Deep Ink / Charcoal
- Background: Warm off-white
- Verified: Muted green
- Community: Muted blue/teal
- Caution: Amber
- Disputed: Controlled red
- Neutral: Stone grey

Typography:
- Instrument Sans
- Inter
- Manrope

Visual motif:
- receipt
- record
- evidence stamp

---

# 23. Accessibility

Minimum MVP:
- WCAG-conscious contrast
- keyboard navigability
- semantic labels
- large touch targets
- mobile-first layout
- status text independent of colour
- simple English
- lightweight pages

---

# 24. Low-Bandwidth Design

Requirements:
- PWA-friendly
- compressed images
- minimal homepage payload
- server-rendered project pages where practical
- lazy media loading
- text-first receipts
- shareable URLs

Future:
- WhatsApp
- USSD
- SMS
- voice
- offline evidence queue

---

# 25. Multilingual Strategy

MVP:
**English**

Stretch:
**Nigerian Pidgin**

Future:
- Hausa
- Yoruba
- Igbo
- additional Nigerian languages

---

# 26. Technical Architecture

```text
Government Documents
        ↓
Document Ingestion
        ↓
Normalised Projects
        ↓
PostgreSQL / Supabase
       ↙       ↘
 Search/RAG   Evidence DB
       ↘       ↙
   Trusted AI Layer
        ↓
     Next.js PWA
```

---

# 27. Recommended Technology Stack

- Next.js 16
- TypeScript
- React
- Tailwind CSS
- Supabase
- PostgreSQL
- Supabase Storage
- OpenAI API
- PostgreSQL text/trigram search
- Vercel
- GitHub

---

# 28. Core Data Model

## Project
Includes receipt ID, budget year, code, official title, plain-language title and description, amount, currency, sector, MDA fields, geography, source references, and data confidence.

## SourceDocument
Includes title, publisher, document type, publication date, URL, file hash, and ingestion date.

## Evidence
Includes project link, observation type, description, media, approximate location, verification status, and moderation status.

## VerificationEvent
Tracks changes to evidence state.

---

# 29. Receipt ID Convention

```text
PR-{COUNTRY}-{REGION}-{YEAR}-{NUMBER}
```

Example:
`PR-NG-FCT-2026-000143`

---

# 30. Search Behaviour

Support:
- location-led
- sector-led
- combined
- natural-language
- known project
- amount questions

---

# 31. Search Result Confidence

If geography is inferred:
**Possible match**

If explicit:
**Location confirmed from official record**

AI must not turn approximate extraction into certainty.

---

# 32. Data Ingestion Pipeline

```text
SOURCE
  ↓
DOWNLOAD
  ↓
EXTRACT
  ↓
CLEAN
  ↓
IDENTIFY PROJECT ROWS
  ↓
NORMALISE AMOUNTS
  ↓
CLASSIFY SECTOR
  ↓
EXTRACT LOCATION
  ↓
MATCH AREA COUNCIL
  ↓
RETAIN SOURCE TEXT
  ↓
GENERATE PLAIN-LANGUAGE DESCRIPTION
  ↓
HUMAN SPOT CHECK
  ↓
IMPORT
```

---

# 33. Data Quality Levels

### HIGH
Project, amount, agency and geography explicitly supported.

### MEDIUM
Project and amount explicit; geography required interpretation.

### LOW
Important fields ambiguous.

Low-confidence records should be excluded or clearly labelled.

---

# 34. Non-Goals for v1.0

Public Receipt v1.0 will not attempt to:
- prove corruption
- determine criminal wrongdoing
- track every Nigerian project
- replace existing civic-monitoring platforms
- provide nationwide live expenditure data
- automatically verify every photograph
- rank politicians
- predict political outcomes
- become a social network
- support every Nigerian language
- build native mobile apps

---

# 35. Competitive Position

Public Receipt's wedge is:

## **Conversational access to the public record with explicit provenance.**

Core differentiation:

> **“Ask a normal question and receive an evidence-backed public receipt.”**

---

# 36. Success Metrics

A first-time user can:
- ask a natural-language question
- find a relevant project
- understand the project
- identify the source
- distinguish official from community evidence
- submit an observation
- identify a next action
- complete the core journey in under three minutes

---

# 37. Functional Acceptance Criteria

- Relevant searches return real indexed projects.
- Every project shows an official source.
- AI summaries derive from stored project information.
- Missing data never triggers fabricated answers.
- Community reports remain visually separate from official records.
- Evidence submissions do not automatically alter project status.
- Users can inspect original wording.
- Users can share receipts.
- Mobile experience works.
- Prototype limitations are disclosed.

---

# 38. Hackathon Demo Scenario

1. Search: “What healthcare projects were budgeted for Bwari in 2026?”
2. Return a real project.
3. Open receipt.
4. Show amount, agency, location, explanation.
5. Open official source.
6. Ask: “Was it completed?”
7. Respond based only on available evidence.
8. Add a community observation.
9. Label it Community Report — Unverified.
10. Share the receipt.

---

# 39. Pitch Narrative

## Problem
Government information may be public without being meaningfully accessible.

## Human Insight
Citizens do not think in ministries, appropriation codes and programme classifications. They think:

> **“What was promised to my community?”**

## Solution
Public Receipt converts complex public records into evidence-backed answers organised around the citizen's question.

## AI Value
AI removes discovery and comprehension barriers without becoming the source of truth.

## Trust Innovation
Public Receipt separates official record, independent evidence, community observation, and unverified claims.

## Impact
**information → understanding → evidence → action**

---

# 40. MVP Build Priorities

## P0
- real dataset
- natural-language search
- project results
- Public Receipt
- provenance
- AI explanation
- evidence states
- evidence submission
- shareable receipt
- responsive deployment

## P1
- semantic search
- Pidgin
- location assistance
- admin verification
- evidence timeline

## P2
- nationwide coverage
- WhatsApp
- USSD
- multilingual voice
- procurement integrations
- release/expenditure integrations
- automated FOI workflow

---

# 41. Product Risks

## AI hallucination
Mitigation: retrieval-only factual answers and visible citations.

## False citizen reports
Mitigation: explicit unverified state until corroboration/review.

## Defamatory allegations
Mitigation: structured observations, moderation, no automatic publication.

## Poor source geography
Mitigation: confidence states and human spot checks.

## Scope explosion
Mitigation: FCT + curated verified records + priority sectors.

## Misinterpretation of “budgeted”
Mitigation:

**Budgeted ≠ Released ≠ Spent ≠ Completed.**

---

# 42. Core Trust Vocabulary

Use consistently:
- Official Record
- Verified Evidence
- Corroborated Community Evidence
- Community Report
- Unverified
- Disputed
- No evidence currently available

---

# 43. Design North Star

The interface should communicate:

> **“This is a trustworthy public record I can understand.”**

Not:

> “This is an AI chatbot.”

AI is infrastructure.

**The receipt is the product.**

---

# 44. Strategic Product Insight

Public Receipt should ultimately become an evidence protocol for public promises.

The canonical receipt connects:
- Promise
- Money
- Institution
- Place
- Source
- Evidence
- Status
- Action

---

# 45. Final Product Statement

Public Receipt exists because:

> **Publishing information is not the same as making it accessible.**

It gives citizens a simple way to ask:

> **“What did government promise us?”**

and see:
- what the public record says
- where it came from
- what evidence exists
- what remains unknown
- what the citizen can do next

---

# 46. MVP Definition of Done

Public Receipt v1.0 is hackathon-ready when:

> **A citizen can ask a natural-language question about a real FCT public project, discover an authentic budget record, understand it in plain language, inspect the original evidence, distinguish official information from citizen observations, submit community evidence, and generate a shareable Public Receipt through one coherent mobile-friendly journey.**

---

# 47. Product Mantra

## ASK.
## VERIFY.
## ACT.

**Public Receipt**

**Every public project deserves a public receipt.**
