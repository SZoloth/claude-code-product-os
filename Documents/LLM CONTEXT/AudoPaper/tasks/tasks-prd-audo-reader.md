# Task List: Audo Reader Implementation

Based on PRD: `prd-audo-reader.md`

## Relevant Files

- `Audo/AudoDataModel.xcdatamodeld/` - Core Data model with SavedItem, Subscription, and Linkage entities
- `Audo/Models/SavedItem.swift` - Core Data entity for saved papers with progress tracking
- `Audo/Models/Subscription.swift` - Core Data entity for user subscriptions (keywords, authors, journals)
- `Audo/Models/CoreDataStack.swift` - Core Data stack setup and management
- `Audo/Models/PreviewData.swift` - Sample data for SwiftUI previews and testing
- `Audo/Models/DataMigration.swift` - Core Data migration strategy and backup management
- `Audo/Services/VoiceService.swift` - Speech recognition and text-to-speech management
- `Audo/Services/PubMedService.swift` - PubMed E-utilities API integration
- `Audo/Services/OpenAlexService.swift` - OpenAlex API integration for citations
- `Audo/Services/UnpaywallService.swift` - Unpaywall API for open access resolution
- `Audo/Services/SearchService.swift` - Orchestrates search across multiple APIs with ranking
- `Audo/Views/HomeView.swift` - Voice-first home menu with inbox/triage functionality
- `Audo/Views/SearchResultsView.swift` - Voice-navigable search results with VoiceOver support
- `Audo/Views/ArticleReaderView.swift` - TTS reader with PDF/OCR support
- `Audo/Views/CitationExplorerView.swift` - References and citing papers navigation
- `Audo/Views/SettingsView.swift` - TTS rate, result count, and accessibility settings
- `Audo/ViewModels/HomeViewModel.swift` - Home screen state and voice command handling
- `Audo/ViewModels/SearchViewModel.swift` - Search results state and voice navigation
- `Audo/ViewModels/ReaderViewModel.swift` - Reading progress and TTS control
- `Audo/Utils/VoiceCommandParser.swift` - Natural language to structured command parsing
- `Audo/Utils/AccessibilityHelpers.swift` - VoiceOver rotor landmarks and semantic grouping
- `Audo/Utils/ErrorHandler.swift` - User-friendly spoken error messages
- `AudoTests/VoiceServiceTests.swift` - Unit tests for speech recognition and TTS
- `AudoTests/SearchServiceTests.swift` - Unit tests for search orchestration and ranking
- `AudoTests/Models/SavedItemTests.swift` - Unit tests for Core Data models
- `AudoUITests/VoiceFlowTests.swift` - End-to-end voice interaction tests
- `AudoUITests/AccessibilityTests.swift` - VoiceOver and accessibility compliance tests

### Notes

- Use Swift Testing framework (`@Test`) for new unit tests alongside existing XCTest UI tests
- Run tests with: `xcodebuild test -project Audo/Audo.xcodeproj -scheme Audo -destination 'platform=iOS Simulator,name=iPhone 15'`
- Focus on accessibility testing with VoiceOver enabled for all user flows

## Tasks

- [ ] 1.0 Core Data Setup and Models
  - [x] 1.1 Create Core Data model file (.xcdatamodeld) with SavedItem, Subscription, and Linkage entities
  - [x] 1.2 Implement SavedItem entity with progress tracking (progressType, progressValue, personalNotes, readCount)
  - [x] 1.3 Implement Subscription entity with personal shortcuts and usage tracking
  - [x] 1.4 Create CoreDataStack.swift with persistent container setup and error handling
  - [x] 1.5 Add Core Data preview data for SwiftUI previews and testing
  - [x] 1.6 Implement data migration strategy for future schema changes

- [x] 2.0 Voice Services Infrastructure
  - [x] 2.1 Create VoiceService.swift with SFSpeechRecognizer setup and permissions handling
  - [x] 2.2 Implement push-to-talk functionality with haptic feedback and visual indicators
  - [x] 2.3 Add STT confidence checking and query confirmation ("Did you say [query]?")
  - [x] 2.4 Implement AVSpeechSynthesizer with rate control (0.8-1.5×) and interruption handling
  - [x] 2.5 Create VoiceCommandParser.swift for natural language to structured commands
  - [x] 2.6 Add personal shortcuts learning and context retention (30-second command validity)
  - [x] 2.7 Implement background noise detection and auto-pause/resume functionality
  - [x] 2.8 Add TTS session management (limit to 3 concurrent sessions)

- [x] 3.0 API Services Integration
  - [x] 3.1 Create PubMedService.swift with ESearch and EFetch API calls
  - [x] 3.2 Implement OpenAlexService.swift for citation data (references and cited-by)
  - [x] 3.3 Create UnpaywallService.swift for open access link resolution
  - [x] 3.4 Implement SearchService.swift to orchestrate and rank results from multiple APIs
  - [x] 3.5 Add API rate limiting, retry logic, and error handling with spoken feedback
  - [x] 3.6 Implement local caching for 50 most recent searches with 7-day auto-purge
  - [x] 3.7 Add network connectivity checking and offline fallback messaging
  - [x] 3.8 Create API response models for PubMed, OpenAlex, and Unpaywall data

- [x] 4.0 Voice-First UI Components
  - [x] 4.1 Refactor ContentView.swift into HomeView.swift with voice-first menu structure
  - [x] 4.2 Create HomeViewModel.swift with inbox/triage logic and voice command handling
  - [x] 4.3 Implement SearchResultsView.swift with VoiceOver rotor landmarks and large hit targets
  - [x] 4.4 Create SearchViewModel.swift with voice navigation and result management
  - [x] 4.5 Implement ArticleReaderView.swift with PDFKit integration and OCR fallback
  - [x] 4.6 Create ReaderViewModel.swift with TTS controls and progress tracking
  - [x] 4.7 Implement CitationExplorerView.swift for references and citing papers navigation
  - [x] 4.8 Create SettingsView.swift with accessibility-focused controls
  - [x] 4.9 Add SFSafariViewController integration for institutional SSO preservation
  - [x] 4.10 Implement additional TTS controls and Safari integration (expanded scope)

- [ ] 5.0 Accessibility and Testing Implementation
  - [ ] 5.1 Create AccessibilityHelpers.swift with rotor landmarks and semantic grouping utilities
  - [ ] 5.2 Add comprehensive accessibility labels and hints to all interactive elements
  - [ ] 5.3 Implement Dynamic Type support and high contrast mode compatibility
  - [ ] 5.4 Create ErrorHandler.swift with spoken error messages and haptic feedback
  - [ ] 5.5 Write unit tests for VoiceService using Swift Testing framework
  - [ ] 5.6 Create SearchService tests with API mocking and ranking validation
  - [ ] 5.7 Add Core Data model tests for SavedItem and Subscription entities
  - [ ] 5.8 Implement VoiceFlowTests.swift for end-to-end voice interaction testing
  - [ ] 5.9 Create AccessibilityTests.swift with VoiceOver navigation validation
  - [ ] 5.10 Add performance tests for OCR processing (5MB file limit) and TTS memory usage