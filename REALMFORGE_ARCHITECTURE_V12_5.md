# Realmforge Architecture V12.5.0

## Release purpose
V12.5.0 introduces campaign-rule persistence for opt-in Hardcore characters and exposes death history on the Character page. Hardcore is implemented as a canonical post-compatibility gameplay owner so permanent death can intercept the mature defeat stack before any legacy recovery wrapper revives the player.

## Persisted campaign rules
V12.5 introduces a canonical `state.campaign` record:
- `mode`: `standard` or `hardcore`;
- `gameOver`: authoritative permanent-run termination flag;
- `endedAt`: timestamp written only when a Hardcore run falls;
- `death`: memorial record containing enemy id/name, day, minute, location and level.

Save schema advances from `11.5.3` to `12.5.0` through an explicit canonical migration. Existing saves become Standard campaigns. The migration never infers Hardcore status from character history or existing deaths.

## Hardcore ownership
Readable final owner: `js/systems/hardcore.js`.
Registered as `systems.hardcore` / `RF.CampaignMode`.

It loads inside the final canonical bundle after the frozen compatibility runtime and therefore owns the final wrappers for:
- Character Creator campaign-mode presentation/binding;
- Character-page Hardcore/Deaths presentation;
- final `RF.loseV4Battle` campaign-death policy;
- final `RF.UI.render` game-over gate.

No chronological `v12_5.js` patch file is introduced.

## Creation contract
- Standard remains the default.
- Choosing Hardcore first opens an explicit irreversible-choice warning.
- Hardcore is only committed when the player presses Enable Hardcore.
- `RF.newGame` and `RF.startNew` accept canonical `{mode}` / `{hardcore}` creation options.
- Restarting a living campaign preserves its mode.

## Permanent-death contract
On Hardcore defeat, before Standard defeat recovery can execute:
1. deaths increments once;
2. campaign is marked `hardcore` + `gameOver=true`;
3. final killer/day/time/location/level is recorded;
4. HP and Stamina are set to zero;
5. combat/activity are cleared;
6. world clock is frozen;
7. the final state is saved;
8. all subsequent rendering is gated to the memorial Game Over screen.

The Standard defeat chain is not modified and continues to perform its established recovery/penalty behavior.

## Memorial save semantics
A fallen Hardcore campaign is preserved rather than deleted. This keeps the run auditable/exportable and avoids destructive save handling.
- Loading a fallen slot renders the memorial and cannot resume gameplay.
- Duplicate preserves the fallen state.
- Export/import preserves the fallen state.
- Restart Campaign explicitly refuses fallen Hardcore state.
- New Character creates a separate campaign slot.

## Character records
- Hardcore: highlighted `HARDCORE CAMPAIGN` banner with one-life rule and ALIVE status while playable.
- Standard: visible lifetime `Deaths` counter backed by the existing `stats.deaths` value introduced historically in V9.2.
- Save-slot metadata carries mode/game-over status for Hardcore/Fallen labels.

## Active runtime order
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v12_5.js`
5. `js/dist/data_core_v12_5.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v12_5.js`
8. `js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js`
9. `js/dist/canonical_v12_5.js`

## Persistence
- App version: 12.5.0
- Save schema: 12.5.0
- Migration: 11.5.3 -> 12.5.0
- Equipment, Tool Belt, Pack/Bank, active travel/combat and all prior gameplay state remain lossless.
- Saveguard slot-identity/triple-copy protections remain authoritative.

## Android/AAB posture
Hardcore uses the existing canonical persistence and UI layers only. No browser-specific gameplay API or alternate Android state model was introduced, preserving the single-codebase path to a future thin Capacitor/AAB shell.
