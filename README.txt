Realmforge: Wanderer's Rise - V12.1.0 Forge & Fletch

Second V12 release. V12.1 expands the canonical gathering/production progression without changing the save schema or re-opening the frozen compatibility archaeology.

APPLICATION VERSION
12.1.0

SAVE SCHEMA
11.5.3 (unchanged)

ACTIVE PRODUCTION RUNTIME
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v12_1.js
5. js/dist/data_core_v12_1.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v12_1.js
8. js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js
9. js/dist/canonical_v12_1.js

V12.1 FORGE & FLETCH
- Added one declarative V12 content pack: js/data/content/packs/10_forge_and_fletch.js.
- Added 56 items and 59 recipes. Live catalogue is now 226 items / 80 recipes.
- Added Cobalt, Redstone and Stariron mining resources.
- Added Ash, Maple and Ancient Ironwood woodcutting resources.
- Added Cobalt, Emberglass, Redsteel and Stariron refined bars.
- Added Tier 4/5/6 Mining pickaxes and Woodcutting axes.
- Completed Bronze, Iron and Steel craftable armour progression and added full Cobalt, Redsteel and Stariron armour sets.
- Added 10 craftable melee weapons and 4 new craftable bows.
- Added six bar + timber arrow-fletching recipes producing the existing Arrow ammunition stack.
- Fletching deliberately remains under the existing Crafting skill; no parallel skill/save-state migration was introduced.
- New resources are supplied through canonical RF.Config + systems.gathering integration rather than historical patch files.
- RF.Authoring now validates resource definitions and location-resource references.
- Exact-level harvesting/crafting requirements are regression-tested.
- Crafted endgame gear is deliberately below the strongest Legendary dungeon equipment.

HARVEST REQUIREMENTS
Mining: Cobalt 16, Redstone 22, Stariron 30.
Woodcutting: Ash 9, Maple 18, Ancient Ironwood 28.

FROZEN COMPATIBILITY
js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js remains 64,639 bytes and byte-identical to V11.30.0/V12.0.0.

KEY DOCUMENTS
- REALMFORGE_ARCHITECTURE_V12_1.md
- Realmforge_Production_Audit_V12_1.txt
- CONTENT_EXPANSION_PROVENANCE_V12_1.txt
- CANONICAL_BUNDLE_PROVENANCE_V12_1.txt
- Realmforge_Development_Log_V1_to_V12_1_0.txt
