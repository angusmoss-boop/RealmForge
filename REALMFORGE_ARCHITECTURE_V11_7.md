# Realmforge V11.7 Production Architecture

## Objective
V11.7 establishes stable architectural boundaries before V12 expands the game. The proven V11.5.3 behaviour is quarantined as a frozen compatibility baseline while all future development targets canonical modules.

## Runtime layers

### 1. Bootstrap / platform
- `js/core/bootstrap.js` owns production namespaces and module registration.
- `js/platform/browser.js` is the browser/PWA platform adapter. Android/Capacitor can later provide a second adapter without rewriting game systems.

### 2. Frozen compatibility baseline
- `js/legacy/base/data.js`
- `js/legacy/base/state.js`
- `js/legacy/base/ui.js`
- `js/legacy/base/main.js`
- `js/legacy/compat_v1153.js`

These files are a compatibility implementation, not the location for new features. `compat_v1153.js` is byte-identical to the proven V11.6.1 compatibility runtime so gameplay semantics remain unchanged.

### 3. Canonical contracts
- `js/core/state.js` — state/save access facade.
- `js/core/migrations.js` — home of all new schema migrations.
- `js/data/catalog.js` — registration/query boundary for items, enemies, locations, quests, recipes and future content.
- `js/systems/inventory.js` — Pack/item contract.
- `js/systems/equipment.js` — Equipment/Tool Belt contract.
- `js/systems/travel.js` — routes/travel contract.
- `js/systems/combat.js` — battle contract.
- `js/systems/research.js` — encounters/Field Research contract.
- `js/systems/quests.js` — quests and Wayfinder contract; Sagas will grow here in V12.
- `js/systems/crafting.js` — crafting/cooking/brewing production contract.
- `js/systems/dungeons.js` — dungeon contract.
- `js/systems/commerce.js` — Markets/Bank contract.
- `js/ui/shell.js` — navigation/render/modal facade.
- `js/core/finalize.js` — application build metadata only.

## Status vocabulary
- `canonical`: implementation is owned by the new production architecture.
- `canonical-facade`: clean API exists, but the current implementation deliberately delegates to the frozen compatibility baseline.

V11.7 mostly establishes canonical facades. This is intentional. Replacing every mature system at once would recreate the regression risk that V11.6 was designed to eliminate.

## Migration strategy
Use a strangler migration:
1. Freeze legacy behaviour.
2. Put a canonical contract in front of it.
3. Write regression tests for that contract.
4. Reimplement one system behind the same API.
5. Compare save/gameplay behaviour.
6. Remove the corresponding legacy ownership only after parity is proven.

The public canonical API remains stable while the implementation changes underneath it.

## Recommended extraction order
1. Save/storage/migrations.
2. Data registries and content definitions.
3. Navigation/modal shell.
4. Inventory + Equipment/Tool Belt.
5. Travel + world progression/Wayfinder.
6. Combat + dungeons.
7. Gathering/crafting/Hunting.
8. Quests/Sagas.

This order gives V12 Sagas, Magic, regions and expanded crafting clean homes without forcing an all-at-once rewrite.

## V12 rule
No new feature should be introduced as `v12_x.js` that monkey-patches an older global function. V12 work should be placed in the appropriate canonical module or a new canonical module under the same folder structure.

## Save policy
- Game version and save schema remain separate.
- V11.7 game version: `11.7.0`.
- Current save schema: `11.5.3`.
- Existing historical migration wrappers remain untouched inside the compatibility baseline.
- New migrations are registered through `RF.Core.Migrations`.

## Android readiness
Platform-specific calls should go through `RF.Platform`. The browser/PWA adapter is present now; a future Capacitor adapter can implement the same boundary for Android back handling, filesystem-backed exports, haptics, lifecycle events and other native features.
