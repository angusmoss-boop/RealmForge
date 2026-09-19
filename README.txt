Realmforge: Wanderer's Rise — V11.20.0 Canonical Platform & Lifecycle

PRODUCTION RUNTIME
Realmforge remains an HTML/CSS/JavaScript PWA. The live browser runtime is the compact production chain below; readable canonical source stays under js/core, js/data, js/platform, js/systems and js/ui.

Active runtime order:
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v11_20.js
5. js/dist/data_core_v11_20.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v11_20.js
8. js/legacy/compat_gameplay_app_shell_trimmed_v1153.js
9. js/dist/canonical_v11_20.js

V11.20 PLATFORM / LIFECYCLE FOUNDATION
- core.lifecycle owns startup, offline catch-up, initial frame boot and service-worker bootstrap.
- Browser lifecycle visibility/resume events are exposed through RF.Platform.
- Travel still owns Clock Sentinel and travel recovery; Time/Energy still owns world-time and Energy mechanics.
- Save import/export fallback dialogs route through RF.Platform rather than direct prompt/alert calls.
- Modern Vault/Combat/Equipment haptics route through RF.Platform.
- Browser/PWA behavior remains unchanged; a future Capacitor adapter can replace these platform mechanics without rewriting gameplay systems.

Application version: 11.20.0
Save schema: 11.5.3

Existing campaigns remain compatible. Valid Equipment and Tool Belt items are never deleted or retroactively unequipped. Ring I and Ring II remain independent physical slots. Deliberate Pack overflow remains lossless and continues to block time/travel until resolved.

See REALMFORGE_ARCHITECTURE_V11_20.md, Realmforge_Production_Foundation_Audit_V11_20.txt, SYSTEM_EXTRACTION_PROVENANCE_V11_20.txt and CANONICAL_BUNDLE_PROVENANCE_V11_20.txt for the production-foundation record.
