const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
const calls={serviceWorker:0,copyText:0,buildInfo:0,onBack:0,pushHistory:0,replaceHistory:0};
function element(){return {innerHTML:'',textContent:'',value:'',disabled:false,hidden:false,style:{},dataset:{},className:'',classList:{add(){},remove(){},contains(){return false},toggle(){}},setAttribute(){},getAttribute(){return null},appendChild(){},remove(){},addEventListener(){},removeEventListener(){},querySelectorAll(){return[]},querySelector(){return null},closest(){return null},focus(){},blur(){},offsetWidth:1,tagName:'DIV'};}
const app=element(),buildStatus=element();
const document={visibilityState:'visible',head:element(),body:element(),documentElement:element(),activeElement:null,getElementById:id=>id==='app'?app:element(),createElement(tag){const e=element();e.tagName=String(tag).toUpperCase();return e},querySelector(sel){if(sel==='[data-v1033-build-status]')return buildStatus;return null},querySelectorAll(){return[]},addEventListener(){},removeEventListener(){}};
const storage=new Map();
const math=Object.create(Math);math.random=()=>0.5;
const ctx=vm.createContext({console,Math:math,Date,JSON,Object,Array,String,Number,Boolean,Map,Set,Promise,RegExp,Error,TypeError,parseInt,parseFloat,isNaN,encodeURIComponent,decodeURIComponent,escape,unescape,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),document,navigator:{onLine:true,clipboard:{writeText:async()=>{}}},location:{protocol:'https:',pathname:'/',href:'https://realmforge.test/'},history:{state:{},pushState(){},replaceState(){},back(){}},performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},alert(){},prompt(){return null},confirm(){return true},fetch:async()=>{throw new Error('Direct fetch should not be used by canonical Developer build probe')},localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>Array.from(storage.keys())[i]||null,get length(){return storage.size}},MutationObserver:class{observe(){}disconnect(){}},ResizeObserver:class{observe(){}disconnect(){}},getComputedStyle:()=>({}),URL,Intl,__errs:[]});
ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;ctx.addEventListener=()=>{};ctx.removeEventListener=()=>{};ctx.scrollTo=()=>{};ctx.scrollX=ctx.scrollY=ctx.pageXOffset=ctx.pageYOffset=0;
document.head.appendChild=function(x){if(x?.tagName==='SCRIPT'&&x.textContent){try{vm.runInContext(x.textContent,ctx,{filename:String(x.textContent.match(/sourceURL=([^\n]+)/)?.[1]||'embedded-runtime.js')})}catch(e){ctx.__errs.push(String(e.stack||e))}}return x};document.documentElement.appendChild=document.head.appendChild;
function load(rel){try{vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),ctx,{filename:rel})}catch(e){ctx.__errs.push(rel+': '+String(e.stack||e));throw e}}
(async()=>{
  load('js/data/base_content.js');load('js/legacy/base/state.js');load('js/legacy/base/ui.js');load('js/dist/save_core_v11_19.js');load('js/dist/data_core_v11_19.js');
  const P=ctx.RF.Platform.active;
  P.registerServiceWorker=async p=>{calls.serviceWorker++;calls.serviceWorkerPath=p;return {scope:'/'};};
  P.copyText=async text=>{calls.copyText++;calls.clipboardPayload=String(text);return true;};
  P.fetchBuildInfo=async p=>{calls.buildInfo++;calls.buildInfoPath=p;return {ok:true,status:200,text:'version=11.19.0\ntitle=Canonical App Shell & Developer\n',lastModified:'Sat, 19 Sep 2026 17:20:00 GMT'};};
  P.onBackNavigation=handler=>{calls.onBack++;calls.backHandler=handler;return()=>{};};
  P.pushHistoryState=(state,url)=>{calls.pushHistory++;calls.lastPush={state,url};return true;};
  P.replaceHistoryState=(state,url)=>{calls.replaceHistory++;calls.lastReplace={state,url};return true;};
  load('tests/fixtures/base_main_v1119.js');
  load('js/dist/systems_core_v11_19.js');load('js/legacy/compat_gameplay_app_shell_trimmed_v1153.js');load('js/dist/canonical_v11_19.js');
  const R=ctx.RF;
  R.state=R.state||R.newGame('Bridge Test','traveller','🧭');
  await R.exportPrompt();
  await R.V1033.checkRemoteBuild();
  R.v96ArmBack();
  const checks={
    serviceWorkerThroughPlatform:calls.serviceWorker===1&&calls.serviceWorkerPath==='./sw.js',
    clipboardThroughPlatform:calls.copyText===1&&calls.clipboardPayload?.length>10,
    exportSuccessModal:R.UI.modal?.title==='Save Exported',
    buildFetchThroughPlatform:calls.buildInfo===1&&calls.buildInfoPath==='./version.txt',
    buildStatusCurrent:/Server matches V11\.19\.0/.test(buildStatus.textContent),
    backRegisteredThroughPlatform:calls.onBack>=1&&typeof calls.backHandler==='function',
    historyReplaceThroughPlatform:calls.replaceHistory>=1&&calls.lastReplace?.state?.rfRealmforgeBase===true,
    historyPushThroughPlatform:calls.pushHistory>=1&&calls.lastPush?.state?.rfRealmforgeGuard===true,
    platformOwner:R.Modules?.info?.('platform.browser')?.meta?.status==='canonical',
    appShellOwner:R.Modules?.info?.('ui.appShell')?.meta?.status==='canonical',
    developerOwner:R.Modules?.info?.('ui.developer')?.meta?.status==='canonical',
    schema:R.Core?.contract?.saveSchema==='11.5.3',version:R.VERSION==='11.19.0'
  };
  console.log(JSON.stringify({checks,calls:{...calls,clipboardPayload:calls.clipboardPayload?`<${calls.clipboardPayload.length} chars>`:null,backHandler:typeof calls.backHandler},knownWarnings:ctx.__errs.filter(x=>x.includes('v10_9')).length},null,2));
  if(Object.values(checks).some(v=>!v))process.exit(2);
})().catch(e=>{console.error(e);process.exit(2)});
