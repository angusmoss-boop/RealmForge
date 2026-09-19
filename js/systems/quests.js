(() => {
  'use strict';
  const RF = window.RF;
  const api = {
    check: state => RF.questCheck(state),
    accept: id => typeof RF.v93AcceptQuest === 'function' ? RF.v93AcceptQuest(id) : null,
    abandon: id => typeof RF.v93AbandonQuest === 'function' ? RF.v93AbandonQuest(id) : null,
    visible: (state, id) => typeof RF.v93OfferVisible === 'function' ? RF.v93OfferVisible(state, id) : true,
    requirementText: (...args) => typeof RF.v93Req === 'function' ? RF.v93Req(...args) : '',
    wayfinderHint: (state, id) => RF.V1151?.progressHint ? RF.V1151.progressHint(state, id) : null
  };
  RF.Systems.Quests = RF.Modules.register('systems.quests', api, { owner: 'systems', status: 'canonical-facade', delegatesTo: 'legacy-v11.5.3' });
})();
