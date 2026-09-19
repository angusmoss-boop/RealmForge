# Realmforge V11.23.0 - Canonical Character, Progression & Vault Ancestry

## Objective
Continue the Production Foundation strangler migration from the proven V11.22.0 runtime without gameplay redesign or save-schema change. V11.22.0 remains the behavioural reference.

## Active production runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_23.js`
5. `js/dist/data_core_v11_23.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v11_23.js`
8. `js/legacy/compat_gameplay_character_progression_trimmed_v1153.js`
9. `js/dist/canonical_v11_23.js`

The browser continues to load compact generated bundles while readable canonical sources remain under `js/core`, `js/data`, `js/platform`, `js/systems` and `js/ui`.

## Ownership changes

### `systems.character`
New canonical owner for historical Character/Progression ancestry. It owns exact V3 perk mechanics and perk modifiers, the V3 Character perk presentation, V10 character creation, and V10 skill/character level-up modal queueing.

This owner does not duplicate Skills or Equipment. It provides the Character-level/perk/milestone substrate those systems extend.

### `systems.inventory`
Inventory now owns the historical Pack/Bank foundations from V8.2, the complete V10.10 Greenvale Vault stage, and V10.12 Pack/Bank/stability fragments. Later V10.42+ modern Vault and V10.56 overflow behavior remain the authoritative later layers in the same canonical owner.

### `systems.equipment`
Equipment gains the V3 Bulwark armour hook and expanded Equipment presentation ancestry plus the V8.2 equipment requirement/action foundation. Modern detached loadouts, eight slots, dual Rings and the V11.5 Loadout Manager remain unchanged.

### `systems.gathering`
Gathering gains V8.2 mastery work requirements/power plus its mastery popup enrichment and V10 Instant Harvest ancestry. V10.22 continuous gathering remains in the same canonical owner.

### `systems.combat`
Combat gains V3 combat technique/perk/UI ancestry, V8.2 combat feedback and the V10 battle-summary foundation. Modern tactical Combat continues to extend these stages chronologically.

### `systems.travel`
Travel gains the V3 Trailwise travel-duration hook. Modern routing, Travel Overlay, waypoint journeys, recovery and Clock Sentinel remain unchanged.

### `systems.skills`
Skills gains V10 skill inspection and V10.12 Skills/Crafting presentation ancestry beneath the later canonical Mastery Grid and requirement-integrity stages.

### `ui.itemBrowser`
Item Browser gains the V3 inventory rarity presentation and V10.12 stable sorting/Shop presentation ancestry. Modern Inventory, Commerce and Crafting remain the gameplay owners.

### `ui.developer`
Developer gains the small V10 Energy-testing control fragment beneath its existing V9.3 ancestry and V10.33 Build Beacon hardening.

## Historical execution strategy
All extracted bodies are exact classic-script slices from the active V11.22 compatibility runtime. Canonical modules load before compatibility, but historical bodies execute only when a guarded installer marker is reached at the original chronological position.

`historical position -> canonical installer -> exact historical body -> next stage`

The complete V10.10 stage is stored as an exact canonical Inventory historical stage rather than rewritten into modern Vault code.

## Compatibility result
V11.22 compatibility runtime: **235,853 bytes**  
V11.23 compatibility runtime: **189,383 bytes**  
Reduction: **46,470 bytes (19.70%)**

Exact historical implementation transferred: **52,348 characters**.

The difference between transferred source and compatibility-byte reduction is expected because guarded chronological installer markers remain in compatibility.

## Save contract
- Application version: `11.23.0`
- Save schema: `11.5.3`
- No persistent-state migration.
- Equipment and Tool Belt IDs are not rewritten.
- Ring I and Ring II remain independent and may hold identical item IDs when two physical copies exist.
- Pack overflow remains lossless and continues blocking time/travel until resolved.
- Active travel/routes and active combat remain supported by regression fixtures.

## Android / Capacitor direction
The Platform/Lifecycle boundaries created before V11.23 remain untouched. This pass reduces historical Character/Inventory/UI wrapper depth that a future Android shell would otherwise coexist with. No Android-only gameplay fork is introduced.

## Validation
- 311 shipped JavaScript files checked with `node --check`: **0 failures**.
- 45 executable Node regression harnesses: **45 PASS**.
- V11.22 -> V11.23 system/UI parity: **51/51 PASS**.
- Dedicated Character/Inventory foundations parity: **31/31 PASS**, covering perk purchase, perk-derived pricing/armour, character and skill level-up queues, Pack capacity, bank geography/transfers, Pack/Bank/Skills/Equipment UI, mastery work math and stable sorting.
- Advanced-save compatibility: **62/62 PASS** across established, active-travel and active-combat campaigns with populated Equipment/Tool Belt and identical Ring slots.
- Fresh V11.22 Full Source + only the 32-file V11.23 GitHub update: runtime contract, parity, save compatibility, targeted suite, all 45 harnesses, all 311 syntax checks, 9/9 runtime/precache references and four bundle reproductions **PASS**.
- The known V10.9 fake-DOM `modalHTML` warning remains equivalent in reference and candidate harnesses.

## Recommended next audit
V11.24 should inspect the remaining mixed foundation giants rather than choose a version by size alone. The largest residual stages are V4 (~28.3k chars), V7 (~26.8k), V9 (~22.2k), V3 (~10.3k), V11.4 (~9.7k), V8 (~8.1k) and V10 (~7.8k).

The promising next boundary is **World Actions / Events / Dungeon ancestry and specialist V7 residue**, with an audit deciding which fragments can move into existing World, Social, Dungeons, Exploration/Locks, Crafting/Fieldcraft and UI owners without reopening already-canonical Combat or Travel.
