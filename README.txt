Realmforge: Wanderer's Rise - V12.7.0 Fallen Memorials

V12.7 fixes Hardcore memorial navigation and upgrades fallen-campaign management/presentation without changing persistent save structure.

APPLICATION VERSION
12.7.0

SAVE SCHEMA
12.6.0 (unchanged from V12.6)

ACTIVE PRODUCTION RUNTIME
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v12_7.js
5. js/dist/data_core_v12_7.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v12_7.js
8. js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js
9. js/dist/canonical_v12_7.js

FALLEN HARDCORE MEMORIALS
- Main Menu now remains authoritative after leaving a fallen Hardcore memorial; passive redraws cannot force Game Over back over the campaign selector.
- Fallen saves remain preserved and reopen into the memorial screen.
- Memorial screen adds optional Delete Save with an in-game two-step confirmation.
- Confirmed deletion removes the campaign index entry plus primary, backup, recovery, temp and recovery timestamp storage records.
- Deletion is never automatic.

CAMPAIGN FRONT DOOR
- Fallen Hardcore cards receive a subtle red memorial treatment.
- Fallen Hardcore cards use a skull-and-crossbones icon rather than the normal save icon.
- Fallen Hardcore cards show a FALLEN badge.
- Fallen Hardcore subtitles show Game Over instead of the last location.
- Alive Hardcore and Standard saves retain normal presentation.

SAVE SAFETY
- Save schema remains 12.6.0; no migration is required.
- Hardcore one-life state remains irreversible.
- Export and duplicate of fallen memorials remain available.
- Saveguard and verified multi-copy persistence remain canonical.

FROZEN COMPATIBILITY
js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js remains 64,639 bytes and byte-identical to the frozen V11.30/V12 compatibility baseline.

KEY DOCUMENTS
- REALMFORGE_ARCHITECTURE_V12_7.md
- Realmforge_Production_Audit_V12_7.txt
- HARDCORE_MEMORIAL_PROVENANCE_V12_7.txt
- CANONICAL_BUNDLE_PROVENANCE_V12_7.txt
- Realmforge_Development_Log_V1_to_V12_7_0.txt
