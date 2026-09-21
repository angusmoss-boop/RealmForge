# Realmforge V12.0.0 Architecture — Saveguard

## Baseline
V11.30.0 remains the frozen Production Foundation baseline. V12.0.0 begins feature development by repairing and hardening persistence. Save schema remains `11.5.3`.

## Active runtime order
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v12_0.js`
5. `js/dist/data_core_v12_0.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v12_0.js`
8. `js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js`
9. `js/dist/canonical_v12_0.js`

The frozen compatibility runtime remains byte-identical to V11.30.0 and is not a V12 extension surface.

## Persistence ownership
`core.campaigns` owns verified campaign slots and the V9.5-compatible storage-key format. `core.state` owns public `RF.save`, `RF.load`, `RF.startNew`, export/import parsing and portable backup packaging. `core.lifecycle` may install save-transfer affordances but does not redefine save semantics. `ui.saveManager` owns the Options & Saves presentation and per-slot actions.

### Slot keys retained for backward compatibility
- `realmforge_v95_slots`
- `realmforge_v95_active`
- `realmforge_v95_<id>_primary`
- `realmforge_v95_<id>_backup`
- `realmforge_v95_<id>_recovery`
- `realmforge_v95_<id>_temp`
- `realmforge_save` legacy mirror

## V12 save invariants
1. A fresh campaign must be written to a new slot ID before becoming active.
2. A state already loaded from one slot cannot be written to another slot accidentally.
3. An unstamped fresh state cannot replace a verified slot whose campaign creation identity differs.
4. New slots begin with three readable local copies immediately.
5. Duplicate is non-activating by default.
6. Import always creates a separate slot.
7. Restart may replace the current slot only after a verified safety duplicate exists and uses an explicit identity-change path.
8. Primary/Backup/Recovery fallback remains ordered and checksum-verified.
9. A corrupt slot index is rebuilt from verified slot envelopes where possible.
10. Save/load and transfer remain behind `RF.Platform` so future Capacitor/Android storage/file adapters can replace browser facilities without gameplay changes.

## Portable backup format
V12 introduces a versioned `realmforge-save-backup` JSON package containing:
- backup format/version
- app version
- save schema
- export timestamp
- campaign/player labels
- checksum
- encoded campaign payload

Pre-V12 base64 text exports remain importable.

## Platform boundary
Browser file download and file selection are implemented by `RF.Platform.Browser.saveTextFile()` and `RF.Platform.Browser.pickTextFile()`. A future Android adapter should implement the same contract rather than introducing Android-specific save logic into game systems.

## V12 development rule
New persistence behavior belongs in canonical Core/UI modules. No V12 save feature may be added to the historical compatibility runtime or as chronological `v12_x.js` patch files.

## Content build continuity
`tools/content_sources_v12_0.json`, `tools/build_content.js` and `tools/validate_content.js` now target the V12 versioned data bundle, so future V12 content packs continue to rebuild the file actually loaded by production.
