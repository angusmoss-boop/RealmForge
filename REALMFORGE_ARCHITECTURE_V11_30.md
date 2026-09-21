# Realmforge V11.30.0 Architecture

## Release theme
**Canonical Content Sources & V12 Readiness**

Save schema remains **11.5.3**.  
Production Foundation phase: **23**.  
Architecture family: `canonical-systems-v11`.

V11.30 is the final V11 production-foundation release. Its purpose is not to add gameplay. It converts the canonical data layer into a practical authoring/build surface, freezes the fully classified compatibility runtime, formalises media ownership, and closes the V11 refactor with an explicit V12/Android readiness boundary.

## Active browser runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_30.js`
5. `js/dist/data_core_v11_30.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v11_30.js`
8. `js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js`
9. `js/dist/canonical_v11_30.js`

The browser/PWA runtime therefore remains exactly nine scripts. Readable content sources and build tooling are development inputs, not additional production script tags.

## Canonical content source decomposition

### Foundation tables
The former single `js/data/base_content.js` source is now generated from readable category files under `js/data/content/base/`:
- `10_backgrounds.js`
- `11_items.js`
- `12_skills.js`
- `13_locations.js`
- `14_enemies.js`
- `15_recipes.js`
- `16_shop_stock.js`
- `17_quests.js`
- `18_events.js`

`00_bootstrap.js` and `99_finalize.js` preserve the original runtime wrapper. The generated `js/data/base_content.js` remains the compact production-runtime payload and reproduces the V11.29 data graph exactly.

### Historical content blocks
The former ~95 KB `js/data/content_blocks_v11_9.js` development monolith is no longer the content-editing surface. Its 87 historical blocks are physically grouped under `js/data/content/legacy/` into Items, Locations, Creatures/Combat Data, Recipes/Crafting, Skills/Perks, People/Social, Quests/Events, World/Activity Data, and one explicitly mixed historical source.

`00_registry.js` preserves the original block registration/order contract. `99_finalize.js` completes the historical content stage. The old monolith filename remains only as a non-runtime pointer for archaeology and documentation.

### Canonical static configuration
The former `js/data/world_config_v11_10.js` development monolith is split under `js/data/config/` into:
- `exploration.js`
- `crime.js`
- `services.js`
- `commerce.js`
- `equipment.js`
- `world.js`
- `dungeons.js`

All 19 Config definitions reproduce the V11.29 configuration graph exactly. The old filename remains only as a pointer.

## Content packs and authoring workflow
New V12+ content belongs in `js/data/content/packs/` and should use `RF.Authoring` / `RF.Catalog` / `RF.Config` rather than chronological patches.

The normal content build path is:

```text
node tools/build_content.js
```

That build:
1. rebuilds `js/data/base_content.js` from the readable base sources;
2. rebuilds `js/dist/data_core_v11_30.js` from the canonical Data manifest plus content packs;
3. syntax-checks generated payloads;
4. runs `tools/validate_content.js` and requires `RF.Authoring.assertClean()`.

Source order is declared in `tools/content_sources_v11_30.json`. Content packs are appended in lexical filename order.

## Canonical asset ownership
`js/data/assets.js` registers canonical owner `data.assets` and exposes `RF.Assets`.

The registry supports `image`, `audio`, `music`, `video`, `font`, and `data` asset types. Content may reference registered asset IDs through fields including `asset`, `image`, `portrait`, `music`, `audio`, `sound`, `sprite`, `iconAsset`, and `backgroundAsset`.

V11.30 intentionally ships **zero real media assets**. The registry establishes the V12 seam without inventing placeholder production art/audio. Missing referenced IDs are authoring-validation errors.

## Content equivalence contract
V11.30 treats source reorganisation as an architecture change only.

Validated invariants:
- all nine foundation data tables are runtime-equivalent to V11.29;
- all 87 historical content blocks preserve IDs, metadata, semantics and reported order;
- all 19 canonical Config definitions preserve their V11.29 values;
- the live Catalog remains 170 items, 88 enemies and 21 locations;
- generated `base_content.js` reproduces byte-for-byte from its source manifest;
- generated `data_core_v11_30.js` reproduces byte-for-byte from its source manifest;
- no gameplay-system source changed.

Exact hashes/source order are recorded in `CONTENT_SOURCE_PROVENANCE_V11_30.txt` and `CANONICAL_BUNDLE_PROVENANCE_V11_30.txt`.

## Compatibility freeze
The compatibility runtime remains:

`js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js`

It is **64,639 bytes** and byte-identical to V11.29.

Its 93 historical boundaries remain fully classified:
- 80 canonical chronology bridges;
- 12 save/migration bridges;
- 1 mixed historical runtime survivor;
- 0 proven retireable/obsolete entries.

V11.30 does not chase a zero-byte legacy counter. The classified compatibility layer is frozen as quarantine/migration infrastructure. V12 ordinary gameplay/content development must not add to it.

## Save/loadout invariants
- Save schema remains `11.5.3`.
- No V11.30 persistent field or migration is added.
- Existing Equipment is preserved, including identical occupied Ring I and Ring II.
- Mining, Woodcutting, Fishing and Firemaking Tool Belt entries remain preserved.
- Pack/Bank contents and deliberate Pack overflow remain lossless.
- Active multi-leg travel and active combat remain covered by save fixtures.

## Platform / Android seam
`RF.Platform.Browser` already isolates browser-facing storage, clock/time, online state, prompts/alerts, vibration, visibility/resume, clipboard, build-info fetching, history/back navigation and service-worker registration.

V11.30 does not add Capacitor or Android code. The next phase should implement a thin Android platform adapter around the same canonical game source rather than forking gameplay.

The formal readiness assessment is in `V12_ANDROID_READINESS_AUDIT_V11_30.txt`.

## V11 completion rule
After V11.30:
- new content goes through canonical content/config/assets;
- new mechanics go through canonical Core/System/UI owners;
- compatibility is migration/chronology quarantine only;
- generated bundles are never hand-edited;
- the V11 production foundation is frozen except for genuine maintenance/hotfix needs.

## V12 opening seam
**V12.0 should be Android Foundation**: create the Capacitor/Android project, implement the native `RF.Platform` adapter, establish repeatable APK/AAB builds, verify save/update persistence on physical Samsung/Android devices, and add real application/store assets. Gameplay/content expansion can then proceed against a continuously tested native target.

## Release certification
The V11.29 -> V11.30 update contains **64 changed/new files and zero deletions**.

A clean V11.29.0 Full Current Source tree overlaid with only the V11.30 update payload produced a **631-file tree byte-for-byte identical** to the V11.30 candidate and passed:
- 73/73 executable Node regression harnesses;
- 428/428 JavaScript syntax checks;
- 75/75 V11.29 -> V11.30 behavioral parity checks;
- 76/76 advanced save compatibility checks;
- 16/16 Content Source / Asset Registry checks;
- V11.30 runtime contract, version 11.30.0 / schema 11.5.3;
- 9/9 active runtime/service-worker precache checks;
- 4/4 production-bundle byte reproductions;
- generated `base_content.js` byte reproduction;
- 64/64 update-payload byte matches;
- byte-identical frozen compatibility versus V11.29.

The known historical V10.9 fake-DOM `modalHTML.bind` warning remains equivalent between baseline/candidate harnesses and is not treated as a browser regression.
