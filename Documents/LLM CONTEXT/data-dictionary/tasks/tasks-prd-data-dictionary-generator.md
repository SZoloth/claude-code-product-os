## Relevant Files

- `app/package.json` - Scripts and dependencies for React + TypeScript + Vite + Tailwind.
- `app/vite.config.ts` - Build/dev server configuration.
- `app/src/App.tsx` - App shell and router.
- `app/src/routes/Wizard.tsx` - Wizard container routing steps.
- `app/src/routes/steps/DescribeStep.tsx` - Paste/upload step UI.
- `app/src/routes/steps/JourneysStep.tsx` - Optional journey structuring UI.
- `app/src/routes/steps/PreviewStep.tsx` - Preview LLM-extracted events.
- `app/src/routes/steps/EditStep.tsx` - Inline table editor for events/properties.
- `app/src/routes/steps/ExportStep.tsx` - Export (CSV/Markdown/Datadog/JIRA text).
- `app/src/components/TableEditor.tsx` - Event/property table editor with responsive design.
- `app/src/components/FileDropzone.tsx` - Upload control for .md/.docx/.pdf.
- `app/src/routes/About.tsx` - About page with feature overview and privacy information.
- `app/src/lib/llm/openaiClient.ts` - OpenAI client with temperature and timeouts.
- `app/src/lib/llm/openaiClient.test.ts` - Unit tests for OpenAI client with retry logic.
- `app/src/lib/llm/prompts.ts` - System/user prompts aligned to Section 12.
- `app/src/lib/llm/prompts.test.ts` - Unit tests for prompt system functionality.
- `app/src/lib/config/index.ts` - Application configuration and environment management.
- `app/src/lib/parsing/markdown.ts` - Markdown extraction → text with metadata.
- `app/src/lib/parsing/docx.ts` - DOCX extraction → text using Mammoth.js.
- `app/src/lib/parsing/pdf.ts` - PDF extraction → text using PDF.js.
- `app/src/lib/parsing/index.ts` - Main parsing coordinator for all file types.
- `app/src/lib/parsing/preprocess.ts` - Normalize, chunk, summarize >60k chars.
- `app/src/lib/parsing/preprocess.test.ts` - Unit tests for text preprocessing functionality.
- `app/src/lib/schema/dataDictionary.ts` - Types/JSON Schema for Section 7 fields.
- `app/src/lib/schema/validators.ts` - Schema validation and naming rules.
- `app/src/lib/export/csv.ts` - CSV generator conforming to Section 7 columns.
- `app/src/lib/export/markdown.ts` - Markdown summary generator.
- `app/src/lib/export/datadog.ts` - Datadog JS stubs per event type.
- `app/src/lib/export/jira.ts` - JIRA-ready ticket text generator.
- `app/src/lib/storage/local.ts` - Local storage and import/export of project JSON.
- `app/src/lib/storage/snapshots.ts` - Snapshot versioning utilities.
- `app/src/lib/utils/naming.ts` - snake_case normalizers and uniqueness helpers.
- `app/src/lib/utils/types.ts` - Shared TypeScript types.
- `app/src/lib/utils/fileValidation.ts` - File upload validation and type detection utilities with enhanced security checks.
- `app/src/lib/utils/fileValidation.test.ts` - Unit tests for file validation functionality.
- `app/src/lib/utils/errorHandling.ts` - Comprehensive error handling system for parsing operations.
- `app/src/lib/utils/errorHandling.test.ts` - Unit tests for error handling utilities.
- `app/src/**/*.test.ts` - Unit tests colocated with implementation files.
- `app/.env.example` - API keys and configuration template.
- `app/.prettierrc` - Code formatting configuration.
- `app/jest.config.js` - Jest testing framework configuration.
- `app/src/test/setup.ts` - Jest test environment setup and mocks.
- `app/src/types/mammoth.d.ts` - TypeScript declarations for Mammoth.js library.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- MVP is local-first: persist to browser storage; provide export/import of project JSON.
- Privacy: no PII guarantees in MVP; add guidance copy in the UI.
- Acceptance criteria: CSV validates, exports succeed, stubs compile in sample app, time-to-first-output < 30s for typical docs.

## Tasks

- [x] 1.0 Project scaffold: local-first web app with wizard flow and light design system
  - [x] 1.1 Initialize project (Vite + React + TypeScript), add Tailwind + Headless UI, ESLint/Prettier.
  - [x] 1.2 Configure routing and wizard skeleton: Describe → Journeys → Preview → Edit → Export.
  - [x] 1.3 Add UI copy for guardrails and expectations for LLM quality.
  - [x] 1.4 Create `.env.example` and wire OpenAI key/config provider.
  - [x] 1.5 Add base layout, responsive design, and accessible table styles.

- [x] 2.0 Input ingestion: paste and file upload (.md/.docx/.pdf) with preprocessing and chunking
  - [x] 2.1 Build paste text area with character count and examples.
  - [x] 2.2 Implement file upload with type checks for .md/.docx/.pdf.
  - [x] 2.3 Parse files to plain text (markdown/docx/pdf extractors).
  - [x] 2.4 Preprocess text: normalize whitespace, de-duplicate headings, detect structure.
  - [x] 2.5 Chunk + summarize flow for > ~60k characters; preserve key sections.
  - [x] 2.6 Error handling for unsupported files, size limits, and parsing failures.

- [ ] 3.0 LLM transformation: prompt orchestration to generate event dictionary aligned to Section 12
  - [x] 3.1 Implement system and user prompts following Section 12 (temperature 0.2).
  - [x] 3.2 Call OpenAI with timeouts and retries; expose progress states.
  - [ ] 3.3 Post-process model output into normalized JSON structure.
  - [ ] 3.4 Apply pressure-test rule; include `notes` questions when uncertain.
  - [ ] 3.5 Map event_type and event_action_type to `datadog_api` defaults.

- [ ] 4.0 Schema and validation: implement Section 7 schema, naming conventions, and Datadog mapping fields
  - [ ] 4.1 Define TypeScript types and JSON Schema for all fields in Section 7.
  - [ ] 4.2 Enforce enums: event_type, event_action_type, lifecycle_status, property.type.
  - [ ] 4.3 Validate uniqueness and snake_case for `event_name` and property names.
  - [ ] 4.4 Validate failure events require `error_code`/`error_message` when present.
  - [ ] 4.5 Build validator utilities and surface validation errors in UI.

- [ ] 5.0 Editing and persistence: inline table editor, snapshot versions, local storage, import/export of project JSON
  - [ ] 5.1 Implement events table: add/edit/delete events; inline fields.
  - [ ] 5.2 Implement properties sub-table per event: name, type, required, example, description.
  - [ ] 5.3 Add context_keys selection UI and validation hints.
  - [ ] 5.4 Add snapshot on save; list and restore prior snapshots.
  - [ ] 5.5 Local storage autosave; import/export project JSON.

- [ ] 6.0 Export and integrations: CSV/Markdown outputs, Datadog JS stubs toggle, JIRA-ready ticket text
  - [ ] 6.1 CSV export matching Section 7 columns; serialize `properties` as JSON.
  - [ ] 6.2 Markdown summary with event table and brief rationale per event.
  - [ ] 6.3 Datadog stubs generator: `addAction` for intent/success; `addError` for failure with error fields.
  - [ ] 6.4 JIRA-ready ticket text with copy-to-clipboard; document manual attach flow.
  - [ ] 6.5 Validate export against schema; re-open and re-export flows.

