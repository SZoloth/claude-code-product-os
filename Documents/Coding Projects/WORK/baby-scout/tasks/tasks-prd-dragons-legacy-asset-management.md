## Relevant Files

- baby-scout/.env - Points Prisma to the local SQLite database file.
- baby-scout/jest.setup.js - Sets test env vars and loads Jest DOM matchers.
- baby-scout/package.json - Adds Prisma scripts and adjusts dependencies.
- baby-scout/package-lock.json - Lockfile updates for Prisma/Dev tooling.
- baby-scout/prisma/schema.prisma - Defines asset, version, relation, and activity models.
- baby-scout/prisma/migrations/20250925000230_init/migration.sql - Initial SQLite migration for the schema.
- baby-scout/prisma/migrations/migration_lock.toml - Prisma migration provider lock.
- baby-scout/prisma/seed.js - Seed routine for users, assets, versions, activity, usage events.
- baby-scout/src/lib/types.ts - Shared domain TypeScript types.
- baby-scout/src/lib/db/client.ts - Prisma client singleton with dev-mode caching.
- baby-scout/src/lib/repos/assets.ts - Asset repository (list/search/status transitions/usage logging).
- baby-scout/src/lib/repos/activity.ts - Activity repository helpers (list/create).
- baby-scout/src/lib/repos/__tests__/assets.test.ts - Jest tests covering asset repository behaviours.
- baby-scout/src/lib/repos/__tests__/activity.test.ts - Jest tests for activity repository flows.
- baby-scout/src/components/AssetGrid.tsx - Virtualized grid with responsive column guardrails.
- baby-scout/src/components/AssetGrid.test.tsx - Tests for responsive column calculations.
- baby-scout/src/components/AssetCard.tsx - Card component with status badge, download action, skeleton state.
- baby-scout/src/components/AssetCard.test.tsx - Tests for AssetCard rendering and behaviour.
- baby-scout/src/components/StatusBadge.tsx - Status pill styling for asset state.
- baby-scout/src/components/StatusBadge.test.tsx - Tests for status badge labelling.
- baby-scout/src/pages/api/assets/index.ts - Next.js API route serving asset listings from Prisma.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Data model and migrations
  - [x] 1.1 Draft ERD and Define TS types in `src/lib/types.ts` (Asset, Version, Relation, User, RoleAssignment, ActivityLog, UsageEvent)
  - [x] 1.2 Add Prisma and create `prisma/schema.prisma` with core models
  - [x] 1.3 Generate initial migration and run against dev DB (SQLite)
  - [x] 1.4 Create `prisma/seed.ts` with sample users/roles/assets/versions/relations
  - [x] 1.5 Implement `src/lib/db/client.ts` and repository layer `src/lib/repos/assets.ts`, `src/lib/repos/activity.ts`
  - [x] 1.6 Add unit tests for repos using seeded DB

- [ ] 2.0 Virtualized asset grid (dynamic columns)
  - [x] 2.1 Refine dynamic column calculation with guardrails (min 2, target ~10 at 1440px)
  - [x] 2.2 Extract `AssetCard.tsx` with status badge, download button, and skeleton state
  - [x] 2.3 Replace mock data with API-backed data from `/api/assets`
  - [x] 2.4 Add loading/error/empty states; ensure smooth virtualization with `overscanCount`
  - [ ] 2.5 Implement keyboard navigation (arrow keys, Enter) and focus ring for accessibility
  - [ ] 2.6 Tests for rendering, responsiveness, and keyboard navigation
  - [ ] 2.7 Create asset detail page `src/pages/assets/[id].tsx` (metadata, relationships, usage history)

- [ ] 3.0 Search and filtering (indexed, keyboard shortcuts)
  - [ ] 3.1 Implement `SearchCommand.tsx` (Cmd/Ctrl+K), with input debounce and keyboard navigation
  - [ ] 3.2 Add filters for type, tags, status; persist last filters in query params
  - [ ] 3.3 Create `/api/search` endpoint; for MVP build in-memory index from DB results (fuzzy + prefix)
  - [ ] 3.4 Highlight matched terms and show result metadata (type, status, tags)
  - [ ] 3.5 Wire search results to navigate to asset detail and focus in grid
  - [ ] 3.6 Tests for search behavior, filters, and shortcuts

- [ ] 4.0 RBAC and asset approval workflow
  - [ ] 4.1 Integrate NextAuth (dev provider) with sessions; include `role` in JWT/session
  - [ ] 4.2 Add `withAuth` middleware to protect API routes; implement role guards in `lib/auth/roles.ts`
  - [ ] 4.3 Implement `/api/assets/[id]/status` to transition statuses; enforce Admin/Reviewer permissions
  - [ ] 4.4 Update UI to display status badges and hide restricted actions for Vendors
  - [ ] 4.5 Seed sample users (Admin, Artist, Vendor) and bind roles; tests for RBAC on routes

- [ ] 5.0 Secure asset downloads and API routes
  - [ ] 5.1 Implement `/api/assets/[id]/download` to check RBAC and return proxied or mocked signed URL
  - [ ] 5.2 Add download button and progress UI on `AssetCard` and asset detail
  - [ ] 5.3 Log `UsageEvent` on successful download; surface in activity feed
  - [ ] 5.4 Tests for access control and download logging

- [ ] 6.0 MVP collaboration basics (activity logs, avatars)
  - [ ] 6.1 Implement `ActivityFeed.tsx` and `/api/activity` (read-only list, server writes via other routes)
  - [ ] 6.2 Show activity on asset detail and global dashboard section
  - [ ] 6.3 Add user avatars to header and activity items; fallback to initials
  - [ ] 6.4 Tests for activity rendering and pagination

- [ ] 7.0 Telemetry, performance budgets, and success metrics
  - [ ] 7.1 Add `src/lib/telemetry.ts` to capture timings and events (search latency p50/p95/p99, zero results)
  - [ ] 7.2 Create `/api/metrics` to ingest telemetry; store minimally in DB
  - [ ] 7.3 Instrument grid performance (approximate FPS via `requestAnimationFrame` sample) and overscan metrics
  - [ ] 7.4 Add lightweight admin view to inspect key metrics (search latency, zero-result rate)
  - [ ] 7.5 Document performance budgets and add Jest tests for basic telemetry hooks
