window.RF=window.RF||{};
RF.VERSION='10.0.0';
RF.V10=RF.V10||{queue:[],lastModalOpen:false,starterLoadout:null};
(()=>{let st=document.createElement('style');st.textContent='.fill.energyFill{background:linear-gradient(90deg,#b88d39,#f0d398)}.skillInspect{width:100%;border:0;text-align:left;background:transparent;color:inherit;cursor:pointer}.skillInspect:active{transform:scale(.992)}.battleSummary .statsGrid{margin:12px 0}.battleSummary .resultGains{max-height:38vh;overflow:auto}';document.head.appendChild(st)})();

/* Realmforge V10 — Endurance & Milestones
   - Energy becomes a long-horizon skilling resource.
   - Level-up popups queue behind combat/activity summaries.
   - Richer battle summary.
   - Skill detail popups.
   - Faster, tighter pickpocket attention.
   - Rare instant-harvest proc.
   - Inn wake-time selection.
   - New-game name field starts blank.
*/

RF.migrateV10=function(s){
  if(!s)return s;
  s.version='10.0.0';
  s.player.maxEnergy=s.player.maxEnergy||100;
  if(s.player.energy==null)s.player.energy=s.player.maxEnergy;
  s.stats=s.stats||{};
  s.stats.instantHarvests??=0;
  s.stats.energySpent??=0;
  s.stats.innRests??=0;
  s.v10=s.v10||{};
  return s;
};
const v10NewBase=RF.newGame;RF.newGame=function(...a){return RF.migrateV10(v10NewBase(...a))};
const v10LoadBase=RF.load;RF.load=function(){return RF.migrateV10(v10LoadBase())};
const v10ImportBase=RF.importSave;RF.importSave=function(x){return RF.migrateV10(v10ImportBase(x))};
if(RF.V95){RF.V95.SCHEMA='10.0.0';const v10SlotMigrateBase=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=function(s){return RF.migrateV10(v10SlotMigrateBase(s))}}

// -------- Character creation --------
RF.UI.creator=function(){
  const bgs=Object.entries(RF.DATA.backgrounds).map(([id,b],i)=>`<button class="bgopt ${i===0?'sel':''}" data-bg="${id}"><b>${b.icon} ${b.name}</b><small>${b.desc}</small></button>`).join('');
  return `<div class="creator"><div class="logo">REALMFORGE<small>WANDERER'S RISE</small></div><div class="creatorCard"><h2 style="font-family:Georgia,serif;color:#f0d398;margin-top:0">Create your wanderer</h2><div class="field"><label>Name</label><input id="charName" maxlength="18" value="" placeholder="Name your wanderer" autocomplete="off" /></div><div class="field"><label>Avatar</label><select id="avatar"><option>🧑</option><option>🧔</option><option>👩</option><option>🧝</option><option>🧙</option><option>🥷</option></select></div><div class="field"><label>Background</label><div class="backgrounds">${bgs}</div></div><button id="startGame" class="startBtn">Begin the Journey</button><div class="sub center" style="margin-top:10px">Your background gives a small head start. It never locks your build.</div></div></div>`;
};
RF.UI.bindCreator=function(){let chosen='farmer';document.querySelectorAll('.bgopt').forEach(x=>x.onclick=()=>{document.querySelectorAll('.bgopt').forEach(y=>y.classList.remove('sel'));x.classList.add('sel');chosen=x.dataset.bg});document.getElementById('startGame').onclick=()=>{let name=document.getElementById('charName').value.trim();if(!name){document.getElementById('charName').focus();return}RF.startNew(name,chosen,document.getElementById('avatar').value)}};

// -------- Energy --------
RF.v10EnergyCost=function(kind){return ({work:3,production:3,hunt:3,fire:2,lockpick:2,forge:3,excavate:3,fishing:2,cooking:2,potion:2})[kind]||2};
RF.v10SpendEnergy=function(s,cost){cost=Math.max(0,cost||0);if(!s?.player)return false;if((s.player.energy||0)<cost){RF.UI.modal={type:'message',title:'Too Exhausted',text:'You do not have enough Energy for that action. Rest at an inn or campfire, or let time pass slowly.'};RF.UI.render(s);return false}s.player.energy=Math.max(0,s.player.energy-cost);s.stats.energySpent=(s.stats.energySpent||0)+cost;return true};
RF.v10EnergyKind=function(){let g=RF.actionGame;if(!g)return null;if(g.type==='work')return'work';if(g.type==='production')return'production';if(g.type==='hunt')return'hunt';if(g.type==='firemaking')return'fire';if(g.type==='lockpick')return'lockpick';if(g.type==='forge')return'forge';if(g.type==='excavate')return'excavate';if(g.type==='fishing')return'fishing';if(g.type==='cooking')return'cooking';if(g.type==='potionLab')return'potion';return g.type};
RF.v10WrapEnergyAction=function(name){let base=RF[name];if(typeof base!=='function')return;RF[name]=function(...args){let s=RF.state,g=RF.actionGame,kind=RF.v10EnergyKind(),beforeTaps=s?.stats?.activeTaps||0,beforeStage=g?.stage,beforeProg=g?.progress,beforeCooldown=g?.v8CooldownUntil||0,beforeEnergy=s?.player?.energy||0,cost=RF.v10EnergyCost(kind);if(s&&kind&&beforeEnergy<cost){RF.v10SpendEnergy(s,cost);return}let out=base.apply(this,args);let ng=RF.actionGame,acted=(s?.stats?.activeTaps||0)>beforeTaps||(g&&g.v8CooldownUntil!==beforeCooldown)||(ng&&ng===g&&(ng.stage!==beforeStage||ng.progress!==beforeProg));if(acted&&s&&kind)RF.v10SpendEnergy(s,cost);return out};};
['workTap','productionTap','huntTrack','setTumbler','stokeForge','hammerForge','excavateTile','castLine'].forEach(RF.v10WrapEnergyAction);
RF.v10WrapDirectEnergy=function(name,kind,valid){let base=RF[name];if(typeof base!=='function')return;RF[name]=function(...args){let s=RF.state;if(!valid(RF.actionGame))return base.apply(this,args);let cost=RF.v10EnergyCost(kind);if(!RF.v10SpendEnergy(s,cost))return;return base.apply(this,args)}};
RF.v10WrapDirectEnergy('sparkFire','fire',g=>g?.type==='firemaking');
RF.v10WrapDirectEnergy('huntStrike','hunt',g=>g?.type==='hunt'&&g.stage==='strike');
RF.v10WrapDirectEnergy('reelFish','fishing',g=>g?.type==='fishing'&&g.stage==='bite');
RF.v10WrapDirectEnergy('turnCook','cooking',g=>g?.type==='cooking');
RF.v10WrapDirectEnergy('brewExperiment','potion',g=>g?.type==='potionLab'&&g.ingredients?.length===2);

const v10AdvanceBase=RF.advanceWorld;RF.advanceWorld=function(min){let s=RF.state,before=s?.player?.energy||0,out=v10AdvanceBase(min);s=RF.state;if(s?.player){s.player.energy=Math.min(s.player.maxEnergy||100,(s.player.energy||0)+Math.max(0,min)*0.02);if(s.player.energy<0)s.player.energy=0}return out};
const v10FireRestBase=RF.restByFire;if(typeof v10FireRestBase==='function')RF.restByFire=function(){let s=RF.state,b=s?.player?.energy||0,out=v10FireRestBase();if(s?.player){s.player.energy=Math.min(s.player.maxEnergy||100,(s.player.energy||0)+22);RF.log(s,`The fire restores ${Math.round(s.player.energy-b)} Energy.`,'good');RF.save(s);RF.UI.render(s)}return out};

// -------- Top and character energy bars --------
const v10TopBase=RF.UI.top.bind(RF.UI);RF.UI.top=function(s){let h=v10TopBase(s),en=Math.max(0,Math.min(100,100*(s.player.energy||0)/(s.player.maxEnergy||100)));let energy=`<div class="tiny" style="margin-top:3px">Energy ${Math.ceil(s.player.energy||0)}/${s.player.maxEnergy||100}</div><div class="bar"><div class="fill energyFill" style="width:${en}%"></div></div>`;h=h.replace('</div></div><div class="timeRow">',`${energy}</div></div><div class="timeRow">`);return h};
const v10CharBase=RF.UI.character.bind(RF.UI);RF.UI.character=function(s){let h=v10CharBase(s);return h.replace('<div class="statbox"><span>Armour</span>',`<div class="statbox"><span>Energy</span><b>${Math.ceil(s.player.energy||0)}/${s.player.maxEnergy||100}</b></div><div class="statbox"><span>Armour</span>`)};

// -------- Instant harvest: rarer than crit --------
const v10WorkBase=RF.workTap;RF.workTap=function(){let s=RF.state,g=RF.actionGame;if(!g||g.type!=='work')return v10WorkBase();let d=RF.DATA.resourceDefs[g.key],level=s.skills[d.skill]?.level||1,tool=RF.bestTool(s,d.skill),chance=Math.min(.055,.012+level*.0008+(tool?.control||0)*.22+(s.luck||0)*.001);if((s.player.energy||0)>=RF.v10EnergyCost('work')&&RF.actionReady?.(g,'v10InstantProbe',0)!==false&&Math.random()<chance){if(!RF.v10SpendEnergy(s,RF.v10EnergyCost('work')))return;g.required=g.required||RF.workRequired(d);g.progress=g.required;g.crit=false;g.mishap=false;g.last='✨ INSTANT HARVEST — a perfect opening finishes the resource immediately.';s.stats.instantHarvests=(s.stats.instantHarvests||0)+1;return RF.finishActiveGather(g)}return v10WorkBase()};

// -------- Faster, tighter pickpocketing --------
RF.v9Vigilance=function(speaker,passer){let job=(speaker.job||'').toLowerCase(),v=passer?45:55;if(/guard|warden|ranger|mercenary|sellsword|captain|watch|locksmith/.test(job))v+=25;if(/merchant|trader|guildmaster|apothecary/.test(job))v+=13;if(/farmer|fisher|innkeeper|miner/.test(job))v-=5;return Math.max(30,Math.min(94,v))};
RF.startPickpocket=function(id,passer=false){let s=RF.state;if(s.combat||s.activity)return;let speaker=passer?RF.passersHere(s).find(x=>x.id===id):RF.DATA.npcs[id];if(!speaker)return;let resume=s.speed;s.speed=0,vig=RF.v9Vigilance(speaker,passer),skill=s.skills.thieving.level||1,width=Math.max(6,Math.min(22,18-vig*.11+skill*.2)),target=8+Math.random()*(84-width);RF.actionGame={type:'pickpocket',id,passer,speaker:{name:speaker.name,icon:speaker.icon||'🧑',job:speaker.job||'Traveller'},target,width,attention:Math.random()*100,velocity:(Math.random()*32+26)*(Math.random()<.5?-1:1),wanderTarget:Math.random()*100,vigilance:vig,resumeSpeed:resume,message:'Their attention shifts quickly. Lift only inside the green window.'};RF.UI.modal={type:'v7Action'};RF.UI.render(s);RF.v9StartPickTicker()};
RF.v9StartPickTicker=function(){RF.v9StopPick();let last=performance.now();RF.V9.pickTimer=setInterval(()=>{let g=RF.actionGame;if(!g||g.type!=='pickpocket'){RF.v9StopPick();return}let now=performance.now(),dt=Math.min(.08,(now-last)/1000);last=now;if(Math.random()<.07){g.wanderTarget=Math.random()*100}let desired=Math.sign(g.wanderTarget-g.attention)*(30+g.vigilance*.32);g.velocity+=(desired-g.velocity)*Math.min(1,dt*2.5)+(Math.random()-.5)*70*dt;let cap=55+g.vigilance*.45;g.velocity=Math.max(-cap,Math.min(cap,g.velocity));g.attention+=g.velocity*dt;if(g.attention<0){g.attention=0;g.velocity=Math.abs(g.velocity)}if(g.attention>100){g.attention=100;g.velocity=-Math.abs(g.velocity)}let el=document.querySelector('.v9AttentionNeedle');if(el)el.style.left=`${g.attention}%`;},40)};

// -------- Inn rest with chosen wake time --------
RF.v10InnHere=s=>['greenvale','ironridge','reedmere'].includes(s.location);
const v10ActionBase=RF.action;RF.action=function(a){if(a==='rest'&&RF.state&&RF.v10InnHere(RF.state)){RF.UI.modal={type:'v10InnRest'};RF.UI.render(RF.state);return}return v10ActionBase(a)};
RF.v10RestUntil=function(hour){let s=RF.state;hour=Math.max(0,Math.min(23,+hour||8));let current=s.minute,delta=(1440-current)+hour*60;RF.advanceWorld(delta);s.player.hp=s.player.maxHp;s.player.stamina=s.player.maxStamina;s.player.energy=s.player.maxEnergy||100;s.stats.innRests=(s.stats.innRests||0)+1;RF.log(s,`You sleep at the inn and wake at ${String(hour).padStart(2,'0')}:00 on Day ${s.day}.`,'good');RF.save(s);RF.UI.modal={type:'message',title:'Properly Rested',text:`You wake at ${String(hour).padStart(2,'0')}:00 with Health, Stamina and Energy fully restored.`};RF.UI.render(s)};

// -------- Level-up queue --------
RF.v10QueueModal=function(m){if(!m)return;RF.V10.queue.push(m)};
const v10AddXpBase=RF.addXp;RF.addXp=function(s,skill,amount){let before=s.skills?.[skill]?.level||1;v10AddXpBase(s,skill,amount);let after=s.skills?.[skill]?.level||before;if(after>before){for(let lv=before+1;lv<=after;lv++)RF.v10QueueModal({type:'v10LevelUp',kind:'skill',skill,level:lv})}};
const v10AddPlayerBase=RF.addPlayerXp;RF.addPlayerXp=function(s,amount){let before=s.player.level;v10AddPlayerBase(s,amount);let after=s.player.level;if(after>before){for(let lv=before+1;lv<=after;lv++)RF.v10QueueModal({type:'v10LevelUp',kind:'character',level:lv})}};

// -------- Skill inspection --------
RF.UI.skills=function(s){
  let skillRows=Object.entries(RF.DATA.skills).map(([id,d])=>{let sk=s.skills[id],next=RF.xpForLevel(Math.min(100,sk.level+1)),prev=RF.xpForLevel(sk.level),pct=sk.level>=100?100:100*(sk.xp-prev)/Math.max(1,next-prev);return `<button class="row skill skillInspect" data-skill-detail="${id}"><div class="skillIcon">${d.icon}</div><div><div class="skillName">${d.name}</div><div class="miniBar"><div class="miniFill" style="width:${Math.max(0,Math.min(100,pct))}%"></div></div><small>${Math.floor(sk.xp)} XP</small></div><div class="skillLevel">${sk.level}</div></button>`}).join('');
  let cat=s.v93?.craftCategory||'all';let options=[['all','All items'],['weapon','Weapons'],['armor','Armour'],['food','Food & Potions'],['material','Materials'],['tool','Tools'],['treasure','Treasure'],['other','Other']].map(([v,l])=>`<option value="${v}" ${cat===v?'selected':''}>${l}</option>`).join('');
  let recipes=Object.entries(RF.DATA.recipes).filter(([id,r])=>{let out=Object.keys(r.outputs||{})[0]||id;return cat==='all'||RF.v92Category(RF.DATA.items[out])===cat}).map(([id,r])=>{let out=Object.keys(r.outputs||{})[0]||id,it=RF.DATA.items[out],req=RF.v93Req?RF.v93Req(s,out):'',canLevel=(s.skills[r.skill]?.level||1)>=r.level,canMats=RF.hasItems(s,r.inputs);return `<button class="row browseRow" data-recipe-detail="${id}"><div class="icon">${it?.icon||'🛠️'}</div><div class="meta"><b>${r.name}</b><small>${RF.DATA.skills[r.skill]?.name||r.skill} Lv ${r.level}${req?` • Use: ${req}`:''}</small></div><span class="recipeState ${canLevel&&canMats?'ready':''}">${canLevel&&canMats?'READY':!canLevel?`LV ${r.level}`:'MATS'}</span><span class="chev">›</span></button>`}).join('');
  return `<section class="card"><h2>Skills</h2><div class="sub">Tap any skill for detailed XP progress. Level cap: 100.</div><div class="list" style="margin-top:10px">${skillRows}</div></section><section class="card"><h3>Crafting</h3><label class="filterLabel">Category<select data-v93-filter="craft">${options}</select></label><div class="sub">Tap a recipe to inspect ingredients, crafting skill and use requirements.</div><div class="list">${recipes||'<div class="sub">No recipes in this category.</div>'}</div></section>`;
};

// -------- Sophisticated combat summary --------
const v10StartBattleBase=RF.startBattle;RF.startBattle=function(id,opts={}){let s=RF.state,e=RF.DATA.enemies[id];let out=v10StartBattleBase(id,opts);if(s?.combat){s.combat.v10Summary={enemy:id,startHp:s.player.hp,startStamina:s.player.stamina,startGold:s.gold,startXp:s.player.xp,startSkills:Object.fromEntries(['attack','strength','defence','vitality'].map(k=>[k,s.skills[k]?.xp||0])),startSkillLevels:Object.fromEntries(['attack','strength','defence'].map(k=>[k,s.skills[k]?.level||1])),startInventory:{...s.inventory},turnStart:s.combat.turn||1,damageTaken:0,parries:0,perfectParries:0};}return out};
const v10EnemyTurnBase=RF.enemyBattleTurn||RF.enemyTurn;if(typeof v10EnemyTurnBase==='function'){
  let key=RF.enemyBattleTurn?'enemyBattleTurn':'enemyTurn';RF[key]=function(...a){let s=RF.state,c=s?.combat,hp=s?.player?.hp||0,logLen=c?.log?.length||0;let out=v10EnemyTurnBase.apply(this,a);if(c?.v10Summary){c.v10Summary.damageTaken+=Math.max(0,hp-(s.player.hp||0));let added=(c.log||[]).slice(logLen).join(' ');if(/PARRY/i.test(added))c.v10Summary.parries++;if(/PERFECT PARRY/i.test(added))c.v10Summary.perfectParries++;}return out};
}
const v10WinBase=RF.winCombat;RF.winCombat=function(){let s=RF.state,c=s?.combat;if(!c)return;let sum=c.v10Summary?JSON.parse(JSON.stringify(c.v10Summary)):null,e=RF.DATA.enemies[c.id],turns=c.turn||1;RF.V10.deferQueue=true;try{v10WinBase()}finally{RF.V10.deferQueue=false}s=RF.state;if(!sum)return;let loot=[];Object.entries(s.inventory).forEach(([id,q])=>{let d=q-(sum.startInventory[id]||0);if(d>0&&RF.DATA.items[id])loot.push(`${RF.DATA.items[id].icon} ${RF.DATA.items[id].name} ×${d}`)});['attack','strength','defence'].forEach(k=>{let a=s.skills[k]?.level||1,b=sum.startSkillLevels?.[k]||1;if(a>b){for(let lv=b+1;lv<=a;lv++)RF.v10QueueModal({type:'v10LevelUp',kind:'skill',skill:k,level:lv})}});let skillXp=['attack','strength','defence','vitality'].map(k=>[k,(s.skills[k]?.xp||0)-(sum.startSkills[k]||0)]).filter(([,x])=>x>0);let summary={type:'v10BattleSummary',enemy:c.id,title:`${e?.name||'Enemy'} Defeated`,turns,damageTaken:sum.damageTaken,hpLeft:s.player.hp,gold:s.gold-sum.startGold,playerXp:s.player.xp-sum.startXp,skillXp,loot,parries:sum.parries,perfectParries:sum.perfectParries};RF.UI.modal=summary;RF.UI.render(s)};

// -------- Modal rendering --------
const v10ModalBase=RF.UI.modalHtml.bind(RF.UI);RF.UI.modalHtml=function(s){let m=this.modal;
  if(m?.type==='v10InnRest'){let hours=[6,8,10,12];return `<div class="modalBack"><div class="modal"><div class="resultIcon">🛏️</div><span class="eyebrow">INN REST</span><h2>Sleep until tomorrow</h2><div class="itemDesc">A proper bed fully restores Health, Stamina and Energy. Choose when you want to wake tomorrow.</div><div class="choices">${hours.map(h=>`<button class="choice" data-v10-rest="${h}"><b>Wake at ${String(h).padStart(2,'0')}:00</b><small>Tomorrow morning</small></button>`).join('')}<button class="choice" data-v10-close><b>Cancel</b></button></div></div></div>`}
  if(m?.type==='v10LevelUp'){if(m.kind==='character')return `<div class="modalBack"><div class="modal resultModal"><div class="resultIcon">🌟</div><span class="eyebrow">CHARACTER LEVEL</span><h2>Level ${m.level}</h2><div class="itemDesc">Your wanderer grows stronger. Maximum Health and Stamina increase as your character level rises.</div><button class="startBtn" data-v10-close>Continue</button></div></div>`;let d=RF.DATA.skills[m.skill];return `<div class="modalBack"><div class="modal resultModal"><div class="resultIcon">${d?.icon||'✨'}</div><span class="eyebrow">SKILL LEVEL UP</span><h2>${d?.name||m.skill} Level ${m.level}</h2><div class="itemDesc">Your ${d?.name||m.skill} mastery has increased.</div><button class="startBtn" data-v10-close>Continue</button></div></div>`}
  if(m?.type==='v10SkillDetail'){let sk=s.skills[m.id],d=RF.DATA.skills[m.id],prev=RF.xpForLevel(sk.level),next=sk.level>=100?prev:RF.xpForLevel(sk.level+1),remain=sk.level>=100?0:Math.max(0,next-sk.xp),into=Math.max(0,sk.xp-prev),span=Math.max(1,next-prev),pct=sk.level>=100?100:Math.min(100,100*into/span);return `<div class="modalBack"><div class="modal"><div class="resultIcon">${d.icon}</div><span class="eyebrow">SKILL</span><h2>${d.name}</h2><div class="statsGrid"><div class="statbox"><span>Level</span><b>${sk.level}</b></div><div class="statbox"><span>Total XP</span><b>${Math.floor(sk.xp)}</b></div><div class="statbox"><span>XP to next</span><b>${sk.level>=100?'MAX':Math.ceil(remain)}</b></div><div class="statbox"><span>Progress</span><b>${Math.round(pct)}%</b></div></div><div class="miniBar" style="margin-top:12px"><div class="miniFill" style="width:${pct}%"></div></div><button class="quietClose" data-v10-close>Close</button></div></div>`}
  if(m?.type==='v10BattleSummary'){let e=RF.DATA.enemies[m.enemy];return `<div class="modalBack"><div class="modal battleSummary"><div class="resultIcon">🏆</div><span class="eyebrow">BATTLE COMPLETE</span><h2>${e?.icon||'⚔️'} ${m.title}</h2><div class="statsGrid"><div class="statbox"><span>Turns</span><b>${m.turns}</b></div><div class="statbox"><span>HP remaining</span><b>${Math.ceil(m.hpLeft)}</b></div><div class="statbox"><span>Damage taken</span><b>${Math.round(m.damageTaken)}</b></div><div class="statbox"><span>Parries</span><b>${m.parries}${m.perfectParries?` • ${m.perfectParries} perfect`:''}</b></div></div><h3>Rewards</h3><div class="resultGains">${m.gold>0?`<div><span>🪙</span><b>+${m.gold} gold</b></div>`:''}${m.playerXp>0?`<div><span>🌟</span><b>+${m.playerXp} Character XP</b></div>`:''}${m.skillXp.map(([k,x])=>`<div><span>${RF.DATA.skills[k]?.icon||'✨'}</span><b>+${Math.round(x)} ${RF.DATA.skills[k]?.name||k} XP</b></div>`).join('')}${m.loot.map(x=>`<div><span>🎁</span><b>${x}</b></div>`).join('')||'<div><span>▫️</span><b>No item drops</b></div>'}</div><button class="startBtn" data-v10-close>Continue</button></div></div>`}
  return v10ModalBase(s);
};

// Queue level-up modals only after the current result/summary is closed.
const v10RenderBase=RF.UI.render.bind(RF.UI);RF.UI.render=function(s){if(s&&!RF.V10.deferQueue&&!this.modal&&RF.V10.queue.length)this.modal=RF.V10.queue.shift();return v10RenderBase(s)};

const v10BindBase=RF.UI.bind.bind(RF.UI);RF.UI.bind=function(s){v10BindBase(s);document.querySelectorAll('[data-skill-detail]').forEach(b=>b.onclick=()=>{RF.UI.modal={type:'v10SkillDetail',id:b.dataset.skillDetail};RF.UI.render(s)});document.querySelectorAll('[data-v10-rest]').forEach(b=>b.onclick=()=>RF.v10RestUntil(+b.dataset.v10Rest));document.querySelectorAll('[data-v10-close]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(s)});};

// Dev convenience for the new resource.
const v10DevBase=RF.UI.dev?.bind(RF.UI);if(v10DevBase)RF.UI.dev=function(s){let h=v10DevBase(s);return h.replace('<h3>Skill XP</h3>',`<h3>Energy</h3><div class="devGrid"><button data-v10-dev-energy="full">Full Energy</button><button data-v10-dev-energy="empty">Empty Energy</button></div><h3>Skill XP</h3>`)};
const v10Bind2Base=RF.UI.bind.bind(RF.UI);RF.UI.bind=function(s){v10Bind2Base(s);document.querySelectorAll('[data-v10-dev-energy]').forEach(b=>b.onclick=()=>{s.player.energy=b.dataset.v10DevEnergy==='full'?(s.player.maxEnergy||100):0;RF.save(s);RF.UI.render(s)})};

if(RF.state){RF.migrateV10(RF.state);if(!RF.state.flags.v10Seen){RF.state.flags.v10Seen=true;RF.log(RF.state,'V10: Energy, milestone popups, richer battle summaries, skill inspection and improved inn rest are active.','important')}RF.save(RF.state);RF.UI.render(RF.state)}
