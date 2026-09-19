# Realmforge V11.14 Production Architecture

## Objective
V11.14 extracts Field Research/Living Encounters, modern Workshop/Crafting, and Skills/Mastery requirement integrity before V12 adds Sigilcrafting, Herblore, Cooking expansion, Hunting overhaul, Schematics and cross-skill endgame crafting.

## Active runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_14.js`
5. `js/dist/data_core_v11_14.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v11_14.js`
8. `js/legacy/compat_gameplay_research_skills_trimmed_v1153.js`
9. `js/dist/canonical_v11_14.js`

## Canonical ownership
### Research
`js/systems/research.js` owns V10.48 Field Identification, V10.49 Unknown Entity, V11.5.2 Fieldcraft Research and V11.5.3 Living Encounters.

### Crafting
`js/systems/crafting.js` owns V10.15 Crafting Requirements, V10.18 Forge & Filters, V10.19 Greenvale Workshop and V10.28 Village Workshop.

### Skills
`js/systems/skills.js` owns V10.37 Mastery Grid and V11.2 Requirement Integrity, including effective-level normalization and exact requirement semantics.

## Historical execution contract
Exact extracted stage source is retained by its canonical owner and invoked by a tiny marker at the original chronological boundary. This preserves all later wrapper dependencies without keeping the implementation buried in compatibility.

## Deliberate seams
V5/V6/V7 remain frozen because each mixes several skilling, crafting, hunting, research, crime, exploration, combat and UI systems. V10.24 remains because it mixes Cooking with Greenvale property/resting. Current final Research behaviour is canonical despite older superseded research foundations remaining in those mixed fossils.

## Compatibility shrink
- V11.13 active compatibility: **780,574 bytes**
- V11.14 active compatibility: **690,619 bytes**
- Removed from compatibility: **89,955 bytes**
- Stages extracted: **10**

## Save contract
- Application version: `11.14.0`
- Save schema: `11.5.3`
- No player-state migration required.
- Research ranks/notes, encounter-hour stamps, skills, Equipment, Tool Belt and Pack overflow remain valid.

## V12 rule
New research/rare-creature work belongs in `systems.research`; new production/Schematics/forge flows in canonical crafting or future domain-specific Cooking/Herblore/Sigilcrafting systems; new skills/mastery requirements use `systems.skills`. No new historical patch chain.

## Validation status
- 190 JavaScript production/test sources pass `node --check` with 0 syntax failures.
- V11.13 ↔ V11.14 equivalence passes for hourly encounter generation, Fieldcraft profile/progress, Field Research and Nearby Creature secrecy UI, effective skill-level normalization, requirement text, Mastery Grid output, workshop craft analysis, workshop rendering and batch-start state.
- Advanced V11.13 campaign save loads through V11.14 with Equipment, Tool Belt, Pack, Bank, skill XP/levels, research ranks/notes, encounter-hour stamps, progression flags, dungeon history and lossless Pack overflow preserved.
- All retained Node regression harnesses from V11.7 onward pass.
- Runtime ownership contract reports canonical Research, Crafting and Skills with all 10 extracted stages installed.
- The known V10.9 `modalHTML` fake-DOM warning remains identical in reference and candidate harnesses and is not a V11.14 behavioural difference.
