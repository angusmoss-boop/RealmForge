Realmforge: Wanderer's Rise — V11.14.0 Canonical Research & Mastery

PRODUCTION FOUNDATION IX
V11.14 moves the mature Field Research/Living Encounters stack, modern Workshop/Crafting layers, and Skills/Mastery requirement-integrity layers out of the historical compatibility runtime.

ACTIVE RUNTIME
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v11_14.js
5. js/dist/data_core_v11_14.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v11_14.js
8. js/legacy/compat_gameplay_research_skills_trimmed_v1153.js
9. js/dist/canonical_v11_14.js

WHAT IS NOW CANONICAL
- js/systems/research.js owns V10.48, V10.49, V11.5.2 and V11.5.3.
- js/systems/crafting.js owns V10.15, V10.18, V10.19 and V10.28.
- js/systems/skills.js owns V10.37 and V11.2.
- Commerce, Dungeons, Travel, Quests, Wayfinder, Combat, Equipment and Inventory remain canonical.

DELIBERATE LEGACY SEAMS
The very old V5/V6/V7 foundations remain in compatibility because they mix gathering, fishing, hunting, firemaking, cooking, crafting, crime, exploration, combat and UI in single historical patches. V10.24 Hearth & Home also remains because it mixes Cooking with property/resting. These are safer to split by domain later rather than wholesale now.

SAVE CONTRACT
Application version: 11.14.0
Save schema: 11.5.3
No player-state migration is required. Existing Equipment, Tool Belt, Pack overflow, research ranks/notes and skill XP/levels are preserved.
