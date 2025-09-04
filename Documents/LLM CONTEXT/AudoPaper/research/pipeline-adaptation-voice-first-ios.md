# Adapting the Video Pipeline to a Voice‑First iPhone Literature Assistant

> NOTE: Exploratory Thought Experiment — Non-binding — Do not use for production.

## Feasibility
High. The video’s “podcast ripper” demonstrates: automated ingestion, ASR, LLM cleaning and summarization, entity extraction, vector search, and orchestration. Swap podcast audio for scientific papers (HTML/PDF → text), and wrap with a voice UI.

## Core Flow (Analog to the Video)
1) Fetch papers from PubMed saved queries and journal feeds.
2) Convert to text (HTML/PDF → text, with OCR fallback) and clean.
3) Summarize into a daily brief with quotes and key findings.
4) Extract citations and entities (drugs, diseases, biomarkers, trials, DOIs).
5) Store structured outputs locally; embed for vector search.
6) Voice navigation to follow references and related works.

## Components Mirrored from the Video
- ASR: on‑device `Parakeet` or `Whisper` for speech input (low‑latency, private).
- Conversion: `FFmpeg` analogue not needed; instead use PDF/HTML parsers + OCR.
- LLMs: local model (e.g., Gemma via Ollama) for cleaning, structured summaries, and extraction; optionally escalate to larger models for hard cases.
- Storage: `DuckDB` for runs/bookkeeping; `LanceDB` (or equivalent) for vector search.
- Prompts: extract quotes, theses, entities; preserve technical terms.

## Accessibility
- Full speech control for search, playback, and navigation.
- High‑quality TTS (`AVSpeechSynthesizer`) with section navigation and speed.
- Voice intents: “follow citation,” “open methods,” “summarize limitations.”

## Risks
- Publisher access limits and ToS; medical indexing coverage; privacy for notes.
- Mitigate via PubMed APIs, journal RSS, Unpaywall, and on‑device speech.

---

## How to Translate the Video System to iPhone

### 1) Voice‑First Control Layer
- Input: on‑device ASR (Parakeet/Whisper wrapper). Keep latency low and private.
- Commands: “search PubMed for diabetic retinopathy RCTs since 2023,” “open the second NEJM result,” “read abstract,” “follow citation 3,” “summarize limitations,” “save to reading list.”
- Output: high‑quality TTS that reads articles/sections; controls like “faster,” “skip to methods,” “back 30 seconds.”

### 2) Ingestion and Conversion (podcasts → papers)
- Sources: PubMed/Medline queries; journal RSS (e.g., NEJM latest); optional arXiv/medRxiv.
- Download: fetch HTML or PDF. If PDF, extract text (PDFKit) or OCR (Vision). Preserve headings and basic table text.
- Cleaning: use a “transcript editor” style prompt with a local LLM to normalize text, remove artifacts, and keep technical terms and equations intact.
- Storage: track item states (fetched, parsed, summarized) in `DuckDB` similar to daily runs.

### 3) Structured Summaries and Extraction
- Daily brief: for each paper include title, authors, study type, population, intervention, outcomes, key results, limitations, and clinical “so what.”
- Quotes/theses: extract notable quotes and implications; adapt the “actionable theses” concept for clinical relevance and guideline ties.
- Entities/citations: LLM‑based extraction for drugs, diseases, biomarkers, trial names, DOIs, in‑text references; resolve DOIs.
- Citation graph: build a lightweight graph (in LanceDB or relational tables) to enable “follow citation 2.”

### 4) Retrieval and Navigation
- Vector search: embed chunks and support “related papers” queries as in the video’s related‑post lookup.
- Local‑first: store embeddings locally; allow optional background sync.
- Voice navigation: “show related on GLP‑1 and retinopathy,” “find systematic reviews,” “compare these two RCTs.”

### 5) Writing Aids and Grading Loop
- Draft clinician notes from summaries; apply an “AP English teacher” grading loop to improve clarity while preserving clinician voice.
- Keep style prompts personable; avoid sterile prose.

### 6) iOS Implementation Sketch
- App: Swift/SwiftUI with VoiceOver; push‑to‑talk or wake‑word; `AVSpeechSynthesizer` for TTS; `BGAppRefreshTask` for light metadata prefetching when feasible.
- ASR: wrapper to run on‑device Whisper/Parakeet; fall back to `SFSpeechRecognizer` as needed.
- Processing: heavy PDF parsing/embedding can offload to a companion service; keep interaction loop snappy on device.
- Data: `DuckDB` for job bookkeeping; `LanceDB` (or local vector store) for embeddings; Core Data for user‑facing entities.
- Models: Ollama‑hosted Gemma for local cleaning/summaries; escalate to larger models for tough extraction cases.

### 7) Compliance and Access
- Prefer PubMed abstracts/links; resolve OA via Unpaywall; use DOI deep links in `SFSafariViewController` for institutional SSO.
- No PHI; on‑device caches and ASR where possible.

---

## Build Milestones (Example)
- Week 1: Voice search to PubMed; read abstracts aloud.
- Week 2: PDF ingestion for OA papers; TTS with section navigation.
- Week 3: Structured summaries and “follow citation” intents.
- Week 4: Related‑papers vector search and daily digest document.
- Week 5: Reliability hardening, offline caches, and common query shortcuts.

## Why This Maps Cleanly
The video shows a full pipeline: download, convert (FFmpeg), transcribe (Parakeet/Whisper), clean (Gemma), summarize to a daily doc, extract entities, store in DuckDB, and vector retrieval with LanceDB. For papers, replace the audio path with PDF/HTML → text and add citation extraction. LLM‑based extraction outperforms classic NER for proper nouns—directly useful for drugs, diseases, and trial names.

## Bottom Line
Feasible and near‑isomorphic: replace the feed and media type, retain the local‑first, low‑latency architecture, and front it with a voice UI that enables hands‑free literature discovery and citation following.

