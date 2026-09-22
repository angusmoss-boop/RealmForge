const fs=require('fs'),vm=require('vm'),path=require('path');const root=path.resolve(__dirname,'..');
function context(storage=new Map()){
  let ctx;function el(){return {innerHTML:'',textContent:'',value:'',disabled:false,hidden:false,style:{},dataset:{},files:[],classList:{add(){},remove(){},contains(){return false},toggle(){}},setAttribute(){},getAttribute(){return null},appendChild(){},remove(){},click(){},addEventListener(){},removeEventListener(){},querySelectorAll(){return[]},querySelector(){return null},closest(){return null},focus(){},blur(){},offsetWidth:1}}
  const app=el(),document={visibilityState:'visible',head:el(),body:el(),documentElement:el(),activeElement:null,getElementById:id=>id==='app'?app:el(),createElement(tag){const x=el();x.tagName=String(tag).toUpperCase();return x},querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},removeEventListener(){}};
  const math=Object.create(Math);math.random=()=>0.5;
  ctx=vm.createContext({console,Math:math,Date,JSON,Object,Array,String,Number,Boolean,Map,Set,Promise,RegExp,Error,TypeError,parseInt,parseFloat,isNaN,encodeURIComponent,decodeURIComponent,escape,unescape,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),__errs:[],document,navigator:{onLine:true,clipboard:{writeText:async()=>{}}},location:{protocol:'file:',pathname:'/',href:'file:///'},history:{state:{},pushState(){},replaceState(){},back(){}},performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},alert(){},prompt(){return null},confirm(){return true},localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>Array.from(storage.keys())[i]||null,get length(){return storage.size}},MutationObserver:class{observe(){}disconnect(){}},ResizeObserver:class{observe(){}disconnect(){}},getComputedStyle:()=>({}),URL,Intl,Blob:class{constructor(parts,opts){this.parts=parts;this.type=opts?.type}}});
  ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;ctx.addEventListener=()=>{};ctx.removeEventListener=()=>{};ctx.scrollTo=()=>{};ctx.scrollX=0;ctx.scrollY=0;ctx.pageXOffset=0;ctx.pageYOffset=0;
  document.head.appendChild=function(x){if(x?.tagName==='SCRIPT'&&x.textContent){try{vm.runInContext(x.textContent,ctx,{filename:String(x.textContent.match(/sourceURL=([^\n]+)/)?.[1]||'embedded-runtime.js')})}catch(e){ctx.__errs.push(String(e.stack||e))}}return x};document.documentElement.appendChild=document.head.appendChild;
  const scripts=['js/data/base_content.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/dist/save_core_v12_1.js','js/dist/data_core_v12_1.js','js/legacy/base/main.js','js/dist/systems_core_v12_1.js','js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js','js/dist/canonical_v12_1.js'];
  for(const rel of scripts){try{vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),ctx,{filename:rel})}catch(e){ctx.__errs.push(rel+': '+String(e.stack||e))}}
  return ctx;
}
const storage=new Map(),ctx=context(storage),R=ctx.RF,C=R.Core.Campaigns,S=R.Core.State;
const checks={};
// Create and establish a valuable campaign.
R.V101.mainMenu=false;R.state=null;R.startNew('Veteran','traveller','🛡️');const veteranId=C.activeId();R.state.player.level=30;R.state.player.xp=90000;R.state.gold=54321;R.state.inventory.lockpick=17;C.saveNow();
const veteranSnapshot=C.readSlot(veteranId).state;const veteranBefore={level:veteranSnapshot.player.level,xp:veteranSnapshot.player.xp,gold:veteranSnapshot.gold,lockpick:veteranSnapshot.inventory.lockpick,created:veteranSnapshot.created};
checks.newSlotTripleCopy=C.backupSummary(veteranId).every(x=>x.ok);
// Reproduce the Options > New Campaign route. The veteran slot must remain unchanged.
R.V95.doConfirm({action:'new',data:{}});R.startNew('FreshStart','farmer','🌱');const freshId=C.activeId();
checks.newCampaignGetsNewSlot=!!freshId&&freshId!==veteranId;
{const v=C.readSlot(veteranId).state;checks.oldCampaignUntouched=v.player.level===veteranBefore.level&&v.player.xp===veteranBefore.xp&&v.gold===veteranBefore.gold&&v.inventory.lockpick===veteranBefore.lockpick&&v.created===veteranBefore.created;}
checks.freshCampaignActive=C.readSlot(freshId).state.player.name==='FreshStart';
// Storage-layer fail-safe: even a bad caller cannot push a different fresh campaign into Veteran.
const intruder=R.newGame('Intruder','traveller','🧨');const blocked=C.writeSlot(veteranId,intruder,'bad write');
{const v=C.readSlot(veteranId).state;checks.crossCampaignWriteBlocked=blocked===false&&v.player.level===30&&v.gold===54321&&v.created===veteranBefore.created;}
// Duplicate is independent, verified, and does not steal active selection.
const activeBeforeDup=C.activeId(),dupId=C.duplicate(veteranId,'Veteran • Copy',{activate:false});
checks.duplicateCreated=!!dupId&&dupId!==veteranId&&C.readSlot(dupId).state.player.level===30;
checks.duplicateDoesNotActivate=C.activeId()===activeBeforeDup;
checks.duplicateTripleCopy=C.backupSummary(dupId).every(x=>x.ok);
// V12 checksummed export/import, imported as a separate slot.
const text=S.packBackup(C.readSlot(veteranId).state,{name:'Veteran'}),pkg=JSON.parse(text);
checks.exportPackage=pkg.format==='realmforge-save-backup'&&pkg.formatVersion===1&&pkg.checksum===C.hash(pkg.payload)&&pkg.saveSchema==='11.5.3';
const importId=S.importText(text,{activate:false,name:'Veteran Imported'});
checks.importCreatesSeparateSlot=!!importId&&![veteranId,freshId,dupId].includes(importId)&&C.readSlot(importId).state.player.level===30;
{const v=C.readSlot(veteranId).state;checks.importDoesNotOverwriteSource=v.player.level===30&&v.gold===54321&&v.created===veteranBefore.created;}
checks.importTripleCopy=C.backupSummary(importId).every(x=>x.ok);
// Pre-V12 base64 exports remain readable.
const rawState=C.readSlot(veteranId).state,legacy=Buffer.from(unescape(encodeURIComponent(JSON.stringify(rawState))),'binary').toString('base64');
checks.legacyExportImport=S.unpackBackup(legacy).player.level===30&&S.unpackBackup(legacy).gold===54321;
// Recovery chain still works under the hardened writer.
const recId=C.createSlot(R.newGame('Recovery','traveller','🧪'),'Recovery',{activate:false});let rec=C.readSlot(recId).state;rec.gold=111;C.writeSlot(recId,rec,null,true,{activate:false});rec.gold=222;C.writeSlot(recId,rec,null,false,{activate:false});
storage.set(C.slotKey(recId,'primary'),'broken');const b=C.readRawSlot(recId);storage.set(C.slotKey(recId,'backup'),'also-broken');const r=C.readRawSlot(recId);
checks.primaryFallsBackToBackup=b?.kind==='backup';checks.primaryBackupFallBackToRecovery=r?.kind==='recovery';

// A damaged slot index is rebuilt from verified slot envelopes rather than orphaning campaigns.
const indexStorage=new Map(),ix=context(indexStorage),IR=ix.RF,IC=IR.Core.Campaigns;IR.V101.mainMenu=false;IR.state=null;IR.startNew('IndexHero','traveller','🗂️');const indexId=IC.activeId();IR.state.player.level=22;IC.saveNow();indexStorage.set(IC.INDEX_KEY,'{corrupt-index');const ix2=context(indexStorage),IC2=ix2.RF.Core.Campaigns;
checks.corruptIndexRecovered=IC2.readIndex().some(x=>x.id===indexId)&&IC2.readSlot(indexId)?.state?.player?.level===22;
checks.schemaUnchanged=C.SCHEMA==='11.5.3'&&R.Core.contract.saveSchema==='11.5.3';
checks.canonicalStartNew=checks.newCampaignGetsNewSlot&&checks.oldCampaignUntouched;
checks.saveManagerCanonical=R.Modules.info('ui.saveManager')?.meta?.status==='canonical';
checks.platformFileSeam=typeof R.Platform.active.saveTextFile==='function'&&typeof R.Platform.active.pickTextFile==='function'&&typeof R.Platform.active.storage.keys==='function';
const known=ctx.__errs.filter(e=>!e.includes('v10_9-split-vault'));
console.log(JSON.stringify({checks,unexpectedErrors:known,slots:C.readIndex().map(x=>({id:x.id,name:x.name,level:x.level}))},null,2));
if(Object.values(checks).some(v=>!v)||known.length)process.exit(2);
