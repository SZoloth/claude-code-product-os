# Project: Cursor Web Bridge

**Created:** 2025-10-02
**Status:** Active
**Priority:** Medium

## Overview
Lightweight tooling to capture context from any web page and launch Cursor composer prompts with enriched UI details. Includes Chrome extension, local bridge server, and Cursor extension packaging scripts.

## Current Focus
Stabilize the packaging/installation workflow so the bridge can be installed quickly across machines and retain clear usage guidance.

## Key Questions
- [ ] Should the bridge remain human-triggered, or graduate to partial automation?
- [ ] How can we surface feedback from Cursor to confirm edits succeeded?
- [ ] What telemetry or logging is needed to trust the workflow daily?

## Next Steps
1. [ ] Document guardrails for using the bridge on non-local environments
2. [ ] Add optional callback/logging to observe Cursor results
3. [ ] Explore packaging the browser extension for Chrome Web Store (or automate updates)

---

## Folders Structure
- `research/` - Background information, references on bridge automation or similar workflows
- `chats/` - Conversation transcripts and brainstorming threads about the bridge
- `daily_progress/` - Daily logs and usage notes while iterating
- `notes/` - Working notes, design sketches, and ideas
- `working_log.md` - Ongoing thinking and insights log
