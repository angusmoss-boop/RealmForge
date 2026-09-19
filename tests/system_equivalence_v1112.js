const fs=require('fs'),vm=require('vm'),path=require('path');const root=path.resolve(__dirname,'..');
function context(scripts,storage=new Map()){
  let ctx;function el(){return {innerHTML:'',textContent:'',value:'',disabled:false,style:{},dataset:{},classList:{add(){},remove(){},contains(){return false}},setAttribute(){},getAttribute(){return null},appendChild(){},remove(){},addEventListener(){},removeEventListener(){},querySelectorAll(){return[]},querySelector(){return null},closest(){return null},focus(){},onclick:null};}
  const app=el(),document={visibilityState:'visible',head:el(),body:el(),documentElement:el(),getElementById:id=>id==='app'?app:el(),createElement(tag){const x=el();x.tagName=String(tag).toUpperCase();return x},querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},removeEventListener(){}};
  ctx=vm.createContext({console,Math,Date,JSON,Object,Array,String,Number,Boolean,Map,Set,Promise,RegExp,Error,TypeError,parseInt,parseFloat,isNaN,encodeURIComponent,decodeURIComponent,escape,unescape,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),__errs:[],document,navigator:{onLine:true,clipboard:{writeText:async()=>{}}},location:{protocol:'file:',pathname:'/'},history:{pushState(){},replaceState(){},back(){}},performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},alert(){},prompt(){return null},confirm(){return true},localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>Array.from(storage.keys())[i]||null,get length(){return storage.size}},MutationObserver:class{observe(){}disconnect(){}},ResizeObserver:class{observe(){}disconnect(){}},getComputedStyle:()=>({}),URL,Intl});
  ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;ctx.addEventListener=()=>{};ctx.removeEventListener=()=>{};
  document.head.appendChild=function(x){if(x?.tagName==='SCRIPT'&&x.textContent){try{vm.runInContext(x.textContent,ctx,{filename:'embedded-runtime.js'})}catch(e){ctx.__errs.push(String(e.stack||e))}}return x};document.documentElement.appendChild=document.head.appendChild;
  for(const rel of scripts){try{vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),ctx,{filename:rel})}catch(e){ctx.__errs.push(rel+': '+String(e.stack||e))}}
  return ctx;
}
const oldScripts=['js/data/base_content.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/dist/save_core_v11_11.js','js/dist/data_core_v11_11.js','tests/fixtures/base_main_v1118.js','js/dist/systems_core_v11_11.js','js/legacy/compat_gameplay_systems_trimmed_v1153.js','js/dist/canonical_v11_11.js'];
const newScripts=['js/data/base_content.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/dist/save_core_v11_12.js','js/dist/data_core_v11_12.js','tests/fixtures/base_main_v1118.js','js/dist/systems_core_v11_12.js','js/legacy/compat_gameplay_world_quest_trimmed_v1153.js','js/dist/canonical_v11_12.js'];
const a=context(oldScripts),b=context(newScripts),A=a.RF,B=b.RF;
function mk(R){let s=R.newGame('RoadParity','traveller','🥷');R.state=s;s.location='greenvale';s.day=10;s.minute=600;s.gold=5000;s.weather='Clear';s.v8={...(s.v8||{}),boostUntil:0,boostCooldownUntil:0};R.UI.modal=null;s.flags={...(s.flags||{}),woundedMerchantResolved:true,banditCampKnown:true,eastwatchOpen:true,vossRevealed:true,vossDefeated:true,northRoadOpen:true,deepMineFound:true,wayfarerHallOpen:true,cryptOpened:true,emberdeepKnown:true};s.visited={...(s.visited||{}),greenvale:true,crossroads:true,watchtower:true,northroad:true,ironridge:true,quarry:true};s.skills.exploration.level=20;s.skills.mining.level=20;return s;}
const sa=mk(A),sb=mk(B);
function same(x,y){return JSON.stringify(x)===JSON.stringify(y)}
const destinations=['crossroads','watchtower','northroad','ironridge','quarry','ember_cave','ruins','drowned_ruins'];
const routeRows={};let routesSame=true;for(const id of destinations){const x=A.v9Route(sa,sa.location,id,false),y=B.v9Route(sb,sb.location,id,false);routeRows[id]={a:x,b:y};if(!same(x,y))routesSame=false;}
// Compare locked-route behaviour from an early-game state.
const la=mk(A),lb=mk(B);for(const s of [la,lb]){s.flags.northRoadOpen=false;s.flags.vossDefeated=false;s.flags.vossRevealed=false;s.flags.eastwatchOpen=false;s.flags.banditCampKnown=false;s.flags.woundedMerchantResolved=false;s.skills.exploration.level=2;s.skills.mining.level=2;}
const lockedIds=['bandit_camp','watchtower','northroad','ironridge','deep_mine','crypt','ember_cave','ruins','drowned_ruins'];
const hints={};let hintsSame=true;for(const id of lockedIds){const x=A.V1151?.progressHint?.(la,id)||null,y=B.V1151?.progressHint?.(lb,id)||null;hints[id]={a:x,b:y};if(!same(x,y))hintsSame=false;}
const lockTextSame=lockedIds.every(id=>A.v9LockText(la,id)===B.v9LockText(lb,id));
// Quest journal and offer semantics.
sa.location=sb.location='greenvale';const offersA=Object.keys(A.DATA.quests).filter(id=>A.v93OfferVisible?.(sa,id)).sort(),offersB=Object.keys(B.DATA.quests).filter(id=>B.v93OfferVisible?.(sb,id)).sort();
const offersSame=same(offersA,offersB);const journalSame=A.UI.quests(sa)===B.UI.quests(sb);
const qid=offersA[0]||'greenvale_teeth';A.v93AcceptQuest(qid);B.v93AcceptQuest(qid);const acceptSame=same(sa.quests[qid],sb.quests[qid]);A.v93AbandonQuest(qid);B.v93AbandonQuest(qid);const abandonSame=!!sa.questAbandoned[qid]===!!sb.questAbandoned[qid]&&!sa.quests[qid]&&!sb.quests[qid];
// Travel overlay and route-plan helpers.
const aa={type:'travel',from:'greenvale',target:'river',duration:18,progress:6};const ab={...aa};sa.activity=aa;sb.activity=ab;sa.speed=sb.speed=1;const normHtml=x=>String(x).replace(/>\s+</g,'><').trim();const overlaySame=normHtml(A.V1017.overlayHtml(sa))===normHtml(B.V1017.overlayHtml(sb))&&typeof B.V1017.overlayHtml(sb)==='string';const remSame=same(A.V1020.remainingRoute?.(sa),B.V1020.remainingRoute?.(sb));
const blockerSame=A.V1122.trueBlocker(sa)===B.V1122.trueBlocker(sb);
const checks={
  version:B.VERSION==='11.12.0',schema:B.V95?.SCHEMA==='11.5.3',
  travelCanonical:B.Modules?.info?.('systems.travel')?.meta?.status==='canonical',questsCanonical:B.Modules?.info?.('systems.quests')?.meta?.status==='canonical',wayfinderCanonical:B.Modules?.info?.('systems.wayfinder')?.meta?.status==='canonical',
  travelStages:B.Systems?.Travel?.installedStages?.includes('v9-routing')&&B.Systems.Travel.installedStages.includes('js/v10_16.js')&&B.Systems.Travel.installedStages.includes('js/v10_17.js')&&B.Systems.Travel.installedStages.includes('js/v10_20.js')&&B.Systems.Travel.installedStages.includes('js/v11_2_2.js'),
  questsInstalled:B.Systems?.Quests?.installed===true,wayfinderInstalled:B.Systems?.Wayfinder?.installed===true,
  routesSame,hintsSame,lockTextSame,offersSame,journalSame,acceptSame,abandonSame,overlaySame,remSame,blockerSame,
  ownership:B.PRODUCTION_FOUNDATION?.systemOwnership?.valid===true
};
console.log(JSON.stringify({checks,offers:offersA,routeRows,hints,errors1111:a.__errs.slice(0,12),errors1112:b.__errs.slice(0,12)},null,2));if(Object.values(checks).some(v=>!v))process.exit(2);
