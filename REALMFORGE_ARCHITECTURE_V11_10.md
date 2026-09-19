# Realmforge V11.10 Production Architecture

## Objective
V11.10 extracts static **world/gameplay configuration** from the historical compatibility runtime. Mature gameplay functions remain unchanged, but the tables they consume now belong to canonical `data.config` ownership.

## Active runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_10.js`
5. `js/dist/data_core_v11_10.js`
6. `js/legacy/base/main.js`
7. `js/legacy/compat_gameplay_config_trimmed_v1153.js`
8. `js/dist/canonical_v11_10.js`

## Canonical configuration ownership
`RF.Config` is now the supported immutable-source / mutable-clone registry for gameplay configuration. It owns **19 extracted configuration payloads** including:
- exploration chest tiers, local encounter fallbacks, local-find extras and regional chest gear pools;
- Greenvale burglary properties and their balance ladder;
- bank, inn and special-facility geography;
- all ten permanent local market definitions and stock tables;
- V10.55 equipment stat-balance data;
- base dungeon definitions, V11.4 dungeon additions/overrides and dungeon boss-home mapping;
- the fourteen eight-species regional combat ecosystems;
- V11.4 generated regional enemy/gear specification payloads.

Historical gameplay receives cloned values at the same execution points as V11.9, preserving mutation semantics and runtime ordering.

## Production rule
V12 static configuration belongs in canonical data/config modules. Systems may read configuration through `RF.Config`; they should not introduce patch-local mega-tables.

## Remaining compatibility layer
The compatibility layer now primarily owns mature gameplay implementation functions and a smaller number of behaviour-coupled definitions/factories. Boss drop factories and other data that depend directly on local helper functions remain candidates for later extraction alongside their owning gameplay systems.

## Save contract
Application version: `11.10.0`

Save schema: `11.5.3`

No player-state migration is required.
