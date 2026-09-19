Realmforge: Wanderer's Rise — V11.18.0 Canonical Interface & Codex

PRODUCTION FOUNDATION XIII
V11.18 moves the mature Database/Codex stack, navigation launcher, Living Vistas presentation and global modal/close-button UI infrastructure out of active compatibility while preserving exact historical execution order.

ACTIVE RUNTIME
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v11_18.js
5. js/dist/data_core_v11_18.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v11_18.js
8. js/legacy/compat_gameplay_ui_presentation_trimmed_v1153.js
9. js/dist/canonical_v11_18.js

NEW CANONICAL UI OWNERS
- js/ui/database.js: V9.4 Field Database, V10.61 Database Grid, V11.1 Location Directory and V11.3 Dungeon Codex/Magic database sector.
- js/ui/navigation.js: V10.38 custom navigation launcher.
- js/ui/presentation.js: V10.39–V10.41 Living Vistas/scene composition/rain plus V11.3.1 shared verdant count-tab styling.
- js/ui/overlays.js: V11.2.1 modal/background scroll lock and V11.2.3 close-button normalisation.

BOUNDARIES PRESERVED
- Gameplay systems remain owned by their existing canonical systems.
- V11.2 Requirement Integrity remains systems.skills even though it also contains the folded V11.1.1 Database close-button repair.
- V10.57/V10.54 continue to enrich navigation at their original chronological boundaries.
- V11.4 continues to enrich dungeon Database rows and world dungeon cards after the canonical V11.3 stage.

SAVE CONTRACT
Application version: 11.18.0
Save schema: 11.5.3
No player-state migration is required. Existing Equipment, both Ring slots, Tool Belt, Pack/Bank, skills/research, quests/flags, market/dungeon/crime/exploration/property state, active travel/combat, buffs, Energy carry and deliberate Pack overflow remain compatible.

See REALMFORGE_ARCHITECTURE_V11_18.md and Realmforge_Production_Foundation_Audit_V11_18.txt for the ownership map and extraction rationale.
