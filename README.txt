Realmforge: Wanderer's Rise — V11.17.0 Canonical Time & Energy

PRODUCTION FOUNDATION XII
V11.17 moves the remaining coherent cross-cutting clock/Energy machinery out of active compatibility while preserving Travel, Property, Inventory and Exploration ownership boundaries.

ACTIVE RUNTIME
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v11_17.js
5. js/dist/data_core_v11_17.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v11_17.js
8. js/legacy/compat_gameplay_time_energy_trimmed_v1153.js
9. js/dist/canonical_v11_17.js

NEW / EXTENDED CANONICAL OWNERS
- js/systems/time_energy.js: Pause / 1× / limited 2×, master world cadence, Energy spending/recovery, V10.22 travel fatigue and non-travel combat clock restoration.
- js/ui/focus_clock.js: V9.6 modal/select clock snapshots and Android/PWA Back unwinding.
- js/systems/gathering.js: V10.22 continuous-gathering slice.
- js/systems/crime.js: V10.2 failed-pickpocket result behavior/UI.
- js/systems/property.js: V10 inn-location helper folded into existing canonical inn-rest ownership.

BOUNDARIES PRESERVED
- Travel and V11.2.2 Clock Sentinel remain systems.travel.
- Inns/homes and full-rest actions remain systems.property.
- Over-encumbrance time/travel blocking remains systems.inventory.
- Explore expedition Energy remains systems.exploration.

SAVE CONTRACT
Application version: 11.17.0
Save schema: 11.5.3
No player-state migration is required. Existing Equipment, both Ring slots, Tool Belt, Pack/Bank, skills/research, quests/flags, market/dungeon/crime/exploration/property state, active travel/combat, buffs, Energy carry and deliberate Pack overflow remain compatible.

VALIDATION
- Compatibility runtime: 471,105 -> 428,249 bytes (-42,856 bytes).
- 234 JavaScript files passed node --check with 0 failures.
- 23 executable Node regression harnesses passed with 0 failures.
- V11.16/V11.17 time/Energy/system parity: PASS.
- Advanced + active-travel + active-combat save compatibility: PASS.
- Known V10.9 fake-DOM modalHTML warning remains identical in reference/candidate tests.

See REALMFORGE_ARCHITECTURE_V11_17.md and Realmforge_Production_Foundation_Audit_V11_17.txt for the ownership map and extraction rationale.
