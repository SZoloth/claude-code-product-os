# PRD vs. Automation Exploration — Comparison

> NOTE: Exploratory Thought Experiment — Non-binding — Do not use for production.

## Summary
Both aim to speed a blind clinician from interest to listening. The PRD ships a voice-first, on-demand search and triage app; the exploration layers proactive, subscription-driven intake with optional scheduling and caching to reduce user effort.

## Alignment
- Data sources: PubMed, OpenAlex, Unpaywall.
- Reading pipeline: abstract-first, PDF→text with OCR fallback, iOS TTS.
- UX: voice-centric navigation, minimal player controls, triage buckets, single-paper citation exploration.
- Platform: iOS 16+, local storage, high accessibility bar.

## Key Differences
- Trigger model
  - PRD: on-demand fetch ("What's new"), no background initially.
  - Exploration: proactive intake via subscriptions; scheduled RSS/API polling (device or companion worker).
- Intake mechanisms
  - PRD: PubMed E-utilities; saved queries.
  - Exploration: prefer RSS (PubMed saved-search RSS; journal TOC feeds) + E-utilities; scraping only as explicit, permissive opt-in.
- Processing depth
  - PRD: fetch, read abstracts; extract full text when opened.
  - Exploration: pre-normalize, segment, and lazily cache TTS audio to reduce latency.
- Queue model
  - PRD: session-driven lists with triage and resume.
  - Exploration: persistent, prioritized queue seeded by subscriptions; "add citations to pipeline" expands the queue.
- Background & infra
  - PRD: no backend; optional background later.
  - Exploration: optional cloud worker for reliable scheduling and ranking; device-only path still supported.
- Storage footprint
  - PRD: metadata, snippets, progress.
  - Exploration: adds chunked text and optional audio cache with eviction policies.
- Legal stance
  - PRD: APIs + OA resolution; DOI deep links.
  - Exploration: codifies opt-in, allowlisted scraping; strict ToS compliance.

## Trade-offs
- Automation Mode benefits: lower friction, faster start, broader discovery via journal feeds/citations.
- Automation Mode costs: background limits, legal diligence for scraping, storage pressure, possible backend.
- PRD benefits: faster to ship, minimal infra, clean legal posture, focused core loop.
- PRD costs: user-initiated updates only; slower time-to-first-play without proactive queue.

## Recommended Hybrid
- Phase 1 (PRD): subscriptions + on-demand "What's new"; abstract TTS; OA resolution + DOI deep links.
- Phase 1.5: lazy TTS caching; text chunking for fast resume; explicit "Add citations to queue".
- Phase 2 (optional): light BGAppRefresh for metadata; or small companion worker for scheduled RSS/API pulls and ranking.

## Decision Gates
- Proactive intake timing (now vs. later)?
- TTS caching vs. storage complexity?
- APIs-only vs. opt-in allowlisted scraping?
- SLA for "new items ready to play" that justifies a backend?

