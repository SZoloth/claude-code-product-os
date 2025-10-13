# Agents — Operating Guidelines

This repository is a personal knowledge and life‑management system, not a software project. All assistants should operate as general‑purpose documentation helpers focused on clarity, organization, and retrieval — never as coding agents.

## Purpose & Scope
- Non‑code repository: Do not analyze, propose, or generate code.
- Focus areas: Information organization, editing for clarity, cross‑linking, and content retrieval.
- Minimal change rule: Make the smallest clear edit that preserves voice; add dates to time‑sensitive updates.

## Structure & Navigation
- Core domains at repo root: `about_sam/`, `personal_development/`, `strategic_planning/`, `job_search/`, `marathon_training/`, `cooking/`, `crm/`, `vinalhaven/`, `journal/`, `project_ideas/`, `convos/`.
- Each major folder maintains its own README describing purpose and layout.
- Top‑level `README.md` explains daily/weekly/monthly/quarterly workflows.
- Use `z_archive/` to preserve historical content that should not be surfaced.

## Naming & Formatting
- Folders: `snake_case` (e.g., `personal_development`).
- Files: `kebab-case.md` (e.g., `daily-plan-2025-09-08.md`).
- Dates: `YYYY-MM-DD` everywhere. Job applications: zero‑padded folders (e.g., `01-canva`, `02-figma`).
- Markdown: concise headings, short sections, consistent tables for trackers. Prefer internal links between related docs.

## Working Practices
- Maintain existing structure; add new material in the most specific domain folder with a brief purpose header.
- When editing: preserve voice, fix clarity, keep changes minimal and reversible, and date time‑sensitive updates.
- Cross‑reference related content (e.g., link training plans to recipes; networking notes to job applications).

## Review Cadence
- Daily: consult Strategic Planning/Daily Planning for priorities; log outcomes in Journal.
- Weekly: review progress per domain and update plans and trackers.
- Monthly/Quarterly: update strategic documents, rebalance domains, and refine systems.

## Safety & Integrity
- Never fabricate factual details (especially in job search). Ask for missing inputs.
- Do not commit secrets or private data; use a local `.env` for any automation.
- Keep the repo text‑first; prefer links for large assets.

## Commits & PRs
- Commits: imperative mood with scoped prefix. Examples: `journal: add 2025-09-08 entry`, `strategic_planning: refine Q4 priorities`.
- PRs: state purpose, impacted folders, before/after notes or screenshots if helpful, and link related documents or decisions.

## Agent‑Specific Notes
- Claude Code and similar tools: see `CLAUDE.md` for non‑code stance and repository expectations.
- Local principle (`CLAUDE.local.md`): ALWAYS think carefully and only action the specific task with the most concise, elegant solution that changes as little text as possible.
- Optional automations: Utilities may exist under `job_search/` (e.g., `job_search_orchestrator.py`); use only when directly relevant, otherwise prioritize content quality and organization.

## Quick Start Checklist (for any change)
- Identify the correct domain folder and read its README.
- Skim top‑level `README.md` if the change affects routines/cadence.
- Draft the smallest necessary edit; add a date if time‑sensitive.
- Link to related documents across domains where helpful.
- Name files with `kebab-case.md` and include `YYYY-MM-DD` when applicable.
- If any factual detail is missing (notably job search), pause and ask.

## References
- `README.md`
- `CLAUDE.md`
- `CLAUDE.local.md`

