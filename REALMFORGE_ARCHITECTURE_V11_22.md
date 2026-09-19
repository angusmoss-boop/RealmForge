# Realmforge V11.22.0 — Canonical Encounters & Interface Foundations

## Objective
Continue the Production Foundation strangler migration from the proven V11.21.0 runtime without gameplay redesign or save-schema change. V11.21.0 is the behavioural reference.

## Active production runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_22.js`
5. `js/dist/data_core_v11_22.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v11_22.js`
8. `js/legacy/compat_gameplay_encounter_interface_trimmed_v1153.js`
9. `js/dist/canonical_v11_22.js`

The browser continues to load compact generated production bundles. Readable canonical source remains under `js/core`, `js/data`, `js/platform`, `js/systems` and `js/ui`.

## Ownership changes

### `systems.encounters`
New canonical owner for the V9.1 inspect-first nearby-creature interaction layer. It owns the exact historical `Nearby Creatures` inspect presentation, enemy inspection entry point and matching inspect/fight/observe/leave binding fragment. Encounter selection is separated from tactical Combat ownership.

### `systems.combat` residual foundations
Combat gains exact historical ownership of:
- V8.3 cooldown-state / cadence / restrained combat-motion fragment.
- V9.1 Attack/Strength/Defence focus and Parry foundation.
- V9.2 defeat rule that clears partial Character/Skill XP while retaining attained levels.

Modern V11 combat stages remain unchanged and continue to extend these foundations chronologically.

### `systems.travel` residual repair
Travel now owns V8.3's remaining stalled-travel repair/watchdog fragment. This is distinct from, and chronologically earlier than, the canonical V10.16/V10.17/V10.20 Travel stack and V11.2.2 Clock Sentinel already owned by Travel.

### `ui.itemBrowser`
New canonical UI owner for historical inspect/filter/detail ancestry:
- V8.3 deliberate Shop/private-trade/Crafting inspect-first detail and confirm UI.
- V9.2 item-category classification and categorized inventory/shop presentation.
- V9.3 dropdown filter UI for inventory/shop/crafting.
- V9.3 item/bank/detail requirement presentation.

This layer is historical UI ancestry. Modern Inventory/Vault/Commerce/Crafting systems remain the authoritative gameplay owners.

### `systems.crime` residual presentation
Crime now also owns the remaining V9.2 pickpocket/burglary modal, crime binding and Reedmere crime-panel presentation fragments. The V9.2 crime state foundation and later dedicated Crime stages were already canonical.

### `ui.developer` ancestry
Developer now owns V9.3's original Developer page/shell and action/binding ancestry in addition to V10.33 Build Beacon/Developer hardening. One historical filter binding remains inside the V9.3 Developer binding slice because preserving the atomic wrapper is safer than rewriting it.

## Historical execution strategy
The extracted bodies are exact classic-script slices from the transformed V11.21 compatibility runtime. Canonical modules are loaded before compatibility, but extracted historical bodies execute only when a guarded installer marker is reached at the original patch position.

`historical position -> canonical installer -> exact source body -> next historical stage`

No extracted historical source body was semantically rewritten.

## Existing ownership preserved
- Save / Storage / Campaigns / Migrations: canonical Core.
- Platform / Lifecycle: `RF.Platform` and `core.lifecycle`.
- Time/Energy: `systems.timeEnergy`.
- Travel routing / Clock Sentinel: `systems.travel`.
- Combat: `systems.combat`.
- Inventory / Equipment / Tool Belt: their current canonical systems.
- Exploration / Locks / Crime / Property / Field Research / Crafting / Fieldcraft: existing canonical owners.
- World / Social: V11.21 canonical owners.
- Navigation / Database / Presentation / Overlays / App Shell / Developer: existing canonical UI owners.

## Compatibility result
V11.21 compatibility runtime: **284,029 bytes**  
V11.22 compatibility runtime: **235,853 bytes**  
Reduction: **48,176 bytes (16.96%)**

Exact historical source transferred in this pass: **50,059 characters**.

## Save contract
- Application version: `11.22.0`
- Save schema: `11.5.3`
- No persistent-state migration.
- Existing Equipment and Tool Belt assignments are not rewritten.
- Ring I and Ring II remain independent and may hold identical item IDs when two physical copies exist.
- Pack overflow remains lossless and continues to block time/travel until resolved.
- Active travel/routes and active combat are preserved by compatibility tests.

## Validation
- 299 JavaScript files checked with `node --check`: **0 failures**.
- 45 executable Node regression harnesses: **45 PASS**.
- V11.21 -> V11.22 parity suite: **43/43 PASS**.
- V11.21 -> V11.22 advanced/active-state save compatibility: **56/56 PASS**.
- V11.22 targeted residual-foundations suite: **18/18 PASS**.
- V11.22 runtime contract: **PASS**.
- Known V10.9 fake-DOM `modalHTML` warning is equivalent in reference and candidate VM harnesses.

## Android / Capacitor direction
V11.22 does not introduce an Android fork. The existing Platform/Lifecycle boundary remains the future Capacitor replacement seam. Removing encounter and residual interface ancestry from compatibility reduces the amount of historical global patch behavior that the native shell must coexist with while keeping one HTML/CSS/JavaScript game implementation.

## Recommended next audit
V11.23 should audit **Character / Progression & legacy Pack/Bank ancestry**. The largest remaining stages are still genuinely mixed: V4 (28,273 chars), V7 (26,812), V9 (22,247), V3 (16,650), V8.2 (15,264), V10 (14,762), V10.12 (11,563) and V10.10 (9,360).

The safest next seams appear to be V3 perk/character progression, V10 creator/skill/level presentation, and the pre-modern Pack/Bank/mastery UI foundations in V8.2/V10.10/V10.12, while leaving canonical Inventory/Equipment/Crafting/Combat as the authoritative gameplay owners. Audit must decide the actual boundary before extraction.
