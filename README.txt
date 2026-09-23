Realmforge: Wanderer's Rise - V12.6.0 Workshop & Energy Expansion

V12.6 fixes the opening Smithing progression, modernises the Greenvale Village Workshop for mobile, and expands the Energy economy to a 1000-point baseline while preserving existing activity costs.

APPLICATION VERSION
12.6.0

SAVE SCHEMA
12.6.0 (advanced explicitly from 12.5.0 for the one-time proportional Energy migration)

ACTIVE PRODUCTION RUNTIME
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v12_6.js
5. js/dist/data_core_v12_6.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v12_6.js
8. js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js
9. js/dist/canonical_v12_6.js

SMITHING PROGRESSION
- Smelt Bronze Bar now requires Smithing Level 1 instead of Level 2.
- Bronze Bar retains 24 Smithing XP, so two Level-1 Bronze smelts provide enough XP to reach Smithing Level 2 naturally.
- Existing higher-tier progression and Forge & Fletch recipes remain unchanged.

GREENVALE VILLAGE WORKSHOP
- Replaces the Android/native category dropdown with eight Realmforge-styled category tabs.
- Categories are contained in a fixed 4-column by 2-row grid on the Workshop surface.
- Tabs preserve the existing category state and recipe handlers.
- Workshop now closes from a top-right X rather than a bottom Leave Workshop action.
- Width containment prevents categories from stretching the mobile page.

ENERGY EXPANSION
- Character max Energy curve changes from 100 + 2 per Character Level to 1000 + 20 per Character Level.
- Existing V12.5 saves migrate current Energy proportionally, so 53/158 becomes 530/1580 rather than 53/1580.
- New characters begin at 1000/1000 Energy.
- Activity, gathering, crafting, travel and other Energy expenses remain numerically unchanged.
- Level-up Energy progression uses the new canonical curve automatically.
- Inns and other full-rest paths continue to restore against maxEnergy rather than a hard-coded cap.

HARDCORE / SAVE SAFETY
- V12.5 Hardcore campaign rules, Fallen memorial state, Standard death totals and restart protection are preserved.
- Saveguard and campaign isolation remain canonical.

FROZEN COMPATIBILITY
js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js remains 64,639 bytes and byte-identical to the frozen V11.30/V12 compatibility baseline.

KEY DOCUMENTS
- REALMFORGE_ARCHITECTURE_V12_6.md
- Realmforge_Production_Audit_V12_6.txt
- WORKSHOP_ENERGY_PROVENANCE_V12_6.txt
- CANONICAL_BUNDLE_PROVENANCE_V12_6.txt
- Realmforge_Development_Log_V1_to_V12_6_0.txt
