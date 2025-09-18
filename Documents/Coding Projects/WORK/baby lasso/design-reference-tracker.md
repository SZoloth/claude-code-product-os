# Design Reference Coverage Tracker

| Reference Image | Matching Component(s) | Status | Notes / Next Steps |
| --- | --- | --- | --- |
| Art Info Panel.png | `ArtInfoPanel` (`src/components/ui/art-info-panel.tsx`) | Done | Promoted to canonical filename, exported through the barrel, and showcased alongside other department panels. |
| Artwork Statuses.png | `ColorPalette` (`src/components/ui/color-palette.tsx`), `DepartmentBadge` (`src/components/ui/department-badge.tsx`) | Done | Palette + badges already implemented and exported; keep verifying token coverage. |
| Buttons + Overlay Components.png | `Button` (`src/components/ui/button.tsx`), `DepartmentButton` (`src/components/ui/department-button.tsx`), `Modal` (`src/components/ui/modal.tsx`), `AssetPickerOverlay` (`src/components/ui/asset-picker-overlay.tsx`) | Done | Modal and overlay picker are exported and demonstrated inside the search experience card. |
| CFX Info Panel.png | `CFXInfoPanel` (`src/components/ui/cfx-info-panel.tsx`) | Done | Exported and featured in the department panel gallery. |
| FLO Info Panel.png | `FLOInfoPanel` (`src/components/ui/flo-info-panel.tsx`) | Done | Exported and showcased next to the other department panels. |
| Global Panel Components.png | `PanelShell`, `PanelSection`, `PanelField`, etc. (`src/components/ui/panel.tsx`, `panel-examples.tsx`) | Done | Panel primitives renamed/exported and demoed via `GlobalPanelExamples`. |
| Groom Info Panel.png | `GroomInfoPanel` (`src/components/ui/groom-info-panel.tsx`) | Done | Exported and included in the department panel gallery. |
| LookDev Info Panel.png | `LookDevInfoPanel` (`src/components/ui/lookdev-info-panel.tsx`) | Done | Exported and showcased. |
| Modal Overlay Components.png | `Modal` (`src/components/ui/modal.tsx`), `AdvancedSearchDialog` (`src/components/ui/advanced-search-dialog.tsx`) | Done | Modal is now exported and `AdvancedSearchDialog` appears in the search demo. |
| Modeling Info Panel.png | `ModelingInfoPanel` (`src/components/ui/modeling-info-panel.tsx`) | Done | Exported and showcased. |
| Navigation Components.png | `CollectionsSideNav`, `NavTiles`, `SidebarNav` (`src/components/ui/collections-side-nav.tsx`, `nav-tiles.tsx`, `sidebar-nav.tsx`) | Done | Navigation widgets renamed, exported, and demonstrated in the application shell card. |
| Search Components.png | `SearchInput` (`src/components/ui/search-input.tsx`), `SearchChip` (`src/components/ui/search-chip.tsx`), `FacetMultiSelect` (`src/components/ui/facet-multi-select.tsx`), `SearchBar` (`src/components/ui/search-bar.tsx`), `SearchResultsGrid` (`src/components/ui/search-results-grid.tsx`), `SearchResultsHeader` (`src/components/ui/search-results-header.tsx`), `SearchResultsList` (`src/components/ui/search-results-list.tsx`), `SearchSuggestions` (`src/components/ui/search-suggestions.tsx`), `SearchTabs` (`src/components/ui/search-tabs.tsx`), `AdvancedSearchDialog` (`src/components/ui/advanced-search-dialog.tsx`) | Done | Full search stack promoted and surfaced together in the showcase demo block. |
| Tab Components copy.png | `SearchTabs` (`src/components/ui/search-tabs.tsx`) | Done | Renamed/exported and integrated into the search experience card. |
| Tab Components.png | `Tabs` (`src/components/ui/tabs.tsx`) | Done | Uses ShadCN tabs and is fully exported. |
| Table Components.png | `Table` (`src/components/ui/table.tsx`), `DataTable` (`src/components/ui/data-table.tsx`) | Done | Both table layers implemented and exported. |
| advanced filters.png | `AdvancedSearchDialog` (`src/components/ui/advanced-search-dialog.tsx`) | Done | Uses the exported modal and is launched from the search demo. |
| breaedcrumbs.png | `Breadcrumb`, `ProjectBreadcrumb`, `AssetBreadcrumb` (`src/components/ui/breadcrumb.tsx`) | Done | Breadcrumb system matches design and is exported. |
| previz panel.png | `PrevizInfoPanel` (`src/components/ui/previz-info-panel.tsx`) | Done | New panel built to mirror the reference, exported, and demoed. |
| toolbar components.png | `Toolbar`, `CollectionsToolbar`, `QuickActionRail` (`src/components/ui/toolbar.tsx`, `collections-toolbar.tsx`, `quick-action-rail.tsx`) | Done | Toolbars shipped and exported; just ensure design variants stay in sync. |

Status legend: `Done` = implemented and exported, `Partial` = code exists but needs export / docs / polish, `Missing` = no implementation yet.
