Realmforge: Wanderer's Rise - V11.29.0 Final Compatibility Classification & Content Authoring Readiness

Production architecture/content-authoring release. Gameplay balance/content is intentionally unchanged.
Save schema remains 11.5.3.

ACTIVE PRODUCTION RUNTIME
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v11_29.js
5. js/dist/data_core_v11_29.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v11_29.js
8. js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js
9. js/dist/canonical_v11_29.js

V11.29 AUTHORING / COMPATIBILITY FOUNDATION
- Added canonical data.authoring (`RF.Authoring`) for validated item/enemy/location/recipe/quest/skill/NPC/perk registration and content packs.
- Added cross-reference validation for the live Catalog and canonical Config graph.
- Added a copy-ready content-pack template and V11.29 authoring guide.
- Added canonical core.compatibilityClassification and classified every one of the 93 remaining historical timeline boundaries.
- Classification result: 80 chronology bridges, 12 save/migration bridges, 1 mixed historical runtime survivor, 0 proven obsolete/retireable stages.
- Compatibility remains 64,639 bytes deliberately. V11.29 removes no historical code without proof.
- New gameplay/content must not be added to historical compatibility or scoped-runtime capsules.

APPLICATION VERSION
11.29.0

SAVE SCHEMA
11.5.3

KEY DOCUMENTS
- REALMFORGE_ARCHITECTURE_V11_29.md
- Realmforge_Production_Foundation_Audit_V11_29.txt
- SYSTEM_EXTRACTION_PROVENANCE_V11_29.txt
- CANONICAL_BUNDLE_PROVENANCE_V11_29.txt
- COMPATIBILITY_CLASSIFICATION_V11_29.txt
- CONTENT_AUTHORING_GUIDE_V11_29.md
- Realmforge_Development_Log_V1_to_V11_29_0.txt

PRODUCTION RULE
If a change only alters what exists in Realmforge, prefer RF.Authoring / RF.Catalog / RF.Config. If it changes how a mechanic works, edit the canonical system owner. Historical compatibility exists only for old chronology/save behaviour and must not receive new gameplay.
