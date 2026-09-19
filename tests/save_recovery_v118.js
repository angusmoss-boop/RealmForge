const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'), storage=new Map();let ctx;
function el(){return {innerHTML:'',textContent:'',value:'',disabled:false,style:{},dataset:{},classList:{add(){},remove(){},contains(){return false}},setAttribute(){},getAttribute(){return null},appendChild(){},remove(){},addEventListener(){},removeEventListener(){},querySelectorAll(){return[]},querySelector(){return null},closest(){return null},focus(){}}}
const app=el(),document={visibilityState:'visible',head:el(),body:el(),documentElement:el(),getElementById:id=>id==='app'?app:el(),createElement(tag){const x=el();x.tagName=String(tag).toUpperCase();return x},querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},removeEventListener(){}};
ctx=vm.createContext({console,Math,Date,JSON,Object,Array,String,Number,Boolean,Map,Set,Promise,RegExp,Error,TypeError,parseInt,parseFloat,isNaN,encodeURIComponent,decodeURIComponent,escape,unescape,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),document,navigator:{onLine:true,clipboard:{writeText:async()=>{}}},location:{protocol:'file:',pathname:'/'},history:{pushState(){},replaceState(){},back(){}},performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},alert(){},prompt(){return null},confirm(){return true},localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>Array.from(storage.keys())[i]||null,get length(){return storage.size}},MutationObserver:class{observe(){} disconnect(){}},ResizeObserver:class{observe(){} disconnect(){}},getComputedStyle:()=>({}),URL,Intl});
ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;ctx.addEventListener=()=>{};ctx.removeEventListener=()=>{};
document.head.appendChild=function(x){if(x?.tagName==='SCRIPT'&&x.textContent){try{vm.runInContext(x.textContent,ctx,{filename:'embedded-runtime.js'})}catch(_){}}return x};document.documentElement.appendChild=document.head.appendChild;
for(const rel of ['js/legacy/base/data.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/dist/save_core_v11_8.js','tests/fixtures/base_main_v1118.js','js/legacy/compat_gameplay_v1153.js','js/dist/canonical_v11_8.js']){try{vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),ctx,{filename:rel})}catch(_){}}
const RF=ctx.RF,C=RF.Core.Campaigns;
let s=RF.newGame('RecoveryTest','traveller','🧪');RF.state=s;
const id=C.createSlot(s,'Recovery Test');
// Create verified backup and recovery copies from the original primary.
s.gold=111;C.writeSlot(id,s,null,true);
// Advance the primary once more so fallback copies are deliberately older but valid.
s.gold=222;C.writeSlot(id,s);
const keys={primary:C.slotKey(id,'primary'),backup:C.slotKey(id,'backup'),recovery:C.slotKey(id,'recovery')};
const initial=C.backupSummary(id);
// Corrupt primary. Reader must fall back to backup.
storage.set(keys.primary,'{"broken":true}');
const backupFallback=C.readRawSlot(id);
// Corrupt backup too. Reader must fall back to recovery.
storage.set(keys.backup,'not-a-valid-envelope');
const recoveryFallback=C.readRawSlot(id);
const result={
  slot:id,
  initial,
  backupFallback:{kind:backupFallback?.kind,gold:backupFallback?.state?.gold},
  recoveryFallback:{kind:recoveryFallback?.kind,gold:recoveryFallback?.state?.gold},
  checks:{
    allCopiesInitiallyValid:initial.every(x=>x.ok),
    corruptPrimaryUsesBackup:backupFallback?.kind==='backup',
    corruptPrimaryAndBackupUsesRecovery:recoveryFallback?.kind==='recovery',
    stateReadableFromBackup:typeof backupFallback?.state?.player?.name==='string',
    stateReadableFromRecovery:typeof recoveryFallback?.state?.player?.name==='string'
  }
};
console.log(JSON.stringify(result,null,2));
if(Object.values(result.checks).some(v=>!v))process.exit(2);
