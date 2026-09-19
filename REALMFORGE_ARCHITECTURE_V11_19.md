# Realmforge V11.19.0 — Canonical App Shell & Developer

## Objective
Continue the Production Foundation strangler migration from the proven V11.18.0 baseline, with priority on the browser/app boundary that a future Capacitor Android wrapper and AAB build will touch.

V11.19 is an architecture release. It does not rebalance gameplay, redesign content, or change the save schema. The target is campaign/startup UI ownership, Developer/build infrastructure, and a cleaner `RF.Platform` seam for browser-native operations.

## Active production runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_19.js`
5. `js/dist/data_core_v11_19.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v11_19.js`
8. `js/legacy/compat_gameplay_app_shell_trimmed_v1153.js`
9. `js/dist/canonical_v11_19.js`

The production browser/PWA still loads nine compact JavaScript files. Readable source remains under `js/core`, `js/data`, `js/platform`, `js/systems` and `js/ui`; generated bundle order and hashes are recorded in `CANONICAL_BUNDLE_PROVENANCE_V11_19.txt`.

## New canonical ownership

### `ui.appShell`
`js/ui/app_shell.js` now owns the mature campaign/startup shell that remained in compatibility:
- the complete transformed V9.5 campaign/options/navigation UI stage;
- the startup/front-door portion of V10.1.

The V9.5 persistence engine itself was already extracted in V11.8 and remains owned by canonical Save Core. V11.19 moves only the user-interface shell around those canonical campaign APIs.

V10.1 was deliberately split at a real responsibility boundary. Its main-menu/front-door code moves to App Shell; its repaired gathering and pickpocket gameplay remains in compatibility at the same historical position.

### `ui.developer`
`js/ui/developer.js` now owns the complete V10.33 Build Beacon / Developer repair stage. This includes:
- running/deployed build presentation;
- Developer page state and selection stability;
- developer action confirmations;
- final live-state Developer binding repair;
- Developer input/select render stability;
- travel/clock recovery controls exposed from the Developer page.

The original V10.33 stage still executes synchronously at the V10.33 historical boundary. After installation, only its deployed-build transport is redirected through the canonical platform adapter.

### `platform.browser` expansion
`js/platform/browser.js` remains the browser implementation of `RF.Platform.active` and now also owns:
- deployed-build text retrieval (`fetchBuildInfo`);
- current URL retrieval;
- history replacement/push;
- Back/popstate subscription;
- service-worker registration;
- clipboard copy (existing boundary, now used by base export flow).

`js/legacy/base/main.js` now asks the active platform adapter to copy exported save text and register the service worker rather than touching those browser APIs directly.

`ui.focusClock` retains ownership of V9.6 modal/select clock locking and Back-navigation semantics, but its history/popstate operations now use `RF.Platform.active` when available. This preserves behavior while allowing a future Capacitor adapter to replace the browser implementation.

## Existing ownership preserved
- Save / Storage / Campaigns / Migrations: canonical Core.
- Content: `RF.Catalog` / canonical Data.
- Static world configuration: `RF.Config`.
- Travel / routing / Clock Sentinel: `systems.travel`.
- Time / Energy: `systems.timeEnergy`.
- Combat: `systems.combat`.
- Equipment / Tool Belt: `systems.equipment`.
- Inventory / Vault / encumbrance: `systems.inventory`.
- Research / Skills / Crafting / Fieldcraft: their existing canonical owners.
- Exploration / Locks / Crime / Property: their existing canonical owners.
- Database / Navigation / Presentation / Overlay infrastructure: the V11.18 canonical UI owners.

## Compatibility strategy
The V11.5.3 chronological runtime remains the behavioral reference. V11.19 replaces two complete historical stages and one precise mixed-stage fragment with synchronous installer markers:
- V9.5 whole stage -> `ui.appShell`.
- V10.1 startup/front-door fragment -> `ui.appShell`.
- V10.33 whole stage -> `ui.developer`.

No stage is executed early simply because its source now lives in a canonical file. Later historical wrappers still see the same runtime objects in the same order.

## Save contract
- Application version: `11.19.0`
- Save schema: `11.5.3`
- No persistent-state migration introduced.
- Existing Equipment and Tool Belt selections remain detached and unchanged.
- Ring I and Ring II remain independent physical slots.
- Pack/Bank remain lossless, including deliberate Pack overflow.
- Existing Energy carry, active combat, active travel/routes, research, quests, markets, dungeons, crime, exploration, resources, property and buffs remain compatible.

## Compatibility runtime change
- V11.18: 344,736 bytes.
- V11.19: 314,471 bytes.
- Reduction: 30,265 bytes, approximately 8.8% of the V11.18 compatibility runtime.
- Exact historical source lifted this pass: 30,425 bytes.

The active compatibility layer is now below 315 KB, down from roughly 1.19 MB when the production-foundation extraction began.

## Android / Capacitor / AAB direction
V11.19 still does not introduce Capacitor or generate an AAB. Realmforge remains a normal HTML/CSS/JavaScript/PWA application.

The significant change is architectural: browser-native operations used by the shell now have an explicit adapter. A future Capacitor implementation can replace clipboard, Back navigation/history semantics, build/version transport and service-worker/no-service-worker behavior without rewriting gameplay systems.

This keeps the eventual Android project thin: native packaging should provide platform services and lifecycle integration, while the Realmforge game remains canonical web-source code shared with the browser/PWA build.

## Validation
- V11.18 -> V11.19 app-shell/system parity: PASS.
- V11.18 advanced/active-state save compatibility: PASS.
- Platform bridge harness: PASS for service-worker registration, clipboard export, deployed-build retrieval, Back registration and history guard operations.
- Runtime ownership contract: PASS.
- Save schema remains 11.5.3.
- The historical V10.9 fake-DOM `modalHTML` warning remains the same known test-harness warning in reference and candidate runtimes.

See `Realmforge_Production_Foundation_Audit_V11_19.txt` for final validation counts and `SYSTEM_EXTRACTION_PROVENANCE_V11_19.txt` for exact source ownership transfer.

## Recommended next extraction
V11.20 should perform a **Canonical Platform & Lifecycle** pass before actual Capacitor packaging. Audit the remaining active direct browser/lifecycle assumptions, especially visibility/focus/pageshow recovery, offline catch-up/startup behavior, import/export file affordances and any shell-level prompt/alert/history fallbacks. Keep gameplay formulas in their current owners. Once that seam is clean and Samsung regression-tested, Realmforge will be in a much better position to add a Capacitor Android project and produce debug AAB/APK packaging without entangling native code with historical gameplay.
