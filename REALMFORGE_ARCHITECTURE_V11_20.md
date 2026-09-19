# Realmforge V11.20.0 — Canonical Platform & Lifecycle

## Objective
Continue the Production Foundation strangler migration from the proven V11.19.0 baseline while preparing the shared HTML/CSS/JavaScript game for an eventual Capacitor Android shell and AAB distribution.

V11.20 is an architecture release. It intentionally preserves V11.19 gameplay, content, save format and historical execution semantics. The target is the remaining browser lifecycle/startup surface, not Travel recovery or Time/Energy gameplay ownership.

## Active production runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_20.js`
5. `js/dist/data_core_v11_20.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v11_20.js`
8. `js/legacy/compat_gameplay_app_shell_trimmed_v1153.js`
9. `js/dist/canonical_v11_20.js`

The browser/PWA therefore remains a compact nine-file production runtime. Readable canonical source remains under `js/core`, `js/data`, `js/platform`, `js/systems` and `js/ui`.

## New canonical ownership

### `core.lifecycle`
`js/core/lifecycle.js` now owns the historical application boot/startup IIFE previously embedded in `js/legacy/base/main.js`.

It owns:
- initial campaign load at the original boot boundary;
- the established offline catch-up calculation and cap;
- first render and master-frame launch;
- service-worker bootstrap through the active platform adapter;
- installation of the mature save import/export shell affordances.

The implementation preserves the previous V11.19 ordering and formulas. `RF.tick` itself deliberately remains in the legacy base for this pass because later canonical Travel/Time stages wrap or replace its behavior and a larger move would create unnecessary order risk.

### `platform.browser` lifecycle surface
The browser adapter now exposes the platform mechanics required by canonical lifecycle and the future Android wrapper:
- wall-clock time and monotonic time;
- text prompt and alert presentation;
- haptic/vibration request;
- visibility state;
- app resume/focus/pageshow subscription;
- clipboard copy;
- build/version retrieval;
- Back/popstate subscription and history guard operations;
- service-worker registration;
- browser storage.

A future Capacitor adapter can implement the same contract without gameplay systems reaching into browser-native APIs.

### Travel Clock Sentinel transport
`systems.travel` remains the owner of V11.2.2 Clock Sentinel, stalled-clock recovery and travel repair. V11.20 changes only how it hears about visibility/resume events: those browser lifecycle mechanics now arrive through `RF.Platform.active`.

This avoids duplicate clock ownership. Travel still decides what to repair; Platform only reports lifecycle events.

### Save import/export fallbacks
Canonical save/lifecycle code no longer calls raw `prompt` or `alert` directly. The browser implementation provides those fallbacks today; a future native adapter may replace them with Capacitor/native UI or another shell presentation.

### Haptics
The modern canonical Inventory, Equipment and Combat stages no longer call `navigator.vibrate` directly. They request haptics through the active platform adapter. The browser adapter preserves the existing short vibration behavior where supported.

## Existing ownership preserved
- Save / Storage / Campaigns / Migrations: canonical Core.
- Campaign/startup UI: `ui.appShell`.
- Build Beacon / Developer: `ui.developer`.
- Modal/select clock locking and Back semantics: `ui.focusClock`.
- Travel / routing / Clock Sentinel: `systems.travel`.
- Cross-cutting Time / Energy: `systems.timeEnergy`.
- Combat, Inventory, Equipment, Research, Skills, Crafting, Fieldcraft, Exploration, Locks, Crime, Property, Commerce and Dungeons remain with their existing canonical owners.

## Compatibility strategy
Unlike most recent releases, V11.20 does not remove another historical patch stage from the 314,471-byte compatibility bundle. The safe extraction target was instead the still-active legacy-base startup IIFE and raw browser lifecycle calls.

`js/legacy/base/main.js` shrinks from 11,782 bytes in V11.19 to 10,528 bytes in V11.20, a 1,254-byte reduction. The compatibility patch bundle remains byte-identical at 314,471 bytes.

Historical test harnesses now load frozen V11.18/V11.19 base-main fixtures when validating older bundles. This prevents a current V11.20 base-main dependency from contaminating regression tests for older architecture releases.

## Save contract
- Application version: `11.20.0`
- Save schema: `11.5.3`
- No persistent-state migration required.
- Valid Equipment and Tool Belt assignments remain untouched.
- Two identical Ring slots remain valid when backed by two physical equipped copies.
- Pack overflow remains lossless and over-capacity continues blocking time/travel.

## Android / Capacitor / AAB direction
V11.20 still does not add Capacitor or generate an APK/AAB. The deliberate sequencing is:
1. clean the platform/lifecycle contract while the PWA is proven on Samsung;
2. verify the browser adapter still reproduces existing behavior;
3. add a Capacitor adapter and Android project as a thin packaging layer;
4. keep V12 gameplay/content inside the same canonical web source rather than forking an Android implementation.

The resulting native shell should provide platform services and lifecycle signals while Realmforge's systems remain platform-agnostic.

## Validation
- Full JavaScript syntax validation: PASS.
- Retained executable Node regression harnesses: PASS.
- V11.19 -> V11.20 system/lifecycle parity: PASS.
- Advanced established-save, active-travel and active-combat compatibility: PASS.
- Dedicated platform/lifecycle adapter harness: PASS.
- Active production runtime and service-worker precache: PASS.
- Known V10.9 fake-DOM `modalHTML` warning remains reference-equivalent.

See `Realmforge_Production_Foundation_Audit_V11_20.txt` for exact validation counts and `SYSTEM_EXTRACTION_PROVENANCE_V11_20.txt` for the ownership transfer record.

## Recommended next extraction
After Samsung validation, V11.21 should return to the remaining compatibility archaeology with a **Canonical World & Social Foundations audit**. V4, V7, V9, V9.2 and related stages are now the largest live blocks, but they are heavily mixed. Audit them by concrete responsibility seams first, likely separating world/NPC/social/event foundations from residual combat/specialist UI. Do not remove an entire large stage merely because its file is old.

Once that boundary is proven, creating the first Capacitor Android wrapper/debug APK/AAB can proceed in parallel without waiting for every final legacy byte to disappear.
