# Realmforge V11.13 Production Architecture

## Objective
V11.13 extracts the mature Combat, Equipment / Tool Belt, and modern Pack / Vault / over-encumbrance layers that V12 Magic, crafted gear, set bonuses, resurrection items and Saga bosses will extend.

## Active runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_13.js`
5. `js/dist/data_core_v11_13.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v11_13.js`
8. `js/legacy/compat_gameplay_combat_loadout_trimmed_v1153.js`
9. `js/dist/canonical_v11_13.js`

## Canonical ownership

### Combat
`js/systems/combat.js` owns 8 mature historical stages: V8.1 Combat & Cadence, V10.35 Battle Lines, V10.36 Battle Intel, V10.57 Battle Categories, V10.58 Battle Tabs, V10.59 Stable Battle Tabs, V10.60 Full Battle Frame and V11.3.2 Battle Reward Flow.

### Equipment / Tool Belt
`js/systems/equipment.js` owns 5 stages: V10.3 Tool Belt, V10.50 Loadout Pages, V10.53 Detached Loadout, V10.55 Loadout Balance and V11.5 Loadout Manager.

### Inventory / Vault / Encumbrance
`js/systems/inventory.js` owns 9 stages: V10.42–V10.47, V10.51, V10.52 and V10.56. This covers the modern Vault/Pack grid flow, three-vault model, quick stack and lossless over-encumbrance behaviour.

## Historical execution contract
The exact extracted implementation source is stored by its canonical owner. The compatibility timeline keeps a tiny installer marker at each original version boundary. This preserves chronological dependencies without leaving the implementation itself buried in the compatibility runtime.

## Deliberate legacy seams
V4 and V8.2 are mixed historical patches containing unrelated world/social/skilling code as well as combat/inventory foundations. They remain frozen in compatibility for this release rather than being split aggressively. V1 bootstrap primitives also remain under `legacy/base` pending a later bootstrap retirement pass.

## Compatibility shrink
- V11.12 active compatibility: **960,222 bytes**
- V11.13 active compatibility: **780,574 bytes**
- Removed from compatibility: **179,648 bytes**
- Mature stages extracted: **22**

## Save contract
- Application version: `11.13.0`
- Save schema: `11.5.3`
- No player-state migration is required.
- Existing detached Equipment and Tool Belt assignments remain valid.
- Pack overflow remains lossless.

## Validation status
Behavioural equivalence passed for Pack/Vault capacity and rendering, Equipment and Tool Belt rendering/operations, identical-ring slot handling, damage/armour totals, lossless over-capacity handling, battle-start state, Tactical Battle rendering and action categories. An advanced V11.12 campaign with active combat and populated loadouts loaded successfully through V11.13 with state preserved.

## V12 rule
New combat actions and Magic integration, equipment tiers/set bonuses, Tool Belt behaviour, Pack/Vault behaviour and encumbrance rules must be implemented in canonical systems, not a new `v12_x.js` patch chain.
