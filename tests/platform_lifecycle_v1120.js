const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
const calls={prompt:0,alert:0,vibrate:0,serviceWorker:0,raf:0,resumeRegistered:0,resumeRepair:0,exportFallback:0,importAlert:0};
const listeners={};
function element(){return {innerHTML:'',textContent:'',value:'',disabled:false,hidden:false,style:{},dataset:{},className:'',classList:{add(){},remove(){},contains(){return false},toggle(){}},setAttribute(){},getAttribute(){return null},appendChild(){},remove(){},addEventListener(){},removeEventListener(){},querySelectorAll(){return[]},querySelector(){return null},closest(){return null},focus(){},blur(){},offsetWidth:1,tagName:'DIV'};}
const app=element();
const document={visibilityState:'visible',head:element(),body:element(),documentElement:element(),activeElement:null,getElementById:id=>id==='app'?app:element(),createElement(tag){const e=element();e.tagName=String(tag).toUpperCase();return e},querySelector(){return null},querySelectorAll(){return[]},addEventListener(){},removeEventListener(){}};
const storage=new Map();
let wall=1779299400000;
const math=Object.create(Math);math.random=()=>0.5;
const ctx=vm.createContext({console,Math:math,Date,JSON,Object,Array,String,Number,Boolean,Map,Set,Promise,RegExp,Error,TypeError,parseInt,parseFloat,isNaN,encodeURIComponent,decodeURIComponent,escape,unescape,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),document,navigator:{onLine:true,clipboard:{writeText:async()=>{}},vibrate:ms=>{calls.vibrate++;calls.vibrateMs=ms;return true}},location:{protocol:'https:',pathname:'/',href:'https://realmforge.test/'},history:{state:{},pushState(){},replaceState(){},back(){}},performance:{now:()=>321.5},requestAnimationFrame:()=>{calls.raf++;return 1},cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},alert:msg=>{calls.alert++;calls.alertText=String(msg)},prompt:(msg,val)=>{calls.prompt++;calls.promptArgs=[String(msg),String(val??'')];return 'browser-prompt'},confirm(){return true},fetch:async()=>({ok:true,status:200,text:async()=>'',headers:{get:()=>''}}),localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>Array.from(storage.keys())[i]||null,get length(){return storage.size}},MutationObserver:class{observe(){}disconnect(){}},ResizeObserver:class{observe(){}disconnect(){}},getComputedStyle:()=>({}),URL,Intl,__errs:[]});
ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;ctx.addEventListener=(name,fn)=>{(listeners[name]||(listeners[name]=[])).push(fn)};ctx.removeEventListener=(name,fn)=>{if(listeners[name])listeners[name]=listeners[name].filter(x=>x!==fn)};ctx.scrollTo=()=>{};ctx.scrollX=ctx.scrollY=ctx.pageXOffset=ctx.pageYOffset=0;
document.head.appendChild=function(x){if(x?.tagName==='SCRIPT'&&x.textContent){try{vm.runInContext(x.textContent,ctx,{filename:String(x.textContent.match(/sourceURL=([^\n]+)/)?.[1]||'embedded-runtime.js')})}catch(e){ctx.__errs.push(String(e.stack||e))}}return x};document.documentElement.appendChild=document.head.appendChild;
function load(rel){vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),ctx,{filename:rel});}
(async()=>{
  load('js/data/base_content.js');load('js/legacy/base/state.js');load('js/legacy/base/ui.js');load('js/dist/save_core_v11_20.js');load('js/dist/data_core_v11_20.js');
  const R=ctx.RF,P=R.Platform.active;
  // Browser adapter primitives before test overrides.
  const promptResult=P.promptText('Adapter prompt','seed');
  P.alertMessage('Adapter alert');
  const vibrationResult=P.vibrate(23);
  let browserResume=0;const dispose=P.onResume(()=>browserResume++);
  (listeners.focus||[]).forEach(fn=>fn());
  document.visibilityState='hidden';(listeners.visibilitychange||[]).forEach(fn=>fn());
  document.visibilityState='visible';(listeners.visibilitychange||[]).forEach(fn=>fn());
  dispose();
  const browserAdapter={promptResult,alertCalls:calls.alert,vibrationResult,vibrationCalls:calls.vibrate,browserResume,visible:P.isVisible()};

  // Prepare deterministic boot state, then swap native-facing adapter methods before legacy main reaches boot boundary.
  P.now=()=>wall;P.monotonicNow=()=>777.25;
  P.registerServiceWorker=async p=>{calls.serviceWorker++;calls.serviceWorkerPath=p;return {scope:'/'};};
  let resumeHandler=null;P.onResume=handler=>{calls.resumeRegistered++;resumeHandler=handler;return()=>{};};
  P.isVisible=()=>true;
  const state=R.newGame('Lifecycle','traveller','🧭');state.minute=600;state.lastReal=wall-10*60000;state.inventory={bread:1};
  R.load=()=>state;
  load('js/legacy/base/main.js');
  const bootSnapshot={minute:R.state.minute,lastTick:R.lastTick,speed:R.state.speed,paused:R.state.paused};
  load('js/dist/systems_core_v11_20.js');load('js/legacy/compat_gameplay_app_shell_trimmed_v1153.js');load('js/dist/canonical_v11_20.js');

  // Clock Sentinel visibility/resume transport remains Travel-owned but platform-backed.
  let visible=true;P.isVisible=()=>visible;const visTrue=R.V1122.visible();visible=false;const visFalse=R.V1122.visible();visible=true;
  const oldRepair=R.V1122.repairOnResume;R.V1122.repairOnResume=()=>{calls.resumeRepair++;};resumeHandler?.();R.V1122.repairOnResume=oldRepair;

  // Save export/import fallbacks must use Platform, not raw globals.
  P.copyText=async()=>false;
  P.promptText=(msg,val)=>{calls.exportFallback++;calls.platformPrompt=[String(msg),String(val??'')];return null;};
  ctx.prompt=()=>{throw new Error('raw prompt used')};ctx.alert=()=>{throw new Error('raw alert used')};
  await R.exportPrompt();
  P.promptText=()=> 'not-a-valid-save';
  P.alertMessage=msg=>{calls.importAlert++;calls.importAlertText=String(msg);return true;};
  R.importPrompt();

  const sourceChecks={};
  for(const f of ['js/systems/inventory.js','js/systems/equipment.js','js/systems/combat.js']){
    const text=fs.readFileSync(path.join(root,f),'utf8');sourceChecks[f]=!text.includes('navigator.vibrate')&&text.includes('RF.Platform?.active?.vibrate');
  }
  const mainText=fs.readFileSync(path.join(root,'js/legacy/base/main.js'),'utf8');
  const checks={
    adapterPrompt:browserAdapter.promptResult==='browser-prompt'&&calls.prompt===1,
    adapterAlert:browserAdapter.alertCalls===1,
    adapterVibrate:browserAdapter.vibrationResult===true&&browserAdapter.vibrationCalls===1&&calls.vibrateMs===23,
    adapterResume:browserAdapter.browserResume===2&&browserAdapter.visible===true,
    lifecycleCanonical:R.Modules?.info?.('core.lifecycle')?.meta?.status==='canonical',
    lifecycleBooted:R.Core?.Lifecycle?.booted===true,
    offlineCatchup:Math.abs(bootSnapshot.minute-601.5)<1e-9,
    monotonicBoot:bootSnapshot.lastTick===777.25,
    bootClock:bootSnapshot.speed===1&&bootSnapshot.paused===false,
    serviceWorkerThroughPlatform:calls.serviceWorker===1&&calls.serviceWorkerPath==='./sw.js',
    resumeRegistered:calls.resumeRegistered>=1&&typeof resumeHandler==='function',
    sentinelVisibility:visTrue===true&&visFalse===false,
    sentinelResumeThroughPlatform:calls.resumeRepair===1,
    exportFallbackThroughPlatform:calls.exportFallback===1&&/^Copy this save backup:/.test(calls.platformPrompt?.[0]||''),
    importAlertThroughPlatform:calls.importAlert===1&&/could not be read/.test(calls.importAlertText||''),
    hapticsPlatformised:Object.values(sourceChecks).every(Boolean),
    bootRemovedFromLegacyMain:!mainText.includes('(function init(){')&&mainText.includes('RF.Core.Lifecycle.installLegacyBoot()'),
    schema:R.Core?.contract?.saveSchema==='11.5.3',version:R.VERSION==='11.20.0'
  };
  console.log(JSON.stringify({checks,bootSnapshot,browserAdapter,calls,sourceChecks,knownWarnings:ctx.__errs.filter(x=>x.includes('modalHTML')).length},null,2));
  if(Object.values(checks).some(v=>!v))process.exit(2);
})().catch(e=>{console.error(e);process.exit(2)});
