# Automation Mode — Executive Summary and UX

> NOTE: Exploratory Thought Experiment — Non-binding — Do not use for production.

Automation Mode subscribes to topics/authors/journals and saved PubMed queries, ingests new items via official feeds/APIs, prepares text for listening, and offers a simple play/triage experience. It complements the PRD’s voice-first flow without adding UI complexity.

## Executive Summary
- Goal: Minimize time-to-first-play for new, relevant papers.
- Intake: Prefer RSS/Atom (PubMed saved search RSS, journal feeds); otherwise official APIs (PubMed E-utilities, OpenAlex). Scraping only where permitted and explicitly enabled.
- Processing: Resolve open access, fetch abstracts/PDFs where allowed, extract/normalize text, segment, and play via iOS TTS. Cache audio segments lazily.
- Controls: Play/pause/next/previous/speed; triage into Read now, Shortlist, Later, Ignore.
- Expansion: “Add citations” fetches references and inbound citations (OpenAlex) into the queue.

## Experience Overview
1) Setup
   - Define topics/keywords, authors, journals, and saved PubMed queries.
   - Optional: institutional auth remains in Safari View for publisher deep links.

2) Intake
   - On demand: “What’s new” pulls recent items since last fetch.
   - Priority: PubMed saved search RSS and journal RSS; then PubMed E-utilities; OpenAlex for citations; Unpaywall for OA.

3) Processing
   - Fetch metadata and abstracts; resolve OA links for DOIs.
   - Download PDFs only when allowed by source policy; else deep-link via DOI.
   - Extract text (PDFKit/WebView) with OCR fallback (Vision) when needed.
   - Normalize and segment into 30–60s chunks; track resume offsets.

4) Playback & Triage
   - Simple player: play, pause, next/previous, faster/slower.
   - Buckets: Read now, Shortlist, Later, Ignore; fast voice actions.
   - “Add citations”: expand references and who-cites-this into the queue.

## Fit with PRD
- Reuses PubMed/OpenAlex/Unpaywall and the reading pipeline (PDF→OCR fallback).
- Extends Home voice menu (“What’s new”, triage buckets, resume) with subscriptions.
- Keeps Phase 1 on-demand fetch; optional background refresh later.

## Ranking & Prioritization
- Default: recency + venue heuristic.
- Optional: OpenAlex citation counts and venue tiers to boost high-signal papers.
- Auto-shortlist: threshold-based promotion to Shortlist bucket with audible summary.

## Accessibility & Privacy
- VoiceOver-first: rotor landmarks, large targets, descriptive labels and hints.
- Privacy-first: on-device processing by default; PDFs remain local unless user consents to cloud worker.
