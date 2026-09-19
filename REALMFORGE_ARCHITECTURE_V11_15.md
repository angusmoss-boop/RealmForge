# Realmforge V11.15 Production Architecture

## Objective
V11.15 extracts the legacy fieldcraft foundations before V12 expands Hunting, Fishing, Cooking, regional resources, Schematics, Herblore and Sigilcrafting. The goal is to give those systems stable canonical extension points without rewriting the mature V5/V6 mechanics in one risky pass.

## Active runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_15.js`
5. `js/dist/data_core_v11_15.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v11_15.js`
8. `js/legacy/compat_gameplay_fieldcraft_trimmed_v1153.js`
9. `js/dist/canonical_v11_15.js`

## Canonical ownership
### Fieldcraft substrate
`js/systems/fieldcraft.js` physically owns the historical runtime source for:
- V5 Hearth & Harvest (`js/v5.js`)
- V6 Hands On (`js/v6.js`)
- V10.24 Hearth & Home (`js/v10_24.js`)

It also owns three V7 fieldcraft-only fragments split from the mixed V7 stage at their original boundaries:
- `v7-rare-skilling`
- `v7-marsh-cooking`
- `v7-camp-extras`

These sources are installed at their original chronological positions by tiny compatibility markers. The fieldcraft source is the already-transformed production representation inherited from V11.14, so prior Save Core and Content Core ownership remains intact.

### Gathering
`js/systems/gathering.js` provides the supported canonical API for resource definitions/state, location resources, active gathering, tool resolution and rare fieldcraft finds.

### Fishing
`js/systems/fishing.js` provides the supported canonical API for fishing start/cast/reel/escape flow and active fishing state.

### Hunting
`js/systems/hunting.js` provides the supported canonical API for hunt start, tracking, strike resolution, failure and active hunt state.

### Cooking / Camp
`js/systems/cooking.js` provides the supported canonical API for campfire availability, camp cooking, cooking timing, fire lighting/resting and the existing Greenvale home-kitchen path.

## Why V5/V6 move as a canonical substrate
V5 and V6 are old, dense, order-sensitive stages that interleave gathering, fishing, hunting, cooking, firemaking, activity presentation and UI hooks. A line-by-line rewrite during the foundation pass would add regression risk without changing player-visible behaviour. V11.15 therefore uses the strangler pattern: the exact proven stage implementation moves out of compatibility, while clean domain APIs become the only supported surface for future work. Individual internals can now be replaced behind those APIs one domain at a time.

## Deliberate seams
- V10.24 mixes Cooking with Greenvale property/rest behaviour. The stage remains intact in canonical Fieldcraft for order safety, but future property/rest work should receive its own canonical owner.
- Other V7 crime/exploration/social blocks remain in compatibility. Only fieldcraft-specific V7 fragments were extracted here.
- Old bootstrap primitives under `legacy/base` remain for a later bootstrap-retirement pass.

## Compatibility shrink
- V11.14 active compatibility: **690,619 bytes**
- V11.15 active compatibility: **627,695 bytes**
- Removed from active compatibility: **62,924 bytes**
- Whole historical stages moved: **3**
- V7 fieldcraft fragments moved: **3**

## Save contract
- Application version: `11.15.0`
- Save schema: `11.5.3`
- No player-state migration required.
- Existing occupied Equipment and Tool Belt slots are preserved.
- Existing resource charge timestamps, camp state, buffs, fieldcraft statistics, rare finds/formulas, home ownership, skill XP/levels and Pack/Bank contents remain valid.
- Additive normalization may create missing `null` Tool Belt slots and lazily initialize resource-state entries for resources visible at the current location. Existing values are not overwritten.
- Pack overflow remains lossless and continues to block time/travel until corrected.

## V12 rule
New Gathering, Fishing, Hunting and Cooking development targets the canonical domain systems. New resources and recipes belong in canonical Data/Config. Do not add new `v12_x.js` fieldcraft patches. The V5/V6 substrate is compatibility history living behind canonical ownership, not the extension surface.

## Validation status
- 208 JavaScript production/test sources pass `node --check` with 0 syntax failures.
- V11.14 ↔ V11.15 parity passes for resource definitions, location-resource tables, camp recipes, equipped-tool resolution, active gathering, fishing, hunting, camp cooking, V7 rare skilling and V10.24 home cooking/panel behaviour.
- Advanced V11.14 campaign loads through V11.15 with Equipment, occupied Tool Belt assignments, Pack, Bank, existing resource-state entries, camp, buffs, fieldcraft statistics, rare finds/formulas, home state, skill XP/levels, progression flags, dungeon history and lossless Pack overflow preserved.
- Runtime ownership contract reports canonical Fieldcraft, Gathering, Fishing, Hunting and Cooking with all 3 historical stages and 3 V7 fragments installed.
- All retained executable Node regression harnesses pass.
- The known V10.9 `modalHTML` fake-DOM warning remains identical in reference and candidate harnesses and is not a V11.15 behavioural difference.
