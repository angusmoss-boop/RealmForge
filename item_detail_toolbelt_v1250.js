const fs=require('fs'),vm=require('vm'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
function el(){return {innerHTML:'',textContent:'',value:'',disabled:false,hidden:false,style:{},dataset:{},className:'',classList:{add(){},remove(){},contains(){return false},toggle(){}},setAttribute(){},getAttribute(){return null},appendChild(){},remove(){},addEventListener(){},removeEventListener(){},querySelectorAll(){return[]},querySelector(){return null},closest(){return null},focus(){},blur(){},matches(){return false},onclick:null,offsetWidth:1,nodeType:1,children:[]};}
const app=el(),document={visibilityState:'visible',head:el(),body:el(),documentElement:el(),activeElement:null,getElementById:id=>id==='app'?app:el(),createElement(tag){const x=el();x.tagName=String(tag).toUpperCase();return x},querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},removeEventListener(){}};const storage=new Map(),math=Object.create(Math);math.random=()=>0.5;
const ctx=vm.createContext({console,Math:math,Date,JSON,Object,Array,String,Number,Boolean,Map,Set,Promise,RegExp,Error,TypeError,parseInt,parseFloat,isNaN,encodeURIComponent,decodeURIComponent,escape,unescape,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),__errs:[],document,navigator:{onLine:true,clipboard:{writeText:async()=>{}}},location:{protocol:'file:',pathname:'/',href:'file:///'},history:{state:{},pushState(){},replaceState(){},back(){}},performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},queueMicrotask:fn=>fn(),setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},alert(){},prompt(){return null},confirm(){return true},localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>Array.from(storage.keys())[i]||null,get length(){return storage.size}},MutationObserver:class{observe(){}disconnect(){}},ResizeObserver:class{observe(){}disconnect(){}},getComputedStyle:()=>({}),URL,Intl});ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;ctx.addEventListener=()=>{};ctx.removeEventListener=()=>{};ctx.scrollTo=()=>{};
document.head.appendChild=function(x){if(x?.tagName==='SCRIPT'&&x.textContent){try{vm.runInContext(x.textContent,ctx,{filename:String(x.textContent.match(/sourceURL=([^\n]+)/)?.[1]||'embedded-runtime.js')})}catch(e){ctx.__errs.push(String(e.stack||e))}}return x};document.documentElement.appendChild=document.head.appendChild;
const scripts=['js/data/base_content.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/dist/save_core_v12_5.js','js/dist/data_core_v12_5.js','js/legacy/base/main.js','js/dist/systems_core_v12_5.js','js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js','js/dist/canonical_v12_5.js'];
for(const rel of scripts)try{vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),ctx,{filename:rel})}catch(e){ctx.__errs.push(rel+': '+String(e.stack||e));}
const R=ctx.RF,V=R.Views?.ItemDetail,checks={},starters=['crude_pickaxe','crude_axe','reed_rod','flint_kit'];
checks.version=R.VERSION==='12.5.0'&&R.Core?.contract?.appVersion==='12.5.0';
checks.schema=R.Core?.contract?.saveSchema==='12.5.0'&&R.V95?.SCHEMA==='12.5.0';
checks.owner=R.Modules?.info?.('ui.itemDetail')?.meta?.status==='canonical'&&V?.version==='12.4.0'&&R.PRODUCTION_FOUNDATION?.systemOwnership?.itemDetailReady===true;
let s=R.newGame('Dossier','traveller','📦');R.state=s;R.V101.mainMenu=false;
checks.newGameStarterBelt=s.v1053?.detached===true&&s.toolbelt?.mining==='crude_pickaxe'&&s.toolbelt?.woodcutting==='crude_axe'&&s.toolbelt?.fishing==='reed_rod'&&s.toolbelt?.firemaking==='flint_kit';
checks.newGameNoPackMirrors=starters.every(id=>(s.inventory?.[id]||0)===0);
// Reproduce the bug condition: a better detached tool is equipped and no starter copies are in Pack.
s.skills.mining.level=99;R.addItem(s,'cobalt_pickaxe',1);checks.betterEquip=R.equipTool('cobalt_pickaxe')!==false&&s.toolbelt.mining==='cobalt_pickaxe'&&(s.inventory.cobalt_pickaxe||0)===0;
starters.forEach(id=>delete s.inventory[id]);const packBefore=JSON.stringify(s.inventory),beltBefore=JSON.stringify(s.toolbelt);
R.migrateV6(s);checks.directV6NoRegrow=starters.every(id=>(s.inventory[id]||0)===0)&&JSON.stringify(s.toolbelt)===beltBefore;
R.Core.Migrations.normalize(s);checks.normalizeNoRegrow=starters.every(id=>(s.inventory[id]||0)===0)&&s.toolbelt.mining==='cobalt_pickaxe'&&JSON.stringify(s.inventory)===packBefore;
// Legitimate spare copies are never guessed away.
R.addItem(s,'crude_pickaxe',1);R.Core.Migrations.normalize(s);checks.sparePreserved=(s.inventory.crude_pickaxe||0)===1&&s.toolbelt.mining==='cobalt_pickaxe';
// A genuinely pre-detached historical state still receives the starter kit so old saves/new chronology remain valid.
const legacy=JSON.parse(JSON.stringify(s));delete legacy.v1053;legacy.inventory={};R.migrateV6(legacy);checks.legacySeedPreserved=starters.every(id=>(legacy.inventory[id]||0)===1);
const v6src=fs.readFileSync(path.join(root,'js/v6.js'),'utf8'),field=fs.readFileSync(path.join(root,'js/systems/fieldcraft.js'),'utf8');
checks.sourceGuard=v6src.includes('if(!s.v1053?.detached) kit.forEach')&&field.includes('if(!s.v1053?.detached) kit.forEach');
// Oak Logs: Codex-grade source + downstream-use knowledge inside the Pack dossier.
s.inventory.logs=13;let html=V.detailHtml(s,'logs');
checks.materialDossier=html.includes('PACK DOSSIER')&&html.includes('Oak Logs')&&html.includes('Sturdy timber.')&&html.includes('Known Sources')&&html.includes('Recipes &amp; Uses')&&html.includes('production material')&&html.includes('--v124-cols:3');
checks.materialActions=(html.match(/class="v124Action(?: |")/g)||[]).length===3&&html.includes('Drop 1')&&html.includes('Drop All')&&html.includes('Close');
// Food gets richer context and a four-tile action row.
s.inventory.bread=2;html=V.detailHtml(s,'bread');checks.foodDossier=html.includes('Bread')&&html.includes('Consumable provisions')&&html.includes('Known Sources')&&html.includes('Restores')&&html.includes('--v124-cols:4')&&html.includes('data-v124-use="bread"');
// Tool Pack entries compare against the detached Tool Belt and expose a sleek equip action.
R.addItem(s,'cobalt_pickaxe',1);html=V.detailHtml(s,'cobalt_pickaxe');checks.toolComparison=html.includes('Tool Belt comparison')&&html.includes('data-v124-equip-tool="cobalt_pickaxe"')&&html.includes('v115CompareCard');
// More than four actions wraps into extra rows while never creating a fifth column.
const ring=Object.entries(R.DATA.items||{}).find(([,it])=>['ring','ring1','ring2'].includes(it.slot));
if(ring){s.inventory[ring[0]]=2;html=V.detailHtml(s,ring[0]);checks.actionGridCap=html.includes('--v124-cols:4')&&(html.match(/class="v124Action(?: |")/g)||[]).length>=5;}else checks.actionGridCap=true;
const uiSrc=fs.readFileSync(path.join(root,'js/ui/item_detail_modern.js'),'utf8');checks.squareGrid=uiSrc.includes('grid-template-columns:repeat(var(--v124-cols,4),minmax(0,1fr))')&&uiSrc.includes('aspect-ratio:1/1');
checks.noPersistentV124=!Object.prototype.hasOwnProperty.call(s,'v124');
const compat=fs.readFileSync(path.join(root,'js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js'));checks.compatFrozen=compat.length===64639&&crypto.createHash('sha256').update(compat).digest('hex')==='68d0283ff351fe7c285a04f06be84a2ef38f4cab0454910c0845d0cce6a4620e';
checks.authoring=R.Authoring?.report?.().valid===true;
const unexpected=ctx.__errs.filter(x=>!String(x).includes('modalHTML'));
console.log(JSON.stringify({checks,toolbelt:s.toolbelt,starterPack:Object.fromEntries(starters.map(id=>[id,s.inventory[id]||0])),unexpectedErrors:unexpected},null,2));
if(Object.values(checks).some(v=>!v)||unexpected.length)process.exit(2);
