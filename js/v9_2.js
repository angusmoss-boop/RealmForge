window.RF=window.RF||{};
RF.VERSION='9.2.0';
RF.V92=RF.V92||{};

RF.migrateV92=function(s){
  if(!s)return s;s.version='9.2.0';s.v92=s.v92||{};
  s.v92.inventoryCategory=s.v92.inventoryCategory||'all';
  s.v92.shopCategory=s.v92.shopCategory||'all';
  s.stats=s.stats||{};s.stats.burglaries=s.stats.burglaries||0;s.stats.deaths=s.stats.deaths||0;
  return s;
};
const v92New=RF.newGame;RF.newGame=function(...a){return RF.migrateV92(v92New(...a))};
const v92Load=RF.load;RF.load=function(){return RF.migrateV92(v92Load())};
const v92Import=RF.importSave;RF.importSave=function(x){return RF.migrateV92(v92Import(x))};
if(RF.state)RF.migrateV92(RF.state);

/* ---------- Content expansion ---------- */
Object.assign(RF.DATA.items,{
  boar_tusk:{name:'Razorback Tusk',icon:'🦷',type:'material',value:19,desc:'A thick tusk prized by carvers and charm-makers.'},
  adder_scale:{name:'Thorn Adder Scale',icon:'🐍',type:'material',value:17,desc:'A patterned scale with a faint herbal scent.'},
  crow_feather:{name:'Blackroad Feather',icon:'🪶',type:'material',value:11,desc:'Oil-dark feather from a road crow.'},
  cave_chitin:{name:'Cave Chitin',icon:'🪲',type:'material',value:24,desc:'Hard shell plate from deep-dwelling vermin.'},
  troll_tooth:{name:'Troll Tooth',icon:'🦷',type:'treasure',value:58,rarity:'Uncommon',desc:'Too large to be comfortable evidence of anything.'},
  drake_scale:{name:'Stoneback Scale',icon:'🦎',type:'material',value:68,rarity:'Rare',desc:'A dense mineralised scale that rings when struck.'},
  wisp_core:{name:'Wisp Core',icon:'🔵',type:'material',value:74,rarity:'Rare',desc:'A cold knot of light that refuses to go fully dark.'},
  raider_token:{name:'Raider Token',icon:'🪙',type:'treasure',value:44,desc:'A stamped token used among road gangs.'},
  croc_tooth:{name:'Fen Croc Tooth',icon:'🦷',type:'material',value:31,desc:'A serrated tooth from a mature fen crocodile.'},
  mire_amber:{name:'Mire Amber',icon:'🟠',type:'treasure',value:92,rarity:'Rare',desc:'Dark amber containing a tiny marsh fly and several bad centuries.'}
});
Object.assign(RF.DATA.enemyMoves,{
  peck:{name:'Raking Peck',power:.76,accuracy:.96},
  wing_flurry:{name:'Wing Flurry',power:.92,accuracy:.9,status:{id:'exposed',chance:.25,turns:1}},
  tusk_rush:{name:'Tusk Rush',power:1.24,accuracy:.84},
  burrow_snap:{name:'Burrow Snap',power:1.04,accuracy:.91},
  shell_guard:{name:'Shell Guard',kind:'guard'},
  mire_spit:{name:'Mire Spit',power:.72,accuracy:.9,status:{id:'weakened',chance:.42,turns:2}}
});
Object.assign(RF.DATA.enemies,{
  road_crow:{name:'Blackroad Crow',icon:'🐦‍⬛',hp:34,damage:[3,7],armor:0,xp:38,gold:[0,2],drops:[['crow_feather',.75,1],['drowned_coin',.015,1]],level:2,temperament:'skittish',moves:['peck','wing_flurry']},
  razorback:{name:'Razorback Boar',icon:'🐗',hp:88,damage:[7,15],armor:3,xp:118,gold:[0,3],drops:[['raw_meat',.82,2],['boar_tusk',.55,1]],level:7,temperament:'territorial',moves:['gore','tusk_rush','brace']},
  tunnel_beetle:{name:'Ironback Beetle',icon:'🪲',hp:76,damage:[5,12],armor:7,xp:112,gold:[0,2],drops:[['cave_chitin',.68,1],['coal',.14,1]],level:7,temperament:'territorial',moves:['burrow_snap','shell_guard','scrabble']},
  ridge_brute:{name:'Ridge Brute',icon:'🧌',hp:168,damage:[12,23],armor:5,xp:238,gold:[8,21],drops:[['troll_tooth',.48,1],['raw_meat',.35,1]],level:14,temperament:'aggressive',moves:['club','headbutt','roar']},
  marsh_lurker:{name:'Marsh Lurker',icon:'🦎',hp:102,damage:[8,17],armor:4,xp:154,gold:[0,5],drops:[['croc_tooth',.28,1],['redroot',.12,1]],level:10,temperament:'territorial',moves:['snap','mire_spit','coil']},
  grave_moth:{name:'Grave Moth',icon:'🦋',hp:82,damage:[7,15],armor:1,xp:146,gold:[2,8],drops:[['wisp_core',.16,1],['mooncap',.15,1]],level:10,temperament:'aggressive',moves:['wing_flurry','hex','drift']}
});


if(RF.DATA.enemies.thorn_adder)RF.DATA.enemies.thorn_adder.drops.push(['adder_scale',.58,1]);
if(RF.DATA.enemies.quarry_drake)RF.DATA.enemies.quarry_drake.drops.push(['drake_scale',.34,1]);
if(RF.DATA.enemies.ash_wisp)RF.DATA.enemies.ash_wisp.drops.push(['wisp_core',.22,1]);
if(RF.DATA.enemies.ridge_raider)RF.DATA.enemies.ridge_raider.drops.push(['raider_token',.25,1]);
if(RF.DATA.enemies.fen_croc)RF.DATA.enemies.fen_croc.drops.push(['croc_tooth',.52,1]);
if(RF.DATA.enemies.mudcrab)RF.DATA.enemies.mudcrab.drops.push(['mire_amber',.035,1]);
// Denser, more varied combat populations across old and new areas.
Object.assign(RF.fieldTables,{
  sunmeadow:[['meadow_boar',4],['razorback',2],['thorn_adder',3],['wolf',2],['road_crow',2],['feral_hound',1]],
  forest:[['wolf',4],['feral_hound',2],['rogue_stag',2],['road_crow',1]],
  river:[['rat',2],['thorn_adder',2],['road_crow',2],['feral_hound',1]],
  mine:[['rat',3],['cave_spider',2],['tunnel_beetle',3]],
  deep_mine:[['cave_spider',3],['tunnel_beetle',3],['crypt_guard',1]],
  crossroads:[['bandit',2],['wolf',2],['road_crow',2],['feral_hound',1]],
  northroad:[['ridge_raider',3],['hill_troll',2],['ridge_brute',1],['wolf',1]],
  quarry:[['ridge_raider',2],['hill_troll',2],['quarry_drake',2],['ridge_brute',1]],
  ember_cave:[['ash_wisp',3],['ember_hound',3],['magma_crawler',2]],
  crypt:[['skeleton',3],['crypt_guard',3],['grave_moth',2],['gravewarden',1]],
  marshroad:[['mire_wolf',3],['marsh_raider',2],['bog_spider',2],['marsh_lurker',2],['road_crow',1]],
  reedmere:[['mudcrab',3],['bog_spider',2],['mire_wolf',2],['marsh_lurker',1]],
  drowned_ruins:[['drowned_sentinel',3],['lantern_wisp',2],['fen_croc',2],['grave_moth',1]],
  mirewatch:[['mire_wolf',3],['fen_croc',2],['marsh_lurker',2],['bog_spider',1]]
});
const v92RefreshBase=RF.refreshEncounters;
RF.refreshEncounters=function(s,loc=s.location,force=false){
  let arr=v92RefreshBase(s,loc,force);if(!RF.fieldTables[loc])return arr;
  const desired=['sunmeadow','forest','river','mine','crossroads','marshroad','reedmere'].includes(loc)?4:3;
  if(arr.length>=desired)return arr;
  let stamp=`${s.day}:${Math.floor(RF.hour(s)/3)}`,rnd=RF.seedRand(RF.seedHash(`v92wild:${loc}:${stamp}`)),table=RF.fieldTables[loc],bag=[];
  table.forEach(([id,w])=>{if(RF.DATA.enemies[id])for(let i=0;i<w;i++)bag.push(id)});
  while(arr.length<desired&&bag.length){let id=bag[Math.floor(rnd()*bag.length)],e=RF.DATA.enemies[id];arr.push({uid:`${loc}_${stamp}_v92_${arr.length}`,id,level:e.level,hostile:e.temperament==='aggressive'&&rnd()<.28})}
  arr._stamp=stamp;s.encounters[loc]=arr;return arr;
};

/* ---------- Multi-stage dialogue ---------- */
RF.V92.followups={};
RF.V92.followups.mira={valley:{text:'Mira glances toward the mill wheel. “Greenvale survives because everyone thinks somebody else is holding it together.”',choices:[
  {text:'Who actually is holding it together?',reply:'“Mostly tired women, old rope, and people who say yes before checking the size of the job.”',relation:1,next:{text:'She smiles despite herself. “That answer was meant to discourage follow-up questions.”',choices:[{text:'It failed.',reply:'“Clearly.” She laughs and returns to stacking flour sacks.',relation:1},{text:'I’ll leave you to it.',reply:'“Kind of you. Suspicious, but kind.”'}]}},
  {text:'Does the mill ever stop?',reply:'“Only when something breaks, floods, freezes, catches fire, or develops an opinion.”'},
  {text:'Enough mill politics.',reply:'Mira nods. “A wise boundary.”'}
]}};
RF.V92.followups.brann={deep:{text:'Brann lowers his voice. “Deep Galleries have old support cuts underneath ours. Somebody mined there long before Greenvale had a name.”',choices:[
  {text:'Who?',reply:'“If I knew, I would have said a name instead of making this properly ominous.”',next:{text:'He taps the side of his nose with a blackened finger.',choices:[{text:'What have you found down there?',reply:'“Tool marks. Melted stone. Once, a boot with no foot in it. New boot, too.”',flag:'brann_boot_story'},{text:'I suddenly regret asking.',reply:'“Healthy instinct.”'}]}},
  {text:'Could it be dangerous?',reply:'“Everything underground is dangerous. Question is whether it knows you are there.”',xp:['exploration',8]},
  {text:'Leave the subject alone.',reply:'Brann looks relieved enough that you notice.'}
]}};
RF.V92.followups.elira={herbs:{text:'Elira opens a small roll of dried leaves. “Rule one: colour lies. Smell lies less. Texture lies only when magic is involved.”',choices:[
  {text:'What should I gather first?',reply:'“Greenleaf, Redroot, Mooncap once you know what you are doing. Never eat anything because a deer did.”',xp:['herblore',10]},
  {text:'What is the worst mistake beginners make?',reply:'“Calling vomiting ‘detoxification’ instead of ‘I poisoned myself.’”'},
  {text:'Ask about antidotes.',reply:'“Venom Sac and Redroot make a crude antivenom. Crude is still preferable to dead.”',flag:'elira_antivenom_hint'}
]}};
RF.V92.followups.halden={roads:{text:'Halden unfolds a small patrol map. “Threat depends on road, hour, weather, and how loudly you advertise having money.”',choices:[
  {text:'Which road is worst?',reply:'“Northwatch after dusk. Fenward in fog. Crossroads whenever three men are pretending not to know each other.”',xp:['exploration',9]},
  {text:'How do guards decide who looks suspicious?',reply:'“Experience, behaviour, and occasionally spectacular prejudice against people carrying stolen silverware.”'},
  {text:'Ask about your own reputation.',reply:s=>(s.crime?.bounty||0)>0?'Halden raises an eyebrow. “At present? Administratively interesting.”':'“Quiet enough that I had to think about it. Keep it that way.”'}
]}};
RF.V92.followups.tamsin={scout:{text:'Tamsin crouches and draws three marks in the dirt. “Tracking is mostly noticing what the world failed to put back where it belongs.”',choices:[
  {text:'Teach me a trick.',reply:'“Look for absence. Bent grass, quiet birds, one dry stone in wet mud. Presence is obvious. Absence is information.”',xp:['hunting',12]},
  {text:'What do you do if you lose a trail?',reply:'“Stop moving. People panic forward. Good scouts become furniture for a minute.”',xp:['exploration',7]},
  {text:'Ask about her worst job.',reply:'“Three days tracking a ‘monster’. Turned out to be two goats in a grain sack.”',relation:1}
]}};
RF.V92.followups.saela={magic:{text:'Saela makes a tiny ember orbit one finger. “Magic becomes safer the moment you stop thinking of it as power and start thinking of it as negotiation.”',choices:[
  {text:'What does reality want?',reply:'“Consistency. Magic is offering it a sufficiently convincing exception.”',xp:['magic',10]},
  {text:'What happens when the negotiation fails?',reply:'She points at a scorch mark on the wall. “Minutes of paperwork.”'},
  {text:'Can anyone learn?',reply:'“Most people can learn something. Not everyone should learn everything. This is also true of cooking.”'}
]}};
// Add entrances to the deeper dialogue branches.
const addFollow=(id,text,key)=>{let d=RF.DATA.namedDialogues[id];if(d&&!d.choices.some(c=>c.v92Follow===key))d.choices.push({text,v92Follow:key,reply:''})};
addFollow('mira','Stay and talk about Greenvale for a while.','valley');
addFollow('brann','Ask him to explain what is wrong with the deep galleries.','deep');
addFollow('elira','Ask for a proper lesson about herbs.','herbs');
addFollow('halden','Ask how he reads danger on the roads.','roads');
addFollow('tamsin','Ask her to teach you how scouts think.','scout');
addFollow('saela','Ask her what magic actually is.','magic');

RF.v92ApplyDialogueEffects=function(s,m,c){
  if(c.cost){if(s.gold<c.cost)return false;s.gold-=c.cost}
  if(c.rep)s.reputation[c.rep[0]]=(s.reputation[c.rep[0]]||0)+c.rep[1];
  if(c.relation)RF.changeRelation(s,m.speaker.id,typeof c.relation==='function'?c.relation(s):c.relation);
  if(c.xp)RF.addXp(s,c.xp[0],c.xp[1]);if(c.flag)s.flags[c.flag]=true;
  if(c.giveItem){RF.addItem(s,c.giveItem[0],c.giveItem[1]);s.collection.items[c.giveItem[0]]=true;if(c.gift){s.social.gifts++;s.stats.giftsReceived++}}
  if(c.joinGuild){s.guild.joined=true;s.guild.rank=Math.max(1,s.guild.rank);s.guild.reputation+=5;s.reputation.wayfarers+=5;s.flags.wayfarerHallOpen=true;RF.addItem(s,'guild_badge',1);s.collection.items.guild_badge=true;RF.generateContracts(s)}
  if(c.companion){s.companion={id:c.companion,level:1,bond:0,hp:70,maxHp:70};RF.log(s,`${RF.DATA.npcs[c.companion].name} joins you as a companion.`,'important')}
  return true;
};
RF.resolveDialogue=function(i){
  let s=RF.state,m=RF.UI.modal,c=m?.choices?.[i];if(!c||c.condition&&!c.condition(s))return;
  if(!RF.v92ApplyDialogueEffects(s,m,c))return;
  let reply=typeof c.reply==='function'?c.reply(s):c.reply;
  if(c.v92Follow){let f=RF.V92.followups[m.speaker.id]?.[c.v92Follow];if(f){RF.UI.modal={type:'dialogue',speaker:m.speaker,stage:c.v92Follow,text:typeof f.text==='function'?f.text(s):f.text,choices:f.choices};RF.save(s);RF.UI.render(s);return}}
  if(c.next){let n=typeof c.next==='function'?c.next(s):c.next;RF.UI.modal={type:'dialogue',speaker:m.speaker,stage:'followup',text:typeof n.text==='function'?n.text(s):n.text,choices:n.choices||[]};}
  else if(c.shop)RF.UI.modal={type:'dialogueShop',speaker:m.speaker,text:reply||'“Have a look.”',stock:c.shop};
  else RF.UI.modal={type:'dialogueEnd',speaker:m.speaker,text:reply||'The conversation reaches a natural end.'};
  RF.save(s);RF.UI.render(s);
};

/* ---------- Death: retain attained levels, lose every partial XP bar ---------- */
RF.v92ResetPartialXp=function(s){
  Object.entries(s.skills||{}).forEach(([id,sk])=>{sk.xp=RF.xpForLevel(sk.level)});
  const level=s.player.level||1;s.player.xp=100*Math.pow(Math.max(0,level-1),2);
};
const v92LoseBase=RF.loseV4Battle;
RF.loseV4Battle=function(){
  v92LoseBase();let s=RF.state;if(!s)return;RF.v92ResetPartialXp(s);s.stats.deaths=(s.stats.deaths||0)+1;
  RF.log(s,'Defeat wipes all partial Character and Skill XP progress. Your attained levels remain intact.','bad');
  if(RF.UI.modal?.type==='message')RF.UI.modal.text+=' All progress toward your next character and skill levels was lost, but every level you had already earned remains.';
  RF.save(s);RF.UI.render(s);
};

/* ---------- Reliable crime systems ---------- */
RF.V92.pickTimer=null;
RF.v92StopPick=function(){if(RF.V92.pickTimer){clearInterval(RF.V92.pickTimer);RF.V92.pickTimer=null}};
RF.v9StopPick=RF.v92StopPick;
RF.v9StartPickTicker=function(){
  RF.v92StopPick();let last=performance.now();
  RF.V92.pickTimer=setInterval(()=>{let g=RF.actionGame;if(!g||g.type!=='pickpocket'){RF.v92StopPick();return}let now=performance.now(),dt=Math.min(.12,(now-last)/1000);last=now;
    g.wanderTarget??=(10+Math.random()*80);if(Math.random()<.045)g.wanderTarget=7+Math.random()*86;
    let desired=Math.sign(g.wanderTarget-g.attention)*(18+g.vigilance*.12);g.velocity+=(desired-g.velocity)*Math.min(1,dt*1.7)+(Math.random()-.5)*8*dt;
    g.velocity=Math.max(-38,Math.min(38,g.velocity));g.attention+=g.velocity*dt;
    if(Math.abs(g.wanderTarget-g.attention)<3)g.wanderTarget=7+Math.random()*86;
    if(g.attention<1){g.attention=1;g.velocity=Math.abs(g.velocity)}if(g.attention>99){g.attention=99;g.velocity=-Math.abs(g.velocity)}
    let el=document.querySelector('.v9AttentionNeedle');if(el)el.style.left=`${g.attention}%`;
  },50);
};
const v92StartPickBase=RF.startPickpocket;
RF.startPickpocket=function(id,passer=false){v92StartPickBase(id,passer);setTimeout(()=>{if(RF.actionGame?.type==='pickpocket')RF.v9StartPickTicker()},30)};

RF.v92CrimeTargets=function(s){let out=[];if(RF.npcsHere)RF.npcsHere(s).forEach(n=>out.push({id:n.id,name:n.name,icon:n.icon||'🧑',job:n.job||'Resident',passer:false}));RF.passersHere(s).forEach(p=>out.push({id:p.id,name:p.name,icon:p.icon||'🧑',job:p.job||'Traveller',passer:true}));return out};
RF.v92BurglarySites={
  greenvale:[{id:'baker',name:'Baker’s Back Room',icon:'🥖',difficulty:22,loot:[18,46],items:['bread','honey_cake']},{id:'clothier',name:'Clothier’s Loft',icon:'🧵',difficulty:38,loot:[30,68],items:['waxed_thread','traveller_token']}],
  mill:[{id:'mill_store',name:'Mill Storehouse',icon:'🌾',difficulty:42,loot:[34,74],items:['bread','coal']}],
  ironridge:[{id:'forge_store',name:'Forge Store',icon:'⚒️',difficulty:62,loot:[55,110],items:['coal','iron_ore','steel_bar']},{id:'assayer',name:'Assayer’s Office',icon:'⚖️',difficulty:76,loot:[80,145],items:['silver_ore','whetstone']}],
  reedmere:[{id:'stilt_store',name:'Stilt Market Lockup',icon:'🌫️',difficulty:54,loot:[45,98],items:['redroot','mooncap','bait_grubs']},{id:'apothecary',name:'Apothecary Rear Shelf',icon:'🧪',difficulty:70,loot:[65,122],items:['antivenom','focus_draught','ghost_orchid']}]
};
RF.commitCrime=function(type){
  let s=RF.state;if(s.activity||s.combat||RF.actionGame)return;
  if(type==='pickpocket'){let targets=RF.v92CrimeTargets(s);RF.UI.modal={type:'v92PickTargets',targets};RF.UI.render(s);return}
  if(type==='burglary'){let sites=RF.v92BurglarySites[s.location]||[];RF.UI.modal={type:'v92BurglarySites',sites};RF.UI.render(s);return}
};
RF.v92ChooseBurglary=function(id){let s=RF.state,site=(RF.v92BurglarySites[s.location]||[]).find(x=>x.id===id);if(!site)return;RF.UI.modal={type:'v92BurglaryEntry',site};RF.UI.render(s)};
RF.v92BurglaryAttempt=function(method){
  let s=RF.state,m=RF.UI.modal,site=m?.site;if(!site)return;let th=s.skills.thieving.level||1,night=RF.hour(s)>=20||RF.hour(s)<5?10:0,tool=RF.bestTool?.(s,'lockpicking');let bonus=th*2+night+(tool?.tier||0)*5;
  let methodBonus=method==='lock'?12:method==='window'?4:method==='bluff'?(s.skills.speech.level||1):0;let chance=Math.max(.12,Math.min(.9,.66+(bonus+methodBonus-site.difficulty)/100));
  RF.advanceWorld(method==='window'?8:12);if(method==='lock'&&(s.inventory.lockpick||0)<1&&!tool){RF.UI.modal={type:'message',title:'No picks',text:'You need a lockpick set for that approach.'};return RF.UI.render(s)}
  if(Math.random()<chance){RF.UI.modal={type:'v92BurglaryInside',site,heat:0};RF.addXp(s,'thieving',12);RF.save(s);RF.UI.render(s)}else{let fine=26+Math.round(site.difficulty*.55);RF.addBounty(s,fine,'failed burglary');RF.addXp(s,'thieving',5);RF.UI.modal={type:'message',title:'Break-in Failed',text:`A light snaps on inside. You get away, but witnesses give a useful description. Bounty +${fine}g.`};RF.save(s);RF.UI.render(s)}
};
RF.v92BurglarySearch=function(deep=false){let s=RF.state,m=RF.UI.modal,site=m?.site;if(!site)return;let risk=(deep?.28:.1)+site.difficulty/500-(s.skills.thieving.level||1)*.004;if(Math.random()<risk){let fine=35+Math.round(site.difficulty*.6);RF.addBounty(s,fine,'caught during burglary');RF.UI.modal={type:'message',title:'Caught Inside',text:`A floorboard gives you away. You escape through the nearest opening with nothing but a bounty of ${fine}g.`};RF.save(s);return RF.UI.render(s)}let gold=site.loot[0]+Math.floor(Math.random()*(site.loot[1]-site.loot[0]+1))*(deep?1.45:1);gold=Math.round(gold);s.gold+=gold;s.crime.thefts++;s.stats.burglaries++;s.reputation.underworld=(s.reputation.underworld||0)+(deep?2:1);RF.addXp(s,'thieving',deep?65:38);let found=[];let rolls=deep?2:1;for(let i=0;i<rolls;i++)if(Math.random()<.55){let id=site.items[Math.floor(Math.random()*site.items.length)];if(RF.addItem(s,id,1)!==false)found.push(RF.DATA.items[id]?.name||id)}RF.advanceWorld(deep?18:8);RF.UI.modal={type:'message',title:'Clean Escape',text:`You slip away with ${gold} gold${found.length?` and ${found.join(', ')}`:''}.`};RF.save(s);RF.UI.render(s)};

/* ---------- Inventory/shop categories ---------- */
RF.v92Category=function(it){if(!it)return'other';if(it.type==='weapon'||it.slot==='main')return'weapons';if(it.type==='armor'||['head','chest','legs','boots','off'].includes(it.slot))return'armour';if(it.type==='food'||it.heal||it.stamina)return'consumables';if(it.type==='material')return'materials';if(it.type==='tool'||it.type==='utility')return'tools';if(it.type==='treasure'||it.type==='trinket'||it.slot==='ring1'||it.slot==='ring2')return'treasure';return'other'};
RF.v92Cats=[['all','All'],['weapons','Weapons'],['armour','Armour'],['consumables','Food & Potions'],['materials','Materials'],['tools','Tools'],['treasure','Treasure'],['other','Other']];
RF.v92CatBar=function(active,kind){return `<div class="categoryTabs">${RF.v92Cats.map(([id,n])=>`<button data-v92-cat="${kind}" data-cat="${id}" class="${active===id?'active':''}">${n}</button>`).join('')}</div>`};
RF.UI.inventory=function(s){
  const used=RF.packUsed(s),pct=Math.min(100,used/RF.V82.PACK_CAP*100),cat=s.v92.inventoryCategory||'all';
  const rows=Object.entries(s.inventory).filter(([,q])=>q>0).filter(([id])=>cat==='all'||RF.v92Category(RF.DATA.items[id])===cat).map(([id,q])=>{let it=RF.DATA.items[id];if(!it)return'';let equipped=RF.isEquipped(s,id),req=RF.itemRequirement(it),can=RF.canEquipItem(s,id),state=equipped?'<span class="equipState equipped">EQUIPPED</span>':it.slot?(can?'<span class="equipState">EQUIP</span>':'<span class="equipState locked">LOCKED</span>'):'';return `<button class="row inventoryRow" data-item-detail="${id}"><div class="icon">${it.icon}</div><div class="meta"><b>${it.name} ${state}</b><small>${it.rarity||it.type||'Item'}${req?` • ${RF.DATA.skills[req.skill]?.name||req.skill} ${req.level}`:''}</small></div><span class="qty">×${q}</span><span class="chev">›</span></button>`}).join('');
  return `<section class="card"><div class="questTitle"><h2>Pack</h2><span class="packCount ${used>=RF.V82.PACK_CAP?'full':''}">${used}/${RF.V82.PACK_CAP} slots</span></div><div class="packBar"><div style="width:${pct}%"></div></div><div class="sub">Items stack by type. Tap a category, then tap an item for details and actions.</div>${RF.v92CatBar(cat,'inventory')}${RF.isBankTown(s)?`<button class="action bankOpen" data-open-bank><b>🏦 Open Bank</b><small>Deposit or withdraw stored items</small></button>`:`<div class="tiny bankHint">🏦 Bank access: Greenvale, Ironridge and Reedmere.</div>`}<div class="list inventoryList">${rows||'<div class="sub">Nothing in this category.</div>'}</div></section>`;
};
RF.UI.shop=function(s){
  const l=RF.DATA.locations[s.location];if(!l?.shop)return `<section class="card"><h2>Shop</h2><div class="notice">There is no permanent shop here. Merchants move through settled roads and towns.</div></section>`;
  const stock=RF.v83ShopStock(s),market=s.world?.market||{food:1,metal:1,wood:1},cat=s.v92.shopCategory||'all';
  const buyRows=stock.filter(id=>cat==='all'||RF.v92Category(RF.DATA.items[id])===cat).map(id=>{let it=RF.DATA.items[id],price=RF.marketPrice?RF.marketPrice(s,id,true):Math.max(1,it.value||1);return `<button class="row browseRow" data-shop-detail="${id}" data-shop-mode="buy"><div class="icon">${it.icon}</div><div class="meta"><b>${it.name}</b><small>${it.desc||'No description recorded.'}</small></div><span class="qty">${price}g</span><span class="chev">›</span></button>`}).join('');
  const sellRows=Object.entries(s.inventory).filter(([id,q])=>q>0&&RF.DATA.items[id]?.value>0&&(cat==='all'||RF.v92Category(RF.DATA.items[id])===cat)).map(([id,q])=>{let it=RF.DATA.items[id],price=RF.marketPrice?RF.marketPrice(s,id,false):Math.max(1,Math.floor(it.value*.55));return `<button class="row browseRow" data-shop-detail="${id}" data-shop-mode="sell"><div class="icon">${it.icon}</div><div class="meta"><b>${it.name}</b><small>Owned ×${q}</small></div><span class="qty">${price}g</span><span class="chev">›</span></button>`}).join('');
  return `<section class="card"><h2>${RF.v83ShopName(s)}</h2><div class="marketTicker"><span>🍞 Food ×${(+market.food||1).toFixed(2)}</span><span>⚒️ Metal ×${(+market.metal||1).toFixed(2)}</span><span>🪵 Wood ×${(+market.wood||1).toFixed(2)}</span></div>${RF.v92CatBar(cat,'shop')}<div class="sub">Tap an item to inspect it before buying.</div><div class="list" style="margin-top:10px">${buyRows||'<div class="sub">No stock in this category.</div>'}</div></section><section class="card"><h3>Sell</h3><div class="list" style="margin-top:10px">${sellRows||'<div class="sub">Nothing saleable in this category.</div>'}</div></section>`;
};

/* ---------- V9.2 modals/bindings ---------- */
const v92ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){let m=this.modal;
  if(m?.type==='v92PickTargets')return `<div class="modalBack"><div class="modal"><div style="font-size:42px">🖐️</div><h2>Choose a Mark</h2><div class="sub">Pickpocketing is a real-time attention test. Vigilant targets have smaller safe windows.</div><div class="list">${m.targets.length?m.targets.map(t=>`<button class="row browseRow" data-v92-pick="${t.id}" data-passer="${t.passer?'1':'0'}"><div class="icon">${t.icon}</div><div class="meta"><b>${t.name}</b><small>${t.job}</small></div><span class="chev">›</span></button>`).join(''):'<div class="sub">Nobody suitable is close enough right now.</div>'}</div><button class="quietClose" data-v92-close>Leave it</button></div></div>`;
  if(m?.type==='v92BurglarySites')return `<div class="modalBack"><div class="modal"><div style="font-size:42px">🪟</div><h2>Choose a Target</h2><div class="sub">Burglary is easier at night and with Thieving skill or proper lock tools.</div><div class="list">${m.sites.length?m.sites.map(x=>`<button class="row browseRow" data-v92-burg-site="${x.id}"><div class="icon">${x.icon}</div><div class="meta"><b>${x.name}</b><small>Security ${x.difficulty}/100</small></div><span class="chev">›</span></button>`).join(''):'<div class="sub">There are no sensible burglary targets here.</div>'}</div><button class="quietClose" data-v92-close>Remain respectable</button></div></div>`;
  if(m?.type==='v92BurglaryEntry')return `<div class="modalBack"><div class="modal"><div style="font-size:42px">${m.site.icon}</div><span class="eyebrow">BURGLARY • SECURITY ${m.site.difficulty}</span><h2>${m.site.name}</h2><div class="sub">Choose how to get inside. Failure can create a bounty before you touch a single valuable.</div><div class="choices"><button class="choice" data-v92-entry="lock"><b>🗝️ Work the lock</b><small>Best with Thieving and lockpicking tools.</small></button><button class="choice" data-v92-entry="window"><b>🪟 Force a rear window</b><small>Faster, louder, less sophisticated.</small></button><button class="choice" data-v92-entry="bluff"><b>🗣️ Bluff your way near the back</b><small>Speech helps create an opening.</small></button><button class="choice" data-v92-close><b>Leave</b></button></div></div></div>`;
  if(m?.type==='v92BurglaryInside')return `<div class="modalBack"><div class="modal"><div style="font-size:42px">🕯️</div><h2>Inside ${m.site.name}</h2><div class="sub">You are in. Taking longer may uncover better loot, but every extra moment increases the chance somebody notices.</div><div class="choices"><button class="choice" data-v92-search="quick"><b>Grab what is obvious and leave</b><small>Lower risk, modest haul.</small></button><button class="choice dangerChoice" data-v92-search="deep"><b>Search thoroughly</b><small>Better haul, much greater risk.</small></button><button class="choice" data-v92-close><b>Leave empty-handed</b></button></div></div></div>`;
  return v92ModalBase(s);
};

const v92BindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  v92BindBase(s);
  document.querySelectorAll('[data-v92-cat]').forEach(b=>b.onclick=()=>{if(b.dataset.v92Cat==='inventory')s.v92.inventoryCategory=b.dataset.cat;else s.v92.shopCategory=b.dataset.cat;RF.save(s);RF.UI.render(s)});
  document.querySelectorAll('[data-v92-pick]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.startPickpocket(b.dataset.v92Pick,b.dataset.passer==='1')});
  document.querySelectorAll('[data-v92-burg-site]').forEach(b=>b.onclick=()=>RF.v92ChooseBurglary(b.dataset.v92BurgSite));
  document.querySelectorAll('[data-v92-entry]').forEach(b=>b.onclick=()=>RF.v92BurglaryAttempt(b.dataset.v92Entry));
  document.querySelectorAll('[data-v92-search]').forEach(b=>b.onclick=()=>RF.v92BurglarySearch(b.dataset.v92Search==='deep'));
  document.querySelectorAll('[data-v92-close]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(RF.state)});
  if(RF.actionGame?.type==='pickpocket'&&!RF.V92.pickTimer)setTimeout(()=>RF.v9StartPickTicker(),10);
};

if(RF.state){RF.migrateV92(RF.state);if(!RF.state.flags.v92Seen){RF.state.flags.v92Seen=true;RF.log(RF.state,'V9.2: deeper conversations, harsher defeat XP loss, denser wildlife, category browsing, and rebuilt crime systems are active.','important');RF.save(RF.state)}RF.UI.render(RF.state)}

// Reedmere also supports the rebuilt crime layer.
const v92WorldBase=RF.UI.world.bind(RF.UI);
RF.UI.world=function(s){
  let h=v92WorldBase(s);if(s.location!=='reedmere'||s.combat||s.activity)return h;
  if(h.includes('data-crime="pickpocket"'))return h;
  const crime=`<section class="card shadowCard"><h3>Less Reputable Options</h3><div class="grid2"><button class="action" data-crime="pickpocket"><span class="emoji">🫳</span><b>Pickpocket</b><small>Choose a nearby mark</small></button><button class="action danger" data-crime="burglary"><span class="emoji">🪟</span><b>Burglary</b><small>Case a local property</small></button></div></section>`;
  return h+crime;
};
