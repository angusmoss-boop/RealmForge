Realmforge: Wanderer's Rise — V11.24.0 Canonical World Actions & Specialist Foundations

Production architecture release. Gameplay balance/content is intentionally unchanged.
Save schema remains 11.5.3.

ACTIVE PRODUCTION RUNTIME
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v11_24.js
5. js/dist/data_core_v11_24.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v11_24.js
8. js/legacy/compat_gameplay_world_actions_specialist_trimmed_v1153.js
9. js/dist/canonical_v11_24.js

V11.24 WORLD ACTIONS / SPECIALIST FOUNDATION
- New canonical systems.specialist owns the V7 shared specialist-action coordinator and potion experimentation ancestry.
- New canonical ui.worldActions owns the historical V7/V9 cross-system context, action-modal and binding composition layer.
- Canonical World, Locks, Crime, Crafting, Research, Combat, Inventory, Character, Travel, Commerce and Item Browser absorb their audited V7/V9 historical fragments.
- Historical execution order remains exact through synchronous installer markers at the old V7/V9 positions.
- Modern system ownership is unchanged: the UI coordinator does not own Lockpicking, Crime, Smithing, Research, Combat, Travel or Inventory gameplay.
- Existing gameplay semantics and save state are intentionally unchanged.

APPLICATION VERSION
11.24.0

SAVE SCHEMA
11.5.3

KEY DOCUMENTS
- REALMFORGE_ARCHITECTURE_V11_24.md
- Realmforge_Production_Foundation_Audit_V11_24.txt
- SYSTEM_EXTRACTION_PROVENANCE_V11_24.txt
- CANONICAL_BUNDLE_PROVENANCE_V11_24.txt
- Realmforge_Development_Log_V1_to_V11_24_0.txt

PRODUCTION RULE
New work belongs in canonical Core/Data/Systems/UI modules. Do not resume historical version-patch monkey-patching.
