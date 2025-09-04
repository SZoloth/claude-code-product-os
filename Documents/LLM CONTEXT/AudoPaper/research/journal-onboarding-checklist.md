# Journal Onboarding Checklist

> NOTE: Exploratory Thought Experiment — Non-binding — Do not use for production.

Use this checklist to add a target journal to the intake pipeline while staying within legal/operational limits.

## Identity & Scope
- Journal name (canonical) and abbreviations
- ISSN (print + electronic) and publisher
- Subject scope confirms relevance

## Source Availability
- PubMed coverage: yes/no; journal abbreviation token (`[ta]`) or exact title `[journal]`
- RSS/Atom feeds: Latest articles / Online first / Issue TOC
- Crossref: validate ISSN and container-title; test recent works
- Europe PMC: confirm journal presence (optional)
- Publisher API: available? license/keys required? (record ToS)

## Query Recipes (record final forms)
- PubMed ESearch term for journal (with `reldate`/`datetype`)
- RSS feed URL(s)
- Crossref query (ISSN + from-pub-date window)
- Europe PMC query (if used)

## Filters & Types
- Include: research articles, reviews, editorials? (define)
- Exclude: corrections, retractions, errata, news (define)

## OA & Linking
- DOI pattern verified; Unpaywall resolution tested
- Publisher DOI deep-link opens in Safari View with SSO if applicable

## Operational Settings
- Polling cadence and last-seen markers
- De-duplication key (DOI primary; PMID secondary)
- Error handling and fallback (e.g., skip on feed outage; retry policy)

## Accessibility
- Ensure items have title, authors, venue, year, and abstract snippet
- VoiceOver labels/hints for actions related to journal feed items

## Compliance
- Record ToS and robots.txt status for feeds/APIs
- Rate limit configuration (PubMed/Crossref/others)

