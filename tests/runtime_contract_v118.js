const fs=require('fs'), vm=require('vm'), path=require('path');
const root=path.resolve(__dirname,'..');
const storage=new Map(); let ctx;
function dummyEl(){return {innerHTML:'',textContent:'',value:'',disabled:false,style:{},dataset:{},classList:{add(){},remove(){},contains(){return false}},setAttribute(){},getAttribute(){return null},appendChild(el){if(el&&el.tagName==='SCRIPT'&&el.textContent){try{vm.runInContext(el.textContent,ctx,{filename:'embedded-runtime.js'});}catch(e){ctx.__errs.push(String(e.stack||e));}}return el;},remove(){},addEventListener(){},removeEventListener(){},querySelectorAll(){return[]},querySelector(){return null},closest(){return null},focus(){}}}
const app=dummyEl();
const document={visibilityState:'visible',head:dummyEl(),body:dummyEl(),documentElement:dummyEl(),getElementById(id){if(id==='app')return app;return dummyEl();},createElement(tag){const e=dummyEl();e.tagName=String(tag).toUpperCase();return e;},querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},removeEventListener(){}};
ctx=vm.createContext({console,Math,Date,JSON,Object,Array,String,Number,Boolean,Map,Set,Promise,RegExp,Error,TypeError,parseInt,parseFloat,isNaN,encodeURIComponent,decodeURIComponent,escape,unescape,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),__errs:[],document,navigator:{onLine:true,clipboard:{writeText:async()=>{}}},location:{protocol:'file:',pathname:'/'},history:{pushState(){},replaceState(){},back(){}},performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},alert(){},prompt(){return null},confirm(){return true},localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>Array.from(storage.keys())[i]||null,get length(){return storage.size}},MutationObserver:class{observe(){} disconnect(){}},ResizeObserver:class{observe(){} disconnect(){}},getComputedStyle:()=>({}),URL,Intl});
ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;ctx.addEventListener=()=>{};ctx.removeEventListener=()=>{};
document.head.appendChild=function(el){if(el&&el.tagName==='SCRIPT'&&el.textContent){try{vm.runInContext(el.textContent,ctx,{filename:'embedded-runtime.js'});}catch(e){ctx.__errs.push(String(e.stack||e));}}return el};document.documentElement.appendChild=document.head.appendChild;
const scripts=['js/legacy/base/data.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/dist/save_core_v11_8.js','tests/fixtures/base_main_v1118.js','js/legacy/compat_gameplay_v1153.js','js/dist/canonical_v11_8.js'];
for(const rel of scripts){try{vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),ctx,{filename:rel});}catch(e){ctx.__errs.push(rel+': '+String(e.stack||e));}}
const RF=ctx.RF;
const assertions=[];const ok=(name,v)=>assertions.push([name,!!v]);
ok('version 11.8.0',RF.VERSION==='11.8.0');
ok('schema 11.5.3',RF.V95?.SCHEMA==='11.5.3');
ok('canonical storage',!!RF.Core?.Storage);
ok('canonical campaigns',!!RF.Core?.Campaigns);
ok('canonical migrations ready',RF.Core?.Migrations?.ready===true);
ok('historical migration registry populated',(RF.Core?.Migrations?.historical?.().length||0)>=70);
ok('late V11 systems present',!!RF.V1153&&!!RF.V1152&&!!RF.V1151&&!!RF.V115);
ok('modern navigation metadata',Array.isArray(RF.V95?.navItems)&&RF.V95.navItems.some(x=>x[0]==='equipment')&&RF.V95.navItems.some(x=>x[0]==='toolbelt')&&!RF.V95.navItems.some(x=>x[0]==='shop'));
ok('wayfinder present',typeof RF.V1151?.progressHint==='function');
// create/save/load round-trip through canonical slot manager
let s=RF.newGame('Contract','traveller','🧑');RF.state=s;RF.save(s);const id=RF.V95.activeId();
ok('slot created',!!id&&RF.V95.readIndex().some(x=>x.id===id));
ok('primary verifies',!!RF.V95.decode(storage.get(RF.V95.slotKey(id,'primary'))));
const before=s.created;RF.state=null;const loaded=RF.load();ok('canonical load returns campaign',loaded?.created===before);RF.state=loaded;
const exp=RF.exportSave(loaded),imp=RF.importSave(exp);ok('export/import round-trip',imp?.created===before&&imp?.saveSchema==='11.5.3');
// persistence owner checks
ok('RF.save points canonical',String(RF.save).includes('C.writeSlot')||String(RF.save).includes('createSlot'));
ok('V95 migrate points canonical',String(RF.V95.migrate).includes('M.normalize'));
const knownHarnessArtifacts=ctx.__errs.filter(e=>String(e).includes('realmforge-embedded:///v10_9.js:45'));
const unexpectedErrors=ctx.__errs.filter(e=>!String(e).includes('realmforge-embedded:///v10_9.js:45'));
const result={version:RF.VERSION,schema:RF.V95?.SCHEMA,modules:RF.Modules?.list?.().map(x=>x.name),assertions,knownHarnessArtifacts:knownHarnessArtifacts.map(e=>String(e).split('\n')[0]),unexpectedErrors,embeddedErrors:RF.PRODUCTION_FOUNDATION?.patchErrors||[],saveCore:RF.PRODUCTION_FOUNDATION?.saveCore};
console.log(JSON.stringify(result,null,2));
if(assertions.some(x=>!x[1])||unexpectedErrors.length||result.embeddedErrors.length)process.exit(2);
