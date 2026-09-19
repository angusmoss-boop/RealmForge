# Realmforge V11.18.0 — Canonical Interface & Codex

## Objective
Continue the Production Foundation strangler migration from the proven V11.17.0 baseline by removing coherent, mature interface/presentation systems from the active compatibility runtime. V11.18 is architecture-only: no gameplay rebalance, content redesign or save-schema change.

The goal is to make Realmforge's future V12 + Capacitor/AAB packaging sit on top of explicit production owners instead of extending the historical patch chain.

## Active production runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_18.js`
5. `js/dist/data_core_v11_18.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v11_18.js`
8. `js/legacy/compat_gameplay_ui_presentation_trimmed_v1153.js`
9. `js/dist/canonical_v11_18.js`

The browser/PWA still loads nine compact runtime files. Readable production source remains split under `js/core`, `js/data`, `js/platform`, `js/systems` and `js/ui`; generated bundles under `js/dist` preserve the source order recorded in `CANONICAL_BUNDLE_PROVENANCE_V11_18.txt`.

## New canonical UI ownership

### `ui.database`
`js/ui/database.js` now owns the complete mature Database/Codex lineage:
- V9.4 Field Database foundation and details.
- V10.61 Database Grid, progression ordering and Research 3/3 enemy gating.
- V11.1 Location Directory / Facilities & Services enrichment.
- V11.3 Dungeons and Magic sectors / Dungeon Codex.

The public owner is `RF.Views.Database`. Existing `RF.UI.database`, `RF.v94DetailHtml`, `RF.V1061`, `RF.V111` and `RF.V113` contracts remain available because later mature patches still extend them.

### `ui.navigation`
`js/ui/navigation.js` owns V10.38 Navigator Grid. `RF.Views.Navigation` is now the canonical home for the current launcher model and navigation presentation.

Later historical enrichments still execute at their original points: Equipment/Tool Belt additions, global Shop retirement and Magic navigation therefore remain identical to V11.17.

### `ui.presentation`
`js/ui/presentation.js` owns:
- V10.39 Living Vistas.
- V10.40 Vista Composition.
- V10.41 Rainline.
- V11.3.1 Verdant Count Tabs.

`RF.Views.Presentation` is the canonical presentation owner for the dynamic World scene and these shared visual refinements. No artwork/content or weather/time formula was changed.

### `ui.overlays`
`js/ui/overlays.js` owns:
- V11.2.1 modal/background scroll lock.
- V11.2.3 close-button normalisation.

`RF.Views.Overlays` therefore owns page-scroll containment and X-button normalisation. V9.6 clock pause/focus behaviour remains separately owned by `ui.focusClock`, because pausing simulated time and controlling document scrolling are different responsibilities.

## Existing ownership preserved
- Save/Storage/Campaigns/Migrations: canonical Core.
- Content: `RF.Catalog` / canonical Data.
- Static world configuration: `RF.Config`.
- Travel/routing/Clock Sentinel: `systems.travel`.
- Time/Energy: `systems.timeEnergy`.
- Combat: `systems.combat`.
- Equipment/Tool Belt: `systems.equipment`.
- Inventory/Vault/encumbrance: `systems.inventory`.
- Research/Skills/Crafting/Fieldcraft: their existing canonical owners.
- Exploration/Locks/Crime/Property: their existing canonical owners.

## Compatibility strategy
The V11.5.3 chronological history remains the behavioural reference. V11.18 replaces 11 complete historical UI stages with tiny synchronous installer markers. The original stage source is stored in canonical UI modules and executes only when its historical marker is reached.

This preserves wrapper order. In particular, later stages that enrich navigation, Database records or dungeon/world presentation still see exactly the objects/functions they saw in V11.17.

## Save contract
- Application version: `11.18.0`
- Save schema: `11.5.3`
- No persistent-state migration introduced.
- Existing Equipment and Tool Belt loadouts remain detached and unchanged.
- Ring I and Ring II remain independent physical slots.
- Pack/Bank remain lossless, including deliberate Pack overflow.
- Existing Energy carry, active combat, active travel/routes, research, quests, markets, dungeons, crime, exploration, resources, property and buffs remain compatible.

## Compatibility runtime change
- V11.17: 428,249 bytes.
- V11.18: 344,736 bytes.
- Reduction: 83,513 bytes, approximately 19.5% of the V11.17 compatibility runtime.
- Exact historical source lifted this pass: 84,239 bytes.

## Android / AAB readiness
V11.18 deliberately introduces no Android-specific framework code. The production game remains ordinary HTML/CSS/JavaScript/PWA code, which is suitable for a later Capacitor WebView wrapper. The important architectural preparation is ownership: new V12 UI work now has canonical UI modules, while browser/native integration can continue behind `RF.Platform` rather than being scattered through new gameplay patches.

Before Play Store packaging, the remaining direct app-shell/build/lifecycle/browser integrations should be audited and routed through canonical Core/UI/Platform owners. This is a packaging concern, not a reason to rewrite established gameplay.

## Validation
- 248 JavaScript files checked with `node --check`: 0 failures.
- 26 executable Node regression harnesses: 26 passed, 0 failed.
- V11.17 -> V11.18 UI/system parity: 25/25 checks passed.
- V11.17 -> V11.18 advanced/active-state save compatibility: 46/46 checks passed.
- Database entries/details, Facilities, Dungeon Codex, final navigation, Living Vistas and overlay contracts are equivalent to V11.17.
- The historical V10.9 fake-DOM `modalHTML` warning appears identically in reference and candidate test runtimes.

## Recommended next extraction
V11.19 should target **Canonical App Shell / Developer & Build Infrastructure**. The strongest candidate is V10.33 Build Beacon + Developer binding repair, followed by carefully audited campaign-entry/app-shell pieces that currently use browser lifecycle/history/version APIs. That pass can strengthen `RF.Platform` ahead of Capacitor/AAB packaging while avoiding the deeply interleaved V3/V4/V7/V9 gameplay foundations until they have safer boundaries.
