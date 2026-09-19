Realmforge: Wanderer's Rise — V11.11.0 Canonical Commerce & Dungeons

PRODUCTION FOUNDATION VI
V11.11 moves the first mature gameplay implementations out of the historical compatibility runtime.

ACTIVE RUNTIME
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v11_11.js
5. js/dist/data_core_v11_11.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v11_11.js
8. js/legacy/compat_gameplay_systems_trimmed_v1153.js
9. js/dist/canonical_v11_11.js

WHAT IS NOW CANONICAL
- js/systems/commerce.js owns Local Market behaviour: stock, pricing, buying/selling, market modal/UI integration and market state migration.
- js/systems/dungeons.js owns the V11.0 dungeon-gauntlet implementation: lobby, wave flow, bosses, completion rewards, run persistence hooks, combat hooks and dungeon UI.
- The historical V10.54 and V11.0 patch entries now contain only chronological install markers.
- Later historical patches still enrich the established RF.V1054 / RF.V1062 namespaces at the exact same points as before, preserving mature behaviour.

WHY INSTALLERS EXIST
The old patch chain has strict chronological dependencies. Canonical system modules load before compatibility, but they install their mature implementation only when the compatibility timeline reaches V10.54 or V11.0. This removes implementation ownership from archaeology without changing runtime ordering.

SAVE CONTRACT
Application version: 11.11.0
Save schema: 11.5.3
No player-state migration is required.

PRODUCTION RULE
New commerce and dungeon work goes directly into canonical system modules and canonical RF.Config/RF.Catalog data. Do not add new patch-local market or dungeon implementations.
