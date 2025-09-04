# Data Sources, Legality, and Ethics

> NOTE: Exploratory Thought Experiment — Non-binding — Do not use for production.

## Priority of Sources
1) PubMed
   - Saved search RSS for polling new items.
   - E-utilities (ESearch + EFetch) for metadata/abstracts; date filters from subscriptions.
2) Journals
   - Official RSS/Atom feeds when available.
3) OpenAlex
   - References (outbound) and who-cites-this (inbound) for expansion on demand.
4) Unpaywall
   - OA resolution for DOIs; store OA URL when present.

## Scraping Policy
- Avoid scraping by default. Only consider for permissive domains with explicit, documented permission and per-domain allowlists.
- No credential stuffing. Respect robots.txt, rate limits, and ToS.
- Prefer opening DOIs in Safari View to inherit institutional SSO rather than programmatic login.

## Legal & Privacy Guardrails
- Use official APIs/feeds with appropriate API keys and attribution where required.
- Keep raw PDFs local to device by default; do not upload to cloud services without explicit user consent.
- Provide a clear setting to enable any experimental scraping path; off by default.

## Accessibility
- Ensure all intake and playback actions are VoiceOver-friendly with labels, hints, and rotor landmarks.
- Announce success/failure states (e.g., OA found, OCR in progress) concisely.
