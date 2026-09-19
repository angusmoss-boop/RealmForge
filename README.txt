Realmforge: Wanderer's Rise — V11.22.0 Canonical Encounters & Interface Foundations

PRODUCTION RUNTIME
Realmforge remains an HTML/CSS/JavaScript PWA with a compact nine-file live production chain. Readable canonical source stays under js/core, js/data, js/platform, js/systems and js/ui.

Active runtime order:
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v11_22.js
5. js/dist/data_core_v11_22.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v11_22.js
8. js/legacy/compat_gameplay_encounter_interface_trimmed_v1153.js
9. js/dist/canonical_v11_22.js

V11.22 ENCOUNTER / INTERFACE FOUNDATION
- systems.encounters owns V9.1 inspect-first nearby-creature presentation/binding.
- systems.combat now also owns exact V8.3 cadence/motion, V9.1 Parry/focus and V9.2 defeat-XP fragments.
- systems.travel owns the remaining V8.3 travel-stall repair fragment.
- ui.itemBrowser owns the historical V8.3 deliberate item/crafting detail layer and V9.2/V9.3 category/filter/detail ancestry.
- systems.crime now owns the remaining V9.2 crime modal/binding/Reedmere presentation glue.
- ui.developer now owns the original V9.3 Developer shell/actions ancestry as well as V10.33.
- No gameplay redesign or persistent-state migration is introduced.

Application version: 11.22.0
Save schema: 11.5.3

Existing campaigns remain compatible. Valid Equipment and Tool Belt items are never deleted or retroactively unequipped. Ring I and Ring II remain independent physical slots. Deliberate Pack overflow remains lossless and continues to block time/travel until resolved.

CURRENT FOUNDATION DOCUMENTS
- REALMFORGE_ARCHITECTURE_V11_22.md
- Realmforge_Production_Foundation_Audit_V11_22.txt
- SYSTEM_EXTRACTION_PROVENANCE_V11_22.txt
- CANONICAL_BUNDLE_PROVENANCE_V11_22.txt
- Realmforge_Development_Log_V1_to_V11_22_0.txt

