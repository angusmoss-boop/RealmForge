Realmforge: Wanderer's Rise - V11.28.0 Scoped Residual Execution & Final Migration Bridges

Production architecture release. Gameplay balance/content is intentionally unchanged.
Save schema remains 11.5.3.

ACTIVE PRODUCTION RUNTIME
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v11_28.js
5. js/dist/data_core_v11_28.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v11_28.js
8. js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js
9. js/dist/canonical_v11_28.js

V11.28 SCOPED RESIDUAL FOUNDATION
- Historical migration definitions now live under Core Migrations.
- Scope-sensitive V10.7 runs from canonical core.scopedRuntime as an exact classic-script capsule.
- V8 cadence/event/travel/presentation/time-energy pieces now live with their canonical owners.
- V10.13 executes from Presentation and V10.14 from Inventory.
- Compatibility is now 64,639 bytes.
- New gameplay/content must not be added to historical compatibility or scoped-runtime capsules.

APPLICATION VERSION
11.28.0

SAVE SCHEMA
11.5.3

KEY DOCUMENTS
- REALMFORGE_ARCHITECTURE_V11_28.md
- Realmforge_Production_Foundation_Audit_V11_28.txt
- SYSTEM_EXTRACTION_PROVENANCE_V11_28.txt
- CANONICAL_BUNDLE_PROVENANCE_V11_28.txt
- Realmforge_Development_Log_V1_to_V11_28_0.txt

PRODUCTION RULE
New work belongs in canonical Core/Data/Systems/UI modules. Historical compatibility and scoped execution are chronology-preservation mechanisms, not homes for new gameplay.
