const fs=require('fs'),vm=require('vm'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
function context(scripts){
  let ctx;function el(){return {innerHTML:'',textContent:'',value:'',disabled:false,hidden:false,style:{},dataset:{},classList:{add(){},remove(){},contains(){return false},toggle(){}},setAttribute(){},getAttribute(){return null},appendChild(){},remove(){},addEventListener(){},removeEventListener(){},querySelectorAll(){return[]},querySelector(){return null},closest(){return null},focus(){},blur(){},onclick:null,offsetWidth:1,nodeType:1};}
  const app=el(),document={visibilityState:'visible',head:el(),body:el(),documentElement:el(),activeElement:null,getElementById:id=>id==='app'?app:el(),createElement(tag){const x=el();x.tagName=String(tag).toUpperCase();return x},querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},removeEventListener(){}};const storage=new Map();const math=Object.create(Math);math.random=()=>0.5;
  ctx=vm.createContext({console,Math:math,Date,JSON,Object,Array,String,Number,Boolean,Map,Set,Promise,RegExp,Error,TypeError,parseInt,parseFloat,isNaN,encodeURIComponent,decodeURIComponent,escape,unescape,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),__errs:[],document,navigator:{onLine:true,clipboard:{writeText:async()=>{}}},location:{protocol:'file:',pathname:'/',href:'file:///'},history:{state:{},pushState(){},replaceState(){},back(){}},performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},queueMicrotask:fn=>fn(),setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},alert(){},prompt(){return null},confirm(){return true},localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>Array.from(storage.keys())[i]||null,get length(){return storage.size}},MutationObserver:class{observe(){}disconnect(){}},ResizeObserver:class{observe(){}disconnect(){}},getComputedStyle:()=>({}),URL,Intl});ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;ctx.addEventListener=()=>{};ctx.removeEventListener=()=>{};ctx.scrollTo=()=>{};ctx.scrollX=0;ctx.scrollY=0;ctx.pageXOffset=0;ctx.pageYOffset=0;
  document.head.appendChild=function(x){if(x?.tagName==='SCRIPT'&&x.textContent){try{vm.runInContext(x.textContent,ctx,{filename:String(x.textContent.match(/sourceURL=([^\n]+)/)?.[1]||'embedded-runtime.js')})}catch(e){ctx.__errs.push(String(e.stack||e))}}return x};document.documentElement.appendChild=document.head.appendChild;
  for(const rel of scripts){try{vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),ctx,{filename:rel})}catch(e){ctx.__errs.push(rel+': '+String(e.stack||e))}}return ctx;
}
function norm(x,seen=new WeakSet()){if(typeof x==='function')return {$fn:String(x)};if(x===null||typeof x!=='object')return x;if(seen.has(x))return {$cycle:true};seen.add(x);if(Array.isArray(x))return x.map(v=>norm(v,seen));const o={};for(const k of Object.keys(x).sort())o[k]=norm(x[k],seen);return o;}
const oldScripts=['tests/fixtures/base_content_v1129.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/dist/save_core_v11_29.js','js/dist/data_core_v11_29.js','js/legacy/base/main.js','js/dist/systems_core_v11_29.js','js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js','js/dist/canonical_v11_29.js'];
const newScripts=['js/data/base_content.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/dist/save_core_v12_0.js','js/dist/data_core_v12_0.js','js/legacy/base/main.js','js/dist/systems_core_v12_0.js','js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js','js/dist/canonical_v12_0.js'];
const A=context(oldScripts),B=context(newScripts),checks={};
checks.dataGraph=JSON.stringify(norm(A.RF.DATA))===JSON.stringify(norm(B.RF.DATA));
const cfg=R=>Object.fromEntries(R.Config.keys().sort().map(k=>[k,norm(R.Config.get(k))]));
checks.configGraph=JSON.stringify(cfg(A.RF))===JSON.stringify(cfg(B.RF));
checks.legacyMetadata=JSON.stringify(A.RF.Content.legacyBlocks())===JSON.stringify(B.RF.Content.legacyBlocks());
checks.counts=Object.keys(B.RF.DATA.items).length===170&&Object.keys(B.RF.DATA.enemies).length===88&&Object.keys(B.RF.DATA.locations).length===21&&B.RF.Config.size()===19&&B.RF.Content.legacyBlockCount()===87;
const manifest=JSON.parse(fs.readFileSync(path.join(root,'tools/content_sources_v12_0.json'),'utf8'));
// Historical release fixture: no content packs existed in this release. Future packs in the live source tree must not enter historical bundle reproduction.
const packs=[];
const historicalSource=rel=>rel==='js/data/authoring.js'?'tests/fixtures/authoring_v1200.js':rel==='js/data/content/legacy/40_recipes_crafting.js'?'tests/fixtures/40_recipes_crafting_pre_v1260.js':rel;
const join=rels=>rels.map(rel=>fs.readFileSync(path.join(root,historicalSource(rel)),'utf8')).join('\n');
checks.baseRepro=join(manifest.baseContentSources)===fs.readFileSync(path.join(root,'js/data/base_content.js'),'utf8');
checks.dataRepro=join([...manifest.dataBundleSources,...packs])===fs.readFileSync(path.join(root,'js/dist/data_core_v12_0.js'),'utf8');
checks.decomposed=manifest.baseContentSources.length===11&&manifest.dataBundleSources.filter(x=>x.includes('/content/legacy/')).length===11&&manifest.dataBundleSources.filter(x=>x.includes('/config/')).length===7&&!manifest.dataBundleSources.includes('js/data/content_blocks_v11_9.js')&&!manifest.dataBundleSources.includes('js/data/world_config_v11_10.js');
checks.oldMonolithsFrozen=fs.readFileSync(path.join(root,'js/data/content_blocks_v11_9.js'),'utf8').includes('intentionally not part')&&fs.readFileSync(path.join(root,'js/data/world_config_v11_10.js'),'utf8').includes('intentionally not part');
checks.assetsCanonical=B.RF.Modules?.info?.('data.assets')?.meta?.status==='canonical'&&B.RF.Assets.count()===0&&B.RF.Assets.validate().length===0;
B.RF.Authoring.asset('test.image',{type:'image',src:'assets/test.webp'});checks.assetDefine=B.RF.Assets.has('test.image')&&B.RF.Assets.url('test.image')==='assets/test.webp';
B.RF.DATA.items.v1130_asset_probe={name:'Asset Probe',type:'material',asset:'missing.asset'};checks.assetReference=B.RF.Authoring.validateAssetReferences().some(x=>x.code==='missing-asset-ref'&&x.path==='items.v1130_asset_probe.asset');delete B.RF.DATA.items.v1130_asset_probe;
checks.clean=B.RF.Authoring.report().valid===true;
checks.foundation=B.RF.PRODUCTION_FOUNDATION?.contentSources?.baseParts===9&&B.RF.PRODUCTION_FOUNDATION?.contentSources?.legacyBlocks===87&&B.RF.PRODUCTION_FOUNDATION?.contentSources?.configDefinitions===19;
checks.schema=B.RF.V95?.SCHEMA==='11.5.3';checks.version=B.RF.VERSION==='12.0.0';
checks.knownWarning=A.__errs.length===1&&B.__errs.length===1&&A.__errs[0].includes('modalHTML')&&B.__errs[0].includes('modalHTML');
console.log(JSON.stringify({checks,summary:B.RF.Authoring.report(),manifest:{base:manifest.baseContentSources.length,data:manifest.dataBundleSources.length,packs}},null,2));
if(Object.values(checks).some(v=>!v))process.exit(2);
