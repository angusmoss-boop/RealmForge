const fs=require('fs'), vm=require('vm'), path=require('path');
const root='/mnt/data/rf_current_1170';
const storage=new Map();
let ctx;
function dummyEl(){return {innerHTML:'',textContent:'',value:'',disabled:false,style:{},dataset:{},classList:{add(){},remove(){},contains(){return false}},setAttribute(){},getAttribute(){return null},appendChild(el){if(el&&el.tagName==='SCRIPT'&&el.textContent){try{vm.runInContext(el.textContent,ctx,{filename:el.sourceURL||'embedded.js'});}catch(e){ctx.__errs.push(String(e.stack||e));}} return el;},remove(){},addEventListener(){},removeEventListener(){},querySelectorAll(){return[]},querySelector(){return null},closest(){return null},focus(){}}}
const app=dummyEl();
const document={
  visibilityState:'visible', head:dummyEl(), body:dummyEl(), documentElement:dummyEl(),
  getElementById(id){ if(id==='app') return app; return dummyEl(); },
  createElement(tag){const e=dummyEl();e.tagName=String(tag).toUpperCase();return e;},
  querySelectorAll(){return[]}, querySelector(){return null},
  addEventListener(){}, removeEventListener(){}
};
ctx=vm.createContext({console,Math,Date,JSON,Object,Array,String,Number,Boolean,Map,Set,Promise,RegExp,Error,TypeError,parseInt,parseFloat,isNaN,encodeURIComponent,decodeURIComponent,escape,unescape,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),
  __errs:[],document,navigator:{onLine:true,clipboard:{writeText:async()=>{}}},location:{protocol:'file:',pathname:'/'},history:{pushState(){},replaceState(){},back(){}},performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},alert(){},prompt(){return null},confirm(){return true},
  localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>Array.from(storage.keys())[i]||null,get length(){return storage.size}},
  MutationObserver:class{observe(){} disconnect(){}},ResizeObserver:class{observe(){} disconnect(){}},
  getComputedStyle:()=>({}),URL,Intl
});
ctx.window=ctx; ctx.globalThis=ctx; ctx.self=ctx;
// make document heads able to eval script after ctx exists
document.head.appendChild=function(el){if(el&&el.tagName==='SCRIPT'&&el.textContent){try{vm.runInContext(el.textContent,ctx,{filename:'embedded-runtime.js'});}catch(e){ctx.__errs.push(String(e.stack||e));}}return el};
document.documentElement.appendChild=document.head.appendChild;
ctx.addEventListener=()=>{};ctx.removeEventListener=()=>{};
const scripts=['js/legacy/base/data.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/legacy/base/main.js','js/legacy/compat_v1153.js','js/dist/canonical_v11_7.js'];
for(const rel of scripts){try{vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),ctx,{filename:rel});}catch(e){ctx.__errs.push(rel+': '+String(e.stack||e));}}
const RF=ctx.RF;
const result={
 version:RF.VERSION, build:RF.BUILD?.version, schema:RF.V95?.SCHEMA,
 modules:RF.Modules?.list?.().map(x=>x.name),
 late:{v1038:!!RF.V1038,v1050:!!RF.V1050,v1054:!!RF.V1054,v115:!!RF.V115,v1151:!!RF.V1151,v1152:!!RF.V1152,v1153:!!RF.V1153},
 contracts:{state:!!RF.Core?.State,catalog:!!RF.Catalog,inventory:!!RF.Systems?.Inventory,equipment:!!RF.Systems?.Equipment,travel:!!RF.Systems?.Travel,combat:!!RF.Systems?.Combat,research:!!RF.Systems?.Research,quests:!!RF.Systems?.Quests,crafting:!!RF.Systems?.Crafting,dungeons:!!RF.Systems?.Dungeons,commerce:!!RF.Systems?.Commerce,shell:!!RF.Views?.Shell},
 errors:ctx.__errs.slice(0,10), embeddedErrors:RF.PRODUCTION_FOUNDATION?.patchErrors||[]
};
console.log(JSON.stringify(result,null,2));
if(result.version!=='11.7.0'||result.schema!=='11.5.3'||Object.values(result.late).some(v=>!v)||Object.values(result.contracts).some(v=>!v))process.exit(2);
