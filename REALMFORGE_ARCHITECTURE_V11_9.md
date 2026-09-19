# Realmforge V11.9 Production Architecture

## Objective
V11.9 moves the first large body of **content definitions** out of the historical patch runtime and into canonical `js/data` ownership. Gameplay behaviour is intentionally unchanged.

## Active runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_9.js`
5. `js/dist/data_core_v11_9.js`
6. `js/legacy/base/main.js`
7. `js/legacy/compat_gameplay_data_trimmed_v1153.js`
8. `js/dist/canonical_v11_9.js`

## What moved
- The original foundation `RF.DATA` definition is now `js/data/base_content.js`; active production no longer loads `js/legacy/base/data.js`.
- 87 shallow historical content-definition statements were extracted from the compatibility runtime.
- Their definitions live in `js/data/content_blocks_v11_9.js` and are invoked at the exact historical execution points by lightweight `RF.Content.applyLegacyBlock(...)` calls.
- This preserves ordering while making `js/data` the owner of those definitions.

## Canonical catalog
`RF.Catalog` now owns the supported API for new content registration and lookup. V12 content should use `RF.Catalog.register`, `registerMany` or `append` rather than scattering direct `RF.DATA` mutation through version patches.

## Remaining compatibility content
Some data is still generated dynamically inside mature gameplay patches, most notably V11.4 ecosystem/dungeon generation and several patch-local tables such as market/dungeon configuration. Those remain in compatibility temporarily because they share local helpers or runtime logic. They are the next candidates for table-by-table extraction, not a reason to add new historical-style patches.

## Save contract
Application version: `11.9.0`

Save schema: `11.5.3`

No player-state migration is required.

## Validation contract
- Final `RF.DATA` must deep-match the V11.8 reference runtime, including function source for behaviour-bearing content.
- All extracted content blocks must execute exactly once.
- Existing save/core recovery tests remain green.
- Equipment, Tool Belt, Pack, Bank, research, Wayfinder and dungeon behaviour remain unchanged.

## Known harness artifact
The headless VM compatibility harness can force legacy `main.js` to render an already-saved late-game location before later historical content patches execute. V11.8 exhibits the same artifact. V11.9 introduces no new error signature there, and normal browser/PWA deferred-script execution remains the production reference. A future bootstrap extraction will remove this historical ordering quirk entirely.
