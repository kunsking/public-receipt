# PUBLIC RECEIPT
## UX Architecture & Wireframe Blueprint v1.0

**Version:** 1.0  
**Status:** Build-ready UX specification  
**Product:** Public Receipt  
**Platform:** Mobile-first Progressive Web App  
**Primary geography:** Federal Capital Territory, Nigeria  
**Primary challenge track:** Transparency & Accountability  
**Parent document:** `docs/product-blueprint.md`

---

# 1. Purpose

This blueprint translates the Public Receipt product strategy into a complete user experience architecture.

It defines:

- information architecture
- navigation
- screen hierarchy
- user journeys
- page-level wireframes
- component behaviour
- AI interaction
- trust states
- evidence workflows
- responsive behaviour
- empty and error states
- accessibility requirements
- design direction
- MVP implementation priority
- prototype acceptance criteria

---

# 2. UX North Star

Public Receipt should never feel like a generic AI chatbot.

The experience should feel like:

> **A trustworthy public record that happens to be easy to ask questions about.**

The primary object is the **Receipt**.

AI is the interaction layer.

Evidence is the trust layer.

Action is the outcome.

Core UX loop:

## ASK → FIND → UNDERSTAND → VERIFY → ACT

---

# 3. Primary UX Principle

Official information, AI explanation, and community evidence must never visually collapse into one another.

Users should always understand:

- What government officially recorded
- What Public Receipt has interpreted
- What citizens have submitted
- What has been independently verified
- What remains unknown

---

# 4. Product Navigation Model

## Primary Navigation

### Home
Start a query.

### Explore
Browse available projects by place or sector.

### My Community
View projects associated with a selected area.

### About the Data
Understand sources, coverage and methodology.

## Primary Contextual Action

### Add Evidence
Available prominently from project pages.

## Secondary Navigation

- How Verification Works
- Data Sources
- Privacy
- About Public Receipt

---

# 5. Mobile Navigation

```text
┌──────────────────────────────┐
│                              │
│         PAGE CONTENT         │
│                              │
├──────────────────────────────┤
│ Home   Explore   Community   │
└──────────────────────────────┘
```

---

# 6. Desktop Navigation

```text
PUBLIC RECEIPT

Home   Explore   My Community   About the Data

                         [Find a Receipt]
```

No large dashboard sidebar.

---

# 7. Primary User Flows

## Flow A — Find a Receipt

```text
Home
  ↓
Ask a question
  ↓
AI interprets request
  ↓
Search results
  ↓
Select project
  ↓
Public Receipt
  ↓
Inspect source
  ↓
Take action
```

## Flow B — Browse Without AI

```text
Explore
  ↓
Choose sector / location
  ↓
Project results
  ↓
Public Receipt
```

## Flow C — Ask About a Specific Receipt

```text
Receipt
  ↓
Ask about this project
  ↓
Project-scoped AI
  ↓
Source-backed answer
```

## Flow D — Add Community Evidence

```text
Receipt
  ↓
I know this project
  ↓
Observation type
  ↓
Add photo
  ↓
Add note
  ↓
Add approximate location
  ↓
Privacy check
  ↓
Review
  ↓
Submit
  ↓
Confirmation
```

## Flow E — Verify Source

```text
Receipt
  ↓
View official source
  ↓
Source evidence
```

## Flow F — Share

```text
Receipt
  ↓
Share
  ↓
Receipt preview
  ↓
Copy link / Download / Native share
```

---

# 8. Screen Inventory

MVP screens:

- S01 — Landing / Home
- S02 — Search Processing
- S03 — Search Results
- S04 — Public Receipt Detail
- S05 — Source Evidence
- S06 — Ask About This Receipt
- S07 — Community Evidence Timeline
- S08 — Add Evidence: Observation
- S09 — Add Evidence: Media & Description
- S10 — Add Evidence: Location
- S11 — Add Evidence: Review
- S12 — Submission Confirmation
- S13 — Share Receipt
- S14 — Explore
- S15 — My Community
- S16 — Verification Explainer
- S17 — About the Data
- S18 — No Results / Unknown

---

# 9. S01 — Landing / Home

## Purpose

Immediately communicate value and start the core journey.

## Mobile Wireframe

```text
┌──────────────────────────────┐
│ PUBLIC RECEIPT          ☰    │
│                              │
│ Every public project         │
│ deserves a public receipt.   │
│                              │
│ What did government promise  │
│ your community?              │
│                              │
│ ┌──────────────────────────┐ │
│ │ Ask about a project,     │ │
│ │ place or service...      │ │
│ └──────────────────────────┘ │
│                              │
│ [ Find a Receipt ]           │
│                              │
│ Try asking:                  │
│ Healthcare in Bwari          │
│ Roads in Kuje                │
│ Schools in AMAC              │
│ Water in Gwagwalada          │
│                              │
│ Prototype coverage           │
│ Selected 2026 federal        │
│ projects in the FCT          │
│                              │
├──────────────────────────────┤
│ Home    Explore   Community  │
└──────────────────────────────┘
```

---

# 10. Home Search Behaviour

Placeholder:

> **Ask about a project, place or public service…**

Avoid:

> “Ask me anything.”

Optional:

**Use my location**

If requested, explain that location is used only to identify nearby public records.

---

# 11. S02 — Search Processing

Avoid chatbot typing animation.

Show structured retrieval:

```text
Searching public records…

✓ Location: Bwari
✓ Sector: Healthcare
✓ Budget year: 2026

Finding receipts…
```

---

# 12. S03 — Search Results

Mobile wireframe:

```text
┌──────────────────────────────┐
│ ← Public Receipt             │
│                              │
│ Healthcare in Bwari          │
│                              │
│ 8 matching public records    │
│                              │
│ [Sector ▾] [Location ▾]      │
│                              │
│ ┌──────────────────────────┐ │
│ │ PHC Construction         │ │
│ │ ₦85,000,000              │ │
│ │ Bwari Area Council       │ │
│ │ ✓ OFFICIAL RECORD       │ │
│ │ [ View Receipt ]         │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

Result card hierarchy:

- Plain-language project title
- Amount
- Location
- Sector
- Official record indicator
- Evidence status where available
- View Receipt

---

# 13. Result Filters

MVP:

- Sector
- Area Council

Optional:

- Amount range

Sorting:

- Most relevant
- Highest allocation

No “best/worst performing” ranking.

---

# 14. S04 — Public Receipt Detail

Most important screen.

Header:

```text
┌──────────────────────────────┐
│ ← Receipt               ↗    │
│                              │
│ PUBLIC RECEIPT               │
│ PR-NG-FCT-2026-000143        │
│                              │
│ Construction and Equipping   │
│ of XYZ Primary Healthcare    │
│ Centre                       │
│                              │
│ Bwari Area Council, FCT      │
│                              │
│ ₦85,000,000                  │
│                              │
│ ✓ OFFICIAL RECORD            │
│                              │
│ [ Share Receipt ]            │
└──────────────────────────────┘
```

---

# 15. Receipt Section — Plain Language

```text
WHAT THIS MEANS

The 2026 federal budget includes funding
to construct and equip a primary healthcare
facility serving this location.

[See original wording]
```

Label:

**AI-assisted explanation from official project record**

---

# 16. Receipt Section — Public Record

```text
THE PUBLIC RECORD

Budget year
2026

Amount
₦85,000,000

Responsible agency
XYZ Federal Health Agency

Sector
Healthcare

Location
Bwari Area Council

Project code
ABC12345

✓ Source confirmed

[ View official source ]
```

---

# 17. Receipt Section — Evidence Status

```text
WHAT DO WE KNOW ABOUT DELIVERY?

Official record
✓ Budget entry found

Independent evidence
— None connected

Community evidence
○ 2 reports

Current status
NO VERIFIED IMPLEMENTATION
EVIDENCE AVAILABLE
```

Required explanation:

> This does not mean the project was not implemented. It means Public Receipt does not currently have sufficient verified evidence to confirm implementation.

---

# 18. Receipt Section — Community Reality

```text
FROM THE COMMUNITY

2 observations

○ COMMUNITY REPORTED
12 September 2026

“Construction appears to have started,
but the building is not yet complete.”

Photo attached

Not independently verified

[ View all evidence ]
```

---

# 19. Receipt Section — Action

```text
WHAT CAN I DO?

[ Add evidence ]

[ View official source ]

[ Share this receipt ]

[ Contact responsible institution ]
```

Mobile sticky action:

```text
[ Add Evidence ]    [ Share ]
```

---

# 20. S05 — Source Evidence

```text
OFFICIAL SOURCE

2026 Federal Appropriation Act

Publisher
Budget Office of the Federation

Budget year
2026

Project code
ABC12345

ORIGINAL RECORD

“CONSTRUCTION AND EQUIPPING OF
XYZ PRIMARY HEALTHCARE CENTRE…”

Amount
₦85,000,000

Page / section
[Where available]

Source status
✓ Official government document

[ Open original document ]
```

Original source text must be visually distinct from AI-generated copy.

---

# 21. Source Provenance

Every receipt should show a source badge:

**Source: 2026 Federal Appropriation Act**

Tap opens provenance.

Source badges should appear close to supported factual claims.

---

# 22. S06 — Ask About This Receipt

Constrained AI interaction.

```text
ASK ABOUT THIS RECEIPT

What would you like to understand?

┌──────────────────────────────┐
│ Ask about this project...    │
└──────────────────────────────┘

Suggested questions

How much was budgeted?

Who is responsible?

What does the official description mean?

Do we have evidence it was completed?
```

Answers must show:

- Answer
- Evidence label
- Source
- Caveat if needed

---

# 23. Unknown / Sensitive Answer State

Question:

> “Has the contractor stolen the money?”

Response:

> **Public Receipt cannot determine that from the available records.**

Then show:

- What the official record says
- What remains unknown

No speculation.

---

# 24. S07 — Community Evidence Timeline

```text
COMMUNITY EVIDENCE

Project:
XYZ Primary Healthcare Centre

2 observations

────────────────────────────

○ COMMUNITY REPORTED

12 September 2026

Work appears incomplete

“Walls are standing but there are no
doors or equipment yet.”

📷 1 photo

Approximate area:
Bwari

Not independently verified
```

Corroborated label:

**◉ CORROBORATED COMMUNITY EVIDENCE**

---

# 25. S08 — Add Evidence: Observation

```text
ADD EVIDENCE

What did you observe?

○ Work has started
○ Work appears completed
○ Work appears incomplete
○ I could not locate the project
○ Something else

[ Continue ]
```

Avoid “Project abandoned.”

---

# 26. S09 — Add Evidence: Media & Description

```text
SHOW US WHAT YOU SAW

Add a photo
[ Upload Photo ]

Optional

Tell us what you observed

┌──────────────────────────────┐
│ Short description...         │
└──────────────────────────────┘

[ Continue ]
```

Privacy warning:

> Avoid images that unnecessarily expose private individuals, children, personal documents, licence plates or sensitive locations.

---

# 27. S10 — Add Evidence: Location

```text
WHERE DID YOU OBSERVE THIS?

○ Use approximate current location
○ Choose area manually

Selected:
Bwari Area Council

Your precise location will not be
displayed publicly.

[ Continue ]
```

---

# 28. S11 — Add Evidence: Review

```text
REVIEW YOUR SUBMISSION

Observation
Work appears incomplete

Photo
[ thumbnail ]

Description
Walls are standing but there is
no equipment yet.

Location
Bwari Area Council

HOW THIS WILL APPEAR

○ Community Report

This submission will not be presented
as verified until reviewed or corroborated.

☑ I understand

[ Submit Evidence ]
```

---

# 29. S12 — Submission Confirmation

```text
EVIDENCE RECEIVED

Thank you.

Your submission has been recorded
as community evidence.

Current status

○ UNVERIFIED COMMUNITY REPORT

It will not change the official project
record automatically.

[ Back to Receipt ]

[ Share Receipt ]
```

---

# 30. S13 — Share Receipt

```text
SHARE THIS RECEIPT

┌──────────────────────────────┐
│ PUBLIC RECEIPT               │
│                              │
│ XYZ Primary Healthcare       │
│ Centre                       │
│                              │
│ Bwari, FCT                   │
│                              │
│ ₦85,000,000                  │
│                              │
│ ✓ Official record           │
│ ? Delivery not verified     │
│                              │
│ PR-NG-FCT-2026-000143        │
└──────────────────────────────┘

[ Share ]

[ Copy Link ]

[ Download Card ]
```

---

# 31. S14 — Explore

```text
EXPLORE PUBLIC RECEIPTS

Location

[ All FCT ▾ ]

Sector

[ Healthcare ]
[ Education ]
[ Roads ]
[ Water ]
[ Infrastructure ]

────────────────────────────

Featured areas

Bwari
24 receipts

Kuje
17 receipts

AMAC
64 receipts
```

---

# 32. S15 — My Community

First-time:

```text
MY COMMUNITY

See projects connected to where
you live or work.

Choose your area council

[ Abaji ]
[ AMAC ]
[ Bwari ]
[ Gwagwalada ]
[ Kuje ]
[ Kwali ]

[ Use approximate location ]
```

Do not create aggregate political performance scores.

---

# 33. S16 — Verification Explainer

```text
HOW PUBLIC RECEIPT HANDLES EVIDENCE

✓ OFFICIAL RECORD
Information taken directly from an
authoritative government source.

✓ VERIFIED EVIDENCE
Independent evidence that has been validated.

◉ CORROBORATED COMMUNITY EVIDENCE
Multiple independent observations support
the same finding.

○ COMMUNITY REPORTED
Submitted by a community member,
but not independently verified.

? UNVERIFIED
There is not enough evidence to support the claim.

! DISPUTED
Credible sources materially conflict.
```

Close with:

> Public Receipt shows uncertainty instead of hiding it.

---

# 34. S17 — About the Data

Include:

### What this prototype covers
Selected 2026 Federal Government projects in the FCT.

### Primary source
2026 Federal Appropriation Act.

### What “budgeted” means
Money listed in a budget is not automatically evidence that funds were released, spent or that a project was completed.

### What is not yet covered
Full national coverage, all state/local budgets, live procurement data and complete release/expenditure records.

### Last dataset update
Timestamp.

---

# 35. S18 — No Results

```text
WE COULDN'T FIND A MATCH

We don't currently have enough indexed
information to answer this query.

Try:

• another location
• a broader sector
• browsing all FCT projects

[ Search Again ]

[ Explore Projects ]
```

Required note:

> No result does not mean no government project exists. It means Public Receipt does not currently have a matching verified record.

---

# 36. Error State — Source Missing

```text
SOURCE TEMPORARILY UNAVAILABLE

The receipt record is still available,
but the original document link could
not be opened.

Document
2026 Federal Appropriation Act

Project code
ABC12345
```

---

# 37. Error State — AI Failure

```text
WE COULDN'T INTERPRET THAT QUESTION

Your public records are still available.

Try:

“Water projects in Kuje”

or browse projects manually.

[ Try Again ]
```

---

# 38. Trust Label Components

Shared component types:

```text
OfficialRecordBadge
VerifiedEvidenceBadge
CorroboratedBadge
CommunityReportBadge
UnverifiedBadge
DisputedBadge
```

Every badge must include visible text.

---

# 39. Receipt Card Component

```text
ReceiptCard
 ├── title
 ├── amount
 ├── location
 ├── sector
 ├── officialRecordStatus
 ├── evidenceStatus
 ├── receiptId
 └── CTA
```

---

# 40. Evidence Card Component

```text
EvidenceCard
 ├── evidenceStatus
 ├── observationType
 ├── description
 ├── media
 ├── approximateLocation
 ├── submittedDate
 └── verificationExplanation
```

---

# 41. Source Component

```text
SourceCitation
 ├── publisher
 ├── documentTitle
 ├── year
 ├── pageOrSection
 ├── projectCode
 └── sourceLink
```

---

# 42. AI Answer Component

```text
TrustedAnswer
 ├── answerText
 ├── evidenceClass
 ├── sourceReference
 ├── caveat
 └── openSourceCTA
```

Unsourced factual outputs must be rejected.

---

# 43. Search Interpretation UI

Optional:

```text
Searching for

Healthcare
in Bwari
for 2026

[ Change ]
```

---

# 44. Query Ambiguity

User:

> “Projects in Abuja”

System:

> **Do you mean the whole FCT or Abuja Municipal Area Council?**

Options:
- All FCT
- AMAC

Do not silently decide.

---

# 45. AI Interaction States

### FOUND
Verified project record supports answer.

### PARTIAL
Some information supported; requested facts incomplete.

### AMBIGUOUS
Clarification required.

### UNKNOWN
No supporting record.

### SENSITIVE
Question asks for unsupported accusation or motive.

---

# 46. Authentication

MVP should not require login to:
- search
- browse
- view receipts
- read evidence
- share

Evidence submission may remain anonymous or use lightweight verification only if necessary.

---

# 47. Design System

Visual personality:
- Calm
- Editorial
- Institutionally credible
- Contemporary
- Minimal
- Non-partisan
- Not futuristic AI

---

# 48. Colour Strategy

Suggested roles:
- Background: warm off-white
- Primary ink: deep charcoal
- Official/verified: muted green
- Community: muted blue/teal
- Caution: amber
- Disputed: controlled dark red
- Neutral: stone grey

Status must never rely on colour alone.

---

# 49. Typography

Recommended:
**Instrument Sans**

Alternative:
**Inter**

Use large editorial headings and strong numerical hierarchy for allocations.

---

# 50. Iconography

Use simple line icons:
- Document
- Map pin
- Institution
- Camera
- Evidence check
- Share
- Information
- Search

Avoid political symbols and warning-siren aesthetics.

---

# 51. Responsive Breakpoints

## Mobile
320–767px

Single column, bottom navigation, sticky actions.

## Tablet
768–1023px

Wider cards, selective two-column layouts.

## Desktop
1024px+

Centered content width, optional evidence sidebar.

---

# 52. Accessibility Requirements

- Keyboard navigation
- Meaningful alt text
- Status independent of colour
- Body text around 16px minimum
- Touch targets around 44px
- Persistent form labels
- Specific error messages
- Visible focus states

---

# 53. Low-Bandwidth Behaviour

- Text-first receipts
- Lazy-load image thumbnails
- Do not auto-load large source PDFs
- Cache receipt data where practical
- Preserve form state locally where possible

---

# 54. Data Confidence UI

If project geography is inferred:

```text
LOCATION

Bwari Area Council

Possible match
```

Tooltip:

> The source describes this location indirectly. Public Receipt has not independently confirmed the exact project site.

---

# 55. Prototype Data Notice

On Explore:

> **Hackathon prototype:** Currently showing selected 2026 Federal Government projects in the FCT.

Do not show on every screen.

---

# 56. Admin / Moderator UX

A full admin app is unnecessary for hackathon MVP.

Optional protected route:

```text
/admin/evidence
```

Actions:
- Approve for display
- Reject
- Mark corroborated
- Mark disputed

---

# 57. Moderation vs Verification

Keep separate.

Moderation:
**Can this content be displayed?**

Verification:
**How strongly is this claim supported?**

---

# 58. Critical Demo Flow

```text
HOME
↓
“What healthcare projects were budgeted
for Bwari in 2026?”
↓
SEARCH RESULTS
↓
REAL PROJECT
↓
PUBLIC RECEIPT
↓
PLAIN-LANGUAGE EXPLANATION
↓
VIEW OFFICIAL SOURCE
↓
ASK:
“Was it completed?”
↓
PUBLIC RECEIPT:
“No verified implementation evidence
is currently available.”
↓
ADD COMMUNITY EVIDENCE
↓
UPLOAD DEMO PHOTO
↓
SUBMIT
↓
“Community report — unverified”
↓
RETURN TO RECEIPT
↓
SHARE PUBLIC RECEIPT
```

---

# 59. Demo Timing Target

Complete primary demonstration:

**90–150 seconds**

---

# 60. Homepage Copy

Hero:

## What did government promise your community?

Supporting:

> Search public budget records in plain language and see the evidence behind every answer.

Primary CTA:

**Find a Receipt**

Secondary:

**Explore Public Projects**

---

# 61. Receipt Copy

Primary label:

## Public Receipt

Supporting:

> A source-backed record of a public project.

---

# 62. Evidence Copy

Header:

## What do we know about delivery?

Avoid:
**Project Performance**

unless appropriate evidence exists.

---

# 63. Community CTA Copy

Recommended:

## I know this project

Supporting:

> Share what you observed.

Better than:
**Report this project**

---

# 64. Verification Copy

Recommended:

> This report has not been independently verified.

Avoid:

> This may be fake.

---

# 65. Action Copy

Section:

## What can I do next?

Actions:
- View official source
- Add community evidence
- Share receipt
- Contact responsible institution

---

# 66. Search Result Ranking

Rank by:
1. geographic match
2. sector match
3. semantic/text relevance
4. data confidence

Do not rank by political significance.

---

# 67. Suggested MVP Routes

```text
/
/search
/explore
/community
/receipt/[id]
/receipt/[id]/source
/receipt/[id]/ask
/receipt/[id]/evidence
/receipt/[id]/submit
/receipt/[id]/share
/verification
/data
/admin/evidence
```

---

# 68. Developer Component Map

```text
<AppShell>
  <TopBar />
  <BottomNav />

<SearchComposer />

<QueryInterpretation />

<ReceiptCard />

<ReceiptHeader />

<ReceiptSummary />

<OfficialRecord />

<EvidenceSummary />

<EvidenceTimeline />

<EvidenceBadge />

<SourceCitation />

<TrustedAnswer />

<ActionPanel />

<AddEvidenceFlow />

<ShareReceiptCard />

<CoverageNotice />
```

---

# 69. MVP Build Order

### Build Block 1
App shell, Home, Search, Results.

### Build Block 2
Receipt detail, Official record, Source evidence.

### Build Block 3
Project-scoped AI, Unknown states, Sensitive-answer states.

### Build Block 4
Community evidence timeline, Evidence submission.

### Build Block 5
Share receipt, Explore, Community.

### Build Block 6
Verification explainer, About data, Polish.

---

# 70. P0 Screens

Must be functional:
- Home
- Results
- Receipt
- Source
- Ask About Receipt
- Evidence submission
- Share Receipt

---

# 71. P1 Screens

Should work if possible:
- Explore
- My Community
- Verification Explainer
- About the Data

---

# 72. P2 UX

May be deferred:
- full moderator dashboard
- advanced maps
- WhatsApp
- Pidgin translation
- full offline mode
- evidence clustering UI
- nationwide browsing

---

# 73. Core UX Acceptance Criteria

A new user can:
- search for a project type in a location
- identify a real public project
- understand what it is
- see the allocation
- verify the source
- understand evidence uncertainty
- submit a community observation
- understand that submission is not automatically verified
- share the receipt

---

# 74. Trust Comprehension Test

Ask:

> “Does Public Receipt say this project was completed?”

If no verified completion evidence exists, tester should answer:

> “No. It says it doesn't currently have verified evidence.”

Ask:

> “Is this citizen report an official fact?”

Tester should answer:

> “No. It is a community report.”

If those distinctions are unclear, the interface has failed.

---

# 75. UX Anti-Patterns

Do not use:
- generic chatbot bubbles as main interface
- large map as homepage
- unsupported AI confidence percentages
- political leader images
- leaderboards
- corruption scores
- red-alert dashboards
- “Failed project” labels based on missing data
- government performance scores
- excessive charts
- public user profiles

---

# 76. Experience Signature

The product should be remembered for three moments:

### Moment 1
A citizen asks a normal question.

### Moment 2
Public Receipt shows the exact public record behind the answer.

### Moment 3
Citizen evidence appears separately and transparently without becoming “truth” automatically.

---

# 77. Final UX Statement

Public Receipt does not ask users to trust an AI.

It gives them a simpler way to inspect evidence.

The interface should make unmistakable:

## What is recorded.
## What is observed.
## What is verified.
## What is still unknown.

Every interaction should move the citizen from:

**question → evidence → understanding → action**

---

# 78. UX Mantra

## ASK.
## FIND.
## VERIFY.
## ACT.

**Public Receipt**

**Every public project deserves a public receipt.**

---

# 79. Hackathon UX Definition of Done

The Public Receipt UX is ready for submission when a first-time mobile user can:

> **Ask a natural-language question about a real FCT public project, find a matching official record, understand the project in plain language, inspect the source, see exactly what is known and unknown about implementation, contribute a clearly labelled community observation, and share a Public Receipt — without confusing AI interpretation, official information, and citizen evidence.**
