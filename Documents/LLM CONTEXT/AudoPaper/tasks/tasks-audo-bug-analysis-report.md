# Audo Bug Fix Implementation Tasks

**Generated from:** `audo-bug-analysis-report.md`  
**Priority Focus:** Critical and High Priority Issues  
**Target:** Transform Audo from prototype to production-ready app  

## Relevant Files

- `Audo/Audo/AudoApp.swift` - Main app entry point requiring VoiceManager initialization fix
- `Audo/Audo/ContentView.swift` - Root view with VoiceManager double initialization bug
- `Audo/Audo/Voice/VoiceManager.swift` - Core voice functionality with multiple critical issues
- `Audo/Audo/Voice/SpeechService.swift` - Speech synthesis service with memory leak issues
- `Audo/Audo/Voice/VoiceActivityDetector.swift` - Voice activity detection with circular reference
- `Audo/Audo/Voice/CommandProcessor.swift` - Command processing with force unwrapping risk
- `Audo/Audo/Voice/NLCommandProcessor.swift` - Natural language processing component
- `Audo/Audo/Models/CoreDataStack.swift` - Core Data management with threading violations
- `Audo/Audo/Models/SavedItem.swift` - Data model with status string consistency issues
- `Audo/Audo/API/APIService.swift` - Base API service missing request cancellation
- `Audo/Audo/API/PubMedService.swift` - PubMed integration with XML parser threading issues
- `Audo/Audo/Services/ResearchWorkflowService.swift` - Workflow service with initializer inconsistencies
- `Audo/Audo/Utils/ErrorHandler.swift` - Error handling with Objective-C association bug
- `Audo/AudoTests/VoiceServiceTests.swift` - Voice service test coverage expansion
- `Audo/AudoTests/CoreDataModelTests.swift` - Core Data testing with threading scenarios
- `Audo/AudoUITests/AccessibilityTests.swift` - Accessibility test validation improvements
 - `Audo/Audo/Views/SearchResultsView.swift` - Stabilize ForEach row builder and background helper
 - `Audo/Audo/Views/TTSControlsView.swift` - Fix 8 compile-time issues (key paths, interpolation, ForEach)
 - `Audo/Audo/UI/Components/VoiceStatusView.swift` - Add mic availability warning banner

### Notes

- Tests should be run with `xcodebuild test -project Audo/Audo.xcodeproj -scheme Audo` after each phase
- Critical issues must be addressed in Phase 1 before proceeding to other phases
- Each parent task should be fully completed and committed before starting the next
 - iOS build/test must be performed in Xcode or a configured simulator environment

## Tasks

- [x] 1.0 Fix Critical VoiceManager Issues
  - [x] 1.1 Fix VoiceManager double initialization in ContentView
  - [x] 1.2 Remove force unwrapping of commandProcessor in VoiceManager initialization
  - [x] 1.3 Fix weak reference cycle in speech authorization callback
  - [x] 1.4 Add proper nil checks and guard statements for async speech operations
  - [x] 1.5 Implement proper VoiceActivityDetector delegate pattern to prevent circular references
  - [x] 1.6 Add thread-safe voice settings access with synchronization
- [x] 2.0 Resolve Core Data Threading Violations
  - [x] 2.1 Implement proper context-per-thread pattern in CoreDataStack
  - [x] 2.2 Fix unsafe type casting in batch delete operations
  - [x] 2.3 Add comprehensive Core Data validation with error recovery
  - [x] 2.4 Fix database migration validation to prevent data loss
  - [x] 2.5 Add proper error handling for Core Data operations across all contexts
- [ ] 3.0 Address Audio Engine Race Conditions
  - [x] 3.1 Add serial queue synchronization to audio engine start/stop operations
  - [x] 3.2 Fix audio session configuration race condition with state checking
  - [x] 3.3 Add proper input channel validation with graceful fallback for devices without microphone
  - [x] 3.4 Implement buffer overflow protection for speech recognition
  - [x] 3.5 Fix audio session conflicts between speech recognition and TTS
- [ ] 4.0 Fix API Integration and Error Handling Issues
  - [x] 4.1 Fix XMLParser delegate threading issues in PubMedService
  - [x] 4.2 Implement request cancellation mechanism in APIService
  - [x] 4.3 Add comprehensive error categorization for network failures
  - [x] 4.4 Fix ResearchWorkflowService duplicate initializers and consolidate with dependency injection
  - [x] 4.5 Replace Objective-C association in ErrorHandler with Swift property wrapper
  - [x] 4.6 Remove unsafe MainActor assumption in uncaught exception handler
- [ ] 5.0 Implement Comprehensive Testing and Validation
  - [x] 5.1 Add VoiceManager unit tests covering critical paths and threading scenarios
  - [x] 5.2 Expand accessibility test coverage with proper UI element validation
  - [x] 5.3 Add Core Data threading and migration tests
  - [x] 5.4 Implement API service mock tests for error handling scenarios
  - [x] 5.5 Add performance tests for memory leak detection and audio processing
  - [x] 5.6 Create integration tests for end-to-end voice workflows

- [x] 6.0 Stabilize SwiftUI Result Builders and Type Checking
  - [x] 6.1 SearchResultsView: ForEach stabilization with explicit `Range<Int>` and helper background
  - [x] 6.2 TTSControlsView: Fix tuple `ForEach`, de-escape key paths and strings, adjust `onChange`, and Substring→String coercions
  - [x] 6.3 Repo-wide scan and cleanup for escaped key paths/interpolation and risky ternaries
  - [x] 6.4 If residual timeouts persist, extract heavy rows into dedicated views

- [x] 7.0 Robust Audio Input Formatting and Conversion
  - [x] 7.1 Guard zero input channels and skip taps when unavailable (Simulator mic off)
  - [x] 7.2 Install taps using node-provided formats; avoid forcing 16 kHz on graph
  - [x] 7.3 Add optional off-graph AVAudioConverter to 16 kHz mono for VAD/network use
  - [x] 7.4 Wire converted buffers into any network upload path if required
