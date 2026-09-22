Realmforge: Wanderer's Rise - V12.5.0 Hardcore & Character Records

V12.5 adds opt-in Hardcore campaigns with genuine one-life rules, memorialised fallen saves, highlighted Hardcore character records and visible death totals for Standard characters.

APPLICATION VERSION
12.5.0

SAVE SCHEMA
12.5.0 (advanced explicitly from 11.5.3 for persisted campaign-rule state)

ACTIVE PRODUCTION RUNTIME
1. js/data/base_content.js
2. js/legacy/base/state.js
3. js/legacy/base/ui.js
4. js/dist/save_core_v12_5.js
5. js/dist/data_core_v12_5.js
6. js/legacy/base/main.js
7. js/dist/systems_core_v12_5.js
8. js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js
9. js/dist/canonical_v12_5.js

V12.5 HARDCORE CAMPAIGNS
- Character creation now offers Standard or Hardcore campaign rules.
- Selecting Hardcore opens an explicit warning before the mode is committed.
- Hardcore is opt-in only and cannot be inferred from old saves.
- Existing saves migrate to Standard mode automatically.
- Hardcore death permanently concludes that campaign before Realmforge's normal revival/recovery chain can run.
- The fallen save is preserved as a memorial instead of being deleted.
- Fallen campaigns remain exportable/duplicable but cannot be resumed or restarted.
- The memorial records killer, day/time, location and final character level.

CHARACTER RECORDS
- Hardcore characters receive a prominent HARDCORE CAMPAIGN banner on the Character page.
- Standard characters now show their existing lifetime Deaths statistic.
- Save-slot metadata also identifies Hardcore/Fallen campaigns.

FROZEN COMPATIBILITY
js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js remains 64,639 bytes and byte-identical to the frozen V11.30/V12 compatibility baseline.

KEY DOCUMENTS
- REALMFORGE_ARCHITECTURE_V12_5.md
- Realmforge_Production_Audit_V12_5.txt
- HARDCORE_CAMPAIGN_PROVENANCE_V12_5.txt
- CANONICAL_BUNDLE_PROVENANCE_V12_5.txt
- Realmforge_Development_Log_V1_to_V12_5_0.txt
