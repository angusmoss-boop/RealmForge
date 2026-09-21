/* Realmforge V11.30.0 — canonical services configuration. */
(()=>{
  'use strict';
  const C=window.RF.Config;
  if(!C)throw new Error('RF.Config must load before services configuration.');
  C.define("services.banks",{
    greenvale:{name:'Greenvale Bank',icon:'🏦'},
    ironridge:{name:'Ironridge Bank',icon:'🏦'},
    reedmere:{name:'Reedmere Bank',icon:'🏦'}
  },{"source": "js/v10_47.js", "bytes": 147});
  C.define("services.innLocations",['greenvale','ironridge','reedmere'],{"source": "js/v11_1.js", "bytes": 36});
  C.define("services.specialFacilities",{
    greenvale:[['🛠️','Village Workshop'],['🍳','Cottage Kitchen']],
    guildhall:[['📜','Wayfarer Contracts']],
    mirewatch:[['🛏️','Lodge Rest']]
  },{"source": "js/v11_1.js", "bytes": 160});
})();
