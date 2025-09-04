# Repository Guidelines

## Project Structure & Modules
- `Audo/`: iOS app (Swift/SwiftUI)
  - `Audo/`: app sources (`AudoApp.swift`, `ContentView.swift`, features to add)
  - `Audo.xcodeproj/`: Xcode project
  - `AudoTests/`: unit tests (XCTest)
  - `AudoUITests/`: UI tests (XCTest UI)
- `tasks/`: planning artifacts (PRDs, task index). Start with `prd-audo-reader.md`.
- `ai-dev-tasks-main/`: templates for PRDs and task generation (no runtime code).

## Build, Test, and Development
- Open in Xcode: `open Audo/Audo.xcodeproj`
- Build (CLI): `xcodebuild -project Audo/Audo.xcodeproj -scheme Audo build`
- Unit/UI tests (CLI):
  - `xcodebuild test -project Audo/Audo.xcodeproj -scheme Audo -destination 'platform=iOS Simulator,name=iPhone 15'`
- Run locally: use Xcode (⌘R) and select an iOS Simulator.

## Coding Style & Naming
- Swift 5+, SwiftUI, 2-space indentation.
- Follow Swift API Design Guidelines; types in PascalCase, methods/properties in camelCase.
- Keep files focused; prefer small views + view models.
- Accessibility: provide labels/hints and rotor landmarks for all interactive elements.
- Optional tools: If added later, run `swiftlint` before committing.

## Testing Guidelines
- Framework: XCTest (unit) and XCTest UI (UI).
- Naming: `test<Feature>_<Behavior>()` in `AudoTests`; UI flows in `AudoUITests`.
- Scope: add tests for parsing, ranking, and voice-command reducers when introduced.
- Run: via Xcode’s Test navigator or the `xcodebuild test` command above.

## Commit & Pull Requests
- Commits: concise, imperative subject (≤72 chars). Group related changes.
- PRs: clear description, link to `tasks/prd-audo-reader.md` section(s), steps to test, and screenshots for UI changes (simulator OK).
- Keep changes minimal and scoped; update `tasks/` docs when behavior or scope changes.

## Security & Config
- Do not commit secrets/API keys. Use per-developer env or Xcode cfg files.
- Network work will target PubMed/OpenAlex/Unpaywall; prefer `SFSafariViewController` for publisher deep links.
---
description: Ensure what you implement Always Works™ with comprehensive testing
---

# How to ensure Always Works™ implementation

Please ensure your implementation Always Works™ for: $ARGUMENTS.

Follow this systematic approach:

## Core Philosophy

- "Should work" ≠ "does work" - Pattern matching isn't enough
- I'm not paid to write code, I'm paid to solve problems
- Untested code is just a guess, not a solution

# The 30-Second Reality Check - Must answer YES to ALL:

- Did I run/build the code?
- Did I trigger the exact feature I changed?
- Did I see the expected result with my own observation (including GUI)?
- Did I check for error messages?
- Would I bet $100 this works?

# Phrases to Avoid:

- "This should work now"
- "I've fixed the issue" (especially 2nd+ time)
- "Try it now" (without trying it myself)
- "The logic is correct so..."

# Specific Test Requirements:

- UI Changes: Actually click the button/link/form
- API Changes: Make the actual API call
- Data Changes: Query the database
- Logic Changes: Run the specific scenario
- Config Changes: Restart and verify it loads

# The Embarrassment Test:

"If the user records trying this and it fails, will I feel embarrassed to see his face?"

# Time Reality:

- Time saved skipping tests: 30 seconds
- Time wasted when it doesn't work: 30 minutes
- User trust lost: Immeasurable

A user describing a bug for the third time isn't thinking "this AI is trying hard" - they're thinking "why am I wasting time with this incompetent tool?"
