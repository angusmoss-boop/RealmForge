Realmforge: Wanderer's Rise — V11.26.0 Canonical V4 Combat & Collection Foundations

Production architecture release. Gameplay balance/content is intentionally unchanged.
Save schema remains 11.5.3.

ACTIVE PRODUCTION RUNTIME
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v11_26.js
5. js/dist/data_core_v11_26.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v11_26.js
8. js/legacy/compat_gameplay_combat_collection_trimmed_v1153.js
9. js/dist/canonical_v11_26.js

V11.26 COMBAT / COLLECTION FOUNDATION
- Canonical Combat now owns the V4 enemy move-pool bootstrap, tactical battle engine ancestry and original tactical combat renderer.
- New canonical systems.collection owns V4 collection item tracking and Collection Log presentation.
- Canonical Character owns the V4 Character collection/companion/specialisation presentation wrapper.
- Canonical Property owns the original Greenvale cottage purchase action.
- Historical execution order remains exact through synchronous installer markers at the old V4 positions.
- V4 migration, social/world composition and mixed binding ancestry remain where ownership is not yet clean.
- Existing gameplay semantics and save state are intentionally unchanged.

APPLICATION VERSION
11.26.0

SAVE SCHEMA
11.5.3

KEY DOCUMENTS
- REALMFORGE_ARCHITECTURE_V11_26.md
- Realmforge_Production_Foundation_Audit_V11_26.txt
- SYSTEM_EXTRACTION_PROVENANCE_V11_26.txt
- CANONICAL_BUNDLE_PROVENANCE_V11_26.txt
- Realmforge_Development_Log_V1_to_V11_26_0.txt

PRODUCTION RULE
New work belongs in canonical Core/Data/Systems/UI modules. Do not resume historical version-patch monkey-patching.
