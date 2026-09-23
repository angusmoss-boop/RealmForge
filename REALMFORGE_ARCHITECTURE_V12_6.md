# Realmforge Architecture V12.6.0

## Release purpose
V12.6.0 fixes the first-rung Smithing progression, gives the Greenvale Village Workshop a mobile-first canonical presentation, and expands the Energy economy to a 1000-point baseline without changing activity costs.

## Persistence and migration
- App version: `12.6.0`
- Save schema: `12.6.0`
- Explicit migration: `12.5.0 -> 12.6.0`
- Existing max/current Energy is converted using the old and new level curves while preserving fill ratio.
- Old curve: `100 + 2 × (level - 1)`.
- New curve: `1000 + 20 × (level - 1)`.
- A one-boot migration target protects the proportional current-Energy value from later historical normalizers during the same load.
- Standard, Hardcore and Fallen campaign semantics remain unchanged.

## Energy ownership
Readable final owner: `js/systems/energy_scale.js`, registered as `systems.energyScale`. It loads post-compatibility and owns the final max-Energy curve plus cap synchronization. Activity costs remain in their existing mature systems and are not multiplied.

## Workshop ownership
Readable final owner: `js/ui/workshop_modern.js`, registered as `ui.workshop`. It supersedes presentation of the historical V10.28 Workshop while preserving its category state, craft analysis, recipe selection and crafting handlers.

Workshop presentation contract:
- eight categories;
- fixed `repeat(4,minmax(0,1fr))` grid;
- two rows on the canonical category set;
- explicit width containment / `min-width:0`;
- no native `<select>`;
- top-right X close control;
- no bottom Leave Workshop action.

## Smithing content change
`js/data/content/legacy/40_recipes_crafting.js` now declares Bronze Bar at Smithing Level 1. Its 24 XP reward is unchanged, so two bars exceed the 45 XP needed for Smithing Level 2. Historical bundle-reproduction tests use a frozen pre-V12.6 copy of this readable source rather than rewriting old bundles.

## Active runtime order
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v12_6.js`
5. `js/dist/data_core_v12_6.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v12_6.js`
8. `js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js`
9. `js/dist/canonical_v12_6.js`

## Frozen compatibility
`js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js` remains exactly 64,639 bytes with SHA-256 `68d0283ff351fe7c285a04f06be84a2ef38f4cab0454910c0845d0cce6a4620e`. No compatibility archaeology was reopened.

## Android/AAB posture
The Workshop uses normal Realmforge DOM/UI primitives rather than a native browser selector, and Energy remains in canonical state/migration owners. No alternate Android gameplay path or browser-specific persistence was introduced.
