# Rollout, Risks, and Metrics

> NOTE: Exploratory Thought Experiment — Non-binding — Do not use for production.

## MVP Scope (2–3 sprints)
- Sprint 1
  - Subscriptions UI (topics/authors/journals/saved PubMed queries)
  - “What’s new” on-demand fetch via PubMed RSS/APIs
  - TTS abstracts (play/pause/next/speed) + resume offsets
- Sprint 2
  - OA resolution + DOI deep-links; in-app WebView/PDF
  - PDF text extraction + OCR fallback for small PDFs
  - Citation expand-on-demand via OpenAlex; add to queue
- Sprint 3 (optional)
  - Lazy TTS segment caching + simple prioritization
  - Background refresh via BGAppRefreshTask where feasible

## Key Risks and Mitigations
- iOS background limits
  - On-demand fetch initially; optional companion worker later; silent push when safe
- Legal constraints on scraping
  - Favor official feeds/APIs; explicit user opt-in for any scraping; per-domain allowlist
- PDF variability and extraction failures
  - OCR fallback; cap processing time; abstract-only mode toggle
- Storage bloat from audio caching
  - Segment-level caching with LRU eviction and size caps

## Success Metrics
- Time-to-first-play for new items after “What’s new”
- Abstract completion rate and abandonment reasons
- Triage action rates (Read now/Shortlist/Later/Ignore)
- “Add citations” usage and listens from citation-expanded items
- OA resolution hit rate; extraction/OCR error rate

## Next Implementation Steps (iOS)
- Add SubscriptionsView and FeedViewModel
- Implement PubMedClient and basic OpenAlexClient
- Introduce ReaderPipeline (extractor/segmenter/tts) with abstract-first
- Extend Core Data: Items, Subscriptions, Chunks, Progress
- Wire Home voice menu to feed/triage/player controls
