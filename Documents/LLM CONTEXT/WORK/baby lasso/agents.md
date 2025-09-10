# Agents Guide

This document guides coding agents working on the Baby Lasso Design System. It defines goals, constraints, project anatomy, and repeatable playbooks to keep changes consistent, safe, and aligned with the design system.

## Goals
- Maintain a ShadCN-based, Tailwind-powered React component library with department theming, typography, and icons.
- Keep exports stable via the `ui` barrel file and path alias `@`.
- Prefer focused, minimal changes; update docs/showcase alongside code.

## Tech Stack
- React 18 + Vite 5 (TypeScript)
- Tailwind CSS + ShadCN design tokens and patterns
- Class Variance Authority (CVA) for component variants
- Lucide React for icons
- Vitest + Testing Library for unit tests

## Project Anatomy (key paths)
- App entry: `src/main.tsx`
- Global styles: `src/index.css`
- Components (barrel): `src/components/ui/index.ts`
- Components (source): `src/components/ui/*.tsx`
- Design tokens/utilities:
  - Department theming: `src/lib/department-themes.ts`
  - Typography variants/scale: `src/lib/typography.ts`
  - Icons + mapping: `src/lib/icons.tsx`
  - ClassName util: `src/lib/utils.ts`
- Showcase app: `src/examples/design-system-showcase.tsx`
- Tailwind config: `tailwind.config.js`
- Vite config (alias `@` → `src/`): `vite.config.ts`
- ShadCN config: `components.json`
- Design references: `design-reference-do-not-delete-folder/` (do not remove)

## Conventions
- TypeScript-first: add/maintain prop types, exports, and enums.
- CVA for variants: use CVA for component variant/size/color systems; match existing naming (e.g., `art-primary`, `modeling-secondary`).
- Tailwind utilities: style via Tailwind classes; use `cn()` from `src/lib/utils.ts` for class merging.
- Accessibility: ensure proper semantics/ARIA; preserve keyboard focus states.
- Barrel exports: add new components and types to `src/components/ui/index.ts`.
- Path alias: import via `@/...` rather than deep relative paths.
- Theming: map department-specific styles via `department-themes.ts` and `tailwind.config.js` color tokens.
- Documentation: update README/showcase with usage examples for any new component or variant.

## Common Playbooks

### 1) Add a new ShadCN-style component
1. Create the component in `src/components/ui/<name>.tsx` using CVA where appropriate.
2. Export it (and its types/variants) from `src/components/ui/index.ts`.
3. Add usage examples to `src/examples/design-system-showcase.tsx` so it’s visible in the demo.
4. If the component needs tokens, add them to `tailwind.config.js` and/or CSS variables in `src/index.css`.
5. Add unit tests if logic is non-trivial (see Testing).

### 2) Add/extend department variants
1. Extend CVA maps in `src/lib/department-themes.ts` for buttons/badges.
2. If introducing new color tokens, add them under the correct department in `tailwind.config.js`.
3. For typography color support, extend `color` variants in `src/lib/typography.ts`.
4. Update `ColorPalette`/showcase to demonstrate the new variant(s).

### 3) Add a typography variant
1. Add the variant to `src/lib/typography.ts` (CVA + scale metadata).
2. Decide default semantic element mapping in `src/components/ui/typography.tsx` if necessary.
3. Surface in `TypographyShowcase` and add usage examples in the showcase.

### 4) Add an icon or category
1. Map the icon name → component in `src/lib/icons.tsx`.
2. If needed, add to `iconCategories` so it appears in `IconShowcase`.
3. Prefer Lucide icons; for brand/department icons, stub with a React component and swap later for SVG.

### 5) Enhance `AssetCard` or `Dashboard`
1. Keep API minimal and typed. Reuse `Button`, `Badge`, `Card` patterns.
2. Maintain responsiveness (Tailwind grid utilities) and hover/focus states.
3. Add optional props instead of changing defaults; document via showcase.

## Development
- Install: `npm install` (Node 18+ recommended for Vite 5)
- Dev server: `npm run dev` → http://localhost:5173
- Build: `npm run build`
- Preview: `npm run preview`
- Tests: `npm run test` (headless) or `npm run test:ui`

## Testing
- Framework: Vitest + Testing Library + jsdom (see `package.json`).
- Location: co-locate tests next to components (`src/components/ui/<name>.test.tsx`) or under `src/lib/*.test.ts`.
- Philosophy: test behavior/props/variants; prefer accessibility queries.

## Theming & Tokens
- CSS variables for ShadCN tokens live in `src/index.css`; dark mode toggled by `.dark` class.
- Department colors and scales live in `tailwind.config.js` under `art`, `modeling`, `lookdev`, `groom`.
- Department component CVA variants live in `src/lib/department-themes.ts`.

## Documentation & Showcase
- README is the primary external doc (`README.md`).
- The showcase (`src/examples/design-system-showcase.tsx`) must be updated with new components/variants.
- For typography and icons, also update `TypographyShowcase` and `IconShowcase` respectively.

## Do’s and Don’ts
- Do: keep changes scoped; update exports and examples; write types; preserve a11y.
- Do: reference tokens and department colors rather than hardcoding hex values in components.
- Don’t: rename or remove existing exports without coordination.
- Don’t: delete the `design-reference-do-not-delete-folder/`.
- Don’t: introduce bespoke styling outside Tailwind/CVA without a clear tokenization plan.

## Validation Checklist (before handing off)
- Builds cleanly: `npm run build`.
- Runs locally: `npm run dev` and manual smoke test of showcase.
- Types compile: no TS errors.
- Lint/tests (if present) pass: `npm run test`.
- Barrel exports updated: `src/components/ui/index.ts`.
- Showcase demonstrates the change: `src/examples/design-system-showcase.tsx`.
- Docs touched if needed: `README.md`.

## Notes
- Path alias `@` resolves to `src/` (see `vite.config.ts`).
- Dark mode works via `class="dark"` wrapper (see `src/examples/design-system-showcase.tsx`).
- Placeholder assets live under `public/` (e.g., `public/placeholder-asset.svg`).

---
This guide complements `README.md` and `CLAUDE.md` and is intended for any coding agent maintaining or extending this design system.

