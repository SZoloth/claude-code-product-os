# Architecture — Components and Data Flow

> NOTE: Exploratory Thought Experiment — Non-binding — Do not use for production.

Automation Mode supports two deployment options: on-device only (Phase 1+) and an optional companion worker (Phase 2). The app remains fully functional without a backend.

## Options
- On-device only
  - Triggered by user (“What’s new”); fetches and processes items on demand.
  - Pros: privacy, fewer dependencies. Cons: no true scheduled intake due to iOS background limits.
- Companion worker (optional)
  - A small cloud worker periodically pulls feeds/APIs, normalizes metadata, performs citation expansion, and produces a compact per-user JSON feed. App pulls on launch/silent push.
  - Pros: reliable scheduling, faster startup, improved ranking. Cons: infra, privacy guardrails required.

## Modules (App)
- SubscriptionsStore: topics/authors/journals/saved PubMed queries.
- Fetcher: RSS/Atom reader, PubMed E-utilities client, OpenAlex client.
- Resolver: DOI/OA (Unpaywall) and DOI deep links via Safari View.
- Ingestor: PDF/HTML fetcher with type/size checks and rate limiting.
- Extractor: PDF text via PDFKit/WebView; OCR fallback via Vision.
- Normalizer: de-hyphenation, whitespace cleanup, heading/section detection.
- Segmenter: chunking into ~30–60s parts; resume offsets.
- TTSEngine: AVSpeechSynthesizer; lazy segment caching; rate control.
- QueueManager: triage buckets; prioritization; in-progress state.
- Storage: Core Data entities for Items, Subscriptions, Chunks, Progress.

## Data Flow (On-Device)
1) Subscriptions → Fetcher pulls new items via RSS/APIs.
2) Resolver maps DOIs to OA links or DOI deep links.
3) Ingestor fetches allowed PDFs/HTML; Extractor gets text; OCR fallback.
4) Normalizer cleans text; Segmenter chunks text; TTSEngine plays/caches.
5) QueueManager surfaces items; user triages; Storage persists state.

## Storage Model (Core Data sketch)
- Item(id, title, authors, venue, year, pmid, doi, abstract, oaURL, addedAt)
- Subscription(id, type[keyword/author/journal/query], query, createdAt)
- Chunk(id, itemID, index, text, audioURL?, duration)
- Progress(itemID, percent, lastChunkIndex, lastOffsetSeconds)
