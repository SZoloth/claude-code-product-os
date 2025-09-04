# Audo (iOS) — Voice-First Literature Reader

A Swift/SwiftUI iPhone app that lets clinicians search PubMed by voice, listen to papers with TTS, and explore citations. Accessibility (VoiceOver) and hands-free flow are first-class goals.

## Quick Links
- Contributor guide: [AGENTS.md](AGENTS.md)
- Product requirements: [tasks/prd-audo-reader.md](tasks/prd-audo-reader.md)
- Tasks index: [tasks/README.md](tasks/README.md)

## Getting Started
- Open the project: `open Audo/Audo.xcodeproj`
- Build and run in Simulator from Xcode (⌘R).
- CLI build: `xcodebuild -project Audo/Audo.xcodeproj -scheme Audo build`
- Tests: `xcodebuild test -project Audo/Audo.xcodeproj -scheme Audo -destination 'platform=iOS Simulator,name=iPhone 15'`

## Repository Layout
- `Audo/` — app sources, Xcode project, unit/UI tests
- `tasks/` — PRDs and planning docs
- `ai-dev-tasks-main/` — templates for PRDs and task generation
