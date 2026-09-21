# Realmforge V11.24.0 - Canonical World Actions & Specialist Foundations

## Objective
Continue the Production Foundation strangler migration from the proven V11.23.0 runtime without gameplay redesign or save-schema change. V11.23.0 remains the behavioural reference.

## Active production runtime
1. `js/data/base_content.js`
2. `js/legacy/base/state.js`
3. `js/legacy/base/ui.js`
4. `js/dist/save_core_v11_24.js`
5. `js/dist/data_core_v11_24.js`
6. `js/legacy/base/main.js`
7. `js/dist/systems_core_v11_24.js`
8. `js/legacy/compat_gameplay_world_actions_specialist_trimmed_v1153.js`
9. `js/dist/canonical_v11_24.js`

Readable canonical sources remain under `js/core`, `js/data`, `js/platform`, `js/systems` and `js/ui`; the browser still loads the compact nine-file production chain.

## Ownership changes

### `systems.specialist`
New canonical owner for the shared V7 specialist-action coordinator and potion experimentation ancestry. It owns `RF.V7`, action timer cleanup/resume/tool helpers and the Herblore experimental bench mechanics. It does **not** own Lockpicking, Thieving, Smithing, Research, Excavation or Travel.

### `ui.worldActions`
New canonical UI coordinator for historical cross-system World/context presentation. It owns the V7 contextual action cards, V7 action modal renderer and mixed action bindings, plus V9 batch/pickpocket action-modal enrichment and quantity/focus binding glue.

This module is intentionally presentation/binding ownership only. The actions it exposes remain implemented by their canonical domain systems.

### Existing canonical owners extended
- `systems.world`: V7 Mirefen encounter tables and the road/Heron world-reveal hooks.
- `systems.locks`: V7 lockpicking timing/action foundation.
- `systems.crime`: V7 timed pickpocketing, V9 drifting-attention pickpocketing and V9 pick-timer cleanup.
- `systems.crafting`: V7 forge heat-control ancestry and V9 quantity-aware batch crafting.
- `systems.research`: V7 Bestiary field research action.
- `systems.combat`: V7 researched-target bonus plus V9 combat-focus/pooled-XP/Parry core and presentation.
- `systems.inventory`: V7 Antivenom special-use ancestry.
- `systems.character`: V7 Deep Roads records panel.
- `systems.travel`: V7 Mirefen discovery gate and natural Marsh Lights side-quest start on road commitment.
- `systems.commerce`: V9 quantity-aware buy/sell helpers.
- `ui.itemBrowser`: V9 quantity trade/private-trade/recipe detail presentation.

## Historical execution strategy
Every extracted source body is an exact slice of the active transformed V11.23 compatibility runtime. Canonical modules are loaded before compatibility, but fragments execute only when the compatibility chronology reaches a guarded installer marker at the exact old position.

`historical position -> canonical installer -> exact historical body -> next historical code`

This preserves wrapper order and dependencies such as `RF.v7Resume`, V7 Smithing before V9 batch Smithing, V7 Pickpocket before V9 attention replacement, and V9 combat-focus wrappers before later V9.1/V9.2 combat layers.

## Compatibility result
V11.23 compatibility runtime: **189,383 bytes**  
V11.24 compatibility runtime: **148,946 bytes**  
Reduction: **40,437 bytes (21.35%)**

Exact historical implementation transferred: **44,753 characters**.

The difference is expected because small guarded installer markers remain in compatibility to retain chronology.

## Save contract
- Application version: `11.24.0`
- Save schema: `11.5.3`
- No persistent-state migration.
- Equipment and Tool Belt identifiers are untouched.
- Ring I and Ring II remain independent and may contain identical item IDs when two physical copies exist.
- Pack overflow remains lossless and continues to block time/travel until resolved.
- Active travel/route state and active combat/clock state remain covered by compatibility fixtures.

## Android / Capacitor direction
The `RF.Platform` and canonical Lifecycle seams from V11.19-V11.20 remain unchanged. V11.24 removes another deep layer of cross-domain monkey-patching that a native Android shell would otherwise have to coexist with. Specialist gameplay and World-action presentation now have stable canonical homes before V12/AAB work.

## Validation
- 324 shipped JavaScript files checked with `node --check`: **0 failures**.
- 49 executable Node regression harnesses: **49 PASS**.
- V11.23 -> V11.24 system/UI parity: **55/55 PASS**.
- Dedicated World Actions/Specialist suite: **20/20 PASS**.
- Advanced save compatibility: **65/65 PASS** across established, active-travel and active-combat campaigns with populated Equipment/Tool Belt, identical Ring slots and deliberate Pack overflow.
- Active runtime/service-worker references: **9/9 PASS**.
- Fresh V11.23 Full Source + only the 36-file V11.24 GitHub update: runtime contract, 55/55 parity, 65/65 save compatibility, 20/20 targeted checks, all 49 retained harnesses, all 324 JavaScript syntax checks, 9/9 runtime/precache references and 4/4 bundle reproductions **PASS**.
- All four production bundles reproduce byte-for-byte from documented source order.
- The known historical V10.9 fake-DOM `modalHTML` warning remains identical in reference/candidate Node harnesses.

## Residual compatibility audit
Largest remaining active historical patch bodies after V11.24:
- V4: 28,281 chars
- V3: 10,268 chars
- V11.4: 9,672 chars
- V8: 8,081 chars
- V10: 7,762 chars
- V10.9: 7,313 chars
- V10.21: 6,881 chars
- V7: 6,617 chars
- V10.7: 6,315 chars
- V10.11: 5,771 chars
- V10.1: 5,673 chars

V7 and V9 are no longer foundation-sized monoliths; their remaining bodies are mostly migration/content markers and small residual integration.

## Recommended next audit
V11.25 should target **Canonical Dungeon / World Event Foundations**. The strongest next seam is the complete V11.4 eightfold-dungeon/ecosystem stage into canonical Dungeons, followed by carefully audited V3/V4 dungeon, forced-encounter, world-pulse and regional-action ancestry. This can reduce another major historical block without reopening mature Travel or Combat ownership.
