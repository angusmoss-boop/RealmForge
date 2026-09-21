# Realmforge V11.26.0 Architecture

## Release theme
**Canonical V4 Combat & Collection Foundations**

Save schema remains **11.5.3**.

## Active browser runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_26.js`
5. `js/dist/data_core_v11_26.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v11_26.js`
8. `js/legacy/compat_gameplay_combat_collection_trimmed_v1153.js`
9. `js/dist/canonical_v11_26.js`

All 9 active files exist and are service-worker precached.

## New / expanded canonical ownership

### `systems.combat`
Canonical Combat now owns the original V4 tactical move-pool bootstrap, the V4 tactical battle engine ancestry and the original V4 tactical combat renderer. Later V8/V9/V10/V11 combat layers still install on top at their original chronological boundaries, so mature battle behavior remains unchanged.

### `systems.collection`
New V11.26 owner for the V4 collection-log foundation. It owns item discovery tracking through the historical `RF.addItem` wrapper and the original Collection Log presentation. It does not own battle resolution, item storage, NPC dialogue or research.

### `systems.character`
Character now owns the V4 Character-page composition that presented Companion, Combat Specialisation, Home summary and Collection Log beneath the older Character page.

### `systems.property`
Property now owns the original V4 Greenvale cottage purchase action. Resting and later home-kitchen behavior remain in the same established Property owner.

## Historical execution rule
Every extracted source body is an exact slice of the active transformed V11.25 compatibility runtime. Canonical modules load before compatibility, but each historical body executes only when a guarded installer marker is reached at the exact former V4 position. Later wrappers therefore observe the same function stack and dependency order as before.

## Compatibility reduction
V11.25 compatibility runtime: **129,864 bytes**  
V11.26 compatibility runtime: **114,791 bytes**  
Reduction: **15,073 bytes (11.61%)**

Exact historical source transferred: **16,316 characters**.

## Save/loadout invariants
- Save schema remains `11.5.3`.
- Existing Equipment survives untouched, including identical occupied Ring I / Ring II.
- Existing Mining / Woodcutting / Fishing / Firemaking Tool Belt entries survive untouched.
- Pack overflow remains lossless and can continue to block time/travel without deleting inventory.
- Active multi-leg travel and active combat remain covered by the compatibility fixtures.
- Collection state, companion state, specialisation, home ownership and dungeon/world progression remain preserved.

## Validation
- 348/348 JavaScript syntax checks PASS.
- 57/57 executable Node regression harnesses PASS.
- V11.25 -> V11.26 parity: 64/64 PASS.
- V4 Combat / Collection targeted suite: 23/23 PASS.
- Advanced save compatibility: 68/68 PASS.
- 9/9 active runtime/precache checks PASS.
- 4/4 production bundle reproductions are byte-identical.

## Residual compatibility audit
Largest remaining historical patch bodies after V11.26:
- js/v8.js: 8,079 chars
- js/v10.js: 7,756 chars
- js/v3.js: 7,628 chars
- js/v10_9.js: 7,310 chars
- js/v10_21.js: 6,881 chars
- js/v4.js: 6,844 chars
- js/v7.js: 6,617 chars
- js/v10_7.js: 6,314 chars
- js/v10_11.js: 5,771 chars
- js/v10_1.js: 5,669 chars
- js/v10_2.js: 3,827 chars
- js/v8_2.js: 2,755 chars

## Next engineering seam
V11.27 should audit the remaining V8/V10/V3 runtime bridges and migrations before choosing a transfer. The compatibility layer is now dominated by small mixed wrappers rather than one giant stage, so ownership correctness matters more than raw byte removal.

## Incremental release validation

The production delta from V11.25.0 contains **27 changed/new files and no deletions**. A clean V11.25.0 Full Current Source tree was overlaid with only the V11.26 update pack and passed the V11.26 runtime contract, 64/64 parity checks, 68/68 advanced save checks, 23/23 targeted Combat/Collection checks, 57/57 retained executable Node harnesses, 348/348 JavaScript syntax checks, 9/9 runtime/precache checks, and 4/4 byte-for-byte bundle reproductions.
