# Realmforge Architecture V12.7

## Release
**V12.7.0 — Fallen Memorials**

Save schema remains **12.6.0**. This release adds no new persistent campaign fields.

## Active runtime order
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v12_7.js`
5. `js/dist/data_core_v12_7.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v12_7.js`
8. `js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js`
9. `js/dist/canonical_v12_7.js`

## Canonical ownership change
`js/systems/hardcore.js` remains the final canonical owner for Hardcore campaign policy and is updated to V12.7 for fallen-memorial navigation, deletion and front-door presentation.

The fallen campaign itself is still represented by the existing persistent `campaign.mode === 'hardcore'` and `campaign.gameOver === true` state introduced in V12.5. No memorial-only save migration was added.

## Navigation precedence
The final Hardcore render guard now checks the campaign front-door state before applying the Game Over memorial override. This prevents passive world/UI redraws from repainting the memorial after the player deliberately returns to the main menu.

Reopening a fallen slot still clears main-menu state through the established campaign loader, causing the canonical Hardcore owner to render the memorial again. Gameplay remains blocked.

## Optional memorial deletion
Deletion uses the existing canonical `RF.Core.Campaigns.delete(id)` persistence API. The Game Over screen exposes it only after a dedicated in-app confirmation step. The persistence owner removes the slot index entry and all local verified slot copies. No inventory or gameplay-state mutation is involved.

## Front-door presentation
The final Hardcore owner wraps the already-installed `RF.V101.renderMainMenu` surface and decorates only slot metadata satisfying both `mode === 'hardcore'` and `gameOver === true`. Standard and living Hardcore cards are untouched.

## Frozen compatibility
`js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js` remains frozen at 64,639 bytes. No chronological V12.7 patch file is introduced.
