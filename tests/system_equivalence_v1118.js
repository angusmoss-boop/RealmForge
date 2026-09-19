const fs=require('fs'),vm=require('vm'),path=require('path');const root=path.resolve(__dirname,'..');
function context(scripts,storage=new Map()){
  let ctx;function el(){return {innerHTML:'',textContent:'',value:'',disabled:false,hidden:false,style:{},dataset:{},className:'',classList:{add(){},remove(){},contains(){return false},toggle(){}},setAttribute(){},getAttribute(){return null},appendChild(){},remove(){},addEventListener(){},removeEventListener(){},querySelectorAll(){return[]},querySelector(){return null},closest(){return null},focus(){},blur(){},onclick:null,offsetWidth:1,nodeType:1};}
  const app=el(),document={visibilityState:'visible',head:el(),body:el(),documentElement:el(),activeElement:null,getElementById:id=>id==='app'?app:el(),createElement(tag){const x=el();x.tagName=String(tag).toUpperCase();return x},querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},removeEventListener(){}};
  const math=Object.create(Math);math.random=()=>0.5;class FixedDate extends Date{static now(){return 1779297600000;}}
  ctx=vm.createContext({console,Math:math,Date:FixedDate,JSON,Object,Array,String,Number,Boolean,Map,Set,Promise,RegExp,Error,TypeError,parseInt,parseFloat,isNaN,encodeURIComponent,decodeURIComponent,escape,unescape,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),__errs:[],document,navigator:{onLine:true,clipboard:{writeText:async()=>{}}},location:{protocol:'file:',pathname:'/',href:'file:///'},history:{state:{},pushState(){},replaceState(){},back(){}},performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},queueMicrotask:fn=>fn(),setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},alert(){},prompt(){return null},confirm(){return true},localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>Array.from(storage.keys())[i]||null,get length(){return storage.size}},MutationObserver:class{observe(){}disconnect(){}},ResizeObserver:class{observe(){}disconnect(){}},getComputedStyle:()=>({}),URL,Intl});
  ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;ctx.addEventListener=()=>{};ctx.removeEventListener=()=>{};ctx.scrollTo=()=>{};ctx.scrollX=0;ctx.scrollY=0;ctx.pageXOffset=0;ctx.pageYOffset=0;
  document.head.appendChild=function(x){if(x?.tagName==='SCRIPT'&&x.textContent){try{vm.runInContext(x.textContent,ctx,{filename:String(x.textContent.match(/sourceURL=([^\n]+)/)?.[1]||'embedded-runtime.js')})}catch(e){ctx.__errs.push(String(e.stack||e))}}return x};document.documentElement.appendChild=document.head.appendChild;
  for(const rel of scripts){try{vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),ctx,{filename:rel})}catch(e){ctx.__errs.push(rel+': '+String(e.stack||e))}}
  return ctx;
}
const oldScripts=['js/data/base_content.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/dist/save_core_v11_17.js','js/dist/data_core_v11_17.js','js/legacy/base/main.js','js/dist/systems_core_v11_17.js','js/legacy/compat_gameplay_time_energy_trimmed_v1153.js','js/dist/canonical_v11_17.js'];
const newScripts=['js/data/base_content.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/dist/save_core_v11_18.js','js/dist/data_core_v11_18.js','js/legacy/base/main.js','js/dist/systems_core_v11_18.js','js/legacy/compat_gameplay_ui_presentation_trimmed_v1153.js','js/dist/canonical_v11_18.js'];
const a=context(oldScripts),b=context(newScripts),A=a.RF,B=b.RF;const same=(x,y)=>JSON.stringify(x)===JSON.stringify(y),norm=x=>String(x).replace(/>\s+</g,'><').replace(/\s+/g,' ').trim();
function fresh(R,name='UIParity'){
  const s=R.newGame(name,'traveller','🧭');R.state=s;s.day=8;s.minute=14*60+35;s.gold=5000;s.location='greenvale';s.weather='Rain';s.player.level=25;s.player.maxEnergy=148;s.player.energy=90;s.speed=1;s.paused=false;
  for(const k of Object.keys(s.skills||{})){s.skills[k].level=Math.max(20,s.skills[k].level||1);s.skills[k].xp=R.xpForLevel?R.xpForLevel(s.skills[k].level):s.skills[k].xp;}
  s.home=s.home||{};s.home.owned=true;s.inventory={...(s.inventory||{}),lockpick:6,bread:3,iron_ore:4};s.bank={iron_ore:12,logs:8};
  s.v7=s.v7||{};s.v7.research=s.v7.research||{};Object.keys(R.DATA.enemies||{}).slice(0,4).forEach(id=>s.v7.research[id]={level:3,notes:0});
  s.visited=s.visited||{};['greenvale','ironridge','crypt','ember_cave'].forEach(id=>{if(R.DATA.locations[id])s.visited[id]=true});
  s.v94=s.v94||{dbType:'enemies',dbSearch:''};R.UI.modal=null;R.actionGame=null;s.activity=null;return s;
}
const sa=fresh(A,'OldUI'),sb=fresh(B,'NewUI'),checks={};
checks.navItems=same(A.V1038?.items,B.V1038?.items);
checks.navHtml=norm(A.UI.nav())===norm(B.UI.nav());
checks.modernNav=(B.V1038?.items||[]).some(x=>x.id==='equipment')&&(B.V1038?.items||[]).some(x=>x.id==='toolbelt')&&(B.V1038?.items||[]).some(x=>x.id==='magic')&&!(B.V1038?.items||[]).some(x=>x.id==='shop');
const sectors=(A.V1061?.SECTORS||[]).map(x=>x[0]);
checks.sectors=same(A.V1061?.SECTORS,B.V1061?.SECTORS)&&sectors.length===8;
checks.databaseEntries=sectors.every(type=>same(A.V1061.entries(sa,type),B.V1061.entries(sb,type)));
checks.databaseHtml=sectors.every(type=>{sa.v94.dbType=type;sb.v94.dbType=type;sa.v94.dbSearch=sb.v94.dbSearch='';return norm(A.UI.database(sa))===norm(B.UI.database(sb));});
const locationIds=['greenvale','ironridge','crypt','ember_cave'].filter(id=>A.DATA.locations[id]&&B.DATA.locations[id]);
checks.facilities=locationIds.every(id=>same(A.V111.facilities(id),B.V111.facilities(id)));
checks.locationDetails=locationIds.every(id=>norm(A.v94DetailHtml(sa,'locations',id))===norm(B.v94DetailHtml(sb,'locations',id)));
const dungeonIds=Object.keys(A.V1062?.DUNGEONS||{});
checks.dungeonEntries=same(A.V113.dungeonEntries(sa),B.V113.dungeonEntries(sb))&&dungeonIds.length===8;
checks.dungeonDetails=dungeonIds.every(id=>norm(A.v94DetailHtml(sa,'dungeons',id))===norm(B.v94DetailHtml(sb,'dungeons',id)));
checks.vistaTheme=same(A.V1039.theme,B.V1039.theme)&&A.V1039.daypart(6.5)===B.V1039.daypart(6.5)&&same(A.V1039.sky(14.5),B.V1039.sky(14.5));
checks.vistaScene=norm(A.V1039.scene(sa))===norm(B.V1039.scene(sb));
checks.worldHtml=norm(A.UI.world(sa))===norm(B.UI.world(sb));
checks.overlaySelector=A.V1121.overlaySelector===B.V1121.overlaySelector;
checks.closeSelectors=A.V1123.SELECTORS===B.V1123.SELECTORS;
checks.overlayState=same({locked:A.V1121.locked,x:A.V1121.scrollX,y:A.V1121.scrollY},{locked:B.V1121.locked,x:B.V1121.scrollX,y:B.V1121.scrollY});
checks.databaseCanonical=B.Modules?.info?.('ui.database')?.meta?.status==='canonical'&&B.Views.Database.installedStages.length===4;
checks.navigationCanonical=B.Modules?.info?.('ui.navigation')?.meta?.status==='canonical'&&B.Views.Navigation.installedStages.length===1;
checks.presentationCanonical=B.Modules?.info?.('ui.presentation')?.meta?.status==='canonical'&&B.Views.Presentation.installedStages.length===4;
checks.overlaysCanonical=B.Modules?.info?.('ui.overlays')?.meta?.status==='canonical'&&B.Views.Overlays.installedStages.length===2;
checks.gameplayOwners=B.Modules?.info?.('systems.timeEnergy')?.meta?.status==='canonical'&&B.Modules?.info?.('systems.travel')?.meta?.status==='canonical'&&B.Modules?.info?.('systems.combat')?.meta?.status==='canonical'&&B.Modules?.info?.('systems.inventory')?.meta?.status==='canonical';
checks.ownership=B.PRODUCTION_FOUNDATION?.systemOwnership?.valid===true;
checks.schema=B.V95?.SCHEMA==='11.5.3';checks.version=B.VERSION==='11.18.0';
checks.knownHarnessWarningEquivalent=a.__errs.length===b.__errs.length&&a.__errs.every(x=>String(x).includes('modalHTML'))&&b.__errs.every(x=>String(x).includes('modalHTML'));
console.log(JSON.stringify({checks,oldErrors:a.__errs.slice(0,3),newErrors:b.__errs.slice(0,3),owners:{database:B.Views.Database.installedStages,navigation:B.Views.Navigation.installedStages,presentation:B.Views.Presentation.installedStages,overlays:B.Views.Overlays.installedStages}},null,2));
if(Object.values(checks).some(v=>!v))process.exit(2);
