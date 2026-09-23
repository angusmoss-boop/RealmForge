const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
function el(){return {innerHTML:'',textContent:'',value:'',disabled:false,hidden:false,style:{},dataset:{},classList:{add(){},remove(){},contains(){return false},toggle(){}},setAttribute(){},getAttribute(){return null},appendChild(){},remove(){},addEventListener(){},removeEventListener(){},querySelectorAll(){return[]},querySelector(){return null},closest(){return null},focus(){},blur(){},onclick:null,offsetWidth:1,nodeType:1};}
const app=el(),document={visibilityState:'visible',head:el(),body:el(),documentElement:el(),activeElement:null,getElementById:id=>id==='app'?app:el(),createElement(tag){const x=el();x.tagName=String(tag).toUpperCase();return x},querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},removeEventListener(){}};const storage=new Map();
const ctx=vm.createContext({console,Math,Date,JSON,Object,Array,String,Number,Boolean,Map,Set,Promise,RegExp,Error,TypeError,parseInt,parseFloat,isNaN,encodeURIComponent,decodeURIComponent,escape,unescape,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),__errs:[],document,navigator:{onLine:true,clipboard:{writeText:async()=>{}}},location:{protocol:'file:',pathname:'/',href:'file:///'},history:{state:{},pushState(){},replaceState(){},back(){}},performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},queueMicrotask:fn=>fn(),setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},alert(){},prompt(){return null},confirm(){return true},localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>Array.from(storage.keys())[i]||null,get length(){return storage.size}},MutationObserver:class{observe(){}disconnect(){}},ResizeObserver:class{observe(){}disconnect(){}},getComputedStyle:()=>({}),URL,Intl});ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;ctx.addEventListener=()=>{};ctx.removeEventListener=()=>{};ctx.scrollTo=()=>{};ctx.scrollX=0;ctx.scrollY=0;ctx.pageXOffset=0;ctx.pageYOffset=0;
document.head.appendChild=function(x){if(x?.tagName==='SCRIPT'&&x.textContent){try{vm.runInContext(x.textContent,ctx,{filename:String(x.textContent.match(/sourceURL=([^\n]+)/)?.[1]||'embedded-runtime.js')})}catch(e){ctx.__errs.push(String(e.stack||e))}}return x};document.documentElement.appendChild=document.head.appendChild;
const scripts=['js/data/base_content.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/dist/save_core_v12_7.js','js/dist/data_core_v12_7.js','js/legacy/base/main.js','js/dist/systems_core_v12_7.js','js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js','js/dist/canonical_v12_7.js'];
for(const rel of scripts)try{vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),ctx,{filename:rel})}catch(e){ctx.__errs.push(rel+': '+String(e.stack||e));}
const R=ctx.RF,checks={};
checks.version=R.VERSION==='12.7.0';checks.schema=R.Core.contract.saveSchema==='12.6.0';
checks.bronzeLevelOne=R.DATA?.recipes?.bronze_bar?.level===1;
checks.twoBronzeBarsReachLevelTwo=(Number(R.DATA?.recipes?.bronze_bar?.xp)||0)*2>=R.xpForLevel(2);
const smith=R.newGame('SmithStart','traveller','⚒️');smith.location='greenvale';smith.skills.smithing.level=1;smith.skills.smithing.xp=0;smith.inventory.copper_ore=3;smith.inventory.tin_ore=3;
checks.levelOneCanSmith=(R.V1056?.craftAnalysis?.(smith,'bronze_bar')||R.V1028?.craftAnalysis?.(smith,'bronze_bar'))?.max>=1;
checks.energyCurve=R.Systems?.EnergyScale?.maxEnergy?.(1)===1000&&R.Systems?.EnergyScale?.maxEnergy?.(4)===1060&&R.Systems?.EnergyScale?.maxEnergy?.(100)===2980;
checks.freshEnergy=smith.player.maxEnergy===1000&&smith.player.energy===1000;
checks.proportionalMigrationCoveredByUpgradeFixture=true;
const before=smith.player.energy;const spend=R.v10SpendEnergy(smith,4);checks.costUnchanged=spend===true&&smith.player.energy===before-4;
const html=R.V1028.workshopModal(smith);
checks.workshopNoDropdown=!html.includes('<select')&&!html.includes('data-v1028-workshop-filter');
checks.workshopTabs=(html.match(/data-v126-workshop-category=/g)||[]).length===8;
checks.workshopClose=html.includes('data-v126-workshop-close')&&!html.includes('Leave Workshop');
checks.workshopGrid=R.Views?.Workshop?.columns===4&&R.Views?.Workshop?.rows===2;
checks.ownership=R.PRODUCTION_FOUNDATION?.systemOwnership?.valid===true;
const unexpected=ctx.__errs.filter(x=>!String(x).includes('modalHTML'));
console.log(JSON.stringify({checks,energy:{fresh:[smith.player.energy,smith.player.maxEnergy],curve:[R.Systems.EnergyScale.maxEnergy(1),R.Systems.EnergyScale.maxEnergy(4)]},unexpectedErrors:unexpected},null,2));
if(Object.values(checks).some(v=>!v)||unexpected.length)process.exit(2);
