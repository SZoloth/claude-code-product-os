# Journal Ingest — Best Sources for New Articles

> NOTE: Exploratory Thought Experiment — Non-binding — Do not use for production.

## Goal
Identify the most reliable, legal, and low-friction ways to get newly published (or ahead-of-print) articles from target journals with minimal latency and maximum coverage.

## Source Priority (Recommended)
1) PubMed (NCBI E-utilities)
   - Why: biomedical coverage, stable identifiers (PMID), abstracts, MeSH, fast indexing for many journals.
   - How: `ESearch` for journal + date filters; `EFetch` for metadata/abstracts; sort by publication or entry date.
   - Pros: official, stable, broad coverage, free.
   - Cons: not every journal is indexed immediately; some delays; not all PDFs.

2) Journal RSS/Atom (TOC feeds)
   - Why: many journals publish article/issue feeds; minimal integration cost.
   - How: subscribe to each target journal’s “latest articles” or “online first” feed.
   - Pros: very fresh; easy to poll; often includes DOI and abstract snippet.
   - Cons: heterogeneous formats; occasional missing metadata; some feeds are partial.

3) Crossref REST API
   - Why: broad publisher participation; quick DOI registration → early availability.
   - How: filter by `container-title` or `issn`, and `from-pub-date`/`until-pub-date`.
   - Pros: publisher-agnostic; good for catching items pre-PubMed indexing.
   - Cons: metadata quality varies; rate limits; abstracts often missing.

4) Europe PMC API
   - Why: strong biomedical coverage overlapping PubMed, with additional grants/links; some OA full text.
   - How: query by journal name/ISSN and publication date; retrieve metadata and links.
   - Pros: complementary to PubMed; OA links.
   - Cons: duplication with PubMed; schema differences.

5) OpenAlex API (supplement)
   - Why: useful for citation expansion and venue filters; less ideal for day-zero intake than Crossref/PubMed.
   - How: filter works by `primary_location.source.display_name` or ISSN and `from_publication_date`.
   - Pros: uniform schema; includes citation counts and related works.
   - Cons: may lag DOI registration; abstracts limited.

6) Preprints (if in scope)
   - arXiv API (subject categories; use for methods/ML/physics adjacent bio).
   - bioRxiv/medRxiv RSS/API for life sciences preprints.

7) Publisher APIs (case-by-case)
   - Elsevier (Scopus/ScienceDirect), Springer Nature, Wiley, SAGE, Taylor & Francis, PLOS, etc.
   - Pros: deep metadata; sometimes full text for OA content.
   - Cons: keys/licenses, ToS constraints; best used sparingly and defensively.

## Query Recipes (Examples)
Note: replace placeholders and respect rate limits/ToS. Examples illustrate patterns, not production code.

1) PubMed — latest N days for a journal
- ESearch: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=%5Bjournal%5D&reldate=7&datetype=pdat&retmax=100&retmode=json&sort=pub+date`
  - Term examples: `"The New England Journal of Medicine"[journal]`, or ISSN with `[ta]`/journal title abbreviations.
- EFetch details by PMID: `.../efetch.fcgi?db=pubmed&id=PMID1,PMID2&retmode=xml`

2) Crossref — recent works by journal (ISSN)
- `https://api.crossref.org/works?filter=from-pub-date:2025-08-20,until-pub-date:2025-09-01,issn:0028-4793&rows=100&sort=published`
  - Prefer ISSN over container-title; normalize publisher names.

3) Europe PMC — recent by journal title
- `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=JOURNAL:"The+Lancet"+AND+PUB_YEAR:2025&format=json&pageSize=100&cursorMark=*`

4) OpenAlex — recent by venue
- `https://api.openalex.org/works?search=&filter=from_publication_date:2025-08-20,to_publication_date:2025-09-01,primary_location.source.issn:0028-4793&per-page=100&sort=publication_date:desc`

5) RSS/Atom — journal TOC
- Most major journals expose a “Latest articles” or “Online first” RSS/Atom feed. Identify via the journal site or `<link rel="alternate" type="application/rss+xml">` in HTML.

## Coverage Notes and Edge Cases
- Ahead-of-print/online-first: Crossref + journal RSS detect earliest; PubMed may lag; use `edat` (Entrez date) vs `pdat` (publication date) appropriately.
- Supplements/corrections/retractions: include/exclude based on document type filters (PubMed `pt` or Crossref `type`).
- High-volume venues: page with cursors (Crossref `next-cursor`, Europe PMC `cursorMark`).
- De-duplication: merge on DOI; backfill PMID/PMCID later.

## Publisher/Journal Notes (Typical Patterns)
- NEJM, JAMA Network, The Lancet, BMJ, Nature Portfolio, Science, Cell Press, PNAS
  - Usually provide RSS; PubMed indexing; Crossref early DOIs.
- PLOS
  - Open API and RSS; OA full text; good abstracts.
- Springer Nature / Wiley / Taylor & Francis / SAGE
  - RSS common; APIs available with keys and ToS; prefer Crossref+PubMed for portability.
- Society journals (AHA, ACS, ASM, etc.)
  - RSS frequently available; confirm PubMed coverage.

## Implementation Strategy
1) Prefer PubMed E-utilities for biomedical journals; poll by journal + `reldate` window; sort by `pubdate` or `entrez date`.
2) For freshness, add journal RSS feeds where available (TOC and Online First).
3) Use Crossref to catch very-new DOIs and to validate metadata; reconcile with PubMed when it appears.
4) Add Europe PMC as an optional supplement when PubMed lags or to improve OA links.
5) For preprints in scope, add bioRxiv/medRxiv or arXiv per topic.
6) Avoid direct scraping unless an allowlisted, permissive domain and user-opt in.

## Sample Polling Cadence (without backend)
- On-demand: user triggers “What’s new” → poll PubMed (7–14 day window), then RSS delta, then Crossref for the last 2–3 days to fill gaps.
- With backend (optional): schedule hourly/3-hourly Crossref + RSS; daily PubMed; de-duplicate and deliver compact deltas.

## Compliance & Operational Notes
- Respect rate limits; include contact email/UA where required (e.g., Crossref polite pool).
- Cache last-seen IDs/timestamps per source to avoid re-fetching.
- Maintain an allowlist of journals with chosen source mix (PubMed-only vs PubMed+RSS+Crossref).

