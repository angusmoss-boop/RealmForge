/* Realmforge V11.30.0 — canonical legacy content definitions: people social. */
(()=>{
'use strict';
const RF=window.RF;
const define=RF.Content.defineLegacyBlock;
define("v2@L27",function(){
RF.DATA.npcs={
  oren:{name:'Oren Vale',icon:'🧔',job:'Merchant',home:'greenvale',schedule:[['greenvale',6,9],['crossroads',9,16],['greenvale',16,24]],condition:s=>s.flags.savedMerchant&&!s.flags.orenMissing,rumours:['Road trade is recovering, slowly.','Blackthorn men have started asking about a map.']},
  mira:{name:'Mira Fen',icon:'👩‍🌾',job:'Miller',home:'mill',schedule:[['mill',5,18],['greenvale',18,21],['mill',21,24]],rumours:['Flour prices jump whenever the east road closes.','Something keeps worrying the sheep after midnight.']},
  halden:{name:'Sergeant Halden',icon:'🛡️',job:'Watch Sergeant',home:'greenvale',schedule:[['watchtower',6,18],['greenvale',18,24]],condition:s=>s.flags.eastwatchOpen,rumours:['Voss is no common roadside thief.','The watch pays for reliable information, not tavern smoke.']},
  elira:{name:'Elira Moss',icon:'🧙‍♀️',job:'Herbalist',home:'greenvale',schedule:[['forest',7,12],['greenvale',12,19],['greenvale',19,24]],rumours:['Fog changes what grows in Whisperwood.','Never brew silver dust with Greenleaf unless you enjoy seeing tomorrow twice.']},
  brann:{name:'Brann Coalhand',icon:'👨‍🏭',job:'Miner',home:'greenvale',schedule:[['mine',6,17],['greenvale',17,22],['greenvale',22,24]],rumours:['There are fresh scratches below the old third gallery.','The deepest tunnels were sealed before my grandfather was born.']}
};
},{"patch": "js/v2.js", "line": 27, "bytes": 1394, "kind": "direct"});
define("v2@L34",function(){
RF.DATA.factions={greenvale:{name:'Greenvale',icon:'🌿'},watch:{name:'Eastwatch',icon:'🛡️'},blackthorn:{name:'Blackthorn',icon:'🗡️'},merchants:{name:'Vale Traders',icon:'🪙'}};
},{"patch": "js/v2.js", "line": 34, "bytes": 190, "kind": "direct"});
define("v3@L39",function(){
RF.DATA.factions.ironridge={name:'Ironridge',icon:'⛰️'};
},{"patch": "js/v3.js", "line": 39, "bytes": 60, "kind": "direct"});
define("v3@L40",function(){
RF.DATA.factions.underworld={name:'Underworld',icon:'🕶️'};
},{"patch": "js/v3.js", "line": 40, "bytes": 63, "kind": "direct"});
define("v3@L41",function(){
Object.assign(RF.DATA.npcs,{
  kael:{name:'Kael Marr',icon:'🧔‍♂️',job:'Forge Marshal',home:'ironridge',schedule:[['ironridge',5,20],['ironridge',20,24]],condition:s=>s.flags.northRoadOpen,rumours:['Steel is easy. Good steel is a lifelong argument with fire.','Emberdeep is closed for a reason, which naturally means fools keep entering it.']},
  nyra:{name:'Nyra Quickhand',icon:'🕶️',job:'Fixer',home:'ironridge',schedule:[['ironridge',18,24],['ironridge',0,3]],condition:s=>s.flags.northRoadOpen,rumours:['A clean reputation is just a criminal record nobody has found yet.','Eastwatch pays poorly. Other people pay creatively.']}
});
},{"patch": "js/v3.js", "line": 41, "bytes": 648, "kind": "npcs"});
define("v4@L76",function(){
Object.assign(RF.DATA.npcs,{
  tamsin:{name:'Tamsin Reed',icon:'🧭',job:'Wayfarer Scout',home:'guildhall',schedule:[['guildhall',6,10],['sunmeadow',10,16],['crossroads',16,19],['guildhall',19,24]],condition:s=>s.flags.wayfarerHallOpen,rumours:['A map is only a list of places where somebody got lost first.','Boars give you a warning. Adders mostly outsource the warning to venom.']},
  vell:{name:'Master Vell',icon:'🧓',job:'Wayfarer Guildmaster',home:'guildhall',schedule:[['guildhall',7,22]],condition:s=>s.flags.wayfarerHallOpen,rumours:['Contracts pay because certainty is expensive.','A useful traveller notices what everyone else calls scenery.']},
  saela:{name:'Saela Emberglass',icon:'🔮',job:'Hedge Mage',home:'ironridge',schedule:[['ironridge',9,15],['quarry',15,18],['ironridge',18,23]],condition:s=>!!RF.DATA.locations.ironridge&&!!s.visited.ironridge,rumours:['Magic is mostly convincing reality that it misremembered the rules.','Ash wisps hate salt, bells, and being observed too confidently.']}
});
},{"patch": "js/v4.js", "line": 76, "bytes": 1023, "kind": "npcs"});
define("v4@L82",function(){
RF.DATA.passers={
  farmer:{icons:['👨‍🌾','👩‍🌾'],jobs:['Shepherd','Turnip Farmer','Drover'],openers:['Fine weather for pretending the fence will mend itself.','You travelling far, or just avoiding somewhere nearby?','Lost a boot in this mud last year. Still think about it.'],gift:'bread'},
  trader:{icons:['🧔','👩‍💼','🧑‍💼'],jobs:['Road Trader','Peddler','Cloth Merchant'],openers:['You have the look of someone who checks prices twice. Sensible.','Road is dearer every mile north. Somehow the potholes remain free.','I trade in necessities, luxuries, and objects people later claim were necessities.'],wares:['honey_cake','field_tonic','lockpick','traveller_token']},
  pilgrim:{icons:['🧕','🧙','🧓'],jobs:['Pilgrim','Shrine Walker','Lay Brother'],openers:['A road walked slowly reveals twice as much and charges no extra.','Have you ever noticed crows always look as if they know the ending?','I have three prayers for rain and none for stopping it. Poor planning.'],gift:'lucky_charm'},
  mercenary:{icons:['🧔‍♂️','🥷','🧑'],jobs:['Sellsword','Caravan Guard','Retired Spear'],openers:['Your stance says you have fought. Your shoulders say you paid for it.','Never trust an opponent who smiles before drawing steel. After is fine.','A good shield is a door you carry into arguments.'],wares:['field_tonic','warding_salt']},
  wanderer:{icons:['🧑','👩','🧔'],jobs:['Wanderer','Tinker','Map Seller'],openers:['Morning. Or afternoon. I stopped asking the sun for paperwork.','There is a village west of here where every dog is named Bramble. No idea why.','Best part of travelling is becoming a stranger professionally.'],wares:['traveller_token','honey_cake']}
};
},{"patch": "js/v4.js", "line": 82, "bytes": 1724, "kind": "direct"});
define("v4@L89",function(){
RF.DATA.passerNames=['Alden','Bess','Corin','Della','Ewan','Fara','Garrick','Hett','Ivo','Jessa','Kell','Lena','Merek','Nell','Orso','Pella','Quin','Rhea','Soren','Tilda','Ulric','Veya','Wren','Yara'];
},{"patch": "js/v4.js", "line": 89, "bytes": 201, "kind": "direct"});
define("v4@L91",function(){
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
},{"patch": "js/v4.js", "line": 91, "bytes": 5643, "kind": "direct"});
define("v7@L122",function(){
Object.assign(RF.DATA.npcs,{
  nessa:{name:'Nessa Vale',icon:'🧪',job:'Marsh Apothecary',home:'reedmere',schedule:[['reedmere',7,13],['marshroad',13,16],['reedmere',16,23]],condition:s=>!!s.visited.marshroad,rumours:['Never trust a mushroom that looks pleased to see you.','Antivenom is cheaper before the bite. People consistently ignore this pricing advantage.']},
  torren:{name:'Torren Pike',icon:'🎣',job:'Reedmere Fisher',home:'reedmere',schedule:[['reedmere',5,8],['drowned_ruins',8,13],['reedmere',13,20]],condition:s=>!!s.visited.reedmere,rumours:['Pike bite hardest when the mist sits low.','There are bells underwater by the old ruins. I do not fish near bells.']},
  ysra:{name:'Ysra Fen',icon:'🪶',job:'Mirewatch Ranger',home:'mirewatch',schedule:[['mirewatch',6,10],['marshroad',10,16],['mirewatch',16,24]],condition:s=>!!s.visited.mirewatch,rumours:['Watch the reeds, not the water. Water lies flatter.','If a lantern light moves against the wind, do not follow it politely.']},
  cobb:{name:'Cobb Rill',icon:'🔐',job:'Locksmith & Recoverer',home:'reedmere',schedule:[['reedmere',9,18],['mirewatch',18,21]],condition:s=>!!s.visited.reedmere,rumours:['Locks are conversations conducted with very small pieces of metal.','A cheap lock tells you what the owner fears. A good lock tells you they can afford fear.']},
  maelin:{name:'Maelin Quill',icon:'📚',job:'Field Naturalist',home:'mirewatch',schedule:[['mirewatch',8,12],['reedmere',12,15],['marshroad',15,19],['mirewatch',19,23]],condition:s=>!!s.visited.mirewatch,rumours:['Everything leaves evidence. Most creatures simply lack lawyers.','The difference between research and being eaten is usually note-taking distance.']},
  dock:{name:'Dock Fenner',icon:'🧔',job:'Causeway Warden',home:'marshroad',schedule:[['marshroad',6,18],['reedmere',18,22]],condition:s=>!!s.visited.marshroad,rumours:['Keep to the planks after dark. Mud has ambition here.','Those bells are for fog. Mostly.']},
  ilse:{name:'Ilse Marr',icon:'🍲',job:'Innkeeper of the Crooked Heron',home:'reedmere',schedule:[['reedmere',6,24]],condition:s=>!!s.visited.reedmere,rumours:['Dry socks cost nothing upstairs if you stop dripping on my floor.','Torren says he saw a stone hand in the water. Torren also says pike understand insults.']}
});
},{"patch": "js/v7.js", "line": 122, "bytes": 2293, "kind": "npcs"});
define("v7@L132",function(){
Object.assign(RF.DATA.namedDialogues,{
  nessa:{greeting:'Nessa holds a vial to the light. “If it turns green, useful. If it turns black, educational.”',choices:[
    {text:'Ask about potion experimentation.',reply:'“Two reagents tell you more than a recipe book ever will. Sometimes what they tell you is ‘open a window’.”',xp:['herblore',18]},
    {text:'Ask about marsh poison.',reply:'“Fen crocs are infection. Spiders are venom. Lantern wisps are a philosophical problem.”',relation:1},
    {text:'See her travelling stock.',reply:'Nessa unlocks a lacquered medicine case.',shop:['antivenom','field_tonic','redroot','mooncap','focus_draught']}
  ]},
  torren:{greeting:'Torren is repairing a hook with hands that look capable of repairing the river itself. “Fish?”',choices:[
    {text:'Ask what is biting.',reply:'“Pike. Eels. Occasionally my patience.”',xp:['fishing',18]},
    {text:'Ask about the drowned ruins.',reply:'Torren stops working. “Stone herons. Bells below the water. A light that follows boats home. I fish elsewhere.”',flag:'heron_rumour',relation:1},
    {text:'Tell him fishing is just waiting.',reply:'“Correct. But with consequences.” Torren nods approvingly.',relation:2}
  ]},
  ysra:{greeting:'Ysra studies the marsh behind you before looking at you. “Good. Nothing followed.”',choices:[
    {text:'Ask for ranger advice.',reply:'“Mudcrabs bluff. Crocs do not. Wisps want you moving. Refuse all three invitations.”',xp:['hunting',22]},
    {text:'Offer to patrol the causeway.',reply:'“Walk it after dusk and bring me what tries to make that difficult.”',flag:'fen_patrol',relation:2},
    {text:'Ask about the heron ruins.',reply:'“Older than Reedmere. Older than the causeway. We do not know who drowned them.”',flag:'heron_rumour'}
  ]},
  cobb:{greeting:'Cobb smiles at your belt, specifically the pocket where lockpicks might be. “Professional curiosity.”',choices:[
    {text:'Ask for lockpicking advice.',reply:'“Do not fight the pin. Pressure is a question. The click is the answer.”',xp:['thieving',20]},
    {text:'Buy better picks.',reply:'Cobb lays out several tools on black felt.',shop:['fine_lockpick','master_picks','lockpick']},
    {text:'Ask whether he is a locksmith or a thief.',reply:'“Invoice decides.”',relation:1}
  ]},
  maelin:{greeting:'Maelin writes three words, watches a beetle, crosses out two of them. “Science.”',choices:[
    {text:'Ask how to research creatures.',reply:'“Observe before fighting. Tracks, posture, feeding, how they react when threatened. Then survive long enough to write it down.”',xp:['exploration',18]},
    {text:'Show interest in the collection.',reply:'“Bring notes. Bring unusual remains. Bring yourself back alive, preferably in that order.”',giveItem:['scholar_notes',1],relation:2},
    {text:'Ask her favourite creature.',reply:'“Mudcrab. Honest architecture. Awful temperament.”'}
  ]},
  dock:{greeting:'Dock leans on a hooked pole. “If you fall off the causeway, shout once. Twice means croc.”',choices:[
    {text:'Ask about the bells.',reply:'“Fog markers. Except the old bronze ones. Those ring when there is no wind.”',flag:'bell_rumour'},
    {text:'Ask about raiders.',reply:'“Use the reeds as walls. Clever until the reeds start moving back.”',xp:['exploration',12]},
    {text:'Compliment the causeway.',reply:'Dock looks genuinely touched. “Nobody compliments infrastructure.”',relation:3}
  ]},
  ilse:{greeting:'Ilse slides a bowl away from a sleeping patron before his forehead reaches it. “Welcome to Reedmere.”',choices:[
    {text:'Ask for local gossip.',reply:'“Nessa nearly fumigated her own roof. Torren is arguing with a pike. Cobb says neither event is technically illegal.”'},
    {text:'Buy marsh stew (42g).',cost:42,reply:'Ilse hands over a steaming bowl wrapped for travel. “Eat it before it becomes a building material.”',giveItem:['marsh_stew',1]},
    {text:'Ask about strangers.',reply:'“Three scholars went toward the drowned stones. Two came back. Both insist there were only two when they left.”',flag:'heron_rumour'}
  ]}
});
},{"patch": "js/v7.js", "line": 132, "bytes": 4163, "kind": "namedDialogues"});
define("v7@L171",function(){
RF.DATA.namedDialogues.mira.choices.push({text:'Ask if anything strange has passed through town.',reply:'“A cart of blue mushrooms, two wet scholars, and a man trying to sell a goose as a guard dog. So: Tuesday.”'});
},{"patch": "js/v7.js", "line": 171, "bytes": 220, "kind": "direct"});
define("v7@L172",function(){
RF.DATA.namedDialogues.brann.choices.push({text:'Ask what metal he actually likes working.',reply:'“Bronze behaves. Iron argues. Silver judges.”',xp:['smithing',8]});
},{"patch": "js/v7.js", "line": 172, "bytes": 170, "kind": "direct"});
define("v7@L173",function(){
RF.DATA.namedDialogues.elira.choices.push({text:'Ask about Mooncaps.',reply:'“Useful. Moody. Pick them after dusk and do not lick your fingers.”',xp:['foraging',10]});
},{"patch": "js/v7.js", "line": 173, "bytes": 171, "kind": "direct"});
define("v7@L174",function(){
RF.DATA.namedDialogues.tamsin.choices.push({text:'Ask for road gossip.',reply:'“Marsh road reopened. Apparently the planks only collapse under people who deserve character development.”'});
},{"patch": "js/v7.js", "line": 174, "bytes": 193, "kind": "direct"});
define("v7@L175",function(){
RF.DATA.namedDialogues.saela.choices.push({text:'Ask whether potions count as magic.',reply:'“Only to people who have never cleaned a cauldron.”'});
},{"patch": "js/v7.js", "line": 175, "bytes": 152, "kind": "direct"});
define("v7@L177",function(){
Object.assign(RF.DATA.passers,{
  scholar:{icons:['🧑‍🏫','👩‍🔬','🧔‍♀️'],jobs:['Travelling Naturalist','Ruins Scholar','Assistant Cartographer'],openers:['I have been bitten twice today, which means the expedition is producing data.','Do you know whether these ruins are cursed in a measurable way?','I need a local guide and, failing that, somebody difficult to frighten.'],wares:['scholar_notes','mooncap','whetstone'],gift:'scholar_notes'},
  fisher:{icons:['🎣','🧔','👩'],jobs:['Net Fisher','Eel Catcher','Barge Hand'],openers:['Water is high. Fish like it. Boots do not.','Caught a pike this morning with somebody else’s hook still in it. Felt accusatory.','If you hear bells under the water, row faster and ask theological questions later.'],wares:['bait_grubs','cooked_fish','cooked_pike'],gift:'bait_grubs'},
  locksmith:{icons:['🔐','🧑‍🔧'],jobs:['Itinerant Locksmith','Safe Mender'],openers:['Locks fail from rust, panic, and relatives. Usually in that order.','I fix doors. Occasionally I fix the assumption that doors are permanent.'],wares:['lockpick','fine_lockpick','waxed_thread']}
});
},{"patch": "js/v7.js", "line": 177, "bytes": 1141, "kind": "passers"});
define("v7@L182",function(){
RF.DATA.passerNames.push('Aster','Bram','Cerys','Dain','Eska','Fenn','Gilda','Hollis','Isen','Juniper','Kest','Mara','Neris','Odo','Perrin','Sable','Tove','Una','Vale','Zerin');
},{"patch": "js/v7.js", "line": 182, "bytes": 177, "kind": "direct"});
})();
