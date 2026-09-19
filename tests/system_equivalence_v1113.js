const fs=require('fs'),vm=require('vm'),path=require('path');const root=path.resolve(__dirname,'..');
function context(scripts,storage=new Map()){
  let ctx;function el(){return {innerHTML:'',textContent:'',value:'',disabled:false,hidden:false,style:{},dataset:{},classList:{add(){},remove(){},contains(){return false},toggle(){}},setAttribute(){},getAttribute(){return null},appendChild(){},remove(){},addEventListener(){},removeEventListener(){},querySelectorAll(){return[]},querySelector(){return null},closest(){return null},focus(){},onclick:null,offsetWidth:1};}
  const app=el(),document={visibilityState:'visible',head:el(),body:el(),documentElement:el(),getElementById:id=>id==='app'?app:el(),createElement(tag){const x=el();x.tagName=String(tag).toUpperCase();return x},querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},removeEventListener(){}};
  ctx=vm.createContext({console,Math,Date,JSON,Object,Array,String,Number,Boolean,Map,Set,Promise,RegExp,Error,TypeError,parseInt,parseFloat,isNaN,encodeURIComponent,decodeURIComponent,escape,unescape,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),__errs:[],document,navigator:{onLine:true,clipboard:{writeText:async()=>{}}},location:{protocol:'file:',pathname:'/'},history:{pushState(){},replaceState(){},back(){}},performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},alert(){},prompt(){return null},confirm(){return true},localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>Array.from(storage.keys())[i]||null,get length(){return storage.size}},MutationObserver:class{observe(){}disconnect(){}},ResizeObserver:class{observe(){}disconnect(){}},getComputedStyle:()=>({}),URL,Intl});
  ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;ctx.addEventListener=()=>{};ctx.removeEventListener=()=>{};
  document.head.appendChild=function(x){if(x?.tagName==='SCRIPT'&&x.textContent){try{vm.runInContext(x.textContent,ctx,{filename:'embedded-runtime.js'})}catch(e){ctx.__errs.push(String(e.stack||e))}}return x};document.documentElement.appendChild=document.head.appendChild;
  for(const rel of scripts){try{vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),ctx,{filename:rel})}catch(e){ctx.__errs.push(rel+': '+String(e.stack||e))}}
  return ctx;
}
const oldScripts=['js/data/base_content.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/dist/save_core_v11_12.js','js/dist/data_core_v11_12.js','tests/fixtures/base_main_v1118.js','js/dist/systems_core_v11_12.js','js/legacy/compat_gameplay_world_quest_trimmed_v1153.js','js/dist/canonical_v11_12.js'];
const newScripts=['js/data/base_content.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/dist/save_core_v11_13.js','js/dist/data_core_v11_13.js','tests/fixtures/base_main_v1118.js','js/dist/systems_core_v11_13.js','js/legacy/compat_gameplay_combat_loadout_trimmed_v1153.js','js/dist/canonical_v11_13.js'];
const a=context(oldScripts),b=context(newScripts),A=a.RF,B=b.RF;
function mk(R){let s=R.newGame('LoadoutParity','traveller','🥷');R.state=s;s.player.level=30;s.gold=20000;s.location='ironridge';for(const k of Object.keys(s.skills||{}))s.skills[k].level=Math.max(20,s.skills[k].level||1);s.inventory={...(s.inventory||{}),iron_sword:2,steel_sword:2,steel_pickaxe:2,steel_axe:2,ash_ring:2,bread:4,potion:4,raw_meat:5,coal:3,iron_ore:5};s.bank={...(s.bank||{}),logs:22,iron_ore:15};s.equipment={...(s.equipment||{}),main:'iron_sword',off:null,head:null,chest:null,legs:null,boots:null,ring1:null,ring2:null};s.toolbelt={...(s.toolbelt||{})};s.v1056=s.v1056||{};R.UI.modal=null;return s;}
const sa=mk(A),sb=mk(B);const same=(x,y)=>JSON.stringify(x)===JSON.stringify(y),norm=x=>String(x).replace(/>\s+</g,'><').replace(/\s+/g,' ').trim();
const initial={
 packUsed:A.packUsed(sa)===B.packUsed(sb),packCap:A.packCapacity(sa)===B.packCapacity(sb),packFree:A.packFree(sa)===B.packFree(sb),
 damage:A.weaponDamage(sa)===B.weaponDamage(sb),armour:A.armor(sa)===B.armor(sb),
 inventoryHtml:norm(A.UI.inventory(sa))===norm(B.UI.inventory(sb)),
 equipmentHtml:norm(A.UI.equipmentPage(sa))===norm(B.UI.equipmentPage(sb)),
 toolbeltHtml:norm(A.UI.toolbeltPage(sa))===norm(B.UI.toolbeltPage(sb))
};
// Detached tool belt behaviour.
A.equipTool('steel_pickaxe');B.equipTool('steel_pickaxe');
const toolSame=same(sa.toolbelt,sb.toolbelt)&&same(sa.inventory,sb.inventory);
// Explicit ring slot behaviour with two physical copies.
A.equipToSlot('ash_ring','ring1');B.equipToSlot('ash_ring','ring1');A.equipToSlot('ash_ring','ring2');B.equipToSlot('ash_ring','ring2');
const ringsSame=same(sa.equipment,sb.equipment)&&same(sa.inventory,sb.inventory)&&sa.equipment.ring1==='ash_ring'&&sa.equipment.ring2==='ash_ring';
// Return one ring and tool to pack.
A.unequipSlot('ring2');B.unequipSlot('ring2');A.unequipToolSlot('mining');B.unequipToolSlot('mining');
const returnSame=same(sa.equipment,sb.equipment)&&same(sa.toolbelt,sb.toolbelt)&&same(sa.inventory,sb.inventory);
// Over-capacity add is lossless and pauses time in both.
for(let i=0;i<40;i++){const id='v1113_dummy_'+i;A.DATA.items[id]={name:id,icon:'•',type:'material',value:1};B.DATA.items[id]={name:id,icon:'•',type:'material',value:1};A.addItem(sa,id,1);B.addItem(sb,id,1);} 
const overflowSame=A.V1056.isOver(sa)===B.V1056.isOver(sb)&&A.packExcess(sa)===B.packExcess(sb)&&same(sa.inventory,sb.inventory)&&sa.speed===sb.speed&&sa.paused===sb.paused;
// Battle start and renderer/category parity.
sa.location=sb.location='crossroads';sa.speed=sb.speed=1;sa.paused=sb.paused=false;A.startBattle('bandit',{forced:false});B.startBattle('bandit',{forced:false});
const combatStateSame=same(sa.combat,sb.combat);const combatHtmlSame=norm(A.UI.combatPopup(sa))===norm(B.UI.combatPopup(sb));
const catsSame=norm(A.V1057.actionCategoryHtml(sa,['<button data-ability="attack">A</button>','<button data-ability="guard">G</button>']))===norm(B.V1057.actionCategoryHtml(sb,['<button data-ability="attack">A</button>','<button data-ability="guard">G</button>']));
const checks={version:B.VERSION==='11.13.0',schema:B.V95?.SCHEMA==='11.5.3',...initial,toolSame,ringsSame,returnSame,overflowSame,combatStateSame,combatHtmlSame,catsSame,
 combatCanonical:B.Modules?.info?.('systems.combat')?.meta?.status==='canonical'&&B.Systems.Combat.installedStages.length===8,
 equipmentCanonical:B.Modules?.info?.('systems.equipment')?.meta?.status==='canonical'&&B.Systems.Equipment.installedStages.length===5,
 inventoryCanonical:B.Modules?.info?.('systems.inventory')?.meta?.status==='canonical'&&B.Systems.Inventory.installedStages.length===9,
 ownership:B.PRODUCTION_FOUNDATION?.systemOwnership?.valid===true};
console.log(JSON.stringify({checks,oldErrors:a.__errs.slice(0,5),newErrors:b.__errs.slice(0,5),pack:{old:A.packUsed(sa),new:B.packUsed(sb),excessOld:A.packExcess(sa),excessNew:B.packExcess(sb)}},null,2));if(Object.values(checks).some(v=>!v))process.exit(2);
