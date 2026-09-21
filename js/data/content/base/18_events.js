/* Realmforge V11.30.0 — base content: events. */
(()=>{
  'use strict';
  const RF=window.RF;
  const BASE=window.RF_BASE_CONTENT_SOURCE||(window.RF_BASE_CONTENT_SOURCE={});
  BASE['events']=[
    {id:'wounded_merchant',title:'A Man Beside the Road',icon:'🩸',once:true,locations:['crossroads','forest'],weight:8,text:'A merchant lies against a milestone, clutching a blood-soaked sleeve. A shattered cart wheel rests nearby.',choices:[
      {text:'Help him',sub:'Spend 1 herb if available. Kindness may be remembered.',condition:s=>true,result:s=>{let used=RF.takeItem(s,'herb',1);s.flags.woundedMerchantResolved=true;s.flags.savedMerchant=true;s.gold+=8;RF.addXp(s,'herblore',used?18:5);return used?'You bind the wound with Greenleaf. He gives his name as Oren Vale and whispers about Blackthorn bandits.':'You do what you can. He survives, and whispers about Blackthorn bandits.';}},
      {text:'Search the wreckage',sub:'Potential loot, potential consequences.',result:s=>{s.flags.woundedMerchantResolved=true;s.flags.robbedMerchant=true;RF.addItem(s,'lockpick',1);s.gold+=19;return 'You pocket a lockpick and a purse before footsteps force you away.';}},
      {text:'Leave him',sub:'The road is not your problem.',result:s=>{s.flags.woundedMerchantResolved=true;s.flags.abandonedMerchant=true;return 'You continue down the road. His voice fades behind you.';}}
    ]},
    {id:'road_shrine',title:'Shrine Beneath the Ash Tree',icon:'🕯️',once:true,locations:['forest','crossroads'],weight:5,text:'A tiny stone shrine sits beneath an ancient ash. Three coins and a black feather lie before it.',choices:[
      {text:'Leave an offering (5g)',condition:s=>s.gold>=5,result:s=>{s.gold-=5;s.flags.shrineBlessing=true;s.luck+=1;return 'The candle flame bends toward you despite the still air. Luck +1.';}},
      {text:'Take the coins',result:s=>{s.gold+=11;s.flags.robbedShrine=true;return 'Eleven gold. Easy money. The candle snuffs itself out.';}},
      {text:'Walk away',result:s=>'You leave the shrine untouched.'}
    ]},
    {id:'travelling_smith',title:'Travelling Smith',icon:'🔨',once:false,locations:['greenvale','crossroads'],weight:4,text:'A soot-faced smith has set up a temporary stall from the back of a wagon.',choices:[
      {text:'Buy 2 iron ore (12g)',condition:s=>s.gold>=12,result:s=>{s.gold-=12;RF.addItem(s,'iron_ore',2);return 'A fair enough deal. Two iron ore added.';}},
      {text:'Ask for advice',result:s=>{RF.addXp(s,'smithing',14);return 'He talks you through heat, colour and the sound good metal makes under a hammer. Smithing XP gained.';}},
      {text:'Move on',result:s=>'You leave him to his work.'}
    ]},
    {id:'lost_child',title:'Crying in the Ferns',icon:'🧒',once:true,locations:['forest'],weight:4,text:'You hear a child crying somewhere beyond the path. Darkness is gathering.',choices:[
      {text:'Search for them',result:s=>{s.flags.savedChild=true;s.reputation.greenvale+=8;RF.addXp(s,'exploration',24);return 'You find the child tangled in brambles and escort them home. Greenvale will remember this.';}},
      {text:'Ignore it',result:s=>{s.flags.ignoredChild=true;s.reputation.greenvale-=3;return 'You convince yourself someone else will deal with it.';}}
    ]}
  ];
})();
