# Realmforge V11.17.0 — Canonical Time & Energy

## Objective
Continue the Production Foundation strangler migration from the stable V11.16.0 behavioural baseline. V11.17 removes the remaining coherent cross-cutting clock/Energy ownership from the compatibility runtime without redesigning gameplay, changing the save schema, or duplicating Travel/Property ownership.

## Active runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_17.js`
5. `js/dist/data_core_v11_17.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v11_17.js`
8. `js/legacy/compat_gameplay_time_energy_trimmed_v1153.js`
9. `js/dist/canonical_v11_17.js`

The browser still loads nine compact runtime files. Readable canonical sources remain under `js/core`, `js/data`, `js/platform`, `js/systems` and `js/ui`; generated production bundles under `js/dist` preserve the explicit source order recorded in `CANONICAL_BUNDLE_PROVENANCE_V11_17.txt`.

## New canonical ownership

### Time & Energy
`systems.timeEnergy` is the canonical cross-cutting owner for the historical clock/Energy spine that did not already belong to Travel or Property.

It owns the complete historical V10.22 and V10.23 stages, with V10.22 delegating its exact continuous-gathering slice to `systems.gathering` at the original chronological position. It also owns exact historical fragments for:

- V8 Pause / 1× / limited 2× speed control and burst state.
- V8.3 deliberate manual-pause tracking.
- V10 Energy spending, active-action Energy wrappers, base recovery, campfire Energy recovery and Energy UI.
- V10.2's 0.8 game-minutes-per-real-second master world cadence.
- V10.26's non-travel combat clock capture/restore bridge.

The public canonical surface is `RF.Systems.TimeEnergy`. Mature globals remain available because current gameplay still depends on the established V11.16 contracts.

### UI Focus & Clock Locks
`ui.focusClock` owns the complete V9.6 App Shell & Focus stage. This includes modal/select clock snapshots, pause/restore behavior and Android/PWA Back unwinding. It is intentionally a UI owner rather than part of `systems.timeEnergy`, because its reason to pause time is interface focus ownership.

### Gathering
`systems.gathering` now additionally owns V10.22's exact continuous-gathering / Endurance Loop fragment. The fragment still executes during the V10.22 historical stage, but the implementation no longer lives inside Time/Energy or compatibility.

### Crime glue cleanup
`systems.crime` now also owns the two remaining coherent V10.2 pickpocket-feedback fragments:

- Failed-pickpocket bounty-result behavior.
- Failed-pickpocket modal/binding UI.

The shared V10.2 CSS block remains in compatibility because it also styles the historical Character skills grid. Splitting that style block would add churn without improving ownership.

### Property glue cleanup
The V10 `v10InnHere` location helper is folded into Property's existing `v10-inn-rest` historical fragment. Property remains the sole owner of inn/home recovery behavior.

## Deliberate ownership boundaries preserved

### Travel remains authoritative for roads and Clock Sentinel
`systems.travel` still owns V9 routing, V10.16 Travel Recovery, V10.17 Travel Overlay, V10.20 Waypoint Journeys and V11.2.2 Clock Sentinel. V11.17 does not duplicate its stalled-clock watchdog, journey sanitisation, travel-combat suspension/resume or route-plan logic.

V10.22 travel fatigue remains installed by `systems.timeEnergy` because that historical stage owns Energy requirement/spending, but it wraps the canonical Travel surface rather than becoming a second route owner.

### Property remains authoritative for rest destinations
`systems.property` still owns V4 home actions, V10 inn rest and V10.24 Hearth & Home. Time/Energy provides recovery mechanics used by those actions but does not own the inn/cottage decisions or kitchen/home UI.

### Inventory remains authoritative for over-encumbrance time blocking
`systems.inventory` retains V10.56's lossless Pack overflow and over-encumbrance guards around `advanceWorld`, `setSpeed`, travel, rest and time-costing activities. That block is an Inventory policy, not a second clock implementation.

### Exploration retains Explore-specific Energy rules
`systems.exploration` still owns the V10.26 Explore expedition Energy cost and Explore state repair. Only the generic combat clock bridge moved to Time/Energy.

## Compatibility strategy
Whole stages are replaced by tiny synchronous installer markers at the exact original version boundary. Mixed patches replace only audited exact source slices. The canonical owners execute the proven V11.16 historical source as classic-script code at that same position, preserving wrapper order and later dependencies.

V11.17 intentionally does not strip references merely because they mention time, Energy, Explore, Crime or Property. Remaining consumers include:

- V8 road interruptions/action cooldowns.
- V8.3 travel soft-lock recovery and other UI polish.
- V10 instant-harvest, level-up queue, battle summaries and skill UI.
- V10.1 mixed main-menu/gathering/pickpocket foundations.
- V10.33 Developer controls that call Energy/time/crime APIs.
- V7 and V9-era mixed context/social/world shells that reference excavation, research or crime alongside unrelated systems.

Those are consumers or genuinely mixed historical layers, not duplicate canonical owners.

## Save contract
- App version: `11.17.0`
- Save schema: `11.5.3`
- No new migration is required.
- Existing Equipment and Tool Belt assignments remain detached and unchanged.
- Two identical physical rings remain valid in Ring I and Ring II.
- Pack/Bank contents remain lossless.
- Existing deliberate Pack overflow remains legal and continues to block time/travel until corrected.
- Existing Energy/recovery carry, active travel, route plans and active combat state remain compatible.

## V12 extension rules
New general clock cadence, Energy recovery/spending and cross-cutting combat clock work belongs in `systems.timeEnergy`. Interface-driven pause/restore/Back behavior belongs in `ui.focusClock`. Travel route/recovery/watchdog behavior belongs in `systems.travel`; inn/home behavior belongs in `systems.property`; encumbrance policy belongs in `systems.inventory`; Explore-specific costs belong in `systems.exploration`.

Do not add new V12 version-patch wrappers for these responsibilities.

## Validation
- 197 JavaScript files under `js/`, 34 JavaScript test files and 3 other JavaScript runtime/support files were checked.
- 234 total JavaScript syntax checks, 0 failures.
- 23 executable Node regression harnesses passed, 0 failed.
- V11.16 ↔ V11.17 parity passed for Pause / 1× / 2×, Energy spending/recovery, world cadence, activity duration state, modal/select clock snapshots, combat clock capture/restore, travel Energy, Clock Sentinel blockers, inn/home/camp recovery, Explore, excavation, pickpocketing, burglary cooldowns, Property output and over-encumbrance blocking.
- Advanced save fixture preserved level/XP, gold, Pack, Bank, all occupied Equipment, both Rings, non-empty Tool Belt, skills/XP, research, quests, market state, world flags, dungeon records, crime state, exploration state, resource charges, Property state, buffs, Energy carry and deliberate Pack overflow.
- Separate active-travel and active-combat fixtures survived V11.16 → V11.17 load with loadouts unchanged.
- The known V10.9 fake-DOM `modalHTML` warning appears identically in the V11.16 reference and V11.17 candidate harnesses.

## Recommended next extraction
V11.18 should target **Canonical UI Shell / Database & World Presentation** rather than another mixed gameplay foundation. The safest high-value candidates are mature whole-stage UI layers such as V10.38 navigation, V10.39–V10.41 Living Vistas, V11.2.1 modal scroll lock, V11.2.3 close-button normalisation, the V9.4/V10.61 Database stack, V11.1 location facilities and V11.3 Dungeon Codex. This can remove a substantial block of compatibility while avoiding the deeply interleaved V3/V4/V7/V9 social/world foundations until their boundaries are better isolated.
