Realmforge: Wanderer's Rise — V11.6.0 Production Foundation I

CURRENT RUNTIME
The active browser runtime now consists of five JavaScript files:
  js/data.js
  js/state.js
  js/ui.js
  js/main.js
  js/realmforge_runtime_v11_6.js

The consolidated runtime contains the exact V11.5.3 active patch chain from V2 through V11.5.3 in the same order. Historical individual patch files remain in js/ for reference/debugging but are no longer loaded by index.html or precached by the service worker.

SAVE COMPATIBILITY
Application version: 11.6.0
Save schema: 11.5.3
V11.6 is an infrastructure-only consolidation and intentionally does not migrate or rewrite valid campaign state.

AUDIT
See Realmforge_Production_Foundation_Audit_V11_6.txt for the source audit and next recommended production-foundation steps.
See RUNTIME_PROVENANCE_V11_6.txt for the exact bundled patch order and SHA-256 hashes.

HISTORY
The canonical release history is maintained in Realmforge_Development_Log_V1_to_V11_6_0.txt when distributed with the release.


V11.6.1 COMPATIBILITY CORRECTION
V11.6.0's direct source concatenation changed browser error-isolation semantics and could stop later historical patches from running. V11.6.1 embeds the same 93 active patches in one downloaded runtime but executes them as separate classic-script elements in their original order. This preserves V11.5.3 behaviour while maintaining the reduced deployment surface.
