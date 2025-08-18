## Data Dictionary Generator (MVP) — PRD

### 1. Introduction / Overview
Non-technical product stakeholders paste or upload a product description (including user journeys). The system uses an LLM to translate that description into a high-quality analytics event data dictionary using the Crystal Widjaja taxonomy and conventions (final schema to be confirmed after you upload the article/examples). Output is shareable with engineering via CSV and Markdown, and optimized for Datadog RUM/Product Analytics code generation.

Primary MVP goal (1A): Enable non-technical PMs to generate a high-quality data dictionary from a product description. Future (1B): add a light review workflow for engineers (comments/edits).

### 2. Goals
- Produce an auditable, editable analytics event specification from natural-language descriptions.
- Conform to a pragmatic baseline of the Crystal Widjaja taxonomy (refined once the source doc/examples are uploaded).
- Export to CSV and Markdown for sharing and review.
- Generate Datadog RUM/Product Analytics snippets for each event when requested.
- Provide basic persistence to re-open/edit projects later (local-first MVP; login later).

### 3. User Stories
- As a non-technical PM, I can paste/upload a product description and get a proposed event dictionary I can review and edit.
- As an engineer, I can read a concise Markdown summary and CSV with clear event names, purposes, triggers, properties, and Datadog code snippets.
- As a PM/engineer, I can export the dictionary and attach it to JIRA tickets manually.
- As a PM, I can save my session and return later to continue editing.

### 4. Functional Requirements (MVP)
1. Input
   - Accept pasted text and file upload for .md/.docx/.pdf (2D).
   - Optional link ingestion may be deferred (confirm in post-MVP).
2. Transformation
   - Use LLM (OpenAI preferred, 8A) to parse description into events and properties following the baseline taxonomy (4C pending uploaded context).
   - Apply schema validation before output (15B).
3. Output
   - Provide CSV and Markdown summary downloads (3B).
   - CSV includes proposed columns in Section 7.
4. Datadog Target
   - Generate Datadog RUM/Product Analytics event specs and JavaScript stubs for common patterns (6A / JS) when toggled on.
5. Editing & Audit
   - Inline table editor to adjust events/properties; snapshot versions on save (11A). If complexity grows, we may fallback to basic edits (11C).
6. Sharing to JIRA
   - MVP: manual share; generate JIRA-ready CSV and copyable ticket text; no API integration (7D).
7. Persistence
   - MVP: local-first storage with export/import of project JSON; plan to add hosted storage later (9D).
8. Authentication
   - No auth in MVP; plan OAuth (Google SSO) post-MVP (10C later).
9. Privacy/PII
   - No PII policy beyond user discretion in MVP (13C). Document guidance in UI copy.
10. Non-Goals (12D)
   - No chat interface, no usage status (added/used/deprecated), no roles/permissions in MVP.

### 5. Non-Goals (Out of Scope for MVP)
- Automated JIRA ticket creation via API.
- Multi-tenant auth/roles; enterprise SSO.
- Event lifecycle/status tracking (added/used/deprecated) and notes workflow.
- Chat-style interface.
- Cross-language SDK code generation beyond JavaScript.

### 6. Design Considerations
- UI pattern: Wizard flow (16B): Describe Product → Journeys → Preview → Edit → Export.
- Use a light design system (e.g., Tailwind + Headless UI) with accessible tables and editors.
- Provide guardrails and examples in the input step to set expectations for the LLM output quality.

### 7. Reference-aligned Schema (CSV Columns)
Derived from Crystal Widjaja’s intent/success/failure framing and the provided CSV examples. Final labels can be tweaked, but the structure should hold:

- event_name
- event_type (intent | success | failure)
- event_action_type (action | error | feature_flag)  
  Rationale: map to Datadog APIs; failures typically use error.
- event_purpose
- user_story
- when_to_fire (aka when_triggered)
- actor (who initiates/experiences)
- object (what is acted upon)
- context_surface (UI surface/module)
- properties (nested list of: name, type, required, example, description)
- context_keys (short list of key properties to always include; aligns with example CSVs)
- ownership_team
- priority
- lifecycle_status (proposed | approved | implemented | deprecated)
- notes (including open questions / uncertainties)
- datadog_api (addAction | addError | addFeatureFlagEvaluation)
- datadog_sample_code (language: JS)

Validation rules and conventions:
- event_name: snake_case; must be unique; avoid encoding segmentation in name (e.g., not "facebook_signup_selected").
- properties.name: snake_case; unique within event.
- properties.type: one of string, number, boolean, enum, object, array, datetime.
- required: boolean.
- lifecycle_status: one of proposed, approved, implemented, deprecated.
- Pressure test rule: for each event, if 99% of users did it, what action would we take? If unclear, exclude or demote to notes.
- Do not model segmentations as separate events; prefer properties (e.g., `source: facebook|google|email`).

Property categories (to guide generation):
- User profile: city, role, company_size, product_tier
- Marketing: source, campaign, entry_page
- Action attributes: first_purchase_date, total_orders, service_type
- Contextual: drivers_on_screen, search_results_count, merchant_types
- Property behavior: set_and_forget vs. append_or_increment

Event mapping to Datadog:
- intent/success events → `datadog_api = addAction`
- failure events → `datadog_api = addError` with `error_code` and `error_message` properties when available
- feature flag evaluation → `datadog_api = addFeatureFlagEvaluation` (future-safe)

### 8. Technical Considerations
- LLM Provider: OpenAI (8A). Temperature default 0.2; token limits adjusted based on doc length.
- Document size: target up to ~60k characters in MVP (14—set by us). For larger docs, chunk + summarize prior to extraction.
- Local-first MVP: persistence via browser storage and project JSON export/import; plan Postgres later (9D/17B).
- Platform: local-first app with option to host later (17B). Run via `npm start`.
- Future OAuth: Google SSO planned (10C post-MVP).

### 9. Success Metrics
- Qualitative: Engineers report the CSV/Markdown are immediately implementable with minimal back-and-forth.
- Functional: CSV validates against schema; downloads succeed; re-open/edit works; Datadog stubs compile in sample app.
- Time-to-first-output: < 30 seconds for typical docs (~10–20k chars).

### 10. Acceptance Criteria (MVP)
- 15B: CSV validates against schema; downloadable; re-openable; re-exportable.
- 15A (adapted): Given a pasted product description with user journeys, tool outputs well-formed events with properties and optional Datadog JS stubs. Quality over arbitrary counts; no minimum numbers enforced.
- Generated Markdown summary includes event table and brief rationale per event.

### 11. Open Questions
- Crystal Widjaja taxonomy: once uploaded, align field names and rules precisely; may adjust event naming conventions and lifecycle definitions.
- Do we include a minimal “journey structuring” prompt for users (e.g., Actor → Action → Object → Context)?
- For Datadog, should we emit `DD_RUM.addAction` vs. `addFeatureFlagEvaluation` guidance per event type automatically?
- JIRA: provide a specific ticket template now, even without API integration?

### 12. Initial Prompts (LLM)
System prompt outline:
- Ingest description and extract journeys; classify events into intent, success, and failure.
- Produce events with clear purpose, when_to_fire trigger, actor, object, and context.
- Derive properties with types, required flag, examples; use categories (user profile, marketing, action, contextual).
- Conform to the schema in Section 7; do not invent placeholder values; avoid modeling segmentations as event names.
- For failure events, include `error_code` and `error_message` when present.
- If uncertain, include an inline `notes` question for reviewer; apply pressure-test rule to prune weak events.

### 13. Datadog RUM Code Templates (JS)
Examples per event type (final details subject to Datadog product analytics best practices):

```javascript
// Example: action event
DD_RUM.addAction('event_name', {
  actor: 'user',
  object: 'resource_or_ui',
  context_surface: 'surface/module',
  properties: {
    // name: example,
  }
})
```

```javascript
// Example: failure event
const error = new Error('event_name failed');
DD_RUM.addError(error, {
  actor: 'user',
  object: 'resource_or_ui',
  context_surface: 'surface/module',
  error_code: 'SOME_CODE',
  error_message: 'Readable diagnostic',
  properties: {
    // additional context
  }
})
```

### 14. Milestones
1) MVP slice: Wizard UI, OpenAI prompt → CSV/Markdown export, local persistence, Datadog stub generation.
2) Refinement: Align schema with uploaded context; validation rules; better examples.
3) Post-MVP: Google SSO; hosted DB; engineer review workflow; optional JIRA API integration.


