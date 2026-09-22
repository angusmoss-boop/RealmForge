const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
function makeContext(scripts,storage){
  let ctx;function el(){return {innerHTML:'',textContent:'',value:'',disabled:false,hidden:false,style:{},dataset:{},className:'',classList:{add(){},remove(){},contains(){return false},toggle(){}},setAttribute(){},getAttribute(){return null},appendChild(){},remove(){},addEventListener(){},removeEventListener(){},querySelectorAll(){return[]},querySelector(){return null},closest(){return null},focus(){},blur(){},matches(){return false},onclick:null,offsetWidth:1,nodeType:1,children:[]}}
  const app=el(),document={visibilityState:'visible',head:el(),body:el(),documentElement:el(),activeElement:null,getElementById:id=>id==='app'?app:el(),createElement(tag){const x=el();x.tagName=String(tag).toUpperCase();return x},querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},removeEventListener(){}};
  const math=Object.create(Math);math.random=()=>0.5;
  ctx=vm.createContext({console,Math:math,Date,JSON,Object,Array,String,Number,Boolean,Map,Set,Promise,RegExp,Error,TypeError,parseInt,parseFloat,isNaN,encodeURIComponent,decodeURIComponent,escape,unescape,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),__errs:[],document,navigator:{onLine:true,clipboard:{writeText:async()=>{}}},location:{protocol:'file:',pathname:'/',href:'file:///'},history:{state:{},pushState(){},replaceState(){},back(){}},performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},queueMicrotask:fn=>fn(),setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},alert(){},prompt(){return null},confirm(){return true},localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>Array.from(storage.keys())[i]||null,get length(){return storage.size}},MutationObserver:class{observe(){}disconnect(){}},ResizeObserver:class{observe(){}disconnect(){}},getComputedStyle:()=>({}),URL,Intl});
  ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;ctx.addEventListener=()=>{};ctx.removeEventListener=()=>{};ctx.scrollTo=()=>{};
  document.head.appendChild=function(x){if(x?.tagName==='SCRIPT'&&x.textContent){try{vm.runInContext(x.textContent,ctx,{filename:String(x.textContent.match(/sourceURL=([^\n]+)/)?.[1]||'embedded-runtime.js')})}catch(e){ctx.__errs.push(String(e.stack||e))}}return x};document.documentElement.appendChild=document.head.appendChild;
  for(const rel of scripts)try{vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),ctx,{filename:rel})}catch(e){ctx.__errs.push(rel+': '+String(e.stack||e))}
  return ctx;
}
const common=['js/data/base_content.js','js/legacy/base/state.js','js/legacy/base/ui.js'];
const compat='js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js';
const v123=[...common,'js/dist/save_core_v12_3.js','js/dist/data_core_v12_3.js','js/legacy/base/main.js','js/dist/systems_core_v12_3.js',compat,'js/dist/canonical_v12_3.js'];
const v124=[...common,'js/dist/save_core_v12_4.js','js/dist/data_core_v12_4.js','js/legacy/base/main.js','js/dist/systems_core_v12_4.js',compat,'js/dist/canonical_v12_4.js'];
const storage=new Map(),starters=['crude_pickaxe','crude_axe','reed_rod','flint_kit'];
const better={mining:'cobalt_pickaxe',woodcutting:'cobalt_axe',fishing:'angler_rod',firemaking:'tinderbox'};
const checks={};
// Build the exact previous-release failure state: detached Tool Belt, better tools equipped,
// starter copies deliberately removed, then V12.3's repeated historical normalizer resurrects them.
let c3=makeContext(v123,storage),R3=c3.RF;R3.startNew('Upgrade Fixture','traveller','🧰');let s3=R3.state;s3.skills.mining.level=99;s3.skills.woodcutting.level=99;s3.skills.fishing.level=99;s3.skills.firemaking.level=99;
for(const id of Object.values(better))if((s3.inventory[id]||0)<1)R3.addItem(s3,id,1);
for(const id of Object.values(better))R3.equipTool(id);
checks.v123BetterBelt=Object.entries(better).every(([slot,id])=>s3.toolbelt?.[slot]===id);
for(const id of starters)delete s3.inventory[id];
checks.v123CleanBeforeNormalize=starters.every(id=>(s3.inventory[id]||0)===0)&&s3.v1053?.detached===true;
R3.Core.Migrations.normalize(s3);
checks.v123BugReproduced=starters.every(id=>(s3.inventory[id]||0)===1);
R3.save(s3);R3.V95.saveNow();const slot=R3.V95.activeId(),raw3=R3.V95.readRawSlot(slot)?.state;
checks.v123DuplicatesActuallyPersisted=starters.every(id=>(raw3?.inventory?.[id]||0)===1);
// Upgrade those actual persisted bytes to V12.4. Existing Pack copies must remain losslessly.
let c4=makeContext(v124,storage),R4=c4.RF,s4=R4.state;
checks.v124LoadedSameSlot=R4.V95.activeId()===slot&&s4?.player?.name==='Upgrade Fixture';
checks.v124PreservesPersistedCopies=starters.every(id=>(s4.inventory?.[id]||0)===1);
checks.v124PreservesBetterBelt=Object.entries(better).every(([slotName,id])=>s4.toolbelt?.[slotName]===id);
// Once the player disposes of those old copies, repeated normalisation and a full reload may not recreate them.
for(const id of starters)delete s4.inventory[id];
R4.Core.Migrations.normalize(s4);checks.v124NoImmediateRegrow=starters.every(id=>(s4.inventory[id]||0)===0);
R4.save(s4);R4.V95.saveNow();const raw4=R4.V95.readRawSlot(slot)?.state;
checks.v124CleanStatePersisted=starters.every(id=>(raw4?.inventory?.[id]||0)===0);
let c4Reload=makeContext(v124,storage),R4b=c4Reload.RF,s4b=R4b.state;
checks.v124NoReloadRegrow=starters.every(id=>(s4b?.inventory?.[id]||0)===0)&&Object.entries(better).every(([slotName,id])=>s4b?.toolbelt?.[slotName]===id);
const unexpected=[...c3.__errs,...c4.__errs,...c4Reload.__errs].filter(x=>!String(x).includes('modalHTML'));
checks.noUnexpectedErrors=unexpected.length===0;
console.log(JSON.stringify({checks,persistedV123:Object.fromEntries(starters.map(id=>[id,raw3?.inventory?.[id]||0])),finalV124:Object.fromEntries(starters.map(id=>[id,s4b?.inventory?.[id]||0])),toolbelt:s4b?.toolbelt,unexpectedErrors:unexpected},null,2));
if(Object.values(checks).some(v=>!v))process.exit(2);
