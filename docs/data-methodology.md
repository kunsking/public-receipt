# Data Methodology

## Primary source

The M1 dataset is transcribed from the **Federal Republic of Nigeria 2026 Appropriation Act Details**, published by the Budget Office of the Federation on 10 August 2026.

- Official landing page: <https://budgetoffice.gov.ng/index.php/2026-appropriation-act-details>
- Publisher: Budget Office of the Federation, Federal Republic of Nigeria
- Date accessed: 20 September 2026
- Downloaded PDF SHA-256: `a8b8eab21df60be5a8fde35fd866f5f467a22acd8f5f255b1b52eb8b41d36f88`

The official landing page, rather than a temporary local copy, is retained on every seed row. Each row also includes the PDF page number, the printed National Assembly page number, the relevant institution or ministry section, and a verbatim excerpt.

## Prototype coverage

The production seed contains 50 capital-project records from the 2026 federal appropriation details. Coverage is limited to records with a clear Federal Capital Territory connection in the official project title or the immediately preceding institution heading. It includes records in Abaji, Abuja Municipal Area Council, Bwari, Gwagwalada and Kwali. No reliable, single-location Kuje row met the final selection threshold for this seed; Kuje remains a valid domain value for later verified additions.

The selected records cover healthcare, education, roads and transport, water and sanitation, and community infrastructure. They are a deliberately reviewed prototype subset, not a complete inventory of every federal project that may affect the FCT.

## Record selection method

1. Download the official detailed 2026 Appropriation Act PDF from the Budget Office document endpoint.
2. Search the complete 2,635-page document for FCT, area-council and locality names.
3. Inspect every candidate in its page context, including the ministry or institution heading, project code, type and amount.
4. Retain only rows with a traceable official title, amount, responsible institution context, source page and usable FCT location.
5. Prefer records in the five prototype sectors and records that a citizen can identify without speculative geographic inference.
6. Validate the canonical CSV before any database write.

## Extraction process

Text was extracted page by page and checked against the PDF layout. The official project wording is stored in `official_title` without silently correcting spelling or grammar. `source_excerpt` combines the row's project code, wording, appropriation type and amount, and adds the institution heading where that heading is necessary to establish location.

The PDF uses `ONGOING` and `NEW` as budget-document type labels. Those labels are preserved in excerpts only; Public Receipt does not treat them as proof of physical implementation.

## Normalisation rules

- Amounts are stored as unformatted non-negative NGN values.
- Receipt IDs are deterministic and sequential: `PR-NG-FCT-2026-000001` onward.
- State is normalised to `Federal Capital Territory`.
- `AMAC` is normalised to `Abuja Municipal Area Council` in the area-council field; the original acronym remains in official wording and excerpts.
- Official spelling, including apparent source typos such as `RAOD`, `PRINCIOAL` and `CRDIAC`, is preserved in `official_title`.
- A project is not split into invented sub-projects. Each receipt corresponds to one official budget line.
- Empty plain-language fields mean no editorial paraphrase has yet passed review; they do not weaken the official record.

## Sector classification

Sector is an editorial discovery aid, not an official Budget Office field. Classification follows the primary purpose evident in the title:

- `healthcare`: hospital facilities, clinical equipment and health-service systems
- `education`: school facilities, learning equipment and campus works
- `roads_transport`: roads, drainage tied to roads, and erosion-control road improvement
- `water_sanitation`: boreholes and water infrastructure
- `community_infrastructure`: civic facilities, public lighting and comparable shared infrastructure

## Area-council interpretation

Location confidence is `high` when the project title or institution heading names the area council or an institution whose official heading includes that location. It is `medium` when a named FCT community is assigned to its area council through ordinary geographic interpretation (currently Zuba and Bmuko). No low-confidence record is included in the production seed.

The raw location text is retained so later reviewers can reassess the normalised area council without losing source context.

## Confidence system

- `high` data confidence: the official Act page clearly supplies the project code, wording and amount.
- `medium` data confidence: an official record exists but one important field requires bounded interpretation.
- `low` data confidence: the record is too ambiguous for normal public display without further review.

All 50 M1 rows have high data confidence. Location confidence is separately assessed and must not be inferred from data confidence.

## Known limitations

- This is a reviewed prototype subset, not a comprehensive FCT budget dataset.
- The detailed Act is large and its web download route may redirect unauthenticated users even though the document endpoint serves the published PDF. The stable official landing page is retained.
- A ministry or institution heading can establish location for rows whose title is terse; the excerpt makes that dependency explicit.
- Sector and area-council fields are normalised interpretations and are not presented as quoted official fields.
- The dataset does not establish procurement, release, expenditure, construction progress or completion.

**Budgeted ≠ Released ≠ Spent ≠ Completed.**
