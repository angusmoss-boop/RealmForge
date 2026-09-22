# Realmforge Architecture V12.2.1

## Release purpose
V12.2.1 is a mobile layout hotfix for the V12.2 Living Codex. It does not change system ownership, save structure, content structure, or gameplay architecture.

## Database ownership
- Historical Database data/detail behavior remains in `js/ui/database.js`.
- Final post-compatibility Database presentation remains owned by `js/ui/database_modern.js`.
- V12.2.1 changes only the responsive refinement layout and version metadata of that modern owner.

## Responsive refinement contract
- Category chips use a wrapping flex container rather than a horizontal scrolling strip.
- Chips remain content-sized and flow onto additional rows when the available width is exhausted.
- The Codex root, hero, sector grid, workbench, refiner host, chip host and results host explicitly opt out of intrinsic-width expansion with `min-width: 0` and are capped to `max-width: 100%`.
- Search behavior and focus-safe passive-render suppression introduced in V12.2 remain unchanged.

## Active runtime order
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v12_2_1.js`
5. `js/dist/data_core_v12_2_1.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v12_2_1.js`
8. `js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js`
9. `js/dist/canonical_v12_2_1.js`

## Persistence
- App version: 12.2.1
- Save schema: 11.5.3
- No migration.
- Saveguard/campaign identity protections remain unchanged.

## Android/AAB posture
No browser-specific gameplay dependency was introduced. The hotfix is presentation-only and preserves the single canonical codebase and existing `RF.Platform` seam.
