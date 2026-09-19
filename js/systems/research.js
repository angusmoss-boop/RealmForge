(() => {
  'use strict';
  const RF = window.RF;
  const api = {
    encounters: (state, location, force = false) => RF.refreshEncounters(state, location, force),
    observe: id => RF.researchEnemy(id),
    identified: (state, id) => RF.V1049?.identified ? RF.V1049.identified(state, id) : (RF.V1048?.identified ? RF.V1048.identified(state, id) : false),
    profile: state => RF.V1152?.profile ? RF.V1152.profile(state) : null,
    uniqueNearby: state => RF.V1153?.uniqueNearby ? RF.V1153.uniqueNearby(state) : (RF.refreshEncounters(state) || [])
  };
  RF.Systems.Research = RF.Modules.register('systems.research', api, { owner: 'systems', status: 'canonical-facade', delegatesTo: 'legacy-v11.5.3' });
})();
