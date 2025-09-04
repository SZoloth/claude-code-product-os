# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Audo is a voice-first iOS application (Swift/SwiftUI) designed for accessibility, enabling clinicians to search PubMed by voice, listen to papers with text-to-speech, and explore citations hands-free. The app prioritizes VoiceOver compatibility and accessibility-first design.

## Development Commands

### Building and Running
```bash
# Open in Xcode
open Audo/Audo.xcodeproj

# Build via command line
xcodebuild -project Audo/Audo.xcodeproj -scheme Audo build

# Run tests (unit and UI)
xcodebuild test -project Audo/Audo.xcodeproj -scheme Audo -destination 'platform=iOS Simulator,name=iPhone 15'

# Run in simulator: Use Xcode (⌘R)
```

## Architecture and Structure

### Core App Structure
- **AudoApp.swift**: Main SwiftUI app entry point
- **ContentView.swift**: Root view (currently placeholder)
- **Testing**: Hybrid testing setup using both Swift Testing framework (`@Test`) for unit tests and XCTest for UI tests

### Key Implementation Areas (Per PRD)

**Voice-First Architecture:**
- Speech-to-text via `SFSpeechRecognizer` for medical term recognition
- Text-to-speech via `AVSpeechSynthesizer` with rate control
- Push-to-talk interface with 30-second command validity windows

**Data Layer:**
- Core Data models for `SavedItem`, `Subscription`, and optional `Linkage`
- Direct API calls to PubMed E-utilities, OpenAlex, and Unpaywall
- Local caching of 50 most recent searches (7-day auto-purge)

**Accessibility-First Design:**
- VoiceOver rotor landmarks for all navigation elements
- Large hit targets and semantic grouping
- Voice command disambiguation ("Open" → "Which number? Say 1 through 10")

**Content Pipeline:**
- PDF text extraction via `PDFKit` with Vision OCR fallback
- `SFSafariViewController` for institutional SSO preservation
- Memory limits: 3 concurrent TTS sessions, 5MB OCR processing cap

### Personal Use Optimizations

The app is designed for single-user personal use with:
- Personal shortcuts learning (e.g., "heart stuff" → "cardiovascular")
- Context retention between voice commands
- Simplified error handling with spoken feedback
- Battery optimization (TTS quality reduction after 30 minutes)

## Code Style

- Swift 5+, SwiftUI, 2-space indentation
- Follow Swift API Design Guidelines
- Keep files focused with small views + view models
- Accessibility labels/hints required for all interactive elements
- Test naming: `test<Feature>_<Behavior>()` pattern

## Key Integration Points

**APIs to be integrated:**
- PubMed E-utilities (ESearch/EFetch) for search and metadata
- OpenAlex for citation graphs and ranking signals
- Unpaywall for open access resolution

**iOS Frameworks:**
- Speech framework for voice recognition
- AVFoundation for text-to-speech
- Vision framework for OCR fallback
- PDFKit for document text extraction

## Documentation References

- Product requirements: `tasks/prd-audo-reader.md` (comprehensive Phase 1 spec)
- Contributor guidelines: `AGENTS.md`
- Task planning: `tasks/README.md`

## Testing Strategy

- Unit tests using Swift Testing framework (`@Test` annotations)
- UI tests using XCTest for accessibility and voice interaction flows
- Focus areas: voice command parsing, API integration, accessibility compliance
- Run via Xcode Test navigator or command line as shown above

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