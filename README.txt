Realmforge: Wanderer's Rise - V11.8.0 Canonical Save Core

PRODUCTION FOUNDATION III
V11.8.0 moves persistence ownership out of the historical compatibility runtime while preserving the proven V11.5.3 campaign format and gameplay behaviour.

ACTIVE RUNTIME
The shipped browser build now loads seven JavaScript files in this order:

1. js/legacy/base/data.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v11_8.js
5. js/legacy/base/main.js
6. js/legacy/compat_gameplay_v1153.js
7. js/dist/canonical_v11_8.js

WHY SAVE CORE LOADS EARLY
The canonical save/storage facade must exist before legacy main.js attempts to load a campaign. This prevents the historical patch chain from owning persistence during startup.

CANONICAL SAVE OWNERSHIP
- js/core/storage.js owns low-level persistence access through RF.Platform.active.storage.
- js/core/campaigns.js owns verified campaign slots, checksums, primary/backup/recovery copies and slot metadata.
- js/core/state.js owns RF.newGame, RF.save, RF.load, RF.exportSave, RF.importSave and campaign creation/import entry points.
- js/core/migrations.js owns the migration chain and all future schema-step registration.
- js/core/save_boot.js registers the historical compatibility normalizers after gameplay definitions exist, then reconciles the loaded campaign through the canonical chain.

COMPATIBILITY FORMAT PRESERVED
Existing browser saves keep the exact V9.5 storage keys and envelope format:
- realmforge_v95_slots
- realmforge_v95_active
- realmforge_v95_<slot>_primary
- realmforge_v95_<slot>_backup
- realmforge_v95_<slot>_recovery
- realmforge_save legacy mirror

Application version: 11.8.0
Save schema: 11.5.3

WHAT LEFT THE LEGACY LAYER
- The base state file no longer owns save/load/export/import.
- The old V9.5 save/storage/campaign-manager implementation was removed from the active gameplay compatibility runtime.
- Historical RF.newGame/RF.load/RF.importSave migration-wrapper ownership was removed from the active compatibility runtime.
- RF.V95.migrate is now canonical and delegates to RF.Core.Migrations.

WHAT REMAINS TEMPORARILY
The historical per-version migration function bodies still exist as compatibility normalizers beside the gameplay code that originally defined their required helpers/data. They no longer own loading or migration order. RF.Core.Migrations invokes them centrally. These bodies can be retired incrementally as each corresponding gameplay system becomes canonical.

PRODUCTION RULES
- New save migrations register through RF.Core.Migrations.
- New gameplay code must not wrap RF.save, RF.load, RF.importSave or RF.newGame.
- Gameplay systems must not call localStorage directly.
- New platform persistence goes through RF.Platform.
- New V12 features belong in canonical modules, not v12_x.js monkey patches.

VALIDATION
- Full-source JavaScript syntax check: PASS - 135 files, 0 failures.
- V11.7 -> V11.8 representative long-running campaign compatibility: PASS.
- Equipment / Tool Belt / Pack / Bank preservation: PASS.
- Research / world flags / dungeon records preservation: PASS.
- Save schema remains 11.5.3: PASS.
- Primary save corruption fallback to verified backup: PASS.
- Primary + backup corruption fallback to recovery copy: PASS.

See REALMFORGE_ARCHITECTURE_V11_8.md and Realmforge_Production_Foundation_Audit_V11_8.txt for details.
