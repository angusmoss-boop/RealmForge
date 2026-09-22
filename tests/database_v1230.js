const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
function el(){return {innerHTML:'',textContent:'',value:'',disabled:false,hidden:false,style:{},dataset:{},classList:{add(){},remove(){},contains(){return false},toggle(){}},setAttribute(){},getAttribute(){return null},appendChild(){},remove(){},addEventListener(){},removeEventListener(){},querySelectorAll(){return[]},querySelector(){return null},closest(){return null},focus(){},blur(){},matches(){return false},onclick:null,offsetWidth:1,nodeType:1};}
const app=el(),document={visibilityState:'visible',head:el(),body:el(),documentElement:el(),activeElement:null,getElementById:id=>id==='app'?app:el(),createElement(tag){const x=el();x.tagName=String(tag).toUpperCase();return x},querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},removeEventListener(){}};const storage=new Map();
const ctx=vm.createContext({console,Math,Date,JSON,Object,Array,String,Number,Boolean,Map,Set,Promise,RegExp,Error,TypeError,parseInt,parseFloat,isNaN,encodeURIComponent,decodeURIComponent,escape,unescape,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),__errs:[],document,navigator:{onLine:true,clipboard:{writeText:async()=>{}}},location:{protocol:'file:',pathname:'/',href:'file:///'},history:{state:{},pushState(){},replaceState(){},back(){}},performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},queueMicrotask:fn=>fn(),setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},alert(){},prompt(){return null},confirm(){return true},localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>Array.from(storage.keys())[i]||null,get length(){return storage.size}},MutationObserver:class{observe(){}disconnect(){}},ResizeObserver:class{observe(){}disconnect(){}},getComputedStyle:()=>({}),URL,Intl});ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;ctx.addEventListener=()=>{};ctx.removeEventListener=()=>{};ctx.scrollTo=()=>{};ctx.scrollX=0;ctx.scrollY=0;ctx.pageXOffset=0;ctx.pageYOffset=0;
document.head.appendChild=function(x){if(x?.tagName==='SCRIPT'&&x.textContent){try{vm.runInContext(x.textContent,ctx,{filename:String(x.textContent.match(/sourceURL=([^\n]+)/)?.[1]||'embedded-runtime.js')})}catch(e){ctx.__errs.push(String(e.stack||e))}}return x};document.documentElement.appendChild=document.head.appendChild;
const scripts=['js/data/base_content.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/dist/save_core_v12_3.js','js/dist/data_core_v12_3.js','js/legacy/base/main.js','js/dist/systems_core_v12_3.js','js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js','js/dist/canonical_v12_3.js'];
for(const rel of scripts)try{vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),ctx,{filename:rel})}catch(e){ctx.__errs.push(rel+': '+String(e.stack||e));}
const R=ctx.RF,V=R.Views?.Database?.V123,checks={};
checks.version=R.VERSION==='12.3.0'&&R.Core?.contract?.appVersion==='12.3.0';
checks.schema=R.Core?.contract?.saveSchema==='11.5.3';
checks.modernOwner=R.Views?.Database?.modernVersion==='12.3.0'&&R.PRODUCTION_FOUNDATION?.systemOwnership?.databaseModern===true;
checks.filterSets=JSON.stringify(V?.filterDefs?.items?.map(x=>x[0]))===JSON.stringify(['all','weapon','armor','tool','food','material','ammo','utility','trinket','quest_treasure'])&&JSON.stringify(V?.filterDefs?.resources?.map(x=>x[0]))===JSON.stringify(['all','mining','woodcutting','fishing','foraging'])&&JSON.stringify(V?.filterDefs?.recipes?.map(x=>x[0]))===JSON.stringify(['all','smithing','fletching','crafting','cooking','herblore']);
const s=R.newGame('CodexTest','traveller','📚');R.state=s;R.V101.mainMenu=false;R.UI.tab='database';
const weaponIds=V.filteredEntries(s,'items','', 'weapon').map(x=>x.id);checks.itemRefine=weaponIds.includes('stariron_warhammer')&&!weaponIds.includes('stariron_bar');
const mining=V.filteredEntries(s,'resources','', 'mining').map(x=>x.id),wood=V.filteredEntries(s,'resources','', 'woodcutting').map(x=>x.id);checks.resourceRefine=mining.includes('stariron')&&!mining.includes('ironwood')&&wood.includes('ironwood')&&!wood.includes('stariron');
const fletch=V.filteredEntries(s,'recipes','', 'fletching').map(x=>x.id),craft=V.filteredEntries(s,'recipes','', 'crafting').map(x=>x.id);checks.recipeRefine=fletch.includes('stariron_arrows')&&fletch.includes('ironwood_greatbow')&&!craft.includes('stariron_arrows')&&!craft.includes('ironwood_greatbow');
checks.richSearch=V.filteredEntries(s,'recipes','stariron','all').some(x=>x.id==='stariron_arrows')&&V.filteredEntries(s,'resources','ironwood','all').some(x=>x.id==='ironwood');
s.v94={dbType:'items',dbSearch:'stariron'};let html=R.UI.database(s);checks.designMarkup=html.includes('REALMFORGE CODEX')&&html.includes('data-rf-live-edit="database-search"')&&html.includes('db122Sectors')&&html.includes('db122Workbench')&&html.includes('db122Result');
checks.itemRefinerMarkup=html.includes('data-db122-filter="weapon"')&&html.includes('data-db122-filter="material"');
const modernCss=fs.readFileSync(path.join(root,'js/ui/database_modern.js'),'utf8');
checks.refinersWrap=modernCss.includes('.db122Chips{display:flex;flex-wrap:wrap')&&!modernCss.includes('.db122Chips{display:flex;gap:6px;overflow-x:auto')&&modernCss.includes('.db122Codex,.db122Hero,.db122Sectors,.db122Workbench,.db122Refine,.db122Chips,.db122Results{min-width:0;max-width:100%;box-sizing:border-box}')&&modernCss.includes('<small>Choose categories</small>');
s.v94.dbType='resources';html=R.UI.database(s);checks.resourceRefinerMarkup=html.includes('data-db122-filter="mining"')&&html.includes('data-db122-filter="foraging"');
s.v94.dbType='recipes';html=R.UI.database(s);checks.recipeRefinerMarkup=html.includes('data-db122-filter="fletching"')&&html.includes('data-db122-filter="herblore"');
s.v94.dbType='locations';html=R.UI.database(s);checks.noIrrelevantRefiners=!html.includes('db122Refine');
// Preserve established bestiary research gate and the Dungeons/Magic sectors.
s.v7=s.v7||{};s.v7.research=s.v7.research||{};s.v7.research.wolf={level:2,notes:99};checks.bestiaryGate=!R.V1061.entries(s,'enemies').some(x=>x.id==='wolf');s.v7.research.wolf.level=3;checks.bestiaryGate=checks.bestiaryGate&&R.V1061.entries(s,'enemies').some(x=>x.id==='wolf');
checks.dungeonsMagic=R.V1061.entries(s,'dungeons').length===8&&R.V1061.entries(s,'magic').length===0;
checks.detailPreserved=String(R.v94DetailHtml(s,'items','stariron_warhammer')).includes('dbModal')&&String(R.v94DetailHtml(s,'dungeons',Object.keys(R.V113.dungeonDefs())[0])).includes('v113DungeonDetail');
// The key regression: passive clock renders are held only while the Database search field is actively edited.
document.activeElement={matches:sel=>sel==='[data-rf-live-edit="database-search"]'};R.UI.tab='database';R.UI.modal=null;R.actionGame=null;s.combat=null;checks.focusGuard=V.shouldHoldRender()===true;R.UI.modal={type:'message'};checks.focusGuard=checks.focusGuard&&V.shouldHoldRender()===false;R.UI.modal=null;R.UI.tab='world';checks.focusGuard=checks.focusGuard&&V.shouldHoldRender()===false;
// V12.3: every displayed database sector and every refinement category is alphabetical.
const alpha=rows=>rows.every((row,i)=>i===0||String(rows[i-1].name).localeCompare(String(row.name),undefined,{sensitivity:'base',numeric:true})<=0);
for(const type of ['items','resources','recipes','npcs','locations','dungeons'])checks['alpha_'+type]=alpha(V.filteredEntries(s,type,'','all'));
// Bestiary requires 3/3 research before entries exist, so fully research the catalogue and then verify ordering.
s.v7=s.v7||{};s.v7.research=s.v7.research||{};for(const id of Object.keys(R.DATA.enemies||{}))s.v7.research[id]={level:3,notes:99};checks.alpha_enemies=alpha(V.filteredEntries(s,'enemies','','all'));
for(const [type,defs] of Object.entries(V.filterDefs||{}))for(const [filter] of defs)checks[`alpha_${type}_${filter}`]=alpha(V.filteredEntries(s,type,'',filter));
// Ingredient graph: Greenleaf Herb participates in canonical recipes, including quantities and disciplines.
const herbUses=V.recipeUsesForItem('herb');const herbNames=herbUses.map(x=>x.outputs?.[0]?.name);
checks.herbUseGraph=['Antivenom','Focus Draught','Minor Healing Potion','Smoke Bomb','Venison Stew'].every(n=>herbNames.includes(n));
checks.herbQuantity=herbUses.some(x=>x.id==='focus_draught'&&x.inputQty===2&&x.discipline==='Herblore'&&x.level===10);
// Camp-fire recipes and extra ingredients are part of the same graph.
const berryUses=V.recipeUsesForItem('wild_berries');checks.campUses=berryUses.some(x=>x.id==='berry_skewer'&&x.inputQty===2&&x.discipline==='Cooking')&&berryUses.some(x=>x.id==='marsh_stew'&&x.inputQty===2&&x.discipline==='Cooking');
// Resource details inherit uses from the item they yield, while non-ingredients stay clean.
const herbDetail=String(R.v94DetailHtml(s,'items','herb')),greenleafDetail=String(R.v94DetailHtml(s,'resources','herb'));
checks.itemUsesDetail=herbDetail.includes('Recipes &amp; Uses')&&herbDetail.includes('Minor Healing Potion')&&herbDetail.includes('Focus Draught')&&herbDetail.indexOf('Known sources')<herbDetail.indexOf('Recipes &amp; Uses');
checks.resourceUsesDetail=greenleafDetail.includes('Recipes &amp; Uses')&&greenleafDetail.includes('Minor Healing Potion');
checks.noEmptyUses=!String(R.v94DetailHtml(s,'items','stariron_warhammer')).includes('Recipes &amp; Uses');
checks.usesMarkup=V.usesHtml('herb').includes('db123UseRow')&&V.usesHtml('herb').includes('Uses 3 × Greenleaf Herb');
checks.authoring=R.Authoring?.report?.().valid===true;
const unexpected=ctx.__errs.filter(x=>!String(x).includes('modalHTML'));
console.log(JSON.stringify({checks,counts:{items:Object.keys(R.DATA.items||{}).length,resources:Object.keys(R.DATA.resourceDefs||{}).length,recipes:Object.keys(R.DATA.recipes||{}).length},unexpectedErrors:unexpected},null,2));
if(Object.values(checks).some(v=>!v)||unexpected.length)process.exit(2);
