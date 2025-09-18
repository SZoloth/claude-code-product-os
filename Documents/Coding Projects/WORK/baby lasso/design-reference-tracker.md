# Design Reference Coverage Tracker

| Reference Image | Matching Component(s) | Status | Notes / Next Steps |
| --- | --- | --- | --- |
| Art Info Panel.png | `ArtInfoPanel` (`src/components/ui/UpanelsUart.tsx`) | Partial | Structure matches design but lives under a placeholder filename; export via `ui/index.ts` and showcase it. |
| Artwork Statuses.png | `ColorPalette` (`src/components/ui/color-palette.tsx`), `DepartmentBadge` (`src/components/ui/department-badge.tsx`) | Done | Palette + badges already implemented and exported; keep verifying token coverage. |
| Buttons + Overlay Components.png | `Button` (`src/components/ui/button.tsx`), `DepartmentButton` (`src/components/ui/department-button.tsx`), `Modal` (`src/components/ui/modal.tsx`), `AssetPickerOverlay` (`src/components/ui/UassetUpickerUoverlay.tsx`) | Partial | Core buttons shipped; overlay picker exists but is not exported or wired into docs yet. |
| CFX Info Panel.png | `CFXInfoPanel` (`src/components/ui/UpanelsUcfx.tsx`) | Partial | Component mirrors design but needs proper filename/export and showcase entry. |
| FLO Info Panel.png | `FLOInfoPanel` (`src/components/ui/UpanelsUflo.tsx`) | Partial | Same pattern as other panels—hook up to exports and demos. |
| Global Panel Components.png | `PanelShell`, `PanelSection`, `PanelField`, etc. (`src/components/ui/Upanel.tsx`, `UpanelsUglobalUexamples.tsx`) | Partial | Infrastructure is in place but hidden behind placeholder filenames; surface in barrel + docs. |
| Groom Info Panel.png | `GroomInfoPanel` (`src/components/ui/UpanelsUgroom.tsx`) | Partial | Needs export and showcase coverage. |
| LookDev Info Panel.png | `LookDevInfoPanel` (`src/components/ui/UpanelsUlookdev.tsx`) | Partial | Implemented but not yet exported/documented. |
| Modal Overlay Components.png | `Modal` (`src/components/ui/modal.tsx`), `AdvancedSearchDialog` (`src/components/ui/advanced-search-dialog.tsx`) | Partial | Modal exists but is not exported; advanced dialog depends on it and remains undocumented. |
| Modeling Info Panel.png | `ModelingInfoPanel` (`src/components/ui/UpanelsUmodeling.tsx`) | Partial | Awaiting export + docs similar to other department panels. |
| Navigation Components.png | `CollectionsSideNav`, `NavTiles`, `SidebarNav` (`src/components/ui/UcollectionsUsideUnav.tsx`, `UnavUtiles.tsx`, `UsidebarUnav.tsx`) | Partial | Navigation widgets are built but still hidden behind placeholder filenames with no exports. |
| Search Components.png | `SearchInput` (`src/components/ui/search-input.tsx`), `SearchChip` (`src/components/ui/search-chip.tsx`), `FacetMultiSelect` (`src/components/ui/facet-multi-select.tsx`), `SearchBar` (`src/components/ui/search-bar.tsx`), `SearchResultsGrid` (`src/components/ui/search-results-grid.tsx`), plus placeholder variants (`src/components/ui/UsearchUresultsUheader.tsx`, `UsearchUresultsUlist.tsx`, `UsearchUsuggestions.tsx`, `UsearchUtabs.tsx`) | Partial | Core search primitives are exported, but several supporting pieces (`SearchResultsHeader/List`, `SearchSuggestions`, `SearchTabs`) remain under placeholder filenames. |
| Tab Components copy.png | `SearchTabs` (`src/components/ui/UsearchUtabs.tsx`) | Partial | Needs refactor to final filename + export; then demo alongside primary tabs. |
| Tab Components.png | `Tabs` (`src/components/ui/tabs.tsx`) | Done | Uses ShadCN tabs and is fully exported. |
| Table Components.png | `Table` (`src/components/ui/table.tsx`), `DataTable` (`src/components/ui/data-table.tsx`) | Done | Both table layers implemented and exported. |
| advanced filters.png | `AdvancedSearchDialog` (`src/components/ui/advanced-search-dialog.tsx`) | Partial | Component depends on unexported modal; add barrel entry + showcase scenario. |
| breaedcrumbs.png | `Breadcrumb`, `ProjectBreadcrumb`, `AssetBreadcrumb` (`src/components/ui/breadcrumb.tsx`) | Done | Breadcrumb system matches design and is exported. |
| previz panel.png | — | Missing | No dedicated Previz panel component yet; needs implementation mirroring other department panels. |
| toolbar components.png | `Toolbar`, `CollectionsToolbar`, `QuickActionRail` (`src/components/ui/toolbar.tsx`, `collections-toolbar.tsx`, `quick-action-rail.tsx`) | Done | Toolbars shipped and exported; just ensure design variants stay in sync. |

Status legend: `Done` = implemented and exported, `Partial` = code exists but needs export / docs / polish, `Missing` = no implementation yet.
