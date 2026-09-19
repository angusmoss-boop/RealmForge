const fs=require('fs'),vm=require('vm'),path=require('path');const root=path.resolve(__dirname,'..');
function context(scripts,storage=new Map()){
  let ctx;function el(){return {innerHTML:'',textContent:'',value:'',disabled:false,hidden:false,style:{},dataset:{},classList:{add(){},remove(){},contains(){return false},toggle(){}},setAttribute(){},getAttribute(){return null},appendChild(){},remove(){},addEventListener(){},removeEventListener(){},querySelectorAll(){return[]},querySelector(){return null},closest(){return null},focus(){},blur(){},offsetWidth:1}}
  const app=el(),document={visibilityState:'visible',head:el(),body:el(),documentElement:el(),activeElement:null,getElementById:id=>id==='app'?app:el(),createElement(tag){const x=el();x.tagName=String(tag).toUpperCase();return x},querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},removeEventListener(){}};
  const math=Object.create(Math);math.random=()=>0.5;
  ctx=vm.createContext({console,Math:math,Date,JSON,Object,Array,String,Number,Boolean,Map,Set,Promise,RegExp,Error,TypeError,parseInt,parseFloat,isNaN,encodeURIComponent,decodeURIComponent,escape,unescape,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),__errs:[],document,navigator:{onLine:true,clipboard:{writeText:async()=>{}}},location:{protocol:'file:',pathname:'/',href:'file:///'},history:{state:{},pushState(){},replaceState(){},back(){}},performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},alert(){},prompt(){return null},confirm(){return true},localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>Array.from(storage.keys())[i]||null,get length(){return storage.size}},MutationObserver:class{observe(){}disconnect(){}},ResizeObserver:class{observe(){}disconnect(){}},getComputedStyle:()=>({}),URL,Intl});ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;ctx.addEventListener=()=>{};ctx.removeEventListener=()=>{};ctx.scrollTo=()=>{};ctx.scrollX=0;ctx.scrollY=0;ctx.pageXOffset=0;ctx.pageYOffset=0;
  document.head.appendChild=function(x){if(x?.tagName==='SCRIPT'&&x.textContent){try{vm.runInContext(x.textContent,ctx,{filename:String(x.textContent.match(/sourceURL=([^\n]+)/)?.[1]||'embedded-runtime.js')})}catch(e){ctx.__errs.push(String(e.stack||e))}}return x};document.documentElement.appendChild=document.head.appendChild;
  for(const rel of scripts){try{vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),ctx,{filename:rel})}catch(e){ctx.__errs.push(rel+': '+String(e.stack||e))}}return ctx;
}
const oldScripts=['js/data/base_content.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/dist/save_core_v11_20.js','js/dist/data_core_v11_20.js','js/legacy/base/main.js','js/dist/systems_core_v11_20.js','js/legacy/compat_gameplay_app_shell_trimmed_v1153.js','js/dist/canonical_v11_20.js'];
const newScripts=['js/data/base_content.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/dist/save_core_v11_21.js','js/dist/data_core_v11_21.js','js/legacy/base/main.js','js/dist/systems_core_v11_21.js','js/legacy/compat_gameplay_world_social_trimmed_v1153.js','js/dist/canonical_v11_21.js'];
const clone=x=>JSON.parse(JSON.stringify(x)),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function baseAdvanced(R,name){
  let s=R.newGame(name,'traveller','🧭');R.state=s;s.player.level=30;s.player.xp=54321;s.gold=18888;s.location='greenvale';s.seed='v1119-compat-'+name;s.day=13;s.minute=16*60;s.player.maxEnergy=158;s.player.energy=67;s.speed=1;s.paused=false;
  for(const k of Object.keys(s.skills||{})){s.skills[k].level=Math.max(20,s.skills[k].level||1);s.skills[k].xp=R.xpForLevel(s.skills[k].level);}s.skills.exploration.level=28;s.skills.exploration.xp=R.xpForLevel(28);s.skills.thieving.level=23;s.skills.thieving.xp=R.xpForLevel(23);
  s.equipment={main:'cindermaw_blade',off:'magma_guard',head:'tyrant_crown',chest:'emberplate_cuirass',legs:'tombwarden_greaves',boots:'cinderstep_boots',ring1:'ash_ring',ring2:'ash_ring'};
  s.toolbelt={mining:'steel_pickaxe',woodcutting:'steel_axe',fishing:'angler_rod',firemaking:'tinderbox'};
  s.inventory={lockpick:12,fine_lockpick:5,iron_ore:55,coal:35,logs:32,raw_meat:12,herb:15,wild_berries:20,ash_ring:1};s.bank={iron_ore:55,logs:32,raw_meat:22,herb:18};
  s.v1023=s.v1023||{};s.v1023.energyRecoveryMinutes=2.25;
  s.v1025=s.v1025||{};s.v1025.chests={ruins:{tier:'medium',foundDay:12,failures:2},quarry:{tier:'rare',foundDay:13,failures:1}};
  s.v7=s.v7||{};s.v7.excavated={...(s.v7.excavated||{}),ruins:4};s.v7.research={...(s.v7.research||{}),wolf:{level:2,notes:1}};s.v7.rareFinds=7;
  s.crime=s.crime||{};Object.assign(s.crime,{bounty:137,heat:61,thefts:19,lastReason:'burglary'});s.stats=s.stats||{};Object.assign(s.stats,{crimes:24,burglaries:9,failedLockpicks:6,chestLocksJammed:1});
  s.v1031=s.v1031||{};s.v1031.burglaryCooldowns={greenvale_miller:13*1440+17*60,greenvale_apothecary:14*1440+8*60};
  s.home={...(s.home||{}),owned:true,level:1,wellRestedBattles:2};s.v1024={...(s.v1024||{}),homeTab:'cook'};s.buffs={...(s.buffs||{}),roadfed:2,wellFed:1};
  s.flags={...(s.flags||{}),vossDefeated:true,northRoadOpen:true,emberdeepKnown:true,wanted:true};
  const qid=Object.keys(R.DATA.quests||{})[0];if(qid)s.quests[qid]={active:true,done:false,progress:2};
  s.v1062=s.v1062||{};s.v1062.records={...(s.v1062.records||{}),ember_cave:{attempts:4,clears:3,bestHp:142}};
  s.resources={...(s.resources||{}),copper:{charges:2,last:R.totalMinutes?.(s)||0},oak:{charges:1,last:R.totalMinutes?.(s)||0}};
  if(R.V1054?.ensureStock){R.V1054.ensureStock(s,'greenvale');}
  return s;
}
function persist(R,s){R.state=s;R.save(s);const id=R.V95.activeId();R.V95.saveNow();return {id,before:clone(R.V95.readSlot(id).state)};}
function bootFixture(name,setup){
  const storage=new Map(),old=context(oldScripts,storage),R0=old.RF;let s=baseAdvanced(R0,name);setup?.(R0,s);const saved=persist(R0,s);const neu=context(newScripts,storage),R=neu.RF,after=R.state;return {old,R0,neu,R,after,before:saved.before,id:saved.id};
}
const results={};
// Advanced idle fixture, including deliberate Pack overflow and time progression before save.
let f=bootFixture('Advanced', (R,s)=>{
  s.player.energy=50;s.v1023.energyRecoveryMinutes=1;R.advanceWorld(8); // exercise save after time progression: +3 Energy
  for(let i=0;i<42;i++){const id='compat19_dummy_'+i;R.DATA.items[id]={name:id,icon:'•',type:'material',value:1};s.inventory[id]=1;}
  R.V1056.enforcePause(s,{log:false});
});
let {R,after,before}=f;
results.advanced={
  slot:R.V95.activeId()===f.id,name:after?.player?.name===before.player.name,level:after?.player?.level===30,xp:after?.player?.xp===before.player.xp,gold:after?.gold===before.gold,
  equipment:same(after?.equipment,before.equipment),dualRings:after?.equipment?.ring1==='ash_ring'&&after?.equipment?.ring2==='ash_ring',
  toolbelt:Object.entries(before.toolbelt||{}).every(([k,v])=>after?.toolbelt?.[k]===v)&&Object.entries(after?.toolbelt||{}).every(([k,v])=>(k in (before.toolbelt||{}))||v==null),
  pack:same(after?.inventory,before.inventory),bank:same(after?.bank,before.bank),market:same(after?.v1054,before.v1054),quests:same(after?.quests,before.quests),skills:Object.keys(before.skills||{}).every(k=>after?.skills?.[k]?.level===before.skills[k].level&&after?.skills?.[k]?.xp===before.skills[k].xp),
  research:same(after?.v7?.research,before.v7.research),explore:same(after?.v1025?.chests,before.v1025.chests),resources:Object.entries(before.resources||{}).every(([k,v])=>after?.resources?.[k]?.charges===v.charges),crime:same(after?.crime,before.crime),cooldowns:same(after?.v1031?.burglaryCooldowns,before.v1031.burglaryCooldowns),
  property:same(after?.home,before.home)&&after?.v1024?.homeTab===before.v1024.homeTab,buffs:same(after?.buffs,before.buffs),flags:after?.flags?.northRoadOpen&&after?.flags?.vossDefeated&&after?.flags?.emberdeepKnown&&after?.flags?.wanted,
  dungeon:after?.v1062?.records?.ember_cave?.clears===3,energy:after?.player?.energy===before.player.energy&&after?.v1023?.energyRecoveryMinutes===before.v1023.energyRecoveryMinutes,
  overflow:R.V1056?.isOver?.(after)===true&&R.packExcess(after)===f.R0.packExcess(before),paused:after?.speed===0&&after?.paused===true,schema:after?.saveSchema==='11.5.3'
};
// Active travel fixture: preserve route/leg, progress and progressive Energy accounting.
f=bootFixture('Travel', (R,s)=>{
  s.inventory={bread:2,lockpick:2};s.location='greenvale';s.player.energy=s.player.maxEnergy;R.V1020.ensure(s);const target=Object.keys(R.DATA.locations.greenvale.neighbors||{}).find(id=>R.V1022.locationUnlocked(s,id));R.travel(target);if(s.activity?.type!=='travel')throw new Error('travel did not start');s.activity.progress=4.4;s.activity.v1022EnergyProgress=4.4;s.activity.v1022EnergySpent=4;s.stats.travelEnergySpent=4;s.player.energy-=4;s.v1020.routePlan={destination:target,path:['greenvale',target],currentIndex:0,pending:false,startedDay:s.day,startedMinute:s.minute,startedAt:123456};
});
R=f.R;after=f.after;before=f.before;results.travel={equipment:same(after.equipment,before.equipment),toolbelt:Object.entries(before.toolbelt).every(([k,v])=>after.toolbelt?.[k]===v),activity:same(after.activity,before.activity),routePlan:same(after.v1020?.routePlan,before.v1020?.routePlan),energy:after.player.energy===before.player.energy,travelEnergy:after.stats.travelEnergySpent===before.stats.travelEnergySpent,schema:after.saveSchema==='11.5.3'};
// Active combat fixture: preserve combat, selected training/category and interrupted clock snapshot.
f=bootFixture('Combat', (R,s)=>{
  s.inventory={bread:2,potion:3};s.location='forest';s.speed=1;s.paused=false;const eid=Object.keys(R.DATA.enemies||{})[0];R.startBattle(eid);if(!s.combat)throw new Error('combat did not start');s.combat.training='defence';s.combat.v1057Category='defensive';s.v1057=s.v1057||{};s.v1057.combatCategory='defensive';
});
R=f.R;after=f.after;before=f.before;results.combat={equipment:same(after.equipment,before.equipment),toolbelt:Object.entries(before.toolbelt).every(([k,v])=>after.toolbelt?.[k]===v),combat:!!after.combat&&after.combat.enemyId===before.combat.enemyId,clock:same(after.combat?.v1026ResumeClock,before.combat?.v1026ResumeClock),category:after.v1057?.combatCategory===before.v1057?.combatCategory,schema:after.saveSchema==='11.5.3'};
const checks={};for(const [group,obj] of Object.entries(results))for(const [k,v] of Object.entries(obj))checks[group+'.'+k]=!!v;
checks.timeEnergyOwner=R.Modules?.info?.('systems.timeEnergy')?.meta?.status==='canonical';checks.focusClockOwner=R.Modules?.info?.('ui.focusClock')?.meta?.status==='canonical';checks.databaseOwner=R.Modules?.info?.('ui.database')?.meta?.status==='canonical'&&R.Views?.Database?.installedStages?.length===4;checks.navigationOwner=R.Modules?.info?.('ui.navigation')?.meta?.status==='canonical'&&R.Views?.Navigation?.installedStages?.length===1;checks.presentationOwner=R.Modules?.info?.('ui.presentation')?.meta?.status==='canonical'&&R.Views?.Presentation?.installedStages?.length===4;checks.overlaysOwner=R.Modules?.info?.('ui.overlays')?.meta?.status==='canonical'&&R.Views?.Overlays?.installedStages?.length===2;checks.appShellOwner=R.Modules?.info?.('ui.appShell')?.meta?.status==='canonical'&&R.Views?.AppShell?.installedStages?.length===1&&R.Views?.AppShell?.installedFragments?.length===1;checks.developerOwner=R.Modules?.info?.('ui.developer')?.meta?.status==='canonical'&&R.Views?.Developer?.installedStages?.length===1;checks.platformBridge=['copyText','promptText','alertMessage','vibrate','isVisible','onResume','fetchBuildInfo','registerServiceWorker','onBackNavigation','pushHistoryState','replaceHistoryState'].every(k=>typeof R.Platform?.active?.[k]==='function');checks.lifecycleOwner=R.Modules?.info?.('core.lifecycle')?.meta?.status==='canonical'&&R.Core?.Lifecycle?.booted===true;checks.worldOwner=R.Modules?.info?.('systems.world')?.meta?.status==='canonical'&&R.Systems?.World?.installedStages?.includes('js/v2.js');checks.socialOwner=R.Modules?.info?.('systems.social')?.meta?.status==='canonical'&&R.Systems?.Social?.installedFragments?.length===6;checks.ownership=R.PRODUCTION_FOUNDATION?.systemOwnership?.valid===true;
const knownWarnings=[f.neu].filter(Boolean);const errs=[...new Set([...(f.neu?.__errs||[])])];
console.log(JSON.stringify({checks,advanced:{energy:results.advanced.energy,overflow:results.advanced.overflow},travel:after?.activity,combatActive:!!after?.combat,lastFixtureErrors:f.neu.__errs.slice(0,4)},null,2));
if(Object.values(checks).some(v=>!v))process.exit(2);
