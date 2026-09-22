# Realmforge Architecture V12.3.0

## Release purpose
V12.3.0 extends the Living Codex from a reference browser into a production-knowledge graph. It adds recipe/use relationships to item and resource details and makes alphabetical ordering a final presentation contract for every Database result list.

## Database ownership
- Historical Database data/detail behavior remains in `js/ui/database.js`.
- Final post-compatibility Database presentation and enrichment remains owned by `js/ui/database_modern.js`.
- `RF.Views.Database.V123` is the V12.3 final Codex owner; the `V122` alias remains for continuity with the V12.2 presentation API.
- No historical Database stage or frozen compatibility source was edited.

## Recipe/use graph
- Recipe/use information is derived live from canonical data, not duplicated into a second hand-maintained table.
- `RF.DATA.recipes[*].inputs` is scanned for ordinary Smithing, Crafting/Fletching, Cooking and Herblore production.
- `RF.DATA.campRecipes` is also scanned, including primary `input`/`qty` and optional `extra` ingredients.
- Duplicate recipe paths are collapsed before rendering.
- Each use record exposes the crafted output, output quantity where relevant, recipe name, production discipline, required level and amount of the inspected ingredient consumed.
- Item details receive `Recipes & Uses` only when the item is actually consumed by one or more recipes.
- Resource details inherit the uses of the item produced by that harvest node, connecting gathering directly to downstream production.

## Alphabetical Database contract
- `RF.Views.Database.V123.filteredEntries()` applies category/search filtering first and then performs a case-insensitive, numeric-aware A-to-Z sort by displayed record name.
- The contract applies to All views and every refinement category.
- The same final ordering applies to Items, Resources, Recipes, Enemies, NPCs, Locations and Dungeons. Magic remains intentionally empty.
- Existing Bestiary 3/3 Research gating happens before the final alphabetical sort and remains intact.

## Existing Living Codex contracts preserved
- Focus-safe mobile search remains active while the world clock continues to advance.
- Refine chips remain responsive multi-row controls and cannot widen the mobile viewport.
- Item/Resource/Recipe filter definitions and live counts are unchanged.
- Existing detail content, location facilities, dungeon records and Magic placeholder remain intact.

## Active runtime order
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v12_3.js`
5. `js/dist/data_core_v12_3.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v12_3.js`
8. `js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js`
9. `js/dist/canonical_v12_3.js`

## Persistence
- App version: 12.3.0
- Save schema: 11.5.3
- No migration.
- No new persistent Codex state.
- Saveguard/campaign identity protections remain unchanged.

## Android/AAB posture
No browser-specific gameplay dependency was introduced. Recipe/use knowledge is computed from canonical content data, and the UI remains behind the existing presentation layer. The single-codebase/`RF.Platform` migration posture is unchanged.
