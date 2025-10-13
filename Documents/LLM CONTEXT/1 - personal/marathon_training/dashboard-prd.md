# Marathon Training Dashboard PRD

_Last updated: 2025-10-03_

## Overview
Create a single-source dashboard that surfaces marathon training plans, daily logs, and performance insights in one place. The dashboard must reduce time spent context switching between plan documents, Strava, and manual trackers while preserving the authoritative role of `master_mcm_training_plan.md`.

## Objectives
- Provide at-a-glance clarity on the current training week, scheduled workouts, and completion status
- Accelerate log updates by pre-populating planned workouts alongside editable actuals fields
- Surface trend insights (mileage, intensity, recovery flags) so adjustments can be made proactively
- Maintain an auditable trail that aligns with existing documents (`master_mcm_training_plan.md`, `mcm_training_log.md`, `weekly-mileage-tracker-2025-09-08-to-2025-10-26.md`)

## Target Users & Needs
| User | Needs | Pain Points Today |
| --- | --- | --- |
| Athlete (Sam) | Know today’s workout, recent performance trends, and whether adjustments are needed. | Multiple documents to reference; manual data aggregation; risk of missing plan updates. |
| Coach/Accountability partner (future) | Quickly see adherence and flag risks. | No unified view; requires parsing raw logs. |
| Retrospective reviewer | Compare planned vs. actual training across cycles. | Data scattered across plan, log, and trackers. |

## Scope
### In Scope
- Current training cycle (Marine Corps Marathon 2025) with ability to roll forward future cycles
- Data ingestion from existing markdown sources and Strava export/CSV (manual import acceptable in v1)
- Visualization layer (Notion database, Airtable base, or lightweight web dashboard) that can be maintained without custom code

### Out of Scope (v1)
- Automated Strava API sync (manual CSV upload acceptable initially)
- Mobile app or heavy web engineering work
- AI-generated workout recommendations (dashboard is descriptive, not prescriptive)

## Key User Journeys
1. **Daily Check-In**: Sam opens dashboard each morning to confirm workout, review mileage to-date, and capture notes post-run.
2. **Weekly Review**: During Sunday planning, Sam sees planned vs. actual mileage, workout completion %, and any injury risk indicators.
3. **Plan Adjustments**: If a missed workout occurs, Sam uses dashboard to note deferral, update plan references, and ensure schedule realigns with `master_mcm_training_plan.md`.

## Functional Requirements
### Data Sources
- Pull scheduled workouts by date from `master_mcm_training_plan.md` (authoritative plan)
- Link each log entry from `mcm_training_log.md` via date keys; include qualitative notes and effort ratings
- Reference weekly totals from `weekly-mileage-tracker-2025-09-08-to-2025-10-26.md` for historical comparisons
- Optional manual Strava CSV uploads providing actual mileage, pace, heart rate; map to dashboard entries

### Core Features
1. **Today's Snapshot**
   - Display today's date, week number in cycle, and scheduled workout details
   - Show completion status toggle (planned, completed, modified, missed) with timestamp
2. **Week Overview**
   - List each day with planned workout, actual outcome, notes, and mileage
   - Aggregate weekly planned vs. actual mileage, long run completion, and key workouts status
3. **Trend Analytics**
   - Rolling 4-week mileage chart with planned vs. actual comparison
   - Recovery signal section: flag 3+ consecutive fatigue notes, sharp mileage spikes (>10% week-over-week), or resting heart rate changes (if data available)
4. **Log Entry Interface**
   - Editable fields for actual distance, duration, perceived effort, conditions, and injury/pain notes
   - Quick links to original log entries in `mcm_training_log.md` for long-form reflections
5. **Plan Integrity Tools**
   - Highlight discrepancies where plan references are missing in log entries
   - Provide reminder to update `master_mcm_training_plan.md` if structural changes are made in dashboard

## Data Flow
The dashboard maintains data integrity through a clear flow between source documents and the visualization layer:

1. **Master Plan → Dashboard** (read-only display)
   - `master_mcm_training_plan.md` serves as authoritative source for scheduled workouts
   - Dashboard pulls workout details by date for display only
   - Any plan changes must be made in source markdown, then refreshed in dashboard

2. **Strava → Dashboard** (manual import)
   - Export activity data as CSV from Strava
   - Import to dashboard using transformation script
   - Map activity metrics (distance, pace, heart rate) to corresponding date entries

3. **Dashboard → Training Log** (manual sync)
   - Completion status, notes, and actual metrics entered in dashboard
   - Weekly sync transfers dashboard entries to `mcm_training_log.md`
   - Ensures log remains comprehensive record even if dashboard is deprecated

4. **Weekly Reconciliation**
   - Compare dashboard data against all source documents
   - Flag discrepancies for resolution
   - Export dashboard to CSV/markdown as backup

This flow ensures `master_mcm_training_plan.md` and `mcm_training_log.md` remain the authoritative sources while the dashboard provides a better UX layer.

## Data & Schema Requirements
- **Primary Key**: Date (YYYY-MM-DD) with derived fields (week number, training phase)
- **Metrics**: Planned distance, actual distance, variance, workout type, pace, duration, heart rate, RPE, completion status
- **Qualitative Fields**: Notes, recovery status, injury flags, fueling feedback
- **Rollups**: Weekly mileage totals, % completion, count of key workouts done vs. planned

## UX & Presentation Guidelines
- Use color coding for status (green=completed, yellow=modified, red=missed)
- Ensure layout works in Notion database view or Airtable grid with supplemental dashboards (e.g., Notion linked views or Airtable Interfaces)
- Provide filters by week, workout type, and status
- Include quick reference links to source documents within each record

## Integrations & Tooling
- Start with Notion or Airtable due to low setup overhead and good visualization
- Automate data synchronization via lightweight scripts or manual weekly updates exported from markdown
- Store data transformations (e.g., CSV to dashboard import) in `/scripts/` for reproducibility

### Platform Evaluation Criteria
| Criteria | Notion | Airtable | Weight |
| --- | --- | --- | --- |
| **Cost** | Free tier sufficient | Free tier limitations | High |
| **Existing ecosystem** | Already in use for other projects | New tool to learn | Medium |
| **Visualization** | Linked databases, basic charts | Interfaces, advanced charts | High |
| **Export/backup** | Markdown/CSV export | CSV/JSON export | High |
| **Data entry speed** | Quick toggle editing | Grid-based editing | Medium |
| **Mobile access** | Good mobile app | Good mobile app | Low |
| **Script integration** | API available | Robust API | Medium |
| **Learning curve** | Familiar | Moderate | Medium |

**Decision framework:** Choose platform that scores highest on weighted criteria with bonus for existing ecosystem integration.

## Non-Functional Requirements
- **Reliability**: Dashboard must be accurate with minimal manual copying; implement checklist for weekly data refresh
- **Maintainability**: Document workflow for adding new training cycles and archiving old ones
- **Security/Privacy**: Strava data handled locally; no public sharing without review

## Success Metrics
- **Dashboard adoption**: Dashboard accessed at least 5 days per week during active training weeks (weeks 1-8 of MCM cycle)
- **Data completeness**: 100% of scheduled workouts represented with completion status logged within 24 hours
- **Efficiency gain**: Weekly plan review and logging time reduced from ~45 minutes to <20 minutes (measured via time tracking for 4 consecutive weeks)
- **Data integrity**: Zero discrepancies between dashboard plan and `master_mcm_training_plan.md` during weekly reconciliation audits

## Implementation Plan
1. **Design**: Map data model and dashboard layout; choose platform (Notion vs Airtable) _Target: 2025-10-06_
2. **Data Prep**: Create export scripts for plan and log markdown into CSV _Target: 2025-10-10_
3. **Dashboard Build**: Configure tables, views, and analytics _Target: 2025-10-14_
4. **User Testing**: Use dashboard for one training week; capture feedback _Target: 2025-10-21_
5. **Iterate & Document**: Update workflows, finalize maintenance checklist _Target: 2025-10-25_

## Risks & Mitigations
- **Manual data drift**: Create weekly reconciliation checklist comparing dashboard to source docs
- **Tool lock-in**: Export data weekly to markdown/CSV for backup
- **Time investment**: Limit v1 scope to must-have views; defer automation until workflow proves valuable

## Open Questions
- **Platform choice**: Preferred platform between Notion and Airtable? Evaluate using criteria table above based on existing workflows → **Decision by: 2025-10-05**
- **Recovery signals**: How to best capture subjective recovery signals (HRV, sleep) without overcomplication? → **Evaluate during user testing phase (2025-10-21)**
- **Cross-training integration**: Should strength training and cross-training be integrated now or in a later phase? → **Defer to v1.1 post-MCM (2025-11-01)**

## Next Steps
- Confirm platform choice
- Draft data export template aligning markdown fields to dashboard schema
- Schedule initial build session aligned with implementation plan timeline
