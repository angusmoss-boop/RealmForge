Realmforge: Wanderer's Rise — V11.19.0 Canonical App Shell & Developer

PRODUCTION FOUNDATION XIV
V11.19 extracts the remaining campaign/startup shell and V10.33 Developer/Build Beacon infrastructure from active compatibility, then strengthens the browser platform boundary needed for future Capacitor/Android/AAB packaging.

ACTIVE RUNTIME
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v11_19.js
5. js/dist/data_core_v11_19.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v11_19.js
8. js/legacy/compat_gameplay_app_shell_trimmed_v1153.js
9. js/dist/canonical_v11_19.js

NEW / EXPANDED CANONICAL OWNERS
- js/ui/app_shell.js: V9.5 campaign/options UI plus the V10.1 startup/front door.
- js/ui/developer.js: V10.33 Build Beacon and final Developer tooling/binding layer.
- js/platform/browser.js: browser transport for storage, clipboard, build-info retrieval, Back/history, visibility and service-worker registration.

PLATFORM PREPARATION
- Save export clipboard uses RF.Platform.
- Service-worker registration uses RF.Platform.
- Build Beacon retrieval uses RF.Platform.
- V9.6 Back/history handling uses RF.Platform when available.
- No Capacitor dependency or Android project is introduced yet; V11.19 prepares the replaceable adapter seam first.

SAVE CONTRACT
Application version: 11.19.0
Save schema: 11.5.3
No player-state migration is required. Existing Equipment, both Ring slots, Tool Belt, Pack/Bank, skills/research, quests/flags, market/dungeon/crime/exploration/property state, active travel/combat, buffs, Energy carry and deliberate Pack overflow remain compatible.

COMPATIBILITY RUNTIME
V11.18: 344,736 bytes
V11.19: 314,471 bytes
Reduction: 30,265 bytes

See REALMFORGE_ARCHITECTURE_V11_19.md and Realmforge_Production_Foundation_Audit_V11_19.txt for details.
