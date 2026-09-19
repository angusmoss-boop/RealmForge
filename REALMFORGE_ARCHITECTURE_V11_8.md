# Realmforge V11.8 Production Architecture

## Objective
V11.8 is the first extraction in which a mature subsystem stops being owned by the V11.5.3 compatibility implementation. Save, storage and migration-chain ownership are now canonical production responsibilities.

The goal is not to change gameplay. It is to make campaign persistence safe, testable and platform-independent before V12 expands Realmforge substantially.

## Runtime order
The browser loads these production files in order:

1. `js/legacy/base/data.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_8.js`
5. `js/legacy/base/main.js`
6. `js/legacy/compat_gameplay_v1153.js`
7. `js/dist/canonical_v11_8.js`

`save_core_v11_8.js` loads before legacy `main.js` so persistence is already canonical when startup attempts to find/load a campaign.

## Canonical persistence ownership

### `js/platform/browser.js`
Browser/PWA adapter. It is the only active canonical layer that touches `localStorage` directly.

### `js/core/storage.js`
Low-level persistence transport. Gameplay code talks to this adapter rather than browser globals.

### `js/core/campaigns.js`
Owns the verified multi-campaign format:
- campaign index and active slot
- checksum envelopes
- primary save
- previous-save backup
- recovery snapshot
- temporary verified writes
- slot create/rename/delete/duplicate/load
- save-now and recovery health summaries

It deliberately preserves the V9.5 storage keys so existing installed campaigns remain readable without conversion.

### `js/core/state.js`
Owns the public compatibility endpoints:
- `RF.newGame`
- `RF.save`
- `RF.load`
- `RF.exportSave`
- `RF.importSave`
- `RF.startNew`
- `RF.importPrompt`

These names remain available so mature gameplay code does not need an all-at-once rewrite, but their implementation is canonical.

### `js/core/migrations.js`
Owns migration order and schema progression.

Two migration concepts are now deliberately separated:

1. **Historical normalizers**
   Existing per-version functions required to make old campaigns match the current V11.5.3 shape. They are registered centrally and invoked in a fixed order.

2. **Future schema migrations**
   New production migrations are registered as explicit `from -> to` schema steps through `RF.Core.Migrations.register()`.

No future feature should wrap `RF.load`, `RF.newGame`, `RF.importSave` or `RF.V95.migrate` to add another migration layer.

### `js/core/save_boot.js`
Runs only after the V11.5.3 gameplay compatibility layer has defined its historical normalizers. It installs the historical registry, normalizes current state once and reconciles the verified campaign-slot manager.

## Compatibility runtime change
The former `js/legacy/compat_v1153.js` remains archived in the full source, but the active application now uses:

`js/legacy/compat_gameplay_v1153.js`

This active compatibility runtime has the V9.5 save/storage manager and historical save/load/import wrapper chain stripped from it.

The active `js/legacy/base/state.js` also no longer defines persistence functions.

Historical migration function bodies have not all been rewritten yet. Some share patch-local helpers or state assumptions with the gameplay implementation that created them. They therefore remain compatibility normalizers temporarily, but the canonical migration registry is now the sole owner of their execution order.

## Save format contract
Application version: `11.8.0`

Current save schema: `11.5.3`

Existing keys remain:
- `realmforge_v95_slots`
- `realmforge_v95_active`
- `realmforge_v95_<id>_primary`
- `realmforge_v95_<id>_backup`
- `realmforge_v95_<id>_recovery`
- `realmforge_v95_<id>_temp`
- `realmforge_v95_<id>_recovery_at`
- `realmforge_save`

The legacy mirror remains temporarily because the old bootstrap still knows about it. It can be removed later when bootstrap/UI ownership migrates.

## Write safety
A campaign write follows the verified V9.5 model:

1. Serialize campaign state.
2. Wrap it in a checksum envelope.
3. Write to a temporary key.
4. Decode/verify the temporary copy.
5. Move the old valid primary to backup.
6. Periodically or forcibly preserve a recovery snapshot.
7. Write the new primary.
8. Decode/verify primary.
9. Remove temporary data.
10. Refresh slot metadata and legacy mirror.

A read attempts `primary -> backup -> recovery` in that order.

## Bootstrap safety
Historical compatibility patches can call `RF.save()` while they are still initialising. Before the full historical migration registry is installed, canonical `RF.save()` updates only the legacy mirror. It deliberately avoids rotating verified slot backups with partially bootstrapped state.

After `core.saveBoot` marks migrations ready, normal verified slot writes resume.

## V12 persistence rules
- Game version and save schema remain separate.
- Presentation/content updates do not bump save schema unless state shape actually changes.
- Schema changes must register an explicit migration in canonical core.
- Migration functions must be deterministic and idempotent where practical.
- Valid Equipment and Tool Belt loadouts must not be discarded by migration.
- If a migration must return an item to Pack, V10.56 overflow safety remains the required lossless fallback.
- Never silently delete unknown player-owned items to make a migration fit.
- Never use direct `localStorage` calls from gameplay systems.

## Validation contract
V11.8 tests cover:
- canonical ownership metadata
- creation and verification of campaign slots
- load/save round trips
- export/import round trips
- V11.7 save loading under V11.8
- representative high-level Equipment and Tool Belt preservation
- Pack and Bank preservation
- research, world flags and dungeon history preservation
- checksum fallback from corrupt primary to backup
- fallback from corrupt primary + backup to recovery

## Next extraction
The next recommended production extraction is **data registries/content definitions**. Realmforge now has a stable persistence boundary ready to store the much larger item, creature, region, Saga, spell and crafting ecosystem planned for V12.
