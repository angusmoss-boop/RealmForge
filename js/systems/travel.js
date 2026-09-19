(() => {
  'use strict';
  const RF = window.RF;
  const api = {
    start: id => RF.travel(id),
    finish: activity => RF.finishTravel(activity),
    setSpeed: speed => typeof RF.setSpeed === 'function' ? RF.setSpeed(speed) : null,
    repair: state => typeof RF.repairTravelIfStalled === 'function' ? RF.repairTravelIfStalled(state) : state,
    route: (state, from, to) => RF.V1020?.route ? RF.V1020.route(state, from, to) : null,
    preview: id => RF.V1020?.openRoutePreview ? RF.V1020.openRoutePreview(id) : null,
    beginRoute: (...args) => RF.V1020?.beginRoute ? RF.V1020.beginRoute(...args) : null,
    clearPlan: state => RF.V1020?.clearPlan ? RF.V1020.clearPlan(state) : null
  };
  RF.Systems.Travel = RF.Modules.register('systems.travel', api, { owner: 'systems', status: 'canonical-facade', delegatesTo: 'legacy-v11.5.3' });
})();
