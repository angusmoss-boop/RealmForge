# Realmforge: Wanderer's Rise — Architecture V12.1

## Release
- Application: **12.1.0 — Forge & Fletch**
- Save schema: **11.5.3 (unchanged)**
- Baseline: V12.0.0 Saveguard, itself built on frozen V11.30.0 Production Foundation.

## Architectural intent
V12.1 is the first broad post-refactor gameplay-content expansion. It proves the V11.30 authoring architecture can grow Realmforge without reviving chronological patch files or moving mature save/gameplay ownership back into compatibility.

## Content ownership
The new progression is authored in one readable declarative pack:

`js/data/content/packs/10_forge_and_fletch.js`

The pack registers items, recipes and the static gathering-extension configuration through `RF.Authoring.registerPack`. It does not mutate generated bundles and it does not create `v12_1.js` gameplay patches.

Generated content remains built from `tools/content_sources_v12_1.json` by `tools/build_content.js` into `js/dist/data_core_v12_1.js`.

## Gathering extension boundary
Historical resource definitions are chronology-sensitive and are still established during the mature compatibility boot sequence. V12.1 therefore adds a canonical extension seam to `systems.gathering`:

- content pack defines `gathering.content.v12_1_forge_fletch` in `RF.Config`;
- `systems.gathering.applyConfiguredContent()` applies registered `gathering.content.*` definitions only after the historical resource tables exist;
- application is idempotent;
- resource ID collisions with differing definitions fail loudly;
- location resource lists append uniquely rather than overwrite mature content.

This makes future V12 resource packs additive and declarative while leaving the frozen 64,639-byte compatibility runtime untouched.

## Authoring validation
`data.authoring` now validates live gathering data in addition to existing catalogue/config/assets checks:
- resource item references must resolve;
- resource skill references must resolve;
- resource levels must be positive;
- resource yields must be valid positive `[min,max]` ranges;
- location-resource keys must resolve to known locations;
- every location resource ID must resolve to a registered resource definition.

V12.1 finalisation runs after configured Gathering content is applied, so the release-time `RF.Authoring` report validates the actual live resource graph.

## Progression model
### Mining
Existing early progression is preserved. V12.1 adds:
- Cobalt Seam — Mining 16
- Redstone Vein — Mining 22
- Stariron Vein — Mining 30

### Woodcutting
Existing Oak/Willow/Alder/Yew progression is preserved. V12.1 adds:
- Ash Tree — Woodcutting 9
- Maple Tree — Woodcutting 18
- Ancient Ironwood — Woodcutting 28

### Production
Smithing gains Cobalt, Emberglass, Redsteel and Stariron bars plus armour/weapons/tools through Smithing 38. Crafting acts as the current Fletching surface and gains bows/arrows through Crafting 35.

No new Fletching skill is introduced in V12.1, intentionally avoiding unnecessary persistent-state/schema changes while still providing a full fletching gameplay progression.

## Arrow model
V12.1 uses the existing `arrow` ammunition item. Six fletching recipes require both a refined bar and timber, with increasingly efficient batch yields. No new ammo-consumption combat mechanic is introduced by this content release.

## Equipment balance
Equipment continues to use the established automatic requirement model:
- melee main hand → Attack
- ranged main hand → Archery
- armour/off-hand → Defence

Crafted Stariron forms the high-end reliable production ceiling but remains below Realmforge's strongest Legendary dungeon/relic gear. This preserves dungeon/rare-drop value while making skilling a dependable progression route.

## Persistence and Android/AAB direction
No persistent state shape changed. Save schema remains 11.5.3. All new content is catalogue/config data and therefore works with established campaigns without migrations.

No Capacitor/Android implementation was added. Platform APIs remain behind `RF.Platform`; the single canonical game source remains suitable for a future thin Android shell.

## Active runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v12_1.js`
5. `js/dist/data_core_v12_1.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v12_1.js`
8. `js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js`
9. `js/dist/canonical_v12_1.js`

## V12 rule retained
Future weapons, ores, bars, trees, recipes and ordinary equipment belong in canonical content packs/config. New mechanics belong in one clearly owned canonical system. Do not return to historical chronological patch-chain development.
