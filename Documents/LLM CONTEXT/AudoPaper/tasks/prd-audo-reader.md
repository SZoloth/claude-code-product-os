# PRD: Audo Reader — Voice-First Literature Search and Listening (Phase 1)

## 1) Overview
Audo Reader is an iOS (Swift/SwiftUI) app that enables a blind physician to search biomedical literature by voice, hear concise summaries, open the best accessible full text, and follow a paper’s citation graph hands-free. Phase 1 focuses on voice-driven PubMed search, result playback of abstracts via iOS text-to-speech (TTS), and basic citation exploration (references and who-cited-this) for one selected paper using OpenAlex. The app targets iOS 16+ and prioritizes first-class accessibility with VoiceOver.

Selections incorporated:
- Feature name: Audo Reader
- iOS: 16+
- Voice interaction: push-to-talk now; wake word later
- Data sources (search + citations): PubMed + OpenAlex
- Backend: TBD (decision task)
- Ranking: hybrid (recency + venue + citations)
- Saved items: local only (Core Data)
- Reading pipeline: PDF/HTML text → OCR fallback
- TTS defaults: system default voice @ 1.0×
- Accessibility focus: VoiceOver rotor landmarks + large targets
- Institutional access: Unpaywall OA when available → else DOI deep-link
- Privacy/analytics: decide later
- Languages: English only (Phase 1)
- Offline use: online only (no offline downloads Phase 1)
- Success metrics (POC): primary = successful voice searches/session
- Phase 1 scope: both core flow and basic citation graph for one paper

## 2) Goals
1. Voice-first PubMed search with accurate STT capture of medical terms.
2. Present top results (10 by default) with concise audio summaries (abstract-based), fully navigable by VoiceOver.
3. Open the best accessible full text: prefer Unpaywall OA; else DOI deep-link in SFSafariViewController.
4. Read abstracts aloud with `AVSpeechSynthesizer`; provide reliable voice/gesture controls (play/pause/next/previous/speed).
5. Support “references” and “who cites this” for one selected paper via OpenAlex.
6. Achieve excellent accessibility: rotor landmarks, large hit targets, semantic grouping, and meaningful hints.
7. App runs on iOS 16+ devices; no backend required initially.

## 2.1) UX Model (Phase 1)
- Home voice menu: “What’s new,” “In progress,” “Saved for later,” “Favorites,” “Search,” “Settings.” Spoken like a short “phone tree,” with numbers and natural-language commands supported.
- Inbox/feed: On open, app can announce “You have X new articles” and list concise titles; user can triage by voice.
- Triage buckets: “Read now,” “Shortlist,” “Later,” “Ignore.” Shortlist is a lightweight favorite. Later is a reading queue. Ignore dismisses the item from the inbox.
- In-progress resume: If an article is partially read, app surfaces progress (e.g., “50% complete”) and supports “resume” immediately.
- Citations anywhere: While focused on a result or article, user can say “View citations,” “Who cites this?,” or “What does this cite?” and triage those items with the same buckets.
- First-run: Minimal onboarding to add topics/keywords/authors/journals to seed the feed (can be skipped). Defaults to voice-only prompts with accessible forms available.

## 2.2) Decisions (Confirmed)
- Buckets: keep “Read now,” “Shortlist,” “Later,” “Ignore.”
- Subscriptions: start with free-text keywords, authors, journals.
- Fetch: on-demand when the user says “What’s new” (no background refresh initially).
- Resume: continue reading at the last offset within abstract/full text (no recap yet).

## 3) User Stories
- As a blind physician, I press and hold the mic, say “Search PubMed for GLP-1 cardiovascular outcomes since 2022,” and hear the top 10 results summarized.
- As a user, I say “Open number three,” and the app opens the best accessible version (OA if available), otherwise the DOI in Safari View (retaining SSO if present).
- As a user, I say “Read abstract,” and the app speaks the abstract with controllable speed and pause/resume by voice or accessible controls.
- As a user, I say “Who cites this?” and the app reads a concise list of citing papers from OpenAlex, with options to open or save.
- As a user, I say “What does this paper cite?” and the app reads a concise list of references (OpenAlex), with options to open or save.
- As a user, I can save a paper to my local queue and later say “Read my saved papers,” to hear titles and play abstracts.
- As a user, if a PDF has no selectable text, the app performs on-device OCR and reads the extracted text.
- As a user, when I open the app and have new items, I hear “You have three new articles” followed by concise titles; I can say “Read now,” “Shortlist,” “Later,” or “Ignore.”
- As a user, when I return after stopping mid-article, I hear “You are 50% through ‘Title’; say ‘resume’ to continue or ‘what’s new’ to hear new items.”

### Voice Grammar Examples (Phase 1)
- Global: "What's new," "In progress," "Saved for later," "Favorites," "Search for [query]," "Settings."
- Triage: "Read now," "Shortlist," "Save for later," "Ignore," "Open number [n]."
- Player: "Read abstract," "Pause," "Resume," "Faster," "Slower," "Next section," "Previous section."
- Citations: "Who cites this?," "What does this cite?," "Open citation [n]," "Shortlist citation [n]."

### Enhanced Voice Context & Disambiguation (Personal Use)
- Commands stay valid for 30 seconds after results are read
- "Open" without number triggers: "Which number? Say 1 through 10"
- During TTS playback: any voice input pauses immediately and processes the command
- Personal shortcuts learned over time (e.g., "heart stuff" = "cardiovascular", "new diabetes" = "diabetes since 2023")
- Smart defaults: "Search again" = repeat last query with current date filter
- "More like this" when focused on a paper = search similar MeSH terms automatically
- "Skip abstract" = jump directly to full text opening

## 4) Functional Requirements

4.1 Voice Input and Query Parsing
1) The system must provide a push-to-talk button to capture speech using `SFSpeechRecognizer`.
2) The system must transcribe queries into text and allow quick correction via voice or simple edit field (accessible).
3) The system must support medical terms, acronyms, and years (e.g., “since 2022”).
4) The system should map basic facets from natural language (e.g., year ranges) into PubMed query parameters where feasible in Phase 1.

4.2 Search and Ranking
5) The system must call PubMed E-utilities (e.g., ESearch + EFetch) to retrieve metadata and abstracts when available.
6) The system must rank results using a hybrid approach (recency + venue + citation signals when available via OpenAlex).
7) The system must present the top N results (default 10), with title, journal, year, authors (first/last), and an abstract snippet.

4.3 Results Presentation and Navigation
8) The system must support VoiceOver with rotor landmarks and large tappable targets for each result item.
9) The system must allow voice commands: “open #,” “read abstract,” “next,” “previous,” “pause,” “resume,” “faster/slower.”
10) The system must read a concise summary per item (title + 1–2 sentence abstract snippet) before offering actions.

4.3.1 Home Menu and Inbox/Triage
10a) The system must provide a voice-first home menu with options: What’s new, In progress, Saved for later, Favorites, Search, Settings.
10b) The system must present an inbox of new items (from saved topics/queries) when available, announcing the count and listing concise titles.
10c) The system must support triage actions by voice: Read now, Shortlist, Later, Ignore, and apply them to the focused item.
10d) The system must support resuming in-progress items from the home menu via “resume” or selecting from “In progress.”

4.4 Reading Pipeline (Abstracts and Full Text)
11) The system must use `AVSpeechSynthesizer` to read abstracts or extracted text, with adjustable rate (0.8–1.5×).
12) The system must display in-app viewer for HTML/PDF when opening accessible versions; if text is selectable via `PDFKit`/WebView, read it directly.
13) The system must fall back to Vision `VNRecognizeTextRequest` OCR when a PDF lacks selectable text, then read the extracted text.

4.5 Citations (Single-Paper Exploration)
14) The system must fetch and present references (outbound) for the selected paper using OpenAlex.
15) The system must fetch and present “who cites this” (inbound) for the selected paper using OpenAlex.
16) The system must allow opening cited/citing items by voice command and saving them to the local queue.
16a) The system must allow triage of cited/citing items using the same buckets as the inbox (Read now, Shortlist, Later, Ignore).

4.6 Open Access Resolution and Institutional Links
17) The system must try Unpaywall to resolve an OA link for a DOI when available.
18) If OA is not available, the system must open the DOI in `SFSafariViewController` to inherit any on-device SSO.

4.7 Saved Items (Local Only)
19) The system must allow saving papers to a local queue using Core Data (title, authors, venue, year, DOI/PMID, abstract snippet, and OA link if known).
20) The system must present the saved queue and allow voice-driven playback of abstracts from the queue.
20a) The system must track reading progress state per item (e.g., percentage, last section/offset) to support resume.

4.10 Subscriptions and Feed (Phase 1)
26) The system must allow users to add simple subscriptions: keywords/phrases, authors, journals (Phase 1) to seed “What’s new.”
27) The system should construct saved queries per subscription (e.g., PubMed search strings with date filters) and fetch on demand when “What’s new” is invoked.
28) The system may support background refresh for new items in a later minor iteration (optional for initial Phase 1).

4.8 Settings and Defaults
21) The system must default to the system TTS voice at 1.0× and allow in-session adjustments.
22) The system must allow user to set default result count (e.g., 10). 
23) The system should expose minimal settings for Phase 1 (voice rate, result count), with accessible labels and hints.

4.9 Performance and Reliability
24) The system should return initial search results within 3–5 seconds on a typical connection for common queries.
25) The system must handle network errors gracefully and offer retry by voice or accessible controls.

4.11 Error Handling & Recovery (Personal Use)
29) When PubMed/OpenAlex APIs fail, the system must speak "Search unavailable, try again" with haptic feedback.
30) The system must cache the last 5 successful searches locally and offer "repeat last search" as fallback during API failures.
31) For API rate limits, the system should wait and retry once automatically, then inform user with estimated wait time.
32) When STT confidence is low, the system must speak back the interpreted query: "Did you say [query]?" and await confirmation.
33) The system must automatically pause voice listening during background noise and resume when quiet.
34) When OCR fails on a PDF, the system must announce "Unable to read this document, opening in browser instead" and open the DOI link.
35) When abstracts are missing, the system must read title + journal + year and immediately offer "open full text."
36) When TTS is interrupted, the system must resume from the last complete sentence, not mid-word.

## 5) Non-Goals (Out of Scope for Phase 1)
- Always-on wake-word detection.
- iCloud sync of saved items (local-only in Phase 1).
- Offline download and reading of full papers.
- Advanced filters (study design, journal lists) beyond simple year facets.
- Multilingual speech in/out.
- Crossref integration (unless required to fill gaps; Phase 2+ consideration).
- Co-reader Q&A (“How many people were in the study?”), folders/tags beyond shortlist/favorites, and always-on wake word are Phase 2+.

## 6) Design Considerations
- SwiftUI-first with clear, minimal layout and large hit targets.
- VoiceOver rotor landmarks for: Search field/controls, Results list, Item actions, Player controls.
- Semantic grouping: each result item includes title, journal/year, authors, and primary actions.
- Haptics for key actions (press to talk start/end, save confirmation) while ensuring VoiceOver compatibility.
- High contrast, Dynamic Type support, and meaningful accessibility labels and hints for all interactive elements.

## 7) Technical Considerations
- Data sources: PubMed (ESearch/EFetch) for search/metadata; OpenAlex for references and citing works; Unpaywall for OA resolution (as part of link-opening flow).
- Networking: Initially call public APIs directly from the app for rapid prototyping; consider a minimal proxy later for caching/rate-limiting.
- OCR: Use Vision `VNRecognizeTextRequest` for scanned PDFs; detect selectable text via `PDFKit` first.
- Reader: `AVSpeechSynthesizer` for TTS with adjustable rate; pause/resume/seek via voice or accessible controls.
- Min iOS: 16+ to maximize device coverage while keeping modern APIs.
- Error states: Handle API rate limits, network loss, and missing abstracts with spoken feedback and accessible alerts.
- Privacy: Avoid storing raw audio; only the STT transcript needed for query. Analytics/TLM decisions deferred.
- Subscriptions/feed: Represent as a set of saved PubMed queries per subscription type; on "What's new," fetch since last opened date and merge/dedupe by DOI/PMID. Consider BGAppRefreshTask later.

### Technical Resilience (Personal App)
- Caching: Cache 50 most recent search results locally (Core Data); auto-purge cache older than 7 days.
- Memory Management: Limit to 3 concurrent TTS sessions (pause others when new one starts); OCR processing limited to 5MB PDF files; clear search results when more than 100 items to prevent UI lag.
- Battery Optimization: Reduce TTS quality to standard (not enhanced) after 30 minutes of continuous use; auto-pause TTS when call/notification interrupts, resume after.

### Data Model (Core Data, Phase 1)
- Entity `SavedItem`: id, source (PubMed/OpenAlex), pmid, doi, title, authors (string), venue, year, abstractSnippet, oaURL, status (enum: new, shortlist, later, in_progress, completed, dismissed), progress (0–1), lastOffset (char index or section+offset), savedAt, updatedAt.
  - Additional fields for personal use: progressType (enum: character_index, time_seconds, section_number), progressValue (Int), personalNotes (String?), readCount (Int).
- Entity `Subscription`: id, type (keyword | author | journal), value (string), createdAt, lastFetchedAt, enabled (bool).
  - Additional fields for personal use: personalShortcuts ([String]), lastUsed (Date).
- Entity `Linkage` (optional Phase 1): for lightweight local reference lists (itemId, citedId/citingId) or store ephemeral in-memory lists fetched on demand.

## 8) Success Metrics (POC)
- Primary: Successful voice searches per session (rate of search actions that return ≥1 result and reach the results-reading step).
- Secondary: Open-access resolution rate (percent of items where an OA link is found and opened).
- Secondary: Triage completion rate for new items (percent of new items assigned a bucket or opened).
- Secondary (accessibility quality, qualitative): VoiceOver test passes for critical flows (search, open, read, save).

## 9) Open Questions
1) Backend: Direct-from-app vs minimal proxy — decide based on rate limits, caching needs, and API key policies; propose A for Phase 1, revisit after testing.
2) Metrics/Analytics: What, if any, privacy-preserving telemetry do we collect in Phase 1? (12C)
3) OA Resolution Scope: We selected 11B (try Unpaywall → else DOI), while Phase 1 data sources for search/citations are PubMed + OpenAlex. Confirm inclusion of Unpaywall for link resolution in Phase 1.
4) Second POC metric: We have 15A selected; confirm a second metric (e.g., OA resolution rate or TTS completion of abstracts).
5) Default result count: Confirm 10 as default; specify min/max bounds.

## 10) Acceptance Criteria (Phase 1)
- Given iOS 16+ device, when I press and hold the mic and say a query, then I hear the top 10 results summarized with titles and abstract snippets.
- Given a result with a DOI, when I say “Open #,” then the app looks up Unpaywall and opens an OA link if available; otherwise opens the DOI in `SFSafariViewController`.
- Given a result, when I say “Read abstract,” then the app uses TTS to read it at the configured rate and responds to “pause,” “resume,” “faster,” and “slower.”
- Given a selected paper, when I say “Who cites this?” or “What does this cite?”, then the app retrieves and speaks a concise list from OpenAlex and allows “open” or “save.”
- Given a PDF that lacks selectable text, when I choose “read,” then the app runs on-device OCR and reads the extracted text.
- All interactive elements expose clear accessibility labels/hints, support rotor navigation, and pass a VoiceOver checkout of the core flows.
- Given I have active subscriptions, when I open the app and say “What’s new,” then I hear “You have N new articles” and a concise list; I can say “Read now,” “Shortlist,” “Later,” or “Ignore,” and the item state updates accordingly.
- Given I stopped mid-article, when I open the app and say “In progress,” then I hear items with progress percentages and can say “resume” to continue where I left off.
