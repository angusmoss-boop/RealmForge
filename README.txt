Realmforge: Wanderer's Rise — V11.16.0 Canonical Exploration, Crime & Homesteads

PRODUCTION FOUNDATION XI
V11.16 moves mature Exploration, the shared lock engine, Crime, resting/property foundations and the mixed V10.24 Hearth & Home stage into explicit canonical owners. Historical code still executes at its exact chronological boundaries, but these implementations no longer live in the active compatibility archive.

ACTIVE RUNTIME
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v11_16.js
5. js/dist/data_core_v11_16.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v11_16.js
8. js/legacy/compat_gameplay_exploration_crime_property_trimmed_v1153.js
9. js/dist/canonical_v11_16.js

NEW CANONICAL OWNERS
- js/systems/exploration.js: V10.25 Into the Unknown, V10.26 Explorer's Pace, V10.34 Earned Finds and V7 excavation.
- js/systems/locks.js: V10.27 Locks & Locality, V10.29 Four Pins and V10.32 Clean Run.
- js/systems/crime.js: bounty primitives, reliable crime foundation, mature pickpocketing, criminal record, moving targets, Seven Doors and Hot Property.
- js/systems/property.js: Greenvale home actions, inn rest and the V10.24 Hearth & Home implementation including home cooking.
- js/systems/fieldcraft.js now owns only V5/V6 fieldcraft foundations plus its three V7 fieldcraft fragments.

SAFE STRANGLER SEAM
The extracted source is the exact V11.15 transformed production source. Installers execute it at the same original version boundaries, preserving dependency order and later wrappers. Shared locks are separated because both Explore treasure and burglary depend on the same lock engine.

SAVE CONTRACT
Application version: 11.16.0
Save schema: 11.5.3
No player-state migration is required. Existing Equipment, Tool Belt, Pack/Bank, exploration chest state, excavation data, bounty/heat/theft records, burglary cooldowns, home ownership/rest buffs, V10.24 kitchen state, progression flags and lossless Pack overflow are preserved.
