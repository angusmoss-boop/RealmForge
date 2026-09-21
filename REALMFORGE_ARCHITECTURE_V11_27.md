# Realmforge V11.27.0 Architecture

## Release theme
**Canonical Runtime Residuals & Migration Bridges**

Save schema remains **11.5.3**.

## Active browser runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_27.js`
5. `js/dist/data_core_v11_27.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v11_27.js`
8. `js/legacy/compat_gameplay_runtime_residuals_trimmed_v1153.js`
9. `js/dist/canonical_v11_27.js`

All 9 active files exist and are service-worker precached.

## Canonical residual ownership
V11.27 moves small, coherent historical runtime bridges out of compatibility without creating new competing gameplay stacks.

- **Inventory** owns the complete V10.9 Split Vault stage.
- **World Actions** owns V10.21 Decision Reliability plus the clean V3 perk/crime binding bridge.
- **Presentation** owns V10.11 layout styling and V10.2 skills/crime styling.
- **App Shell** owns the V10.11 campaign-state render guard.
- **Item Browser** owns V10.11 category-first ordering.
- **Gathering** owns the repaired V10.1 active-gathering tap path.
- **Crime** owns the repaired V10.1 pickpocket path.
- **Overlays** owns the V10 modal style, milestone/rest/skill/battle-summary renderer and modal bindings.
- **Fieldcraft** owns V10.2 campfire duration logic.
- **Character** owns the V10.2 Character-tab skills grid.
- **Commerce** owns the V3 Ironridge market presentation.
- **Dungeons** owns the clean V3 Delve action starter.

## Historical execution rule
Every extracted body is an exact slice of the active transformed V11.26 compatibility runtime. Canonical modules contain the source, but execution is still triggered by guarded installer markers at the original historical positions. This preserves wrapper order and dependency timing.

## Deliberate residuals
- V8 remains in compatibility because it mixes travel interruption state, shared action cooldowns, combat cadence, UI cooldown decoration and travel progress hooks.
- V10.7 remains pending because its coherent-looking pieces depend on IIFE-local captured bases; moving them without a scoped installer would alter lexical behavior.
- V3's combined Delve + Prospector `finishActivity` wrapper remains intact because splitting it would rewrite historical behavior. Only the clean Delve action starter moved.
- V4 and V7 migration/state normalizers remain cross-domain and are not assigned to a false single owner.

## Compatibility reduction
V11.26 compatibility runtime: **114,791 bytes**  
V11.27 compatibility runtime: **84,320 bytes**  
Reduction: **30,471 bytes (26.54%)**

Exact historical source transferred: **33,431 characters** across 16 fragments.

## Save/loadout invariants
- Save schema remains `11.5.3`.
- Existing Equipment survives untouched, including identical occupied Ring I / Ring II.
- Existing Mining / Woodcutting / Fishing / Firemaking Tool Belt entries survive untouched.
- Pack overflow remains lossless and can continue to block time/travel without deleting inventory.
- Active multi-leg travel and active combat remain covered by compatibility fixtures.

## Validation
- 359/359 JavaScript syntax checks PASS.
- 61/61 executable Node regression harnesses PASS.
- V11.26 -> V11.27 parity: 66/66 PASS.
- Runtime Residuals targeted suite: 20/20 PASS.
- Advanced save compatibility: 69/69 PASS.
- 9/9 active runtime/precache checks PASS.
- 4/4 production bundle reproductions are byte-identical.

## Residual compatibility audit
Largest remaining historical patch bodies after V11.27:
- js/v8.js: 8,081 chars
- js/v4.js: 6,844 chars
- js/v7.js: 6,617 chars
- js/v3.js: 6,426 chars
- js/v10_7.js: 6,315 chars
- js/v10.js: 3,891 chars
- js/v8_2.js: 2,755 chars
- js/v9.js: 2,731 chars
- js/v10_14.js: 2,582 chars
- js/v9_2.js: 2,472 chars
- js/v10_13.js: 2,137 chars
- js/v10_2.js: 2,085 chars

## Next engineering seam
V11.28 should audit **scoped residual execution**, especially V8 and V10.7. At this stage the remaining compatibility runtime is mostly mixed wrapper/migration code, so a scoped installer mechanism may be more valuable than forcing additional fragments through ordinary global-script extraction.

## Incremental release validation
The production delta from V11.26.0 contains **35 changed/new files and no deletions**. A clean V11.26.0 Full Current Source tree was overlaid with only the V11.27 update pack and passed the V11.27 runtime contract, 66/66 parity checks, 69/69 advanced save checks, 20/20 Runtime Residuals checks, 61/61 retained executable Node harnesses, 359/359 JavaScript syntax checks, 9/9 runtime/precache checks, and 4/4 byte-for-byte bundle reproductions.
