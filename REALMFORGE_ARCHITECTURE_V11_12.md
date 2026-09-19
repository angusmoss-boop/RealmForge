# Realmforge V11.12 Production Architecture

## Objective
V11.12 extracts the road/progression-facing systems that V12 will expand heavily: routing/travel, quests and Wayfinder guidance.

## Active runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_12.js`
5. `js/dist/data_core_v11_12.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v11_12.js`
8. `js/legacy/compat_gameplay_world_quest_trimmed_v1153.js`
9. `js/dist/canonical_v11_12.js`

## Canonical ownership
### Travel / World Routing
`js/systems/travel.js` owns:
- V9 route graph and location-unlock routing helpers.
- V10.16 travel recovery and journey repair.
- V10.17 travel overlay and travel-combat suspension.
- V10.20 multi-leg/waypoint journeys and route-preview lifecycle.
- V11.2.2 Clock Sentinel recovery scheduler.

These mature stages are installed at their original chronological boundaries. Later cross-cutting historical patches may still extend them, but compatibility no longer owns the primary implementation.

### Quests
`js/systems/quests.js` owns the V9.3 quest discovery and journal interaction layer:
- Quest metadata.
- Available/active/completed journal rendering.
- Quest detail modal.
- Accept/abandon interactions.
- Quest UI bindings.

### Wayfinder
`js/systems/wayfinder.js` owns V11.5.1 contextual progression hints and narrative lock messaging.

## Compatibility shrink
V11.11 active compatibility: **1,026,996 bytes**.
V11.12 active compatibility: **960,222 bytes**.
Removed from compatibility: **66,774 bytes**.

## Save contract
Application version: `11.12.0`
Save schema: `11.5.3`
No player-state migration is required.

## V12 rule
Sagas, tutorial progression, region routing, transport and future Wayfinder notifications must be implemented in canonical modules rather than new `v12_x.js` monkey patches.
