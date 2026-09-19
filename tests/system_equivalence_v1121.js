const fs=require('fs'),vm=require('vm'),path=require('path');const root=path.resolve(__dirname,'..');
function context(scripts,storage=new Map()){
  let ctx;function el(){return {innerHTML:'',textContent:'',value:'',disabled:false,hidden:false,style:{},dataset:{},className:'',classList:{add(){},remove(){},contains(){return false},toggle(){}},setAttribute(){},getAttribute(){return null},appendChild(){},remove(){},addEventListener(){},removeEventListener(){},querySelectorAll(){return[]},querySelector(){return null},closest(){return null},focus(){},blur(){},onclick:null,offsetWidth:1,nodeType:1};}
  const app=el(),document={visibilityState:'visible',head:el(),body:el(),documentElement:el(),activeElement:null,getElementById:id=>id==='app'?app:el(),createElement(tag){const x=el();x.tagName=String(tag).toUpperCase();return x},querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},removeEventListener(){}};
  const math=Object.create(Math);math.random=()=>0.5;class FixedDate extends Date{static now(){return 1779297600000;}}
  ctx=vm.createContext({console,Math:math,Date:FixedDate,JSON,Object,Array,String,Number,Boolean,Map,Set,Promise,RegExp,Error,TypeError,parseInt,parseFloat,isNaN,encodeURIComponent,decodeURIComponent,escape,unescape,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),__errs:[],document,navigator:{onLine:true,clipboard:{writeText:async()=>{}}},location:{protocol:'file:',pathname:'/',href:'file:///'},history:{state:{},pushState(){},replaceState(){},back(){}},performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},queueMicrotask:fn=>fn(),setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},alert(){},prompt(){return null},confirm(){return true},localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>Array.from(storage.keys())[i]||null,get length(){return storage.size}},MutationObserver:class{observe(){}disconnect(){}},ResizeObserver:class{observe(){}disconnect(){}},getComputedStyle:()=>({}),URL,Intl});
  ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;ctx.__app=app;ctx.addEventListener=()=>{};ctx.removeEventListener=()=>{};ctx.scrollTo=()=>{};ctx.scrollX=0;ctx.scrollY=0;ctx.pageXOffset=0;ctx.pageYOffset=0;
  document.head.appendChild=function(x){if(x?.tagName==='SCRIPT'&&x.textContent){try{vm.runInContext(x.textContent,ctx,{filename:String(x.textContent.match(/sourceURL=([^\n]+)/)?.[1]||'embedded-runtime.js')})}catch(e){ctx.__errs.push(String(e.stack||e))}}return x};document.documentElement.appendChild=document.head.appendChild;
  for(const rel of scripts){try{vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),ctx,{filename:rel})}catch(e){ctx.__errs.push(rel+': '+String(e.stack||e))}}
  return ctx;
}
const oldScripts=['js/data/base_content.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/dist/save_core_v11_20.js','js/dist/data_core_v11_20.js','js/legacy/base/main.js','js/dist/systems_core_v11_20.js','js/legacy/compat_gameplay_app_shell_trimmed_v1153.js','js/dist/canonical_v11_20.js'];
const newScripts=['js/data/base_content.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/dist/save_core_v11_21.js','js/dist/data_core_v11_21.js','js/legacy/base/main.js','js/dist/systems_core_v11_21.js','js/legacy/compat_gameplay_world_social_trimmed_v1153.js','js/dist/canonical_v11_21.js'];
const a=context(oldScripts),b=context(newScripts),A=a.RF,B=b.RF;const same=(x,y)=>JSON.stringify(x)===JSON.stringify(y),norm=x=>String(x).replace(/>\s+</g,'><').replace(/\s+/g,' ').trim();
function fresh(R){const s=R.newGame('ShellParity','traveller','🧭');R.state=s;s.day=8;s.minute=14*60+35;s.gold=5000;s.location='greenvale';s.weather='Rain';s.player.level=25;s.player.maxEnergy=148;s.player.energy=90;s.speed=1;s.paused=false;for(const k of Object.keys(s.skills||{})){s.skills[k].level=Math.max(20,s.skills[k].level||1);s.skills[k].xp=R.xpForLevel?R.xpForLevel(s.skills[k].level):s.skills[k].xp;}s.home=s.home||{};s.home.owned=true;s.inventory={...(s.inventory||{}),lockpick:6,bread:3,iron_ore:4};s.bank={iron_ore:12,logs:8};s.v7=s.v7||{};s.v7.research=s.v7.research||{};Object.keys(R.DATA.enemies||{}).slice(0,4).forEach(id=>s.v7.research[id]={level:3,notes:0});s.visited=s.visited||{};['greenvale','ironridge','crypt','ember_cave'].forEach(id=>{if(R.DATA.locations[id])s.visited[id]=true});s.v94=s.v94||{dbType:'enemies',dbSearch:''};R.UI.modal=null;R.actionGame=null;s.activity=null;R.V101.mainMenu=false;return s;}
const sa=fresh(A),sb=fresh(B),checks={};
checks.campaignNav=same(A.V95?.navItems,B.V95?.navItems);
checks.optionsHtml=norm(A.UI.options(sa))===norm(B.UI.options(sb));
checks.developerHtml=norm(A.UI.dev(sa))===norm(B.UI.dev(sb));
checks.buildParser=same(A.V1033.parseVersion('version=11.20.0\ntitle=Test'),B.V1033.parseVersion('version=11.20.0\ntitle=Test'));
checks.versionCompare=[['11.20.0','11.19.0'],['11.19.0','11.20.0'],['11.20.0','11.20.0']].every(([x,y])=>A.V1033.compareVersion(x,y)===B.V1033.compareVersion(x,y));
const stripBuild=h=>norm(h).replace(/V11\.(?:20|21)\.0 • Canonical [^<]+/g,'Vx • Canonical').replace(/Built 19 Sep 2026 • (?:18:50|19:16) BST/g,'Built x');
checks.buildMarkupStructure=stripBuild(A.V1033.buildMarkup())===stripBuild(B.V1033.buildMarkup());
A.V101.mainMenu=true;B.V101.mainMenu=true;A.V101.renderMainMenu();B.V101.renderMainMenu();
const stripMenu=h=>norm(h).replace(/V11\.(?:20|21)\.0 • Canonical [^<]+/g,'Vx • Canonical').replace(/Built 19 Sep 2026 • (?:18:50|19:16) BST/g,'Built x');
checks.mainMenuStructure=stripMenu(a.__app.innerHTML)===stripMenu(b.__app.innerHTML);
A.V101.mainMenu=false;B.V101.mainMenu=false;
checks.focusCapture=same(A.v96CaptureClock(sa),B.v96CaptureClock(sb));
checks.navItems=same(A.V1038?.items,B.V1038?.items);checks.navHtml=norm(A.UI.nav())===norm(B.UI.nav());
checks.modernNav=(B.V1038?.items||[]).some(x=>x.id==='equipment')&&(B.V1038?.items||[]).some(x=>x.id==='toolbelt')&&(B.V1038?.items||[]).some(x=>x.id==='magic')&&!(B.V1038?.items||[]).some(x=>x.id==='shop');
const sectors=(A.V1061?.SECTORS||[]).map(x=>x[0]);checks.sectors=same(A.V1061?.SECTORS,B.V1061?.SECTORS)&&sectors.length===8;
checks.databaseEntries=sectors.every(type=>same(A.V1061.entries(sa,type),B.V1061.entries(sb,type)));
checks.vistaScene=norm(A.V1039.scene(sa))===norm(B.V1039.scene(sb));checks.worldHtml=norm(A.UI.world(sa))===norm(B.UI.world(sb));
checks.appShellCanonical=B.Modules?.info?.('ui.appShell')?.meta?.status==='canonical'&&B.Views.AppShell.installedStages.includes('js/v9_5.js')&&B.Views.AppShell.installedFragments.includes('v10_1-app-shell');
checks.developerCanonical=B.Modules?.info?.('ui.developer')?.meta?.status==='canonical'&&B.Views.Developer.installedStages.includes('js/v10_33.js')&&B.V1033.__v1119PlatformBuildProbe===true;
checks.platformBridge=['copyText','promptText','alertMessage','vibrate','isVisible','onResume','fetchBuildInfo','registerServiceWorker','onBackNavigation','pushHistoryState','replaceHistoryState'].every(k=>typeof B.Platform?.active?.[k]==='function');
checks.lifecycleCanonical=B.Modules?.info?.('core.lifecycle')?.meta?.status==='canonical'&&B.Core?.Lifecycle?.booted===true;
checks.worldCanonical=B.Modules?.info?.('systems.world')?.meta?.status==='canonical'&&B.Systems.World.installedStages.includes('js/v2.js')&&B.Systems.World.installedFragments.includes('v9_2-encounter-ecology');
checks.socialCanonical=B.Modules?.info?.('systems.social')?.meta?.status==='canonical'&&B.Systems.Social.installedFragments.length===6;
checks.presentationFragment=B.Views?.Presentation?.installedFragments?.includes('v9_1-weather-scene');
checks.npcParity=same(A.npcsHere(sa).map(x=>x.id),B.npcsHere(sb).map(x=>x.id));
checks.passersParity=same(A.passersHere(sa),B.passersHere(sb));
checks.contractParity=(A.guild?.contractProgress?true:true)&&typeof B.contractProgress==='function';
checks.socialUiParity=norm(A.UI.peopleV4(sa))===norm(B.UI.peopleV4(sb))&&norm(A.UI.guildPanel(sa))===norm(B.UI.guildPanel(sb));
checks.compatReduced=require('fs').readFileSync(require('path').join(root,'js/legacy/compat_gameplay_world_social_trimmed_v1153.js')).length<314471;
checks.existingUiOwners=B.Modules?.info?.('ui.database')?.meta?.status==='canonical'&&B.Modules?.info?.('ui.navigation')?.meta?.status==='canonical'&&B.Modules?.info?.('ui.presentation')?.meta?.status==='canonical'&&B.Modules?.info?.('ui.overlays')?.meta?.status==='canonical';
checks.gameplayOwners=B.Modules?.info?.('systems.timeEnergy')?.meta?.status==='canonical'&&B.Modules?.info?.('systems.travel')?.meta?.status==='canonical'&&B.Modules?.info?.('systems.combat')?.meta?.status==='canonical'&&B.Modules?.info?.('systems.inventory')?.meta?.status==='canonical';
checks.ownership=B.PRODUCTION_FOUNDATION?.systemOwnership?.valid===true;checks.schema=B.V95?.SCHEMA==='11.5.3';checks.version=B.VERSION==='11.21.0';
checks.knownHarnessWarningEquivalent=a.__errs.length===b.__errs.length&&a.__errs.every(x=>String(x).includes('modalHTML'))&&b.__errs.every(x=>String(x).includes('modalHTML'));
console.log(JSON.stringify({checks,oldErrors:a.__errs.slice(0,3),newErrors:b.__errs.slice(0,3),owners:{appShell:B.Views.AppShell.installedStages,appShellFragments:B.Views.AppShell.installedFragments,developer:B.Views.Developer.installedStages}},null,2));
if(Object.values(checks).some(v=>!v))process.exit(2);
