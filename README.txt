Realmforge: Wanderer's Rise — V11.21.0 Canonical World & Social Foundations

PRODUCTION RUNTIME
Realmforge remains an HTML/CSS/JavaScript PWA with a compact nine-file live production chain. Readable canonical source stays under js/core, js/data, js/platform, js/systems and js/ui.

Active runtime order:
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v11_21.js
5. js/dist/data_core_v11_21.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v11_21.js
8. js/legacy/compat_gameplay_world_social_trimmed_v1153.js
9. js/dist/canonical_v11_21.js

V11.21 WORLD / SOCIAL FOUNDATION
- systems.world owns the exact historical V2 Living World stage plus V9.2 encounter-ecology enrichment.
- systems.social owns V4 relationships/passers/dialogue/contracts and the V9.2 multi-stage dialogue foundation through exact chronological fragment installers.
- ui.presentation now also owns the V9.1 weather/time-responsive world-scene bridge.
- Existing Combat, Travel, Crime, Property, Research and other canonical owners remain unchanged.
- No gameplay redesign or persistent-state migration is introduced.

Application version: 11.21.0
Save schema: 11.5.3

Existing campaigns remain compatible. Valid Equipment and Tool Belt items are never deleted or retroactively unequipped. Ring I and Ring II remain independent physical slots. Deliberate Pack overflow remains lossless and continues to block time/travel until resolved.

See REALMFORGE_ARCHITECTURE_V11_21.md, Realmforge_Production_Foundation_Audit_V11_21.txt, SYSTEM_EXTRACTION_PROVENANCE_V11_21.txt and CANONICAL_BUNDLE_PROVENANCE_V11_21.txt for the production-foundation record.
