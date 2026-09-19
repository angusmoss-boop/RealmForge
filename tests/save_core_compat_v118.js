const fs=require('fs'),vm=require('vm'),path=require('path');
function makeContext(root, scripts, storage){let ctx;function el(){return {innerHTML:'',textContent:'',value:'',disabled:false,style:{},dataset:{},classList:{add(){},remove(){},contains(){return false}},setAttribute(){},getAttribute(){return null},remove(){},addEventListener(){},removeEventListener(){},querySelectorAll(){return[]},querySelector(){return null},closest(){return null},focus(){}}}const app=el();const document={visibilityState:'visible',head:el(),body:el(),documentElement:el(),getElementById(id){return id==='app'?app:el()},createElement(tag){const e=el();e.tagName=String(tag).toUpperCase();return e},querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},removeEventListener(){}};ctx=vm.createContext({console,Math,Date,JSON,Object,Array,String,Number,Boolean,Map,Set,Promise,RegExp,Error,TypeError,parseInt,parseFloat,isNaN,encodeURIComponent,decodeURIComponent,escape,unescape,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),__errs:[],document,navigator:{onLine:true,clipboard:{writeText:async()=>{}}},location:{protocol:'file:',pathname:'/'},history:{pushState(){},replaceState(){},back(){}},performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},alert(){},prompt(){return null},confirm(){return true},localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>Array.from(storage.keys())[i]||null,get length(){return storage.size}},MutationObserver:class{observe(){} disconnect(){}},ResizeObserver:class{observe(){} disconnect(){}},getComputedStyle:()=>({}),URL,Intl});ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;ctx.addEventListener=()=>{};ctx.removeEventListener=()=>{};document.head.appendChild=function(x){if(x?.tagName==='SCRIPT'&&x.textContent){try{vm.runInContext(x.textContent,ctx,{filename:'embedded-runtime.js'});}catch(e){ctx.__errs.push(String(e.stack||e))}}return x};document.documentElement.appendChild=document.head.appendChild;for(const rel of scripts){try{vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),ctx,{filename:rel})}catch(e){ctx.__errs.push(rel+': '+String(e.stack||e))}}return ctx}
const storage=new Map();
const root118=path.resolve(__dirname,'..');
// Reconstruct the proven V11.7 runtime from archived pre-extraction save core plus retained compatibility files.
const scripts117=['js/legacy/base/data.js','archive/legacy-save-core/base_state_v1153.js','js/legacy/base/ui.js','tests/fixtures/base_main_v1118.js','js/legacy/compat_v1153.js','js/dist/canonical_v11_7.js'];
const c117=makeContext(root118,scripts117,storage), R117=c117.RF;
let s=R117.newGame('CluCompat','traveller','🥷');R117.state=s;
// Representative long-running campaign features we must never lose.
s.player.level=29;s.gold=14795;s.location='ironridge';s.day=39;s.minute=1041;
s.equipment={...s.equipment,main:'cindermaw_blade',off:'magma_guard',head:'ossuary_coif',chest:'emberplate_cuirass',legs:'tombwarden_greaves',boots:'cinderstep_boots',ring1:'ashglass_ring',ring2:'ashglass_ring'};
s.toolBelt={...(s.toolBelt||{}),mining:'steel_pickaxe',woodcutting:'steel_axe',fishing:'angler_rod',firemaking:'wayfarer_tinderbox'};
s.inventory={...(s.inventory||{}),raw_meat:40,blackroad_feather:6,lockpick:7};
s.bank={...(s.bank||{}),iron_ore:55,oak_logs:32};
s.flags={...(s.flags||{}),northRoadOpen:true,vossDefeated:true,emberdeepKnown:true};
s.v7=s.v7||{};s.v7.research=s.v7.research||{};s.v7.research.blackthorn_scout={level:3,notes:0};
s.v1062=s.v1062||{};s.v1062.records=s.v1062.records||{};s.v1062.records.emberdeep={attempts:4,clears:3,bestHp:142};
R117.save(s);const slot=R117.V95.activeId();R117.V95.saveNow();
const before=JSON.parse(JSON.stringify(R117.V95.readSlot(slot).state));
const c117reload=makeContext(root118,scripts117,storage);
const c118=makeContext(root118,['js/legacy/base/data.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/dist/save_core_v11_8.js','tests/fixtures/base_main_v1118.js','js/legacy/compat_gameplay_v1153.js','js/dist/canonical_v11_8.js'],storage),R118=c118.RF;
const after=R118.state;
const checks={slotSame:R118.V95.activeId()===slot,name:after?.player?.name===before.player.name,level:after?.player?.level===29,gold:after?.gold===14795,location:after?.location==='ironridge',equipment:JSON.stringify(after?.equipment)===JSON.stringify(before.equipment),toolBelt:JSON.stringify(after?.toolBelt)===JSON.stringify(before.toolBelt),pack:after?.inventory?.raw_meat===40&&after?.inventory?.blackroad_feather===6,bank:after?.bank?.iron_ore===55&&after?.bank?.oak_logs===32,research:after?.v7?.research?.blackthorn_scout?.level===3,flags:after?.flags?.northRoadOpen&&after?.flags?.vossDefeated&&after?.flags?.emberdeepKnown,dungeon:after?.v1062?.records?.emberdeep?.clears===3,schema:after?.saveSchema==='11.5.3'&&R118.V95.SCHEMA==='11.5.3',owner:R118.PRODUCTION_FOUNDATION?.persistenceOwner==='core.campaigns'};
const sig=e=>String(e).split('\n')[0].replace(/^js\/legacy\/base\/main\.js: /,'');
const referenceSigs=new Set(c117reload.__errs.map(sig));
const unexpected=[...c118.__errs].filter(e=>!referenceSigs.has(sig(e)));
console.log(JSON.stringify({checks,unexpectedErrors:unexpected,referenceReloadErrors:c117reload.__errs.map(sig),newErrors:c118.__errs.map(sig)},null,2));
if(Object.values(checks).some(v=>!v)||unexpected.length)process.exit(2);
