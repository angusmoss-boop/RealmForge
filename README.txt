Realmforge: Wanderer's Rise — V11.27.0 Canonical Runtime Residuals & Migration Bridges

Production architecture release. Gameplay balance/content is intentionally unchanged.
Save schema remains 11.5.3.

ACTIVE PRODUCTION RUNTIME
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v11_27.js
5. js/dist/data_core_v11_27.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v11_27.js
8. js/legacy/compat_gameplay_runtime_residuals_trimmed_v1153.js
9. js/dist/canonical_v11_27.js

V11.27 RUNTIME RESIDUAL FOUNDATION
- Canonical owners now carry Split Vault, Decision Reliability, V10.11 layout/state/list bridges, V10.1 gathering/pickpocket repair, V10 modal shell, V10.2 residuals and clean V3 runtime bridges.
- Historical execution order remains exact through guarded installer markers.
- V8 mixed cadence/runtime, V10.7 scoped wrappers and mixed migration normalizers remain compatibility-owned pending a scope-safe extraction mechanism.
- Existing gameplay semantics, loadouts and save state are intentionally unchanged.

APPLICATION VERSION
11.27.0

SAVE SCHEMA
11.5.3

KEY DOCUMENTS
- REALMFORGE_ARCHITECTURE_V11_27.md
- Realmforge_Production_Foundation_Audit_V11_27.txt
- SYSTEM_EXTRACTION_PROVENANCE_V11_27.txt
- CANONICAL_BUNDLE_PROVENANCE_V11_27.txt
- Realmforge_Development_Log_V1_to_V11_27_0.txt

PRODUCTION RULE
New work belongs in canonical Core/Data/Systems/UI modules. Historical compatibility is a temporary chronology bridge, not a place for new gameplay.
