Realmforge: Wanderer's Rise — V11.23.0 Canonical Character, Progression & Vault Ancestry

Production architecture release. Gameplay balance/content is intentionally unchanged.
Save schema remains 11.5.3.

ACTIVE PRODUCTION RUNTIME
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v11_23.js
5. js/dist/data_core_v11_23.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v11_23.js
8. js/legacy/compat_gameplay_character_progression_trimmed_v1153.js
9. js/dist/canonical_v11_23.js

V11.23 CHARACTER / PROGRESSION / VAULT FOUNDATION
- New canonical systems.character owns historical V3 perk/progression and V10 creator/milestone ancestry.
- Canonical Inventory owns the V8.2 Pack/Bank foundations, complete V10.10 Greenvale Vault stage and V10.12 Pack/Bank stability fragments.
- Canonical Equipment, Gathering, Combat, Travel, Skills, Item Browser and Developer absorb their own audited V3/V8.2/V10/V10.12 ancestry.
- Historical execution order is preserved through tiny synchronous installer markers in compatibility.
- Existing gameplay semantics and save state are intentionally unchanged.

APPLICATION VERSION
11.23.0

SAVE SCHEMA
11.5.3

KEY DOCUMENTS
- REALMFORGE_ARCHITECTURE_V11_23.md
- Realmforge_Production_Foundation_Audit_V11_23.txt
- SYSTEM_EXTRACTION_PROVENANCE_V11_23.txt
- CANONICAL_BUNDLE_PROVENANCE_V11_23.txt
- Realmforge_Development_Log_V1_to_V11_23_0.txt

PRODUCTION RULE
New work belongs in canonical Core/Data/Systems/UI modules. Do not resume historical version-patch monkey-patching.
