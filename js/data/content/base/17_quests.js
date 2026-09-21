/* Realmforge V11.30.0 — base content: quests. */
(()=>{
  'use strict';
  const RF=window.RF;
  const BASE=window.RF_BASE_CONTENT_SOURCE||(window.RF_BASE_CONTENT_SOURCE={});
  BASE['quests']={
    first_steps:{name:'First Steps',desc:'Get your bearings in Greenvale.',objectives:[{type:'visit',target:'forest',text:'Visit Whisperwood'},{type:'skill',target:'foraging',value:2,text:'Reach Foraging level 2'}],reward:{gold:25,xp:60},next:'missing_caravan'},
    missing_caravan:{name:'The Missing Caravan',desc:'A trader expected from the east never arrived.',objectives:[{type:'flag',target:'woundedMerchantResolved',text:'Learn what happened on the east road'},{type:'item',target:'bandit_token',value:1,text:'Obtain a Blackthorn token'}],reward:{gold:70,xp:120,item:'old_map'},next:'blackthorn'},
    blackthorn:{name:'Blackthorn',desc:'The token bears the mark of a local bandit gang.',objectives:[{type:'flag',target:'banditCampKnown',text:'Discover the Blackthorn camp'},{type:'kill',target:'bandit',value:3,text:'Defeat 3 Blackthorn bandits'}],reward:{gold:130,xp:220,item:'iron_helm'}}
  };
})();
