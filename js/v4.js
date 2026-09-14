window.RF=window.RF||{};
RF.VERSION='4.0.0';

/* =========================================================
   REALMFORGE V4 — VOICES & STEEL
   Dialogue, social memory, field encounters, tactical combat,
   companions, contracts, guilds, collection log and faction motion.
   ========================================================= */

Object.assign(RF.DATA.items,{
  field_tonic:{name:'Field Tonic',icon:'🧴',type:'food',value:42,rarity:'Uncommon',desc:'Combat medicine. Restores 28 HP and clears Bleeding.',heal:28},
  honey_cake:{name:'Honey Cake',icon:'🍯',type:'food',value:18,desc:'A travelling luxury. Restores 16 HP.',heal:16},
  lucky_charm:{name:'Carved Hare Charm',icon:'🐇',type:'trinket',value:75,rarity:'Rare',desc:'A tiny hare carved from rowan. Someone gave this to you for a reason.'},
  sunmeadow_hide:{name:'Sunmeadow Hide',icon:'🦬',type:'material',value:24,desc:'Thick hide from the broad-backed beasts of the meadow.'},
  venom_sac:{name:'Venom Sac',icon:'🟢',type:'material',value:28,desc:'Dangerous alchemical material.'},
  traveller_token:{name:'Traveller Token',icon:'🎟️',type:'trinket',value:20,desc:'A stamped brass token accepted by several road merchants.'},
  warding_salt:{name:'Warding Salt',icon:'🧂',type:'utility',value:35,desc:'Used by hedge mages to disrupt hostile magic.'},
  guild_badge:{name:'Wayfarer Guild Badge',icon:'🧭',type:'quest',value:0,rarity:'Uncommon',desc:'Marks you as a sworn member of the Wayfarers.'},
  field_manual:{name:'Field Manual',icon:'📕',type:'trinket',value:95,rarity:'Rare',desc:'Notes on tells, feints and monster behaviour.'}
});

Object.assign(RF.DATA.locations,{
  sunmeadow:{name:'Sunmeadow Fields',icon:'🌾',region:'Greenvale',desc:'Long grass, broken drystone walls and old cart tracks. Peaceful at a glance; full of teeth when the wind changes.',neighbors:{greenvale:13,mill:11,crossroads:17},actions:['forage','hunt','explore'],wild:true},
  guildhall:{name:'Wayfarer Hall',icon:'🧭',region:'Greenvale',desc:'A timber guildhall plastered with maps, contracts and trophies from journeys that improved in the telling.',neighbors:{greenvale:6},actions:['talk'],lockedFlag:'wayfarerHallOpen'}
});
RF.DATA.locations.greenvale.neighbors.sunmeadow=13;
RF.DATA.locations.greenvale.neighbors.guildhall=6;
RF.DATA.locations.mill.neighbors.sunmeadow=11;
RF.DATA.locations.crossroads.neighbors.sunmeadow=17;

Object.assign(RF.DATA.enemies,{
  meadow_boar:{name:'Razorback Boar',icon:'🐗',hp:68,damage:[6,13],armor:3,xp:82,gold:[0,4],drops:[['raw_meat',.8,1],['sunmeadow_hide',.42,1]],level:5,temperament:'territorial',moves:['gore','hoof_feint','brace']},
  thorn_adder:{name:'Thorn Adder',icon:'🐍',hp:46,damage:[4,10],armor:0,xp:75,gold:[0,2],drops:[['venom_sac',.48,1],['herb',.2,1]],level:5,temperament:'aggressive',moves:['bite','venom_bite','coil']},
  feral_hound:{name:'Feral Hound',icon:'🐕',hp:74,damage:[7,14],armor:1,xp:94,gold:[0,3],drops:[['raw_meat',.3,1],['wolf_fang',.4,1]],level:7,temperament:'aggressive',moves:['snap','hamstring','circle']},
  hill_troll:{name:'Young Hill Troll',icon:'🧌',hp:155,damage:[10,21],armor:6,xp:240,gold:[8,22],drops:[['iron_ore',.6,2],['field_manual',.05,1]],level:11,temperament:'territorial',moves:['club','boulder','roar','brace']},
  ash_wisp:{name:'Ash Wisp',icon:'👻',hp:88,damage:[8,16],armor:2,xp:145,gold:[3,12],drops:[['warding_salt',.22,1],['ember_shard',.16,1]],level:9,temperament:'aggressive',moves:['cinder_touch','hex','drift']}
});
// Give legacy enemies tactical move pools.
Object.assign(RF.DATA.enemies.rat,{moves:['bite','scrabble']});
Object.assign(RF.DATA.enemies.wolf,{moves:['snap','hamstring','circle']});
Object.assign(RF.DATA.enemies.bandit,{moves:['slash','dirty_trick','brace']});
Object.assign(RF.DATA.enemies.brute,{moves:['club','roar','brace']});
Object.assign(RF.DATA.enemies.cave_spider,{moves:['bite','venom_bite','web']});
Object.assign(RF.DATA.enemies.blackthorn_scout,{moves:['quickshot','marked_shot','evade']});
Object.assign(RF.DATA.enemies.captain_voss,{moves:['slash','commanding_strike','dirty_trick','brace']});
if(RF.DATA.enemies.gravewarden)RF.DATA.enemies.gravewarden.moves=['grave_cut','hex','brace','soul_drain'];
if(RF.DATA.enemies.ridge_raider)RF.DATA.enemies.ridge_raider.moves=['slash','marked_shot','dirty_trick'];

RF.DATA.abilities={
  attack:{name:'Strike',icon:'⚔️',level:1,desc:'Reliable weapon attack.',cost:0,cooldown:0,kind:'attack',power:1,accuracy:.94},
  guard:{name:'Guard',icon:'🛡️',level:1,desc:'Reduce incoming damage until your next turn.',cost:0,cooldown:0,kind:'guard'},
  power:{name:'Power Strike',icon:'💥',level:3,skill:'strength',desc:'Heavy hit with a chance to stagger.',cost:18,cooldown:1,kind:'attack',power:1.55,accuracy:.78,status:{id:'stagger',chance:.25,turns:1}},
  precision:{name:'Precise Strike',icon:'🎯',level:4,skill:'attack',desc:'Highly accurate hit with increased critical chance.',cost:13,cooldown:1,kind:'attack',power:1.16,accuracy:1,crit:.28},
  bleeding_cut:{name:'Bleeding Cut',icon:'🩸',level:7,skill:'attack',desc:'Lower initial damage, inflicts Bleeding.',cost:15,cooldown:2,kind:'attack',power:.88,accuracy:.91,status:{id:'bleed',chance:.8,turns:3}},
  hunters_mark:{name:"Hunter's Mark",icon:'🐾',level:6,skill:'hunting',desc:'Expose the enemy, increasing damage it takes.',cost:11,cooldown:3,kind:'status',targetStatus:{id:'exposed',turns:3}},
  arcane_spark:{name:'Arcane Spark',icon:'✨',level:3,skill:'magic',desc:'Magic damage partly ignores armour.',cost:16,cooldown:1,kind:'magic',power:1.25,accuracy:.95},
  second_wind:{name:'Second Wind',icon:'❤️‍🔥',level:5,skill:'vitality',desc:'Recover health. Stronger when badly wounded.',cost:22,cooldown:4,kind:'heal'},
  riposte:{name:'Riposte',icon:'↩️',level:8,skill:'defence',desc:'Guard and prepare a counterattack.',cost:14,cooldown:3,kind:'riposte'},
  crushing_blow:{name:'Crushing Blow',icon:'🔨',level:10,skill:'strength',desc:'Slow, brutal attack that breaks armour temporarily.',cost:26,cooldown:3,kind:'attack',power:1.9,accuracy:.69,status:{id:'broken_armor',chance:.75,turns:2}},
  volley:{name:'Quick Volley',icon:'🏹',level:8,skill:'archery',desc:'Two rapid hits when wielding a bow.',cost:20,cooldown:2,kind:'volley',requiresBow:true}
};

RF.DATA.enemyMoves={
 bite:{name:'Bite',power:1,accuracy:.92},scrabble:{name:'Scrabble',power:.75,accuracy:.96},snap:{name:'Snap',power:1,accuracy:.93},
 slash:{name:'Slash',power:1.05,accuracy:.9},club:{name:'Crushing Swing',power:1.32,accuracy:.76},quickshot:{name:'Quick Shot',power:.9,accuracy:.95},
 gore:{name:'Gore',power:1.2,accuracy:.86},hoof_feint:{name:'Hoof Feint',power:.7,accuracy:.95,status:{id:'exposed',chance:.45,turns:2}},
 brace:{name:'Brace',kind:'guard'},coil:{name:'Coil',kind:'guard'},circle:{name:'Circle',kind:'buff',status:{id:'focused',turns:2}},
 venom_bite:{name:'Venom Bite',power:.82,accuracy:.87,status:{id:'poison',chance:.55,turns:3}},hamstring:{name:'Hamstring',power:.85,accuracy:.9,status:{id:'bleed',chance:.35,turns:2}},
 dirty_trick:{name:'Dirty Trick',power:.7,accuracy:.88,status:{id:'weakened',chance:.65,turns:2}},commanding_strike:{name:'Commanding Strike',power:1.42,accuracy:.82},
 web:{name:'Web',power:.35,accuracy:.94,status:{id:'weakened',chance:.8,turns:2}},marked_shot:{name:'Marked Shot',power:1.15,accuracy:.88,status:{id:'exposed',chance:.55,turns:2}},
 evade:{name:'Evade',kind:'guard'},boulder:{name:'Hurl Boulder',power:1.38,accuracy:.72},roar:{name:'Roar',kind:'status',status:{id:'weakened',turns:2}},
 cinder_touch:{name:'Cinder Touch',power:1.08,accuracy:.9,status:{id:'burn',chance:.5,turns:3}},hex:{name:'Hex',kind:'status',status:{id:'weakened',turns:3}},drift:{name:'Drift',kind:'guard'},
 grave_cut:{name:'Grave Cut',power:1.25,accuracy:.88,status:{id:'bleed',chance:.4,turns:2}},soul_drain:{name:'Soul Drain',power:.78,accuracy:.9,drain:true}
};

Object.assign(RF.DATA.npcs,{
  tamsin:{name:'Tamsin Reed',icon:'🧭',job:'Wayfarer Scout',home:'guildhall',schedule:[['guildhall',6,10],['sunmeadow',10,16],['crossroads',16,19],['guildhall',19,24]],condition:s=>s.flags.wayfarerHallOpen,rumours:['A map is only a list of places where somebody got lost first.','Boars give you a warning. Adders mostly outsource the warning to venom.']},
  vell:{name:'Master Vell',icon:'🧓',job:'Wayfarer Guildmaster',home:'guildhall',schedule:[['guildhall',7,22]],condition:s=>s.flags.wayfarerHallOpen,rumours:['Contracts pay because certainty is expensive.','A useful traveller notices what everyone else calls scenery.']},
  saela:{name:'Saela Emberglass',icon:'🔮',job:'Hedge Mage',home:'ironridge',schedule:[['ironridge',9,15],['quarry',15,18],['ironridge',18,23]],condition:s=>!!RF.DATA.locations.ironridge&&!!s.visited.ironridge,rumours:['Magic is mostly convincing reality that it misremembered the rules.','Ash wisps hate salt, bells, and being observed too confidently.']}
});

RF.DATA.passers={
  farmer:{icons:['👨‍🌾','👩‍🌾'],jobs:['Shepherd','Turnip Farmer','Drover'],openers:['Fine weather for pretending the fence will mend itself.','You travelling far, or just avoiding somewhere nearby?','Lost a boot in this mud last year. Still think about it.'],gift:'bread'},
  trader:{icons:['🧔','👩‍💼','🧑‍💼'],jobs:['Road Trader','Peddler','Cloth Merchant'],openers:['You have the look of someone who checks prices twice. Sensible.','Road is dearer every mile north. Somehow the potholes remain free.','I trade in necessities, luxuries, and objects people later claim were necessities.'],wares:['honey_cake','field_tonic','lockpick','traveller_token']},
  pilgrim:{icons:['🧕','🧙','🧓'],jobs:['Pilgrim','Shrine Walker','Lay Brother'],openers:['A road walked slowly reveals twice as much and charges no extra.','Have you ever noticed crows always look as if they know the ending?','I have three prayers for rain and none for stopping it. Poor planning.'],gift:'lucky_charm'},
  mercenary:{icons:['🧔‍♂️','🥷','🧑'],jobs:['Sellsword','Caravan Guard','Retired Spear'],openers:['Your stance says you have fought. Your shoulders say you paid for it.','Never trust an opponent who smiles before drawing steel. After is fine.','A good shield is a door you carry into arguments.'],wares:['field_tonic','warding_salt']},
  wanderer:{icons:['🧑','👩','🧔'],jobs:['Wanderer','Tinker','Map Seller'],openers:['Morning. Or afternoon. I stopped asking the sun for paperwork.','There is a village west of here where every dog is named Bramble. No idea why.','Best part of travelling is becoming a stranger professionally.'],wares:['traveller_token','honey_cake']}
};
RF.DATA.passerNames=['Alden','Bess','Corin','Della','Ewan','Fara','Garrick','Hett','Ivo','Jessa','Kell','Lena','Merek','Nell','Orso','Pella','Quin','Rhea','Soren','Tilda','Ulric','Veya','Wren','Yara'];

RF.DATA.namedDialogues={
  mira:{greeting:s=>s.flags.grainRationing?'Mira wipes flour from her forearms. “Still standing. So is the mill. I call that a successful policy.”':'Mira leans against a sack of grain. “If you’re here to complain about flour prices, take a number. If you’re here to help, skip the queue.”',choices:[
    {text:'How is the valley doing?',reply:'“Better when the roads behave. Worse when men with swords decide they understand economics.”',rep:['greenvale',1]},
    {text:'Tell me something completely unimportant.',reply:'“Brann snores loud enough to shake flour from the rafters. There. Valuable intelligence.”'},
    {text:'Offer to carry sacks for a while.',reply:'“Now that is a language I speak.” You spend a while helping. Mira presses warm bread into your hands afterward.',gift:'bread',xp:['strength',10],relation:2}
  ]},
  brann:{greeting:'Brann rubs mine dust from his beard and succeeds mainly in relocating it. “You look too clean. Suspicious.”',choices:[
    {text:'Ask about the deep galleries.',reply:'“Stone down there sounds wrong. Not hollow. Listening.”',flag:'brann_deep_warning'},
    {text:'Tell him he looks worse.',reply:'Brann studies you solemnly. “Good. Means the mine lost.”',relation:1},
    {text:'Buy him a drink (4g).',cost:4,reply:'The drink disappears at alarming speed. Brann gives you two pieces of coal “for whatever questionable project you’ve got brewing.”',giveItem:['coal',2],relation:3}
  ]},
  elira:{greeting:'Elira turns a leaf over between two fingers. “Plants are easier than people. They poison you with much clearer signalling.”',choices:[
    {text:'Ask for herbal advice.',reply:'“Bruised Greenleaf smells like wet pepper. If it smells sweet, put it down and apologise to your liver.”',xp:['herblore',18]},
    {text:'Ask how her day is going.',reply:'“A fox stole my lunch. I respect the technique, object to the target.”',relation:1},
    {text:'Purchase a field tonic (35g).',cost:35,reply:'Elira hands you a corked bottle. “Drink it. Do not admire it. Medicine resents an audience.”',giveItem:['field_tonic',1]}
  ]},
  oren:{greeting:s=>s.flags.robbedMerchant?'Oren’s smile reaches precisely nowhere. “Funny thing about roadside disasters. You remember the hands that were nearby.”':'Oren grins. “There’s my favourite argument for not dying beside a milestone.”',choices:[
    {text:'Ask about trade.',reply:'“Buy where people have plenty, sell where they complain loudly. Entire profession, really.”',xp:['trading',16]},
    {text:'Ask if he needs anything.',reply:'“Not today. Which is merchant speech for: ask again after the next catastrophe.”',relation:1},
    {text:'See what he has tucked away.',reply:'Oren opens a narrow travelling case.',shop:['honey_cake','field_tonic','traveller_token','lockpick']}
  ]},
  halden:{greeting:s=>s.crime?.bounty>0?'Halden folds his arms. “You have considerable confidence approaching a watch sergeant with your face currently on paper.”':'Halden nods once. “Wanderer.”',choices:[
    {text:'Ask about threats on the road.',reply:'“Blackthorn splinters, feral packs, opportunists. Peace is mostly danger waiting for poor scheduling.”',xp:['exploration',12]},
    {text:'Ask what he does for fun.',reply:'Halden stares. “Paperwork with smaller margins.”'},
    {text:'Volunteer for patrol work.',reply:'“Wayfarer Hall posts the work we cannot spare uniforms for. Speak to Vell.”',flag:'wayfarerHallOpen',relation:2}
  ]},
  tamsin:{greeting:'Tamsin rolls a coin across her knuckles, catches it, and nearly drops it. “That was more impressive in my head.”',choices:[
    {text:'Ask about scouting.',reply:'“See first. Fight second. Run third. Anyone who says running is cowardice has never been chased by a troll.”',xp:['exploration',20],relation:1},
    {text:'Ask about joining the Wayfarers.',reply:'“Talk to Vell. If he likes you, welcome aboard. If he doesn’t, wait ten minutes. He forgets efficiently.”',flag:'wayfarerHallOpen'},
    {text:'Invite her to travel with you.',condition:s=>(s.social?.relations?.tamsin||0)>=5&&s.guild?.rank>=1,reply:'“About time. I was getting tired of saving all my excellent commentary for myself.”',companion:'tamsin'}
  ]},
  vell:{greeting:'Master Vell peers over a map. “If you are about to ask whether the red marks are dangerous, yes. If you are about to ask whether they pay, also yes.”',choices:[
    {text:'Join the Wayfarers.',condition:s=>!s.guild?.joined,reply:'Vell stamps a badge with unnecessary violence. “Welcome. Try not to become one of the red marks.”',joinGuild:true},
    {text:'Ask for work.',reply:'“Board is to your right. Anything still pinned up has not killed the previous volunteer yet.”'},
    {text:'Ask why he founded the guild.',reply:'“I didn’t. I inherited it after the founder vanished. That answer usually stops the follow-up questions.”',relation:1}
  ]},
  saela:{greeting:'Saela’s fingertips glow faintly orange. “Before you ask, yes, it is magic. No, it does not help with washing dishes.”',choices:[
    {text:'Ask to learn practical magic.',reply:'“Start with Arcane Spark. Less dramatic than fireballs, substantially better for eyebrows.”',xp:['magic',35],flag:'arcane_tutored'},
    {text:'Ask about ash wisps.',reply:'“They are what happens when a bad memory discovers mobility. Salt helps.”'},
    {text:'Buy warding salt (28g).',cost:28,reply:'Saela wraps the salt twice. “Keep it dry. And do not season dinner with it unless dinner is haunted.”',giveItem:['warding_salt',1]}
  ]}
};

RF.DATA.contractTemplates=[
 {id:'cull',name:'Cull the Wild',icon:'🐾',desc:'Reduce dangerous wildlife near the road.',targets:['wolf','meadow_boar','feral_hound'],count:[2,4],reward:[55,95]},
 {id:'venom',name:'Venom Samples',icon:'🐍',desc:'Bring back venom sacs for guild alchemists.',item:'venom_sac',count:[1,3],reward:[60,110]},
 {id:'road',name:'Road Survey',icon:'🗺️',desc:'Walk the roads and report what changed.',visits:['sunmeadow','crossroads','forest'],reward:[45,80]}
];

RF.migrateV4=function(s){
 if(!s)return s;s.version='4.0.0';
 s.social=s.social||{relations:{},passersSeen:{},dialogues:0,gifts:0};s.social.relations=s.social.relations||{};s.social.passersSeen=s.social.passersSeen||{};
 s.encounters=s.encounters||{};s.collection=s.collection||{enemies:{},items:{},npcs:{},abilities:{}};
 s.companion=s.companion||null;s.guild=s.guild||{joined:false,rank:0,reputation:0,contracts:[],completed:0};s.home=s.home||{owned:false,level:0,wellRestedBattles:0};s.specialization=s.specialization||null;
 s.factionWar=s.factionWar||{tension:0,lastShiftDay:s.day||1};s.stats=s.stats||{};s.stats.dialogues??=0;s.stats.turnBattles??=0;s.stats.contracts??=0;s.stats.giftsReceived??=0;
 s.flags=s.flags||{};s.reputation=s.reputation||{};s.reputation.wayfarers??=0;
 if((s.player?.level||1)>=3||s.flags.eastwatchOpen)s.flags.wayfarerHallOpen=true;
 // clean legacy combat into V4 battle shape if loading mid-fight
 if(s.combat&&!s.combat.turn){s.combat=null;RF.log(s,'The unfinished V3 skirmish disperses as the V4 battle system takes over.','important')}
 Object.keys(s.inventory||{}).forEach(id=>{if((s.inventory[id]||0)>0)s.collection.items[id]=true});
 return s;
};
const v4New=RF.newGame;RF.newGame=function(...a){return RF.migrateV4(v4New(...a))};
const v4Load=RF.load;RF.load=function(){return RF.migrateV4(v4Load())};
const v4Import=RF.importSave;RF.importSave=function(x){return RF.migrateV4(v4Import(x))};

RF.relationship=(s,id)=>s.social?.relations?.[id]||0;
RF.changeRelation=function(s,id,n){s.social.relations[id]=(s.social.relations[id]||0)+n};
RF.seedHash=function(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
RF.seedRand=function(seed){let x=seed>>>0;return()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}};
RF.passersHere=function(s){
 let loc=RF.DATA.locations[s.location];if(!loc||['crypt','deep_mine','ember_cave','bandit_camp'].includes(s.location))return[];
 let h=RF.hour(s),busy=(h>=7&&h<21);if(!busy&&s.location!=='crossroads')return[];
 let seed=RF.seedHash(`${s.day}:${s.location}:${Math.floor(h/3)}`),rnd=RF.seedRand(seed),types=Object.keys(RF.DATA.passers),count=s.location==='crossroads'?2+(rnd()>.55?1:0):(rnd()>.5?2:1),arr=[];
 for(let i=0;i<count;i++){
  let type=types[Math.floor(rnd()*types.length)],a=RF.DATA.passers[type],name=RF.DATA.passerNames[Math.floor(rnd()*RF.DATA.passerNames.length)],job=a.jobs[Math.floor(rnd()*a.jobs.length)],icon=a.icons[Math.floor(rnd()*a.icons.length)],opener=a.openers[Math.floor(rnd()*a.openers.length)];
  arr.push({id:`passer_${seed}_${i}`,type,name,job,icon,opener,wares:a.wares||[],gift:a.gift||null});
 }
 return arr;
};

RF.openDialogue=function(id,passer=false){
 let s=RF.state;if(s.combat||s.activity)return;s.speed=0;
 if(passer){let p=RF.passersHere(s).find(x=>x.id===id);if(!p)return;RF.collectionNpc(s,p.id,p.name);RF.UI.modal={type:'dialogue',speaker:p,stage:'root',text:p.opener,choices:RF.passerChoices(p,s)};}
 else {let n=RF.DATA.npcs[id],d=RF.DATA.namedDialogues[id];if(!n)return;if(!d){let line=n.rumours?.[Math.floor(Math.random()*n.rumours.length)]||'“Roads be with you.”';RF.UI.modal={type:'dialogue',speaker:{id,name:n.name,icon:n.icon,job:n.job},stage:'root',text:line,choices:[{text:'Wish them well.',reply:'You exchange a nod and continue with your day.',relation:1},{text:'Move on.',reply:'The conversation ends there.'}]};}
 else {RF.collectionNpc(s,id,n.name);RF.UI.modal={type:'dialogue',speaker:{id,name:n.name,icon:n.icon,job:n.job},stage:'root',text:typeof d.greeting==='function'?d.greeting(s):d.greeting,choices:d.choices};}}
 s.social.dialogues++;s.stats.dialogues++;RF.save(s);RF.UI.render(s);
};
RF.collectionNpc=function(s,id,name){s.collection.npcs[id]=name||true};
RF.passerChoices=function(p,s){
 let choices=[
  {text:'Be friendly.',reply:()=>{let pool=['You trade a few harmless stories about the road.','The conversation wanders pleasantly through weather, food and villages neither of you recommends.','For several minutes, neither of you says anything historically important. It is excellent.'];return pool[Math.floor(Math.random()*pool.length)]},relation:1,xp:['speech',7]},
  {text:'Ask where they are headed.',reply:()=>`“${p.type==='trader'?'Wherever people have money and poor impulse control.':p.type==='pilgrim'?'East until the shrine road bends north. After that, I let the road vote.':p.type==='mercenary'?'North for work. South if the work notices me first.':'Nowhere urgent. That is the luxury.'}”`,xp:['exploration',5]},
  {text:'Make a dry joke.',reply:()=>Math.random()<.72?'They laugh. Not politely either. A genuine one.':'They stare for half a second too long. “Right.”',relation:Math.random()<.72?2:0,xp:['speech',5]}
 ];
 if(p.wares?.length)choices.push({text:'Ask if they are selling anything.',reply:'They loosen the straps on a travelling case.',shop:p.wares});
 if(p.gift&&Math.random()<.38&&!s.social.passersSeen[p.id])choices.push({text:'Offer them some road advice.',reply:()=>{s.social.passersSeen[p.id]=true;return `They consider your advice, then press something into your hand. “Fair trade.”`;},giveItem:[p.gift,1],gift:true});
 return choices;
};
RF.resolveDialogue=function(i){
 let s=RF.state,m=RF.UI.modal,c=m?.choices?.[i];if(!c)return;if(c.condition&&!c.condition(s))return;
 if(c.cost){if(s.gold<c.cost)return;s.gold-=c.cost}
 if(c.rep){s.reputation[c.rep[0]]=(s.reputation[c.rep[0]]||0)+c.rep[1]}
 if(c.relation)RF.changeRelation(s,m.speaker.id,typeof c.relation==='function'?c.relation(s):c.relation);
 if(c.xp)RF.addXp(s,c.xp[0],c.xp[1]);if(c.flag)s.flags[c.flag]=true;
 if(c.giveItem){RF.addItem(s,c.giveItem[0],c.giveItem[1]);s.collection.items[c.giveItem[0]]=true;if(c.gift){s.social.gifts++;s.stats.giftsReceived++}}
 if(c.joinGuild){s.guild.joined=true;s.guild.rank=Math.max(1,s.guild.rank);s.guild.reputation+=5;s.reputation.wayfarers+=5;s.flags.wayfarerHallOpen=true;RF.addItem(s,'guild_badge',1);s.collection.items.guild_badge=true;RF.generateContracts(s);}
 if(c.companion){s.companion={id:c.companion,level:1,bond:0,hp:70,maxHp:70};RF.log(s,`${RF.DATA.npcs[c.companion].name} joins you as a companion.`,'important')}
 let reply=typeof c.reply==='function'?c.reply(s):c.reply;
 if(c.shop){RF.UI.modal={type:'dialogueShop',speaker:m.speaker,text:reply||'“Have a look.”',stock:c.shop};}
 else RF.UI.modal={type:'dialogueEnd',speaker:m.speaker,text:reply||'The conversation reaches a natural end.'};
 RF.save(s);RF.UI.render(s);
};

RF.generateContracts=function(s){
 if(!s.guild.joined)return;if(s.guild.contracts.some(x=>!x.done))return;
 let rnd=RF.seedRand(RF.seedHash(`contracts:${s.day}:${s.player.name}`));s.guild.contracts=[];
 for(let i=0;i<3;i++){
  let t=RF.DATA.contractTemplates[Math.floor(rnd()*RF.DATA.contractTemplates.length)],c={uid:`${s.day}_${i}_${t.id}`,type:t.id,name:t.name,icon:t.icon,desc:t.desc,done:false,claimed:false,startKills:{...s.kills},startVisited:{...s.visited}};
  if(t.targets){c.target=t.targets[Math.floor(rnd()*t.targets.length)];c.count=t.count[0]+Math.floor(rnd()*(t.count[1]-t.count[0]+1))}
  if(t.item){c.item=t.item;c.count=t.count[0]+Math.floor(rnd()*(t.count[1]-t.count[0]+1))}
  if(t.visits)c.visits=t.visits.slice();c.reward=t.reward[0]+Math.floor(rnd()*(t.reward[1]-t.reward[0]+1));s.guild.contracts.push(c);
 }
};
RF.contractProgress=function(s,c){
 if(c.target)return Math.min(c.count,(s.kills[c.target]||0)-(c.startKills[c.target]||0));
 if(c.item)return Math.min(c.count,s.inventory[c.item]||0);
 if(c.visits)return c.visits.filter(x=>s.visited[x]).length;return 0;
};
RF.claimContract=function(uid){let s=RF.state,c=s.guild.contracts.find(x=>x.uid===uid);if(!c||c.claimed)return;let need=c.visits?c.visits.length:c.count;if(RF.contractProgress(s,c)<need)return;if(c.item&&!RF.takeItem(s,c.item,c.count))return;c.done=true;c.claimed=true;s.gold+=c.reward;s.guild.reputation+=8;s.reputation.wayfarers+=3;s.guild.completed++;s.stats.contracts++;if(s.guild.completed>=3)s.guild.rank=Math.max(s.guild.rank,2);if(s.guild.completed>=8)s.guild.rank=Math.max(s.guild.rank,3);RF.addPlayerXp(s,80+c.reward);RF.log(s,`Contract complete: ${c.name}. ${c.reward}g earned.`,'important');RF.save(s);RF.UI.render(s)};

RF.fieldTables={
 sunmeadow:[['meadow_boar',4],['thorn_adder',3],['wolf',2],['feral_hound',1]],forest:[['wolf',4],['feral_hound',1]],river:[['rat',1],['thorn_adder',1]],mine:[['rat',4],['cave_spider',1]],deep_mine:[['cave_spider',4]],crossroads:[['bandit',1],['wolf',1]],northroad:[['ridge_raider',4],['hill_troll',1]],quarry:[['ridge_raider',2],['hill_troll',2]],ember_cave:[['ash_wisp',4]],crypt:[['gravewarden',1]]
};
RF.refreshEncounters=function(s,loc=s.location,force=false){
 if(!RF.fieldTables[loc]){s.encounters[loc]=[];return[]}
 let old=s.encounters[loc]||[],stamp=`${s.day}:${Math.floor(RF.hour(s)/3)}`;if(!force&&old._stamp===stamp)return old;
 let rnd=RF.seedRand(RF.seedHash(`wild:${loc}:${stamp}`)),table=RF.fieldTables[loc],bag=[];table.forEach(([id,w])=>{for(let i=0;i<w;i++)bag.push(id)});let count=loc==='sunmeadow'?2+Math.floor(rnd()*2):1+Math.floor(rnd()*2),arr=[];
 for(let i=0;i<count;i++){let id=bag[Math.floor(rnd()*bag.length)],e=RF.DATA.enemies[id];arr.push({uid:`${loc}_${stamp}_${i}`,id,level:e.level,hostile:e.temperament==='aggressive'&&rnd()<.3})}arr._stamp=stamp;s.encounters[loc]=arr;return arr;
};
RF.fightNearby=function(uid){let s=RF.state,list=RF.refreshEncounters(s),spot=list.find(x=>x.uid===uid);if(!spot||s.combat)return;RF.startBattle(spot.id,{sourceUid:uid,forced:false})};

RF.unlockedAbilities=function(s){return Object.entries(RF.DATA.abilities).filter(([id,a])=>{if(a.skill&&s.skills[a.skill].level<a.level)return false;if(!a.skill&&s.player.level<a.level)return false;if(a.requiresBow&&!RF.DATA.items[s.equipment.main]?.ranged)return false;return true}).map(([id,a])=>({id,...a}))};
RF.statusName=id=>({bleed:'Bleeding',poison:'Poisoned',burn:'Burning',exposed:'Exposed',weakened:'Weakened',stagger:'Staggered',broken_armor:'Armour Broken',focused:'Focused',guard:'Guarding',riposte:'Riposte'})[id]||id;
RF.addStatus=function(target,id,turns,power=1){let ex=target.statuses.find(x=>x.id===id);if(ex){ex.turns=Math.max(ex.turns,turns);ex.power=Math.max(ex.power||1,power)}else target.statuses.push({id,turns,power})};
RF.hasStatus=(target,id)=>target.statuses?.some(x=>x.id===id&&x.turns>0);
RF.startBattle=function(id,opts={}){
 let s=RF.state,e=RF.DATA.enemies[id];if(!e)return;s.activity=null;s.speed=0;s.combat={id,hp:e.hp,maxHp:e.hp,turn:1,phase:'player',playerStatuses:[],enemyStatuses:[],cooldowns:{},enemyGuard:false,playerGuard:false,riposte:false,sourceUid:opts.sourceUid||null,forced:!!opts.forced,log:[`${e.name} enters the fight.`]};s.stats.turnBattles++;s.collection.enemies[id]=(s.collection.enemies[id]||0);RF.log(s,`${opts.forced?'Ambush! ':'Battle: '}${e.name}.`,'bad');RF.save(s);RF.UI.render(s)
};
RF.spawnEnemy=function(id){return RF.startBattle(id,{forced:true})};
RF.battleLog=function(s,text,type=''){s.combat.log.unshift({text,type});s.combat.log=s.combat.log.slice(0,8);RF.log(s,text,type)};
RF.tickStatuses=function(s,target,who){
 let statuses=target.statuses||[];for(let st of statuses){if(['bleed','poison','burn'].includes(st.id)){let dmg=st.id==='bleed'?4:st.id==='poison'?5:6;dmg=Math.max(1,Math.round(dmg*(st.power||1)));if(who==='player'){s.player.hp-=dmg;RF.battleLog(s,`${RF.statusName(st.id)} deals ${dmg} damage to you.`,'bad')}else{s.combat.hp-=dmg;RF.battleLog(s,`${RF.statusName(st.id)} deals ${dmg} damage to the enemy.`,'good')}}st.turns--}target.statuses=statuses.filter(x=>x.turns>0)
};
RF.playerBattleTarget=function(s){return {statuses:s.combat.playerStatuses}};RF.enemyBattleTarget=function(s){return {statuses:s.combat.enemyStatuses}};
RF.playerAttackDamage=function(s,a,magic=false){let e=RF.DATA.enemies[s.combat.id],weapon=RF.weaponDamage(s),skill=magic?s.skills.magic.level:s.skills.strength.level,base=5+weapon+skill*.72+s.skills.attack.level*.45,armor=e.armor*(RF.hasStatus({statuses:s.combat.enemyStatuses},'broken_armor') ? .45 : 1),dmg=base*(a.power||1)*(0.88+Math.random()*.24)-armor*(magic?.18:.48);if(RF.hasStatus({statuses:s.combat.enemyStatuses},'exposed'))dmg*=1.25;if(RF.hasStatus({statuses:s.combat.playerStatuses},'weakened'))dmg*=.78;if(RF.hasStatus({statuses:s.combat.playerStatuses},'focused'))dmg*=1.14;if(s.specialization==='arcanist'&&magic)dmg*=1.18;if(s.home?.wellRestedBattles>0)dmg*=1.08;let crit=Math.random()<((a.crit||.08)+(s.specialization==='duelist' ? .08 : 0));if(crit)dmg*=1.65;return {dmg:Math.max(1,Math.round(dmg)),crit}};
RF.battleAbility=function(id){
 let s=RF.state,c=s.combat;if(!c||c.phase!=='player')return;let a=RF.DATA.abilities[id];if(!a||!RF.unlockedAbilities(s).some(x=>x.id===id))return;if((c.cooldowns[id]||0)>0)return;if(s.player.stamina<a.cost)return;
 s.player.stamina-=a.cost;c.cooldowns[id]=a.cooldown||0;c.phase='resolving';s.collection.abilities[id]=true;
 if(a.kind==='guard'){c.playerGuard=true;RF.addStatus({statuses:c.playerStatuses},'guard',1);RF.battleLog(s,'You settle behind your guard.','good')}
 else if(a.kind==='riposte'){c.playerGuard=true;c.riposte=true;RF.battleLog(s,'You prepare to turn the next blow back on your enemy.','good')}
 else if(a.kind==='heal'){let missing=s.player.maxHp-s.player.hp,heal=Math.round((16+s.skills.vitality.level*2.2)*(s.player.hp/s.player.maxHp<.35?1.55:1));s.player.hp=Math.min(s.player.maxHp,s.player.hp+heal);RF.battleLog(s,`Second Wind restores ${heal} HP.`,'good')}
 else if(a.kind==='status'){RF.addStatus({statuses:c.enemyStatuses},a.targetStatus.id,a.targetStatus.turns);RF.battleLog(s,`${a.name}: ${RF.statusName(a.targetStatus.id)} applied.`,'good')}
 else if(a.kind==='volley'){for(let n=0;n<2;n++){let r=RF.playerAttackDamage(s,{power:.72,crit:.1});c.hp-=r.dmg;RF.battleLog(s,`${n?'Second arrow':'Quick Volley'} hits for ${r.dmg}${r.crit?' critical':''}.`,'good');if(c.hp<=0)break}RF.addXp(s,'archery',14)}
 else {let hit=Math.random()<=a.accuracy;if(hit){let r=RF.playerAttackDamage(s,a,a.kind==='magic');c.hp-=r.dmg;RF.battleLog(s,`${a.name} deals ${r.dmg}${r.crit?' critical':''} damage.`,'good');if(a.status&&Math.random()<a.status.chance)RF.addStatus({statuses:c.enemyStatuses},a.status.id,a.status.turns);RF.addXp(s,a.kind==='magic'?'magic':a.skill||'attack',8+a.cost*.35)}else RF.battleLog(s,`${a.name} misses.`,'bad')}
 if(c.hp<=0)return RF.winCombat();
 RF.tickStatuses(s,{statuses:c.enemyStatuses},'enemy');if(c.hp<=0)return RF.winCombat();
 setTimeout(()=>RF.enemyBattleTurn(),120);RF.save(s);RF.UI.render(s)
};
RF.enemyBattleTurn=function(){
 let s=RF.state,c=s.combat;if(!c)return;let e=RF.DATA.enemies[c.id];c.phase='enemy';if(RF.hasStatus({statuses:c.enemyStatuses},'stagger')){RF.battleLog(s,`${e.name} is staggered and loses its turn.`,'good')}else{
  if(c.id==='gravewarden'&&c.hp/c.maxHp<.5&&!c.bossPhase2){c.bossPhase2=true;RF.addStatus({statuses:c.enemyStatuses},'focused',99);RF.battleLog(s,'The Gravewarden cracks its helm open. Cold light spills through the fracture. Phase II begins.','bad')}if(c.id==='captain_voss'&&c.hp/c.maxHp<.4&&!c.bossPhase2){c.bossPhase2=true;RF.addStatus({statuses:c.enemyStatuses},'focused',4);RF.battleLog(s,'Voss throws away his damaged shield. “Enough games.” His attacks quicken.','bad')}let pool=e.moves||['bite'],mid=pool[Math.floor(Math.random()*pool.length)],m=RF.DATA.enemyMoves[mid]||RF.DATA.enemyMoves.bite;
  if(m.kind==='guard'){c.enemyGuard=true;RF.addStatus({statuses:c.enemyStatuses},'guard',1);RF.battleLog(s,`${e.name} uses ${m.name}.`)}
  else if(m.kind==='buff'||m.kind==='status'){let target=m.kind==='buff'?{statuses:c.enemyStatuses}:{statuses:c.playerStatuses};RF.addStatus(target,m.status.id,m.status.turns);RF.battleLog(s,`${e.name} uses ${m.name}. ${RF.statusName(m.status.id)} takes hold.`,'bad')}
  else if(Math.random()<=(m.accuracy||.9)){let raw=(e.damage[0]+Math.random()*(e.damage[1]-e.damage[0]))*(m.power||1),armor=RF.armor(s)*.32,hit=Math.max(1,Math.round(raw-armor));if(c.playerGuard)hit=Math.ceil(hit*(s.specialization==='warden' ? .35 : .46));if(RF.hasStatus({statuses:c.enemyStatuses},'weakened'))hit=Math.ceil(hit*.78);s.player.hp-=hit;RF.battleLog(s,`${e.name} uses ${m.name} for ${hit} damage.`,'bad');if(m.status&&Math.random()<(m.status.chance||1))RF.addStatus({statuses:c.playerStatuses},m.status.id,m.status.turns);if(m.drain){c.hp=Math.min(c.maxHp,c.hp+Math.ceil(hit*.5));RF.battleLog(s,`${e.name} drains vitality.`,'bad')}if(c.riposte&&hit>0){let ret=Math.max(3,Math.round((RF.weaponDamage(s)+s.skills.defence.level)*.8));c.hp-=ret;RF.battleLog(s,`Riposte returns ${ret} damage.`,'good')}}else RF.battleLog(s,`${e.name}'s ${m.name} misses.`,'good')
 }
 c.playerGuard=false;c.riposte=false;RF.tickStatuses(s,{statuses:c.playerStatuses},'player');if(s.player.hp<=0)return RF.loseV4Battle();if(c.hp<=0)return RF.winCombat();Object.keys(c.cooldowns).forEach(k=>c.cooldowns[k]=Math.max(0,c.cooldowns[k]-1));c.turn++;c.phase='player';s.player.stamina=Math.min(s.player.maxStamina,s.player.stamina+8+(s.companion?2:0));if(s.companion&&Math.random()<.42)RF.companionAssist(s);RF.save(s);RF.UI.render(s)
};
RF.companionAssist=function(s){if(!s.companion||!s.combat)return;let n=RF.DATA.npcs[s.companion.id],dmg=5+s.companion.level*2+Math.floor(Math.random()*6);s.combat.hp-=dmg;s.companion.bond++;RF.battleLog(s,`${n.name} darts in and deals ${dmg} damage.`,'good')};
RF.loseV4Battle=function(){let s=RF.state,e=RF.DATA.enemies[s.combat.id],loss=Math.floor(s.gold*.1);s.gold-=loss;s.player.hp=Math.ceil(s.player.maxHp*.5);s.player.stamina=Math.ceil(s.player.maxStamina*.45);s.location=s.location==='ironridge'||s.location==='quarry'||s.location==='northroad'?'ironridge':'greenvale';s.combat=null;RF.log(s,`Defeated by ${e.name}. You wake under a healer's eye, ${loss}g lighter.`,'bad');RF.UI.modal={type:'message',title:'Defeated',text:`You survived, but lost ${loss} gold and were carried to safety.`};RF.save(s);RF.UI.render(s)};
RF.useBattleItem=function(id){let s=RF.state,c=s.combat;if(!c||c.phase!=='player'||!(s.inventory[id]>0))return;let it=RF.DATA.items[id];if(!it?.heal&&!it?.stamina)return;RF.takeItem(s,id,1);if(it.heal)s.player.hp=Math.min(s.player.maxHp,s.player.hp+it.heal);if(it.stamina)s.player.stamina=Math.min(s.player.maxStamina,s.player.stamina+it.stamina);if(id==='field_tonic')c.playerStatuses=c.playerStatuses.filter(x=>x.id!=='bleed');RF.battleLog(s,`You use ${it.name}.`,'good');c.phase='resolving';setTimeout(()=>RF.enemyBattleTurn(),120);RF.save(s);RF.UI.render(s)};
RF.fleeV4=function(){let s=RF.state,c=s.combat;if(!c||c.phase!=='player')return;let e=RF.DATA.enemies[c.id],chance=c.forced ? .45 : .72;if(RF.perkRank(s,'vanish')&&(s.inventory.smoke_bomb||0)>0){RF.takeItem(s,'smoke_bomb',1);chance=1}if(Math.random()<chance){RF.log(s,`You disengage from ${e.name}.`);s.combat=null;RF.save(s);RF.UI.render(s)}else{RF.battleLog(s,'You fail to create an opening!','bad');c.phase='resolving';setTimeout(()=>RF.enemyBattleTurn(),120)}};
// V4 replaces legacy combat action entry point.
RF.combatAction=function(action){if(action==='flee')return RF.fleeV4();return RF.battleAbility(action==='attack'?'attack':action==='defend'?'guard':action)};

const v4WinBase=RF.winCombat;RF.winCombat=function(){
 let s=RF.state,c=s.combat;if(!c)return;let id=c.id,source=c.sourceUid;s.collection.enemies[id]=(s.collection.enemies[id]||0)+1;
 v4WinBase();s=RF.state;if(s.home?.wellRestedBattles>0)s.home.wellRestedBattles--;if(source&&s.encounters[s.location])s.encounters[s.location]=s.encounters[s.location].filter(x=>x.uid!==source);Object.keys(s.inventory||{}).forEach(x=>{if((s.inventory[x]||0)>0)s.collection.items[x]=true});if(s.companion&&s.companion.bond%5===0)s.companion.level=Math.min(20,s.companion.level+1);RF.save(s)
};

const v4AddItem=RF.addItem;RF.addItem=function(s,id,q=1){v4AddItem(s,id,q);if(s.collection)s.collection.items[id]=true};

const v4FinishTravel=RF.finishTravel;RF.finishTravel=function(a){
 v4FinishTravel(a);let s=RF.state;if(!s)return;RF.refreshEncounters(s,s.location,true);
 // Forced encounters are occasional, not constant. Dangerous areas are worse at night.
 if(!s.combat&&RF.fieldTables[s.location]){let h=RF.hour(s),danger=(h>=21||h<5)?.22:.10;if(['crypt','ember_cave','bandit_camp'].includes(s.location))danger=.34;if(Math.random()<danger){let list=RF.refreshEncounters(s),spot=list[Math.floor(Math.random()*list.length)];if(spot){RF.log(s,'Something cuts off your route. No clean way around it.','bad');RF.startBattle(spot.id,{sourceUid:spot.uid,forced:true})}}}
};

const v4Pulse=RF.worldPulse;RF.worldPulse=function(s,minutes){
 v4Pulse(s,minutes);if(!s)return;RF.refreshEncounters(s);
 if(s.guild?.joined&&s.day>(s.guild.lastContractDay||0)){if(!s.guild.contracts.some(c=>!c.claimed)){s.guild.lastContractDay=s.day;RF.generateContracts(s)}}
 if(s.day>s.factionWar.lastShiftDay){s.factionWar.lastShiftDay=s.day;let shift=Math.floor(Math.random()*5)-2;s.factionWar.tension=Math.max(0,Math.min(100,s.factionWar.tension+shift+(s.world?.alert||0)));if(s.factionWar.tension>55&&Math.random()<.28){s.world.news.unshift('Wayfarer scouts report skirmishes along the northern road.');s.world.market.metal=Math.min(1.8,(s.world.market.metal||1)+.05)}}
 if(s.crime?.bounty>=70&&['greenvale','crossroads','ironridge'].includes(s.location)&&Math.random()<.012){s.speed=0;RF.UI.modal={type:'bountyHunter',title:'Bounty Hunter',text:'A scarred hunter compares your face to a folded notice. “We can do this politely, loudly, or profitably.”'}}
};

RF.resolveBounty=function(choice){let s=RF.state,b=s.crime.bounty||0;if(choice==='pay'&&s.gold>=b){s.gold-=b;s.crime.bounty=0;s.crime.heat=0;s.flags.wanted=false;RF.UI.modal={type:'message',title:'Account Settled',text:'The hunter pockets the money and tears the notice in half.'}}
 else if(choice==='prison'){let days=Math.max(1,Math.ceil(b/60));s.day+=days;s.crime.bounty=0;s.crime.heat=0;s.flags.wanted=false;s.player.hp=s.player.maxHp;s.player.stamina=s.player.maxStamina;RF.UI.modal={type:'message',title:'Time Served',text:`You spend ${days} day${days>1?'s':''} in a cold holding cell. The bounty is cleared, though the soup has changed you.`}}
 else {RF.UI.modal=null;let id=s.location==='ironridge'?'ridge_raider':'bandit';RF.startBattle(id,{forced:true})}RF.save(s);RF.UI.render(s)};


RF.buyHome=function(){let s=RF.state;if(s.location!=='greenvale'||s.home.owned||s.gold<450)return;s.gold-=450;s.home.owned=true;s.home.level=1;RF.log(s,'You purchase a small cottage on Greenvale’s western lane. A permanent bed, a stubborn fireplace, and a door that locks.','important');RF.save(s);RF.UI.render(s)};
RF.restAtHome=function(){let s=RF.state;if(!s.home.owned||s.location!=='greenvale'||s.combat||s.activity)return;s.player.hp=s.player.maxHp;s.player.stamina=s.player.maxStamina;s.home.wellRestedBattles=3;RF.advanceWorld(8*60);RF.log(s,'You sleep in your own bed. Well Rested: +8% damage for the next 3 victories.','good');RF.save(s);RF.UI.render(s)};
RF.chooseSpecialization=function(id){let s=RF.state;if(s.specialization||s.player.level<10||!['duelist','warden','arcanist'].includes(id))return;s.specialization=id;let names={duelist:'Duelist',warden:'Warden',arcanist:'Arcanist'};RF.log(s,`Combat specialisation chosen: ${names[id]}.`,'important');RF.save(s);RF.UI.render(s)};

// ---------- V4 UI ----------
RF.UI.dialogueModal=function(s,m){let sp=m.speaker;return `<div class="modalBack"><div class="modal dialogueModal"><div class="dialogueHead"><div class="dialoguePortrait">${sp.icon||'🧑'}</div><div><h2>${sp.name}</h2><div class="sub">${sp.job||'Traveller'}${sp.id&&!String(sp.id).startsWith('passer_')?` • Relationship ${RF.relationship(s,sp.id)>=0?'+':''}${RF.relationship(s,sp.id)}`:''}</div></div></div><div class="dialogueText">${m.text}</div><div class="choices">${m.choices.map((c,i)=>`<button class="choice" data-dialogue-choice="${i}" ${c.condition&&!c.condition(s)?'disabled':''}><b>${c.text}</b>${c.cost?`<small>Costs ${c.cost}g</small>`:''}</button>`).join('')}</div><button class="quietClose" data-close-dialogue>End conversation</button></div></div>`};
RF.UI.dialogueEnd=function(s,m){let sp=m.speaker;return `<div class="modalBack"><div class="modal dialogueModal"><div class="dialogueHead"><div class="dialoguePortrait">${sp.icon||'🧑'}</div><div><h2>${sp.name}</h2><div class="sub">${sp.job||'Traveller'}</div></div></div><div class="dialogueText">${m.text}</div><div class="choices"><button class="choice" data-close-dialogue>Continue</button></div></div></div>`};
RF.UI.dialogueShop=function(s,m){return `<div class="modalBack"><div class="modal dialogueModal"><div class="dialogueHead"><div class="dialoguePortrait">${m.speaker.icon||'🧑'}</div><div><h2>${m.speaker.name}</h2><div class="sub">Private trade</div></div></div><div class="dialogueText">${m.text}</div><div class="list">${m.stock.map(id=>{let it=RF.DATA.items[id],price=Math.max(1,Math.round(it.value*1.15*(RF.priceFactor?RF.priceFactor(s,id,true):1)));return `<div class="row"><div class="icon">${it.icon}</div><div class="meta"><b>${it.name}</b><small>${it.desc}</small></div><span class="qty">${price}g</span><button data-dialogue-buy="${id}" data-price="${price}" ${s.gold>=price?'':'disabled'}>Buy</button></div>`}).join('')}</div><button class="quietClose" data-close-dialogue>Thanks, that's all</button></div></div>`};
const v4ModalBase=RF.UI.modalHtml.bind(RF.UI);RF.UI.modalHtml=function(s){let m=this.modal;if(m?.type==='dialogue')return this.dialogueModal(s,m);if(m?.type==='dialogueEnd')return this.dialogueEnd(s,m);if(m?.type==='dialogueShop')return this.dialogueShop(s,m);if(m?.type==='bountyHunter'){let b=s.crime.bounty;return `<div class="modalBack"><div class="modal"><div style="font-size:42px">🎯</div><h2>Bounty Hunter</h2><div class="sub">${m.text}</div><div class="choices"><button class="choice" data-bounty="pay" ${s.gold>=b?'':'disabled'}><b>Pay the bounty • ${b}g</b></button><button class="choice" data-bounty="prison"><b>Surrender</b><small>Serve time and clear the warrant</small></button><button class="choice" data-bounty="fight"><b>Draw steel</b><small>Extremely unsubtle</small></button></div></div></div>`}return v4ModalBase(s)};

RF.UI.combat=function(s){
 let c=s.combat,e=RF.DATA.enemies[c.id],abilities=RF.unlockedAbilities(s),statuses=t=>(t||[]).map(x=>`<span class="statusChip ${x.id}">${RF.statusName(x.id)} ${x.turns}</span>`).join('');let items=['potion','field_tonic','cooked_meat','cooked_fish','mana_tonic'].filter(id=>(s.inventory[id]||0)>0);
 return `<section class="card tacticalCombat"><div class="battleHeader"><div><span class="eyebrow">TURN ${c.turn}</span><h2>${e.icon} ${e.name}</h2></div><span class="phaseTag">${c.phase==='player'?'YOUR TURN':'ENEMY TURN'}</span></div><div class="battleField"><div class="enemyPane"><div class="tiny">Lv ${e.level} • ${e.temperament||'hostile'}</div><div class="bar large"><div class="fill hp" style="width:${Math.max(0,100*c.hp/c.maxHp)}%"></div></div><div class="tiny">${Math.max(0,Math.ceil(c.hp))}/${c.maxHp} HP</div><div class="statusRow">${statuses(c.enemyStatuses)}</div></div><div class="versus">⚔️</div><div class="playerPane"><b>${s.player.avatar} ${s.player.name}</b><div class="tiny">${Math.ceil(s.player.hp)}/${s.player.maxHp} HP • ${Math.floor(s.player.stamina)} STA</div><div class="statusRow">${statuses(c.playerStatuses)}</div>${s.companion?`<div class="companionMini">${RF.DATA.npcs[s.companion.id]?.icon||'🧭'} ${RF.DATA.npcs[s.companion.id]?.name||'Companion'} • Bond ${s.companion.bond}</div>`:''}</div></div><div class="battleLog">${c.log.map(x=>`<div class="${x.type||''}">${typeof x==='string'?x:x.text}</div>`).join('')}</div><h3>Abilities</h3><div class="abilityGrid">${abilities.map(a=>{let cd=c.cooldowns[a.id]||0,disabled=c.phase!=='player'||s.player.stamina<a.cost||cd>0;return `<button class="abilityBtn ${a.id==='attack'?'primary':''}" data-ability="${a.id}" ${disabled?'disabled':''}><span>${a.icon}</span><b>${a.name}</b><small>${a.cost?`${a.cost} STA`:'Free'}${cd?` • CD ${cd}`:''}<br>${a.desc}</small></button>`}).join('')}</div>${items.length?`<h3>Battle Items</h3><div class="battleItems">${items.map(id=>`<button data-battle-item="${id}" ${c.phase!=='player'?'disabled':''}>${RF.DATA.items[id].icon} ${RF.DATA.items[id].name} ×${s.inventory[id]}</button>`).join('')}</div>`:''}<button class="cancelBtn" data-v4-flee ${c.phase!=='player'?'disabled':''}>🏃 Attempt to flee</button></section>`
};

RF.UI.nearbyEnemies=function(s){let list=RF.refreshEncounters(s);if(!RF.fieldTables[s.location])return'';return `<section class="card"><div class="questTitle"><h3>Nearby Creatures</h3><span class="tag">WILD AREA</span></div><div class="sub">You can choose your fights here. Aggressive creatures may still ambush you while travelling or waiting.</div><div class="list" style="margin-top:9px">${list.length?list.map(x=>{let e=RF.DATA.enemies[x.id],seen=s.collection.enemies[x.id]>0;return `<div class="row enemyRow"><div class="icon">${e.icon}</div><div class="meta"><b>${seen?e.name:'Unknown '+e.icon} • Lv ${e.level}</b><small>${e.temperament||'Hostile'} • ${seen?`${s.collection.enemies[x.id]} defeated`:'Not yet recorded'}</small></div><button data-fight="${x.uid}" ${s.activity||s.combat?'disabled':''}>Fight</button></div>`}).join(''):'<div class="sub">The area is unusually quiet.</div>'}</div></section>`};
RF.UI.peopleV4=function(s){let named=RF.npcsHere(s),passers=RF.passersHere(s);return `<section class="card"><div class="questTitle"><h3>People Nearby</h3><span class="tag">LIVE</span></div><div class="list">${named.map(n=>`<div class="row"><div class="icon">${n.icon}</div><div class="meta"><b>${n.name}</b><small>${n.job} • Relationship ${RF.relationship(s,n.id)>=0?'+':''}${RF.relationship(s,n.id)}</small></div><button data-talk-npc="${n.id}" ${s.combat||s.activity?'disabled':''}>Talk</button></div>`).join('')}${passers.map(p=>`<div class="row passer"><div class="icon">${p.icon}</div><div class="meta"><b>${p.name}</b><small>Passing ${p.job}</small></div><button data-talk-passer="${p.id}" ${s.combat||s.activity?'disabled':''}>Chat</button></div>`).join('')}${!named.length&&!passers.length?'<div class="sub">Nobody is close enough for conversation.</div>':''}</div></section>`};
const v4WorldBase=RF.UI.world.bind(RF.UI);RF.UI.world=function(s){let html=v4WorldBase(s);html=html.replace(/<section class="card"><h3>People Here <span class="tag">LIVE<\/span><\/h3>[\s\S]*?<\/section>/,'');let insert=this.nearbyEnemies(s)+this.peopleV4(s);return html.replace('<section class="card"><h3>World Feed</h3>',insert+'<section class="card"><h3>World Feed</h3>')};

RF.UI.guildPanel=function(s){if(!s.flags.wayfarerHallOpen&&!s.guild.joined)return'';let rank=['Outsider','Pathfinder','Trailwarden','Cartographer'][s.guild.rank]||`Rank ${s.guild.rank}`;return `<section class="card"><div class="questTitle"><h3>🧭 Wayfarer Guild</h3><span class="rarityTag">${rank}</span></div><div class="sub">Reputation ${s.guild.reputation} • Contracts completed ${s.guild.completed}</div>${s.guild.joined?`<div class="list" style="margin-top:10px">${s.guild.contracts.map(c=>{let p=RF.contractProgress(s,c),need=c.visits?c.visits.length:c.count;return `<div class="row"><div class="icon">${c.icon}</div><div class="meta"><b>${c.name}</b><small>${c.desc}<br>${p}/${need} • Reward ${c.reward}g</small></div><button data-contract="${c.uid}" ${p>=need&&!c.claimed?'':'disabled'}>${c.claimed?'Done':'Claim'}</button></div>`}).join('')}</div>`:'<div class="sub" style="margin-top:8px">Speak with Master Vell in Wayfarer Hall to join.</div>'}</section>`};
const v4QuestBase=RF.UI.quests.bind(RF.UI);RF.UI.quests=function(s){return v4QuestBase(s)+this.guildPanel(s)};

RF.UI.collectionPanel=function(s){let enemyTotal=Object.keys(RF.DATA.enemies).length,enemySeen=Object.keys(s.collection.enemies).filter(k=>s.collection.enemies[k]>0).length,itemTotal=Object.keys(RF.DATA.items).length,itemSeen=Object.keys(s.collection.items).length,npcSeen=Object.keys(s.collection.npcs).length,abilitySeen=Object.keys(s.collection.abilities).length;return `<section class="card"><h3>Collection Log</h3><div class="statsGrid"><div class="statbox"><span>Bestiary</span><b>${enemySeen}/${enemyTotal}</b></div><div class="statbox"><span>Items</span><b>${itemSeen}/${itemTotal}</b></div><div class="statbox"><span>People</span><b>${npcSeen}</b></div><div class="statbox"><span>Moves Used</span><b>${abilitySeen}</b></div></div><div class="list" style="margin-top:10px">${Object.entries(s.collection.enemies).filter(([,q])=>q>0).slice(0,12).map(([id,q])=>`<div class="row"><div class="icon">${RF.DATA.enemies[id]?.icon||'❓'}</div><div class="meta"><b>${RF.DATA.enemies[id]?.name||id}</b><small>${q} defeated</small></div></div>`).join('')}</div></section>`};
const v4CharBase=RF.UI.character.bind(RF.UI);RF.UI.character=function(s){let h=v4CharBase(s);let comp=s.companion?`<section class="card"><h3>Companion</h3><div class="row"><div class="icon">${RF.DATA.npcs[s.companion.id]?.icon||'🧭'}</div><div class="meta"><b>${RF.DATA.npcs[s.companion.id]?.name}</b><small>Level ${s.companion.level} • Bond ${s.companion.bond}<br>May assist during tactical battles.</small></div></div></section>`:'';let spec=s.specialization?`<section class="card"><h3>Combat Specialisation</h3><div class="sub">${s.specialization==='duelist'?'⚔️ Duelist • +8% critical chance':s.specialization==='warden'?'🛡️ Warden • stronger Guard mitigation':'✨ Arcanist • +18% magic damage'}</div></section>`:s.player.level>=10?`<section class="card"><h3>Choose a Combat Specialisation</h3><div class="sub">A permanent emphasis, not a class lock. All skills remain trainable.</div><div class="grid2" style="margin-top:8px"><button class="action" data-spec="duelist"><b>⚔️ Duelist</b><small>+8% critical chance</small></button><button class="action" data-spec="warden"><b>🛡️ Warden</b><small>Guard reduces more damage</small></button><button class="action" data-spec="arcanist"><b>✨ Arcanist</b><small>+18% magic damage</small></button></div></section>`:'';let home=s.home?.owned?`<section class="card"><h3>🏠 Greenvale Cottage</h3><div class="sub">Owned • Well Rested victories remaining: ${s.home.wellRestedBattles||0}</div></section>`:'';return h+comp+spec+home+this.collectionPanel(s)};

RF.UI.regionMap=function(s){let locs=Object.entries(RF.DATA.locations).filter(([id,l])=>s.visited[id]||(!l.lockedFlag||s.flags[l.lockedFlag])).filter(([id,l])=>['Greenvale','Ironridge'].includes(l.region));return `<section class="card"><h3>Regional Map</h3><div class="mapGrid">${locs.map(([id,l])=>`<button class="mapNode ${s.location===id?'here':''} ${s.visited[id]?'seen':''}" ${RF.DATA.locations[s.location]?.neighbors?.[id]?'data-travel="'+id+'"':'disabled'}><span>${l.icon}</span><b>${l.name}</b><small>${l.region}${s.location===id?' • YOU ARE HERE':RF.DATA.locations[s.location]?.neighbors?.[id]?' • Road connected':''}</small></button>`).join('')}</div></section>`};
const v4World2=RF.UI.world.bind(RF.UI);RF.UI.world=function(s){let base=v4World2(s);let home=s.location==='greenvale'?`<section class="card"><h3>🏠 Home</h3>${s.home?.owned?`<div class="sub">Your cottage waits on the western lane.</div><button class="action primary" data-home-rest style="width:100%;margin-top:8px"><b>Sleep at Home</b><small>8 hours • full recovery • Well Rested buff</small></button>`:`<div class="sub">A small cottage is for sale on the western lane.</div><button class="action" data-buy-home ${s.gold>=450?'':'disabled'} style="width:100%;margin-top:8px"><b>Buy Cottage • 450g</b><small>Permanent home and rested bonus</small></button>`}</section>`:'';return base+home+this.regionMap(s)};

const v4BindBase=RF.UI.bind.bind(RF.UI);RF.UI.bind=function(s){v4BindBase(s);document.querySelectorAll('[data-talk-npc]').forEach(b=>b.onclick=()=>RF.openDialogue(b.dataset.talkNpc,false));document.querySelectorAll('[data-talk-passer]').forEach(b=>b.onclick=()=>RF.openDialogue(b.dataset.talkPasser,true));document.querySelectorAll('[data-dialogue-choice]').forEach(b=>b.onclick=()=>RF.resolveDialogue(+b.dataset.dialogueChoice));document.querySelectorAll('[data-close-dialogue]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(RF.state)});document.querySelectorAll('[data-dialogue-buy]').forEach(b=>b.onclick=()=>{let id=b.dataset.dialogueBuy,p=+b.dataset.price;if(RF.state.gold>=p){RF.state.gold-=p;RF.addItem(RF.state,id,1);RF.addXp(RF.state,'trading',5);RF.save(RF.state);RF.UI.render(RF.state)}});document.querySelectorAll('[data-fight]').forEach(b=>b.onclick=()=>RF.fightNearby(b.dataset.fight));document.querySelectorAll('[data-ability]').forEach(b=>b.onclick=()=>RF.battleAbility(b.dataset.ability));document.querySelectorAll('[data-battle-item]').forEach(b=>b.onclick=()=>RF.useBattleItem(b.dataset.battleItem));document.querySelector('[data-v4-flee]')?.addEventListener('click',()=>RF.fleeV4());document.querySelectorAll('[data-contract]').forEach(b=>b.onclick=()=>RF.claimContract(b.dataset.contract));document.querySelectorAll('[data-bounty]').forEach(b=>b.onclick=()=>RF.resolveBounty(b.dataset.bounty));document.querySelector('[data-buy-home]')?.addEventListener('click',()=>RF.buyHome());document.querySelector('[data-home-rest]')?.addEventListener('click',()=>RF.restAtHome());document.querySelectorAll('[data-spec]').forEach(b=>b.onclick=()=>RF.chooseSpecialization(b.dataset.spec))};

// Turn the old generic Talk action into opening someone real when possible.
const v4Action=RF.action;RF.action=function(a){if(a!=='talk')return v4Action(a);let s=RF.state,people=RF.npcsHere(s),pass=RF.passersHere(s);if(people.length)return RF.openDialogue(people[Math.floor(Math.random()*people.length)].id,false);if(pass.length)return RF.openDialogue(pass[Math.floor(Math.random()*pass.length)].id,true);return v4Action(a)};

RF.migrateV4(RF.state);
if(RF.state){RF.refreshEncounters(RF.state,RF.state.location,true);RF.log(RF.state,'Realmforge V4 awakened: conversations, relationships, tactical turn-based combat, wild encounters, companions and Wayfarer contracts are active.','important');RF.save(RF.state);RF.UI.render(RF.state)};
