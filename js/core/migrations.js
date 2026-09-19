/* Canonical migration owner.
   Historical migration functions are still defined by the frozen gameplay
   compatibility layer for now, but the migration CHAIN is owned here.
   No patch may wrap RF.load/newGame/importSave or RF.V95.migrate anymore. */
(() => {
  'use strict';
  const RF = window.RF;
  const historical = [];
  const schemaSteps = new Map();
  let baselineInstalled = false;
  let running = 0;

  const addHistorical = (id, version, getter) => historical.push({ id, version, getter });

  const api = {
    get ready() { return baselineInstalled; },
    get running() { return running > 0; },
    currentSchema: () => RF.Core.contract.saveSchema,
    historical: () => historical.map(({ id, version }) => ({ id, version })),
    register(from, to, migrate) {
      if (!from || !to || typeof migrate !== 'function') throw new Error('Invalid migration registration.');
      const key = `${from}->${to}`;
      if (schemaSteps.has(key)) throw new Error(`Migration already registered: ${key}`);
      schemaSteps.set(key, { from, to, migrate });
      return key;
    },
    list: () => Array.from(schemaSteps.values()).map(({ from, to }) => ({ from, to })),
    installHistoricalBaseline() {
      if (baselineInstalled) return historical.length;
      [
        ['v2','2.0.0',()=>RF.migrateV2],['v3','3.0.0',()=>RF.migrateV3],['v4','4.0.0',()=>RF.migrateV4],
        ['v5','5.0.0',()=>RF.migrateV5],['v6','6.0.0',()=>RF.migrateV6],['v7','7.0.0',()=>RF.migrateV7],
        ['v8','8.0.0',()=>RF.migrateV8],['v8.1','8.1.0',()=>RF.migrateV81],['v8.2','8.2.0',()=>RF.migrateV82],
        ['v8.3','8.3.0',()=>RF.migrateV83],['v9','9.0.0',()=>RF.migrateV9],['v9.1','9.1.0',()=>RF.migrateV91],
        ['v9.2','9.2.0',()=>RF.migrateV92],['v9.3','9.3.0',()=>RF.migrateV93],['v9.4','9.4.0',()=>RF.migrateV94],
        ['v10','10.0.0',()=>RF.migrateV10],['v10.1','10.1.0',()=>RF.migrateV101],['v10.2','10.2.0',()=>RF.migrateV102],
        ['v10.3','10.3.0',()=>RF.migrateV103],['v10.6','10.6.0',()=>RF.migrateV106],['v10.7','10.7.0',()=>RF.migrateV107],
        ['v10.16','10.16.0',()=>RF.V1016?.repairCampaign],['v10.17','10.17.0',()=>RF.V1017?.migrate],
        ['v10.18','10.18.0',()=>RF.V1018?.migrate],['v10.19','10.19.0',()=>RF.V1019?.migrate],
        ['v10.20','10.20.0',()=>RF.V1020?.migrate],['v10.21','10.21.0',()=>RF.V1021?.migrate],
        ['v10.22','10.22.0',()=>RF.migrateV1022],['v10.23','10.23.0',()=>RF.migrateV1023],
        ['v10.24','10.24.0',()=>RF.migrateV1024],['v10.25','10.25.0',()=>RF.migrateV1025],
        ['v10.26','10.26.0',()=>RF.migrateV1026],['v10.27','10.27.0',()=>RF.migrateV1027],
        ['v10.28','10.28.0',()=>RF.migrateV1028],['v10.29','10.29.0',()=>RF.migrateV1029],
        ['v10.30','10.30.0',()=>RF.migrateV1030],['v10.31','10.31.0',()=>RF.migrateV1031],
        ['v10.32','10.32.0',()=>RF.migrateV1032],['v10.33','10.33.0',()=>RF.V1033?.migrate],
        ['v10.34','10.34.0',()=>RF.V1034?.migrate],['v10.35','10.35.0',()=>RF.V1035?.migrate],
        ['v10.36','10.36.0',()=>RF.V1036?.migrate],['v10.37','10.37.0',()=>RF.V1037?.migrate],
        ['v10.38','10.38.0',()=>RF.V1038?.migrate],['v10.39','10.39.0',()=>RF.V1039?.migrate],
        ['v10.40','10.40.0',()=>RF.V1040?.migrate],['v10.41','10.41.0',()=>RF.V1041?.migrate],
        ['v10.42','10.42.0',()=>RF.V1042?.migrate],['v10.43','10.43.0',()=>RF.V1043?.migrate],
        ['v10.44','10.44.0',()=>RF.V1044?.migrate],['v10.45','10.45.0',()=>RF.V1045?.migrate],
        ['v10.46','10.46.0',()=>RF.V1046?.migrate],['v10.47','10.47.0',()=>RF.V1047?.migrate],
        ['v10.48','10.48.0',()=>RF.V1048?.migrate],['v10.49','10.49.0',()=>RF.V1049?.migrate],
        ['v10.50','10.50.0',()=>RF.V1050?.migrate],['v10.51','10.51.0',()=>RF.V1051?.migrate],
        ['v10.52','10.52.0',()=>RF.V1052?.migrate],['v10.53','10.53.0',()=>RF.V1053?.migrate],
        ['v10.54','10.54.0',()=>RF.V1054?.migrate],['v10.55','10.55.0',()=>RF.V1055?.migrate],
        ['v10.56','10.56.0',()=>RF.V1056?.migrate],['v10.57','10.57.0',()=>RF.V1057?.migrate],
        ['v10.58','10.58.0',()=>RF.V1058?.migrate],['v10.59','10.59.0',()=>RF.V1059?.migrate],
        ['v10.60','10.60.0',()=>RF.V1060?.migrate],['v10.61','10.61.0',()=>RF.V1061?.migrate],
        ['v11.0','11.0.0',()=>RF.V1062?.migrate],['v11.1','11.1.0',()=>RF.V111?.migrate],
        ['v11.2','11.2.0',()=>RF.V112?.migrate],['v11.2.1','11.2.1',()=>RF.V1121?.migrate],
        ['v11.2.2','11.2.2',()=>RF.V1122?.migrate],['v11.2.3','11.2.3',()=>RF.V1123?.migrate],
        ['v11.3','11.3.0',()=>RF.V113?.migrate],['v11.4','11.4.0',()=>RF.V114?.migrate],
        ['v11.5','11.5.0',()=>RF.V115?.migrate],['v11.5.2','11.5.2',()=>RF.V1152?.migrate],
        ['v11.5.3','11.5.3',()=>RF.V1153?.migrate]
      ].forEach(([id, version, getter]) => addHistorical(id, version, getter));
      baselineInstalled = true;
      return historical.length;
    },
    normalize(state) {
      if (!state || !baselineInstalled) return state;
      running++;
      try {
        for (const step of historical) {
          const fn = step.getter();
          if (typeof fn !== 'function') continue;
          try { state = fn(state) || state; }
          catch (err) { console.warn(`[Realmforge migration ${step.id}]`, err); }
        }
        // Future schema steps are intentionally separate from the historical normalizers.
        let current = state.saveSchema || state.version || RF.Core.contract.saveSchema;
        let guard = 0;
        while (current !== RF.Core.contract.saveSchema && guard++ < 100) {
          const step = Array.from(schemaSteps.values()).find(x => x.from === current);
          if (!step) break;
          state = step.migrate(state) || state;
          current = step.to;
        }
        state.version = RF.Core.contract.saveSchema;
        state.saveSchema = RF.Core.contract.saveSchema;
        return state;
      } finally { running--; }
    }
  };
  RF.Core.Migrations = RF.Modules.register('core.migrations', api, { owner: 'core', status: 'canonical', baselineSchema: RF.Core.contract.saveSchema });
})();
