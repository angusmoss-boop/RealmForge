# Realmforge V11.11 Production Architecture

## Objective
V11.11 begins the migration of mature gameplay implementations themselves. Commerce and Dungeons are the first systems to leave the historical compatibility runtime.

## Active runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_11.js`
5. `js/dist/data_core_v11_11.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v11_11.js`
8. `js/legacy/compat_gameplay_systems_trimmed_v1153.js`
9. `js/dist/canonical_v11_11.js`

## Canonical system ownership
### Commerce
`js/systems/commerce.js` owns the full Local Markets implementation originally introduced at V10.54. `RF.Systems.Commerce.installHistoricalV1054()` installs that behaviour at the exact chronological V10.54 boundary. Later compatibility patches, including V10.56 overflow behaviour, continue to extend `RF.V1054` normally.

### Dungeons
`js/systems/dungeons.js` owns the full Dungeon Gauntlet implementation originally introduced at V11.0. `RF.Systems.Dungeons.installHistoricalV1062()` installs it at the exact V11.0 boundary. V11.3 Database integration and V11.4 Eightfold Dungeon enrichment continue to extend `RF.V1062` in-place.

## Compatibility shrink
Previous active compatibility runtime: **1,074,126 bytes**.
New active compatibility runtime: **1,026,996 bytes**.
Implementation removed from compatibility: **47,130 bytes**.

## Save contract
Application version: `11.11.0`

Save schema: `11.5.3`

No player-state migration is required.

## Production rule
Future market/dungeon features belong in their canonical systems and their canonical Catalog/Config definitions. The historical V10.54/V11.0 entries remain only as ordering markers until the surrounding timeline is fully retired.
