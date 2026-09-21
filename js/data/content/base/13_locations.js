/* Realmforge V11.30.0 — base content: locations. */
(()=>{
  'use strict';
  const RF=window.RF;
  const BASE=window.RF_BASE_CONTENT_SOURCE||(window.RF_BASE_CONTENT_SOURCE={});
  BASE['locations']={
    greenvale:{name:'Greenvale',icon:'🏘️',region:'Greenvale',desc:'A quiet farming village where every road seems to lead toward trouble.',neighbors:{forest:18,river:12,mine:20,crossroads:16},actions:['rest','forage','talk'],shop:true},
    forest:{name:'Whisperwood',icon:'🌲',region:'Greenvale',desc:'Old oak forest. Safe near the road, less so beneath the deeper canopy.',neighbors:{greenvale:18,crossroads:14,ruins:28},actions:['woodcut','hunt','forage']},
    river:{name:'Silverrun River',icon:'🌊',region:'Greenvale',desc:'A cold, clear river running south through the valley.',neighbors:{greenvale:12,crossroads:18},actions:['fish','forage']},
    mine:{name:'Old Greenvale Mine',icon:'⛏️',region:'Greenvale',desc:'A reopened mine with deeper passages still boarded shut.',neighbors:{greenvale:20,crossroads:20},actions:['mine','explore']},
    crossroads:{name:'Kingroad Crossroads',icon:'🪧',region:'Greenvale',desc:'Merchants, pilgrims and less reputable travellers all pass here.',neighbors:{greenvale:16,forest:14,river:18,mine:20,bandit_camp:32},actions:['wait','explore']},
    ruins:{name:'Mossbound Ruins',icon:'🏚️',region:'Greenvale',desc:'Collapsed stones swallowed by the forest. Something has scratched symbols into the doorway.',neighbors:{forest:28},actions:['explore'],lockedSkill:{exploration:4}},
    bandit_camp:{name:'Blackthorn Camp',icon:'⛺',region:'Greenvale',desc:'A crude camp hidden beyond the eastern ridge.',neighbors:{crossroads:32},actions:['explore'],lockedFlag:'banditCampKnown'}
  };
})();
