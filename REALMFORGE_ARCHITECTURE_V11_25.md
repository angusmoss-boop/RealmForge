# Realmforge V11.25.0 Architecture

## Release theme
**Canonical Dungeon & World Event Foundations**

Save schema remains **11.5.3**.

## Active browser runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_25.js`
5. `js/dist/data_core_v11_25.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v11_25.js`
8. `js/legacy/compat_gameplay_dungeon_world_events_trimmed_v1153.js`
9. `js/dist/canonical_v11_25.js`

All 9 active files exist and are service-worker precached.

## New / expanded canonical ownership

### `systems.dungeons`
The existing canonical V11.0 dungeon owner now also stores and installs the complete transformed **V11.4 Eightfold Dungeons** stage at the exact historical `js/v11_4.js` boundary. It also owns the small V3 Delve action-button ancestor. Active dungeon runs and saved V11.0 records remain the same structures.

### `systems.worldEvents`
New V11.25 owner for historical cross-system event hooks that wrap world pulses or completed travel. It does **not** own route planning, Clock Sentinel, Energy accounting, battle resolution, or encounter ecology.

### `systems.world`
Now owns the V4 base encounter ecology / `RF.fieldTables` / refresh foundation beneath the later V9.2 ecology enrichment.

### `systems.encounters`
Now owns the V4 Nearby Creatures presentation ancestor beneath later inspect-first encounter UI.

### `ui.worldActions`
Now also owns the old mixed V3/V4 world-card, event-modal, regional map/home composition and cross-system binding ancestry. Gameplay mechanics remain with their domain owners.

## Historical execution rule
Every extracted source body is an exact slice of the active transformed V11.24 compatibility runtime. Canonical modules load before compatibility, but source executes only when a guarded installer marker is reached at the exact former patch position. The full V11.4 stage follows the same rule.

## Compatibility reduction
V11.24 compatibility runtime: **148,946 bytes**  
V11.25 compatibility runtime: **129,864 bytes**  
Reduction: **19,082 bytes (12.81%)**

Exact historical source transferred: **21,119 characters**.

## Save/loadout invariants
- Save schema remains `11.5.3`.
- Existing Equipment survives untouched, including identical occupied Ring I / Ring II.
- Existing Mining / Woodcutting / Fishing / Firemaking Tool Belt entries survive untouched.
- Pack overflow remains lossless and can continue to block time/travel without deleting inventory.
- Active multi-leg travel and active combat state remain covered by the compatibility fixtures.
- Existing dungeon records and active dungeon structures are preserved.

## Validation
- 336/336 JavaScript syntax checks PASS.
- 53/53 executable Node regression harnesses PASS.
- V11.24 -> V11.25 parity: 55/55 PASS.
- Dungeon / World Event targeted suite: 24/24 PASS.
- Advanced save compatibility: 65/65 PASS.
- 9/9 active runtime/precache checks PASS.
- 4/4 production bundle reproductions are byte-identical.

## Residual compatibility audit
Largest remaining historical patch bodies after V11.25:
- js/v4.js: 21,688 chars
- js/v8.js: 8,079 chars
- js/v10.js: 7,756 chars
- js/v3.js: 7,628 chars
- js/v10_9.js: 7,310 chars
- js/v10_21.js: 6,881 chars
- js/v7.js: 6,617 chars
- js/v10_7.js: 6,314 chars
- js/v10_11.js: 5,771 chars
- js/v10_1.js: 5,669 chars
- js/v10_2.js: 3,827 chars
- js/v8_2.js: 2,755 chars

## Next engineering seam
V11.26 should audit the remaining V4 tactical-combat/collection/character-shell ancestry and the mixed V3 Delve/Prospector finish hook. The priority remains ownership correctness over raw byte removal.

## Update reconstruction
A fresh V11.24 Full Current Source plus only the 27-file V11.25 GitHub delta reproduces the validated V11.25 installation with zero deletions. Runtime contract, 55/55 parity, 65/65 save compatibility, 24/24 targeted checks, 53/53 retained executable harnesses, 336/336 syntax checks, 9/9 runtime/precache references and 4/4 bundle reproductions all pass.
