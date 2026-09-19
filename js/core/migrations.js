/* Canonical migration registry for V12+.
   Historical migration wrappers remain frozen in the compatibility baseline.
   New schema changes should be registered here rather than adding another
   version-patch wrapper around RF.load/newGame/importSave. */
(() => {
  'use strict';
  const RF = window.RF;
  const steps = new Map();
  const api = {
    currentSchema: () => RF.V95?.SCHEMA || RF.Core.contract.saveSchema,
    register(from, to, migrate) {
      if (!from || !to || typeof migrate !== 'function') throw new Error('Invalid migration registration.');
      const key = `${from}->${to}`;
      if (steps.has(key)) throw new Error(`Migration already registered: ${key}`);
      steps.set(key, { from, to, migrate });
      return key;
    },
    list: () => Array.from(steps.values()).map(({ from, to }) => ({ from, to })),
    run(state, from, to) {
      if (!state || from === to) return state;
      let current = from;
      let guard = 0;
      while (current !== to && guard++ < 100) {
        const step = Array.from(steps.values()).find(x => x.from === current);
        if (!step) throw new Error(`No canonical migration path from ${current} to ${to}.`);
        state = step.migrate(state) || state;
        current = step.to;
      }
      if (current !== to) throw new Error(`Migration did not reach ${to}.`);
      return state;
    }
  };
  RF.Core.Migrations = RF.Modules.register('core.migrations', api, { owner: 'core', status: 'canonical', baselineSchema: RF.Core.contract.saveSchema });
})();
