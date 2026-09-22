# Realmforge Architecture V12.4.0

## Release purpose
V12.4.0 modernises Pack item details to the same information standard as the Living Codex and fixes a real persistence/reconciliation defect where historical starter-tool migration could repeatedly repopulate the Pack after the Tool Belt had moved to detached-copy ownership.

## Pack item-detail ownership
- New readable final owner: `js/ui/item_detail_modern.js`.
- Registered canonically as `ui.itemDetail` / `RF.Views.ItemDetail`.
- It loads after the Living Codex owner, so it can reuse the canonical Database recipe/use graph without duplicating content metadata.
- Historical Pack, Equipment and Tool Belt UI remains available as substrate; V12.4 takes final ownership only of `itemDetail` presentation/binding.
- No chronological `v12_4.js` patch file was introduced.

### Pack dossier information
When an owned Pack item is opened, the final dossier can expose:
- rarity/type and owned quantity;
- original authored item description plus contextual explanation of how that item behaves in Realmforge;
- damage, armour, restorative value, tool tier/power/control and base value where relevant;
- equip requirement and current player level;
- comparison against worn Equipment or the matching Tool Belt slot;
- Known Sources from the established item-source graph;
- Recipes & Uses from the V12.3 live production graph;
- contextual actions such as Use, Equip, Drop 1, Drop All and Close.

### Action-grid contract
- Actions use square tiles.
- Maximum columns: 4.
- Column count automatically contracts below four when fewer actions exist.
- Five or more actions wrap onto additional rows while remaining capped at four columns.
- The grid remains mobile-first and does not introduce horizontal overflow.

## Tool Belt integrity fix
### Root cause
`RF.migrateV6()` historically ensured the original starter kit existed in Pack every time that migration/normalisation path ran:
- Crude Pickaxe
- Crude Axe
- Reed Rod
- Flint Kit

Later V10.53 changed Equipment/Tool Belt to a detached-copy model: the equipped copy is intentionally removed from Pack and stored by slot identity. Because `migrateV6()` remained part of the canonical migration chain, modern saves could have those deliberately absent starter copies re-created after normalization/reload/update, even when superior tools were equipped.

### V12.4 rule
The historical V6 starter-kit seeding now runs only while `s.v1053.detached` has not been established. This change is applied in both:
- readable historical source `js/v6.js`; and
- canonical Fieldcraft historical-stage source in `js/systems/fieldcraft.js`.

This keeps the readable source and generated systems bundle reproducible.

### Safety semantics
- Modern detached saves: no starter-tool regeneration.
- New campaigns: starter-kit chronology still runs before detached conversion and remains valid.
- Genuinely old pre-detached saves: starter kit is still supplied for backward compatibility.
- Existing Pack copies are never auto-deleted. Realmforge cannot reliably distinguish an unwanted historical ghost copy from a legitimate spare, so V12.4 preserves inventory losslessly. Once the player removes an unwanted copy, it stays removed.

## Active runtime order
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v12_4.js`
5. `js/dist/data_core_v12_4.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v12_4.js`
8. `js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js`
9. `js/dist/canonical_v12_4.js`

## Persistence
- App version: 12.4.0
- Save schema: 11.5.3
- No new persistent V12.4 UI state.
- No schema migration.
- Saveguard campaign-identity protections remain unchanged.
- Equipment/Tool Belt detached-copy ownership remains authoritative.

## Android/AAB posture
No browser-specific gameplay API was introduced. The new dossier is presentation-only and uses existing canonical UI/data ownership. The migration fix is within the existing canonical system/migration source, preserving the single-codebase path to a future Capacitor/AAB shell.
