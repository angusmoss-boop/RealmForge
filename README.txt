Realmforge: Wanderer's Rise — V11.12.0 Canonical Roads & Quests

PRODUCTION FOUNDATION VII
V11.12 moves routing/travel, the V9.3 quest journal interaction layer and V11.5.1 Wayfinder guidance out of the historical compatibility runtime.

ACTIVE RUNTIME
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v11_12.js
5. js/dist/data_core_v11_12.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v11_12.js
8. js/legacy/compat_gameplay_world_quest_trimmed_v1153.js
9. js/dist/canonical_v11_12.js

WHAT IS NOW CANONICAL
- js/systems/travel.js owns V9 routing plus V10.16 Travel Recovery, V10.17 Travel Overlay, V10.20 Waypoint Journeys and V11.2.2 Clock Sentinel.
- js/systems/quests.js owns the V9.3 quest offer/journal/detail/accept/abandon interaction layer.
- js/systems/wayfinder.js owns V11.5.1 narrative locked-route hints.
- Commerce and Dungeons remain canonical from V11.11.
- Historical compatibility retains tiny chronological installer calls at the extracted boundaries.

CROSS-CUTTING EXTENSIONS
Later historical systems still extend Travel/Quest state where appropriate, for example Energy, over-encumbrance, Explore encounters and combat clock restoration. They now extend canonical Travel/Quest contracts instead of owning the primary implementations.

SAVE CONTRACT
Application version: 11.12.0
Save schema: 11.5.3
No player-state migration is required.

PRODUCTION RULE
New travel, map routing, Saga/quest and Wayfinder work belongs in canonical systems. Do not add a new historical patch file for these systems.
