# Realmforge V11.16.0 — Canonical Exploration, Crime & Homesteads

## Objective
Continue the Production Foundation strangler migration without gameplay changes or save-schema changes. V11.15 remains the behavioural reference.

## Active runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_16.js`
5. `js/dist/data_core_v11_16.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v11_16.js`
8. `js/legacy/compat_gameplay_exploration_crime_property_trimmed_v1153.js`
9. `js/dist/canonical_v11_16.js`

## Ownership changes
### Exploration
`systems.exploration` owns V10.25, V10.26, V10.34 and the V7 excavation fragment. It exposes exploration/chest/excavation entry points while retaining exact historical execution order.

### Shared Locks
`systems.locks` owns V10.27, V10.29 and V10.32. This is intentionally cross-cutting because exploration chests and burglary doors use one mature four-pin lock engine.

### Crime
`systems.crime` owns the V3 bounty primitives, V4 bounty resolution, the V9.2 reliable crime foundation, V10 pickpocket tuning, and dedicated V10.4/V10.5/V10.6/V10.8/V10.30/V10.31 crime stages. Mixed UI shells outside those precise fragments remain in compatibility until their owning UI/system layers are migrated.

### Property & Resting
`systems.property` owns the V4 home actions, V10 inn rest, and the whole V10.24 Hearth & Home stage. This transfers V10.24 away from Fieldcraft without changing its source or execution point. Cooking keeps compatibility aliases that delegate home-kitchen calls to Property.

## Compatibility strategy
Each whole historical stage is replaced in compatibility by a tiny installer marker. Mixed patches have only exact audited fragments replaced. The canonical owners inject the extracted classic-script source synchronously at the same chronological boundary, preserving the global-wrapper behaviour of the proven V11.15 runtime.

## Save contract
- App version: `11.16.0`
- Save schema: `11.5.3`
- No migration required
- Existing loadouts are never unequipped or deleted
- Existing Pack overflow remains lossless

## V12 extension rule
New exploration mechanics extend `systems.exploration`; new crime/jail systems extend `systems.crime`; all lock interactions extend `systems.locks`; houses/inns/rest buffs extend `systems.property`. Do not create a new version patch merely to mutate these systems.

## Validation
- 219 JavaScript files checked, 0 syntax failures.
- V11.15 versus V11.16 parity passed for exploration chest definitions, Explore energy, excavation, lock profiles/initialisation, bounty handling, pickpocket initialisation, burglary sites/cooldowns, home rest, inn rest and V10.24 home kitchen output.
- An advanced V11.15 campaign retained Equipment, Tool Belt, Pack, Bank, exploration chests, excavation records, bounty/heat/thefts, burglary cooldowns, property state, skills, progression flags, dungeon history and Pack overflow under V11.16.
- The known V10.9 fake-DOM warning is identical in both automated runtimes.
