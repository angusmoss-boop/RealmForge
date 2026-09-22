Realmforge: Wanderer's Rise - V12.4.0 Pack Dossiers & Tool Belt Integrity

V12.4 modernises Pack item inspection and fixes the historical starter-tool regeneration bug without changing the save schema or deleting player inventory.

APPLICATION VERSION
12.4.0

SAVE SCHEMA
11.5.3 (unchanged)

ACTIVE PRODUCTION RUNTIME
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v12_4.js
5. js/dist/data_core_v12_4.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v12_4.js
8. js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js
9. js/dist/canonical_v12_4.js

V12.4 PACK DOSSIERS
- Added final canonical UI owner js/ui/item_detail_modern.js.
- Pack item taps now open a Codex-grade dossier with richer description/context, stats, requirements, equipment/tool comparison, Known Sources and Recipes & Uses where applicable.
- Actions are compact square tiles in a maximum four-column grid and wrap into additional rows as needed.
- Food exposes Use; equipment/tools expose Equip; Drop 1 / Drop All / Close remain available where valid.
- The dossier reuses live Database recipe/use knowledge rather than maintaining duplicate metadata.

V12.4 TOOL BELT INTEGRITY
- Fixed the V6 starter-kit normalizer re-granting Crude Pickaxe, Crude Axe, Reed Rod and Flint Kit after the detached Tool Belt migration had already run.
- Modern detached Tool Belt saves no longer regrow starter tools during normalize/reload/update.
- New campaigns and genuinely old pre-detached saves still receive the historical starter kit correctly.
- Existing Pack copies are preserved losslessly. V12.4 never guesses that an owned spare should be deleted.

FROZEN COMPATIBILITY
js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js remains 64,639 bytes and byte-identical to the frozen V11.30/V12 baseline.

KEY DOCUMENTS
- REALMFORGE_ARCHITECTURE_V12_4.md
- Realmforge_Production_Audit_V12_4.txt
- PACK_DOSSIER_TOOLBELT_PROVENANCE_V12_4.txt
- CANONICAL_BUNDLE_PROVENANCE_V12_4.txt
- Realmforge_Development_Log_V1_to_V12_4_0.txt
