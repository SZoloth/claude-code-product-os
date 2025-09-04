# Research: Automation Mode for Audo Reader

> NOTE: Exploratory Thought Experiment — Non-binding — Do not use for production.

This folder documents an "Automation Mode" that complements the PRD for Audo Reader. It describes a subscription-driven, low-friction pipeline that ingests new papers via official feeds/APIs, prepares text for listening, and offers simple play/triage controls.

## Index
- automation-mode.md — executive summary and UX overview
- architecture.md — components, data flow, and storage
- data-sources-and-legality.md — sources priority, ToS, and scraping policy
- rollout-and-metrics.md — MVP scope, risks, mitigations, and success metrics
- pipeline-adaptation-voice-first-ios.md — adapt the video pipeline to iOS
- pipeline-prompts.md — sample prompts for cleaning, summaries, entities, citations

## Why
- Reduce friction for blind clinicians: new items arrive ready to play.
- Start on-device with on-demand fetch; add a companion worker later for scheduling.
- Stay within legal/ethical bounds by prioritizing official feeds and APIs.

## How it fits the PRD
- Reuses PubMed, OpenAlex, Unpaywall; aligns with “What’s new,” triage buckets, and TTS playback.
- Adds subscription-driven intake and optional background refresh later.
