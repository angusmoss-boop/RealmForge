# Realmforge V11.28.0 Architecture

## Release theme
**Scoped Residual Execution & Final Migration Bridges**

Save schema remains **11.5.3**.
Production Foundation phase: **21**.
Architecture family: `canonical-systems-v11`.

## Active browser runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_28.js`
5. `js/dist/data_core_v11_28.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v11_28.js`
8. `js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js`
9. `js/dist/canonical_v11_28.js`

All 9 active production scripts exist and are service-worker precached.

## V11.28 ownership changes
V11.28 changes how the remaining difficult historical code executes rather than forcing mixed code into false single-domain owners.

### Canonical migrations
Historical migration function definitions for V3, V4, V7, V8, V8.3, V9, V9.1, V9.2, V9.3, V10 and V10.2 now live in `js/core/migrations.js` and are installed at their original historical boundaries through `RF.Core.Migrations.installHistoricalDefinition(...)`.

The compatibility runtime retains only the chronological installer/invocation bridge. Persistent semantics are unchanged and the active save schema remains 11.5.3.

### Scoped historical execution
`js/core/scoped_runtime.js` introduces canonical `core.scopedRuntime`.

It owns the complete historical V10.7 stage as an exact source capsule. V10.7 captures IIFE-local bases such as the pre-existing armour and enemy-turn functions, so ordinary fragment extraction would alter lexical scope. The scoped owner executes the whole stage as a classic-script capsule at the exact V10.7 historical boundary instead.

This is a containment mechanism for scope-sensitive historical code, not a destination for new gameplay.

### V8 ownership split
The old V8 mixed runtime now delegates coherent pieces to established owners:
- `systems.cadence`: V8 runtime configuration and real-time action/combat cadence.
- `systems.worldEvents`: road interruption/event mechanics.
- `systems.travel`: journey activity-card presentation bridge.
- `ui.presentation`: cooldown decoration and touch/render polish.
- `systems.timeEnergy`: speed-control rebinding bridge.

Migration definition ownership moved separately to Core migrations.

### Whole-stage transfers
- `js/v10_13.js` now executes from canonical `ui.presentation`.
- `js/v10_14.js` now executes from canonical `systems.inventory`.

Both retain their original historical execution positions.

## Compatibility reduction
V11.27 compatibility runtime: **84,320 bytes**  
V11.28 compatibility runtime: **64,639 bytes**  
Reduction: **19,681 bytes (23.34%)**

Exact historical implementation transferred this release: **23,162 characters across 21 transfers**.

## Deliberately retained residuals
The remaining compatibility runtime is now mostly chronology bridges and genuinely mixed historical code. In particular:
- V3 retains the combined Delve + Prospector `finishActivity` wrapper because Dungeon and Mining behavior share one captured wrapper.
- V4/V7 retain cross-domain initialization/migration-adjacent composition that does not have a truthful single owner.
- Remaining V8 code is only the residue that still depends on cross-owner wrapper timing after the clean cadence/travel/presentation/event pieces were removed.
- Other small historical patches remain in compatibility where extraction would create more architecture than it removes.

Largest remaining patch bodies after V11.28:
- `js/v7.js`: 6,149 chars
- `js/v4.js`: 5,836 chars
- `js/v3.js`: 5,722 chars
- `js/v10.js`: 3,758 chars
- `js/v8_2.js`: 2,755 chars
- `js/v9.js`: 2,688 chars
- `js/v9_2.js`: 2,359 chars
- `js/v10_2.js`: 2,179 chars
- `js/v8.js`: 2,004 chars
- `js/v9_3.js`: 1,834 chars
- `js/v8_3.js`: 1,782 chars
- `js/v9_1.js`: 1,507 chars


## Production bundle model
Readable canonical source remains the development source of truth. The browser continues to load four generated canonical bundles plus the small chronology compatibility runtime.

V11.28 adds `core.scopedRuntime` to the Save / Platform / Lifecycle bundle and `systems.cadence` to the Systems + UI bundle. Bundle source order is documented in `CANONICAL_BUNDLE_PROVENANCE_V11_28.txt` and reproduces all four production bundles byte-for-byte.

## Save/loadout invariants
- Save schema remains `11.5.3`.
- Existing Equipment is preserved, including identical occupied Ring I and Ring II.
- Mining, Woodcutting, Fishing and Firemaking Tool Belt entries remain preserved.
- Pack overflow remains lossless and may continue to block time/travel without deleting inventory.
- Active multi-leg travel and active combat remain represented in save compatibility fixtures.

## Validation
- 372/372 JavaScript syntax checks PASS.
- 65/65 executable Node regression harnesses PASS.
- V11.27 -> V11.28 behavioral parity: 71/71 PASS.
- Advanced save compatibility: 72/72 PASS.
- Scoped Residuals targeted suite: 47/47 PASS.
- 9/9 active runtime/service-worker checks PASS.
- 4/4 production bundles reproduce byte-for-byte.

## Incremental release validation
The production delta from V11.27.0 contains **31 changed/new files and no deletions**. A clean V11.27.0 Full Current Source tree overlaid with only the V11.28 update pack passed the V11.28 runtime contract, 71/71 parity checks, 72/72 advanced save checks, 47/47 Scoped Residuals checks, 65/65 executable Node harnesses, 372/372 JavaScript syntax checks, 9/9 runtime/precache checks and 4/4 byte-for-byte bundle reproductions. All 31 update payload files matched the V11.28 source tree byte-for-byte.

## Next engineering seam
V11.29 should focus on **final compatibility classification and content-authoring readiness**. The remaining compatibility layer is small enough that each survivor should now be classified as one of: extractable canonical gameplay, permanent historical chronology bridge, save migration compatibility, or safely retireable obsolete code. At the same time, the canonical Catalog/Config layer can begin receiving stronger content validation so V12 content growth does not recreate patch-era coupling.
