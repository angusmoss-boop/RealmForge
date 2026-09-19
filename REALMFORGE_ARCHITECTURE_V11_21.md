# Realmforge V11.21.0 — Canonical World & Social Foundations

## Objective
Continue the Production Foundation strangler migration from the proven V11.20.0 baseline. V11.21 targets the largest remaining coherent world/social seams inside the mixed historical V2/V4/V9.1/V9.2 layers without redesigning gameplay or changing persistent state.

The release deliberately preserves canonical ownership already established for Combat, Travel, Crime, Property, Exploration, Research, Commerce, Time/Energy, UI shell and Platform/Lifecycle.

## Active production runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_21.js`
5. `js/dist/data_core_v11_21.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v11_21.js`
8. `js/legacy/compat_gameplay_world_social_trimmed_v1153.js`
9. `js/dist/canonical_v11_21.js`

The shipped browser/PWA runtime therefore remains nine JavaScript files. Readable canonical source remains under `js/core`, `js/data`, `js/platform`, `js/systems` and `js/ui`.

## New canonical ownership

### `systems.world`
`js/systems/world.js` now owns the exact transformed V2 Living World stage plus the V9.2 encounter-ecology enrichment.

The V2 stage establishes the historical substrate for:
- in-game hour helpers and NPC schedules;
- reputation/world-market state;
- world news and ambient NPC moments;
- world-pulse/day-change behavior;
- early event resolution and world-progression hooks;
- the original world/reputation presentation used by later layers.

The entire transformed V2 stage is retained byte-for-byte inside the canonical installer because it is a coherent historical Living World substrate whose cross-cutting wrappers are subsequently enriched or superseded by later canonical systems. It still executes at the original V2 chronological boundary.

The V9.2 ecology fragment owns the expanded `RF.fieldTables` population and encounter-density wrapper while leaving death handling, crime, inventory/shop categories and other V9.2 responsibilities in their existing owners/compatibility positions.

Future V12 world simulation, schedules, ambient world state and encounter-ecology work should extend `systems.world` rather than introduce version patches.

### `systems.social`
`js/systems/social.js` now owns audited exact fragments from V4 and V9.2:
- V4 relationships and deterministic passers;
- V4 named/passer dialogue entry and resolution;
- V4 collection-of-met-people support used by dialogue;
- V4 Wayfarer contract generation/progress/claim logic;
- V4 dialogue renderer primitives;
- V4 People Nearby rendering;
- V4 Wayfarer Guild quest-panel integration;
- V4 generic Talk routing into named/passers;
- V9.2 multi-stage/deeper dialogue followups and dialogue-effect routing.

The V4 tactical combat engine, encounter combat, mixed Character panel, Property actions, bounty UI and mixed binding wrapper remain outside Social ownership. This is intentionally fragment-level extraction rather than claiming the entire V4 stage.

Future V12 relationships, NPC conversation, passer/social memory and Wayfarer-style social contract development belongs in `systems.social`.

### `ui.presentation` enrichment
The old V9.1 weather/time-responsive scene bridge is now an exact historical fragment owned by `ui.presentation`.

This keeps the chronological scene evolution coherent: V9.1 establishes weather/time CSS classes before the later canonical Living Vistas/Vista Composition/Rainline stages replace the actual scene presentation.

## Historical execution strategy
Canonical World/Social modules are loaded in `systems_core_v11_21.js`, but they do not eagerly execute historical behavior. The trimmed compatibility runtime retains tiny synchronous installer markers at each original chronological position.

This preserves the mature classic-script wrapper chain:

`historical position -> canonical installer -> exact source body -> next historical stage`

No source block was semantically rewritten during the ownership transfer.

## Existing ownership preserved
- Save / Storage / Campaigns / Migrations: canonical Core.
- App lifecycle / Platform bridge: `core.lifecycle` / `RF.Platform`.
- Combat: `systems.combat`.
- Travel / routing / Clock Sentinel: `systems.travel`.
- Crime / bounty / burglary / pickpocket: `systems.crime`.
- Property / homes / inns: `systems.property`.
- Exploration / Locks / Research / Crafting / Fieldcraft / Inventory / Equipment remain with their current canonical owners.
- Navigation / Database / Living Vistas / overlays / app shell / developer tooling remain with their current canonical UI owners.

## Compatibility result
V11.20 compatibility runtime: **314,471 bytes**  
V11.21 compatibility runtime: **284,029 bytes**  
Reduction: **30,442 bytes (9.68%)**

Exact historical source moved to canonical ownership in this release: **31,605 characters**.

The difference between source moved and runtime reduction is the small chronological installer/guard markers retained in compatibility.

## Save contract
- Application version: `11.21.0`
- Save schema: `11.5.3`
- No persistent-state migration required.
- Existing Equipment and Tool Belt assignments remain untouched.
- Two identical rings remain valid in Ring I/Ring II when two physical equipped copies exist.
- Pack overflow remains legal/lossless and continues blocking time/travel until corrected.
- Active travel/routes and active combat remain compatible.

## Android / Capacitor / AAB direction
V11.21 remains the shared HTML/CSS/JavaScript/PWA game. No Android fork or duplicate gameplay implementation is introduced.

V11.19/V11.20 already established the replaceable Platform/Lifecycle boundary. V11.21 reduces the amount of historical world/social logic that a future native shell must coexist with, while keeping the future Capacitor adapter thin and platform-focused.

## Validation
- 286 JavaScript files passed `node --check` with zero failures.
- 44 executable Node regression harnesses passed with zero failures.
- V11.20 -> V11.21 parity suite: **33/33 PASS**.
- V11.20 -> V11.21 advanced/active-state save compatibility: **52/52 PASS**.
- V11.21 runtime contract: PASS.
- Active production runtime/service-worker references: **9/9 PASS**.
- The known V10.9 fake-DOM `modalHTML` warning remains identical in reference and candidate runtimes.

## Recommended next extraction
V11.22 should audit the remaining **Encounter / Combat-adjacent world substrate and residual UI glue**, especially V9.1 inspect-first encounter UI, V8.3 deliberate-touch UI/travel repair remnants, V9.3 residual category/developer-era glue, and the still-mixed V4/V7 surfaces.

The next pass should continue fragment-level ownership tracing rather than remove a large historical stage by age alone.
