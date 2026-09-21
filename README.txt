Realmforge: Wanderer's Rise - V12.0.0 Saveguard

First V12 release. V11.30.0 remains the frozen Production Foundation baseline; V12.0.0 fixes and hardens the canonical save/load system without changing gameplay content or the save schema.

APPLICATION VERSION
12.0.0

SAVE SCHEMA
11.5.3 (unchanged)

ACTIVE PRODUCTION RUNTIME
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v12_0.js
5. js/dist/data_core_v12_0.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v12_0.js
8. js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js
9. js/dist/canonical_v12_0.js

V12.0 SAVEGUARD
- Fixed New Campaign overwriting the currently active campaign.
- Canonical RF.startNew remains authoritative; legacy/base/main.js may no longer replace it.
- Added storage-layer cross-campaign overwrite rejection.
- New campaign slots start with three verified local copies immediately.
- Duplicate creates a separate verified slot without changing the active campaign.
- Options & Saves now provides per-slot Duplicate and Export controls.
- Export uses a versioned checksummed .rfsave backup package.
- Import accepts V12 .rfsave files and pre-V12 base64 text exports.
- Imports always create a separate campaign slot.
- Browser file download/file-pick behavior lives behind RF.Platform for future Android/Capacitor adapters.
- Corrupt slot indexes can be reconstructed from verified slot envelopes.
- Primary -> Backup -> Recovery fallback remains intact.
- Save schema remains 11.5.3.

FROZEN COMPATIBILITY
js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js remains byte-identical to V11.30.0 at 64,639 bytes. No V12 gameplay/save feature was added to the historical compatibility layer.

KEY DOCUMENTS
- REALMFORGE_ARCHITECTURE_V12_0.md
- Realmforge_Production_Audit_V12_0.txt
- SAVE_SYSTEM_PROVENANCE_V12_0.txt
- CANONICAL_BUNDLE_PROVENANCE_V12_0.txt
- Realmforge_Development_Log_V1_to_V12_0_0.txt
