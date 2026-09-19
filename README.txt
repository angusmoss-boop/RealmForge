Realmforge: Wanderer's Rise — V11.7.0 Canonical Architecture

PRODUCTION FOUNDATION II
V11.7.0 is an infrastructure-only refactor. It deliberately does not change gameplay or save data.

ACTIVE ARCHITECTURE
The shipped browser runtime loads six JavaScript files. Five reproduce the frozen V11.5.3 baseline and one generated bundle contains the canonical production modules.

1. Frozen compatibility baseline (proven V11.5.3 behaviour)
   js/legacy/base/data.js
   js/legacy/base/state.js
   js/legacy/base/ui.js
   js/legacy/base/main.js
   js/legacy/compat_v1153.js

2. Canonical production source modules
   js/core/bootstrap.js
   js/platform/browser.js
   js/core/state.js
   js/core/migrations.js
   js/data/catalog.js
   js/systems/*.js
   js/ui/shell.js
   js/core/finalize.js

WHY THE LEGACY LAYER STILL EXISTS
A behaviour-identical rewrite of years of wrapper-based patches in one jump would be needlessly risky. V11.7 uses a strangler architecture: the stable V11.5.3 implementation is frozen behind explicit canonical contracts. New V12 code must be written against those contracts. Existing systems can then be migrated out of the compatibility layer one at a time with regression tests, until the legacy layer can be deleted safely.

RULE GOING FORWARD
Do not add new v12_x.js override patches around legacy global functions.
New content/data goes through RF.Catalog.
New save migrations go through RF.Core.Migrations.
New system code lives under js/systems/.
New platform-specific behaviour lives under js/platform/.
New interface ownership lives under js/ui/.

SAVE COMPATIBILITY
Application version: 11.7.0
Save schema: 11.5.3
No gameplay-state migration is introduced.

See REALMFORGE_ARCHITECTURE_V11_7.md for the module ownership map and migration plan.

PRODUCTION BUNDLE
The readable canonical source modules are generated into `js/dist/canonical_v11_7.js` for the shipped build. See CANONICAL_BUNDLE_PROVENANCE_V11_7.txt for exact source hashes and bundle provenance.
