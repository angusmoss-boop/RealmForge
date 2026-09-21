# Realmforge V11.30 Content Authoring Guide

## The rule
New V12+ **content** belongs in canonical content/config sources. New **mechanics** belong in the canonical system that owns the mechanic. Historical compatibility receives no new gameplay.

## Where to edit existing content
- `js/data/content/base/` — the nine original foundation tables: backgrounds, items, skills, locations, enemies, recipes, shop stock, quests and events.
- `js/data/content/legacy/` — the 87 historical content blocks, now grouped by subject instead of one 95 KB monolith.
- `js/data/config/` — static configuration grouped by domain: exploration, crime, services, commerce, equipment, world and dungeons.

The old `js/data/content_blocks_v11_9.js` and `js/data/world_config_v11_10.js` filenames are retained only as non-runtime pointers. Do not add content there.

## Where to add new V12 content
Put new content packs in:

`js/data/content/packs/`

Use `RF.Authoring.registerPack(...)` or the single-record helpers:

```js
RF.Authoring.item('mireglass_sword', {...});
RF.Authoring.enemy('bog_stalker', {...});
RF.Authoring.location('mirefen_gate', {...});
RF.Authoring.recipe('mireglass_sword_recipe', {...});
RF.Authoring.quest('mirefen_intro', {...});
```

Files in `js/data/content/packs/*.js` are automatically appended to the Data bundle in lexical filename order by the V11.30 content builder.

## Assets
V11.30 formalises `RF.Assets` / `data.assets` for future Android/web media.

```js
RF.Authoring.asset('regions.mirefen.map', {
  type: 'image',
  src: 'assets/regions/mirefen/map.webp'
});
```

Supported registry types are `image`, `audio`, `music`, `video`, `font` and `data`. Content records may reference asset IDs with fields such as `asset`, `image`, `portrait`, `music`, `audio`, `sound`, `sprite`, `iconAsset` or `backgroundAsset`; missing IDs are caught by authoring validation.

## Build and validate
After editing content, run:

```text
node tools/build_content.js
```

That command:
1. rebuilds the nine-file-runtime `js/data/base_content.js` from the readable base sources;
2. rebuilds `js/dist/data_core_v11_30.js` from the canonical Data source manifest plus content packs;
3. syntax-checks both generated payloads;
4. automatically runs the live `RF.Authoring.assertClean()` validation gate through `tools/validate_content.js`.

The manifest controlling source order is `tools/content_sources_v11_30.json`.

## Validation coverage
The live validator covers IDs and cross-references for items, enemies, locations, recipes, quests, skills, NPCs, perks, drops, recipe inputs/outputs, neighbours, NPC schedules, quest chains/objectives, shop stock, events, markets, ecosystems, service locations, burglary loot, equipment configuration, exploration pools, dungeon definitions and asset references.

## Production rule
Do not hand-edit generated production bundles. Edit readable sources, run the content builder, then run the normal regression suite before release.
