# Realmforge V11.29 Content Authoring Guide

## Goal
V11.29 adds a canonical authoring surface so future Realmforge content can be described as data rather than implemented by patching gameplay systems.

New content should use `RF.Authoring` and `RF.Catalog`. New static gameplay configuration should use `RF.Authoring.defineConfig(...)` / `RF.Config`.

Do **not** add new content to `js/legacy/compat_*`, `core.scopedRuntime`, or historical `v*.js` patch bodies.

## The simple route: a content pack
A content pack can register several related records together:

```js
RF.Authoring.registerPack({
  items: {
    mireglass_sword: {
      name: 'Mireglass Sword',
      icon: '⚔️',
      type: 'weapon',
      value: 420,
      damage: 12,
      slot: 'main',
      desc: 'A dark green blade forged from glassy Mirefen ore.'
    }
  },
  enemies: {
    bog_stalker: {
      name: 'Bog Stalker',
      icon: '🐊',
      hp: 120,
      damage: [8, 16],
      armor: 3,
      xp: 140,
      gold: [3, 10],
      level: 10,
      drops: [['mireglass_sword', 0.02, 1]]
    }
  }
});
```

`registerPack()` validates record shape as it registers content and then runs the full cross-reference validator. A broken reference therefore fails loudly during development rather than becoming a silent in-game bug.

A copy-ready example lives at `content_templates/realmforge_content_pack.example.js`.

## Single-record helpers
For small additions the short helpers are available:

```js
RF.Authoring.item('mireglass_sword', {...});
RF.Authoring.enemy('bog_stalker', {...});
RF.Authoring.location('mirefen_gate', {...});
RF.Authoring.recipe('mireglass_sword_recipe', {...});
RF.Authoring.quest('mirefen_intro', {...});
RF.Authoring.skill('example_skill', {...});
RF.Authoring.npc('example_npc', {...});
RF.Authoring.perk('example_perk', {...});
```

The generic forms remain available when needed:

```js
RF.Authoring.register('items', 'mireglass_sword', record);
RF.Authoring.registerMany('items', records);
```

Duplicate IDs are rejected unless an explicit replacement is requested. IDs must use lowercase letters, numbers and underscores.

## Static configuration
Use dotted configuration names:

```js
RF.Authoring.defineConfig('my_region.encounters', {
  mirefen_gate: [['bog_stalker', 3]]
});
```

`RF.Config` deep-freezes definitions. Gameplay systems should request configuration from the registry rather than mutate the source definition.

## What V11.29 validates
The authoring validator checks the current canonical content graph, including:

- item, enemy, location, recipe, quest, skill, NPC and perk record shape;
- enemy drop item IDs;
- recipe input/output item IDs and recipe skill IDs;
- location neighbour IDs;
- NPC homes and scheduled locations;
- perk prerequisites;
- quest `next` links and visit/kill/item/skill objective references;
- global shop-stock item IDs;
- event location IDs;
- market locations and stock items;
- ecosystem locations/enemies and the current eight-species invariant;
- bank/inn locations;
- burglary loot items;
- equipment balance item IDs;
- exploration enemy/item pools;
- live dungeon locations, bosses, rewards and materials;
- V11.4 dungeon entity/gear registrations.

Run:

```js
RF.Authoring.report()
```

for the complete structured report, or:

```js
RF.Authoring.assertClean()
```

to throw immediately if any authoring error exists.

`RF.Catalog.validate()` remains backward-compatible and returns error-message strings. `RF.Catalog.validateDetailed()` returns structured issues.

## Editing existing content
V11.29 establishes the validation API, but historical content is still physically reconstructed from `base_content.js` plus canonical historical content blocks. Do not hand-edit generated production bundles.

The next content-focused refactor can split those historical definitions into friendly region/category source files without changing their runtime shape. The desired end state is one obvious content file per area/type, validated by this V11.29 layer.

## Production rule
If an addition only changes **what exists** in Realmforge, prefer content/config data.

If it changes **how a mechanic works**, edit the canonical owner for that mechanic.

If it exists only to load an old campaign or preserve old execution chronology, it belongs in migration/compatibility infrastructure and should never receive new gameplay.
