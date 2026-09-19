Realmforge: Wanderer's Rise — V11.13.0 Canonical Combat & Loadouts

PRODUCTION FOUNDATION VIII
V11.13 moves the mature Combat presentation/cadence layers and the modern Equipment / Tool Belt / Pack / Vault / over-encumbrance layers out of the historical compatibility runtime.

ACTIVE RUNTIME
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v11_13.js
5. js/dist/data_core_v11_13.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v11_13.js
8. js/legacy/compat_gameplay_combat_loadout_trimmed_v1153.js
9. js/dist/canonical_v11_13.js

WHAT IS NOW CANONICAL
- js/systems/combat.js owns 8 extracted mature combat stages: V8.1, V10.35, V10.36, V10.57–V10.60 and V11.3.2.
- js/systems/equipment.js owns 5 extracted loadout stages: V10.3, V10.50, V10.53, V10.55 and V11.5.
- js/systems/inventory.js owns 9 extracted modern Pack/Vault/overflow stages: V10.42–V10.47, V10.51, V10.52 and V10.56.
- Commerce, Dungeons, Travel, Quests and Wayfinder remain canonical from previous foundation releases.

LEGACY BOOTSTRAP SEAMS
Some earlier mixed patches remain in compatibility because they combine unrelated systems in one historical file, especially V4 tactical-combat/world/social code and V8.2 Pack/Bank/Mastery/combat-feedback code. V11.13 deliberately does not split those risky mixed stages yet. New V12 Combat, Equipment, Tool Belt, Pack and encumbrance work belongs in canonical modules.

SAVE CONTRACT
Application version: 11.13.0
Save schema: 11.5.3
No player-state migration is required.
