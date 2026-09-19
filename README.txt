Realmforge: Wanderer's Rise — V11.15.0 Canonical Fieldcraft Foundations

PRODUCTION FOUNDATION X
V11.15 moves the old V5/V6 fieldcraft foundations, three V7 fieldcraft-only fragments, and the mixed V10.24 Hearth & Home stage out of the active historical compatibility runtime. Clean canonical Gathering, Fishing, Hunting and Cooking APIs now sit above that proven behaviour.

ACTIVE RUNTIME
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v11_15.js
5. js/dist/data_core_v11_15.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v11_15.js
8. js/legacy/compat_gameplay_fieldcraft_trimmed_v1153.js
9. js/dist/canonical_v11_15.js

WHAT IS NOW CANONICAL
- js/systems/fieldcraft.js owns the exact historical V5 Hearth & Harvest, V6 Hands On and V10.24 Hearth & Home runtime stages, plus the V7 rare-skilling, marsh-cooking and camp-extra fragments.
- js/systems/gathering.js is the canonical Gathering API for resources, resource state, active work, equipped-tool resolution and rare skilling finds.
- js/systems/fishing.js is the canonical Fishing API for casting, bite/reel resolution, escapes and active fishing state.
- js/systems/hunting.js is the canonical Hunting API for tracking, strike resolution, failure and active hunt state.
- js/systems/cooking.js is the canonical Cooking/Camp API for campfires, camp cooking, active cooking and the existing Greenvale home-kitchen path.
- Research, Skills, Crafting, Commerce, Dungeons, Travel, Quests, Wayfinder, Combat, Equipment and Inventory remain canonical.

SAFE STRANGLER SEAM
V5/V6 were historically very mixed and order-sensitive. V11.15 does not rewrite their mature mechanics from scratch. Their proven runtime source is physically removed from compatibility and installed by the canonical Fieldcraft substrate at the original chronological boundaries. The clean domain APIs above it are now the supported V12 extension points.

V10.24 also contains Greenvale property/rest behaviour alongside Cooking. It is kept intact inside the canonical Fieldcraft substrate for execution-order safety. Future property/rest development should be split into its own canonical owner rather than extending that historical stage.

SAVE CONTRACT
Application version: 11.15.0
Save schema: 11.5.3
No player-state migration is required. Existing Equipment, Tool Belt, Pack/Bank, resource charges, camp state, buffs, skilling statistics, rare finds/formulas, home ownership, skill XP/levels, progression flags, dungeon history and lossless Pack overflow are preserved.
