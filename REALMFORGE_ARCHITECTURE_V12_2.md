# Realmforge: Wanderer's Rise — Architecture V12.2

## Release
- Application: **12.2.0 — Living Codex**
- Save schema: **11.5.3 (unchanged)**
- Baseline: V12.1.0 Forge & Fletch.

## Scope
V12.2 repairs the Database search interaction and modernises the Database/Codex presentation without reopening historical patch archaeology or changing persistent gameplay state.

## Root-cause repair
The active world clock intentionally refreshes Realmforge's visible UI roughly every 0.18 seconds while simulated time is running. The historical Database search input lived inside that fully redrawn page. On touch devices, focusing the input opened the keyboard, then the next passive clock render destroyed and recreated the input, immediately losing focus.

V12.2 fixes this at the final rendering boundary rather than pausing the game or altering the frozen time-energy chronology:
- `js/ui/database_modern.js` executes after the frozen compatibility stream in `canonical_v12_2.js`.
- While the Database search element marked `data-rf-live-edit="database-search"` owns focus, passive `RF.UI.render()` calls are held.
- Simulated time continues to advance normally.
- Any modal, combat, active action interface, navigation change or explicit Codex render remains allowed.
- Search result changes are rendered into the Database result region in-place rather than replacing the full page.

This keeps Android/PWA keyboard focus stable while preserving the mature world clock and active-state behavior.

## Final Database ownership
Historical Database stages remain the mature data/detail authority:
- `js/v9_4.js`
- `js/v10_61.js`
- `js/v11_1.js`
- `js/v11_3.js`

Canonical `js/ui/database.js` still owns and installs those stages. V12.2 adds a post-compatibility presentation layer:

`js/ui/database_modern.js`

This layer owns the final Database page markup, search/refine interactions, live result rendering and visual skin. It does not duplicate catalogue data or alter Database detail semantics.

## Category refiners
Refiner state is intentionally runtime UI state, not save state. No migration or schema change is required.

### Items
Derived from each item's canonical `type`:
- All
- Weapons
- Armour
- Tools
- Food
- Materials
- Ammo
- Utilities
- Trinkets
- Quest & Treasure

### Resources
Derived from each resource definition's canonical gathering `skill`:
- All
- Mining
- Woodcutting
- Fishing
- Foraging

### Recipes
Derived from each recipe's canonical production skill:
- All
- Smithing
- Fletching
- Crafting
- Cooking
- Herblore

Fletching remains part of the Crafting skill in persistent state. The Codex classifies a Crafting recipe as Fletching when it produces ammunition or a ranged bow, or is explicitly bow/arrow named. Generic Crafting excludes those records when the Crafting refiner is active. This provides useful discovery without inventing a new persistent skill.

## Search model
Search is richer than the historical name/subtitle filter while remaining catalogue-driven:
- Items: ID, name, subtitle, type, rarity, description and value.
- Resources: ID, name, subtitle, gathering skill, description, yield item ID/name.
- Recipes: ID, name, subtitle, skill, level, ingredient IDs/names and output IDs/names.
- Other Database sectors continue to search their established row name/subtitle representation.

Existing Field Research 3/3 bestiary gating is preserved. Dungeon and Magic sections are preserved.

## Interface design
The Living Codex presentation adds:
- Codex hero header and live record counter.
- Retained 4×2 Database sector navigation with a more compact premium treatment.
- Dedicated search workbench with clear action and focus state.
- Horizontally scrollable category chips with live category counts.
- Modern record cards with icon capsules, category/level badges and richer hierarchy.
- Designed empty states.
- Responsive one-column mobile and two-column wider result layouts.
- Refined existing Database detail modals using the established detail content and close behavior.

The interface remains data-first and uses no external assets, keeping the future Android/AAB shell thin.

## Persistence / compatibility
- Save schema remains **11.5.3**.
- No new persistent state is introduced.
- Existing `s.v94.dbType` / `s.v94.dbSearch` compatibility is retained.
- Refiner selection is session-local UI state.
- Equipment, Ring I/Ring II, Tool Belt, Pack, Bank, skills/XP, research, quests, markets, crime/cooldowns, property/buffs, collection, dungeon records, Energy, active travel and active combat are untouched.
- Frozen compatibility runtime remains `js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js` at 64,639 bytes.

## Active runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v12_2.js`
5. `js/dist/data_core_v12_2.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v12_2.js`
8. `js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js`
9. `js/dist/canonical_v12_2.js`

## V12 rule retained
Presentation upgrades belong in readable canonical UI modules loaded after any historical chronology they intentionally supersede. Content remains declarative. Persistent-state changes remain explicit/versioned. Do not revive chronological `v12_*.js` patch development.
