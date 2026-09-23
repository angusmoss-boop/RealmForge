const fs=require('fs'),vm=require('vm'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
function makeContext(storage=new Map()){
  function el(){return {innerHTML:'',textContent:'',value:'',disabled:false,hidden:false,style:{},dataset:{},className:'',files:[],classList:{add(){},remove(){},contains(){return false},toggle(){}},setAttribute(){},getAttribute(){return null},appendChild(){},remove(){},click(){},addEventListener(){},removeEventListener(){},querySelectorAll(){return[]},querySelector(){return null},closest(){return null},focus(){},blur(){},matches(){return false},onclick:null,offsetWidth:1,nodeType:1,children:[]};}
  const app=el(),document={visibilityState:'visible',head:el(),body:el(),documentElement:el(),activeElement:null,getElementById:id=>id==='app'?app:el(),createElement(tag){const x=el();x.tagName=String(tag).toUpperCase();return x},querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},removeEventListener(){}};
  const math=Object.create(Math);math.random=()=>0.5;
  const ctx=vm.createContext({console,Math:math,Date,JSON,Object,Array,String,Number,Boolean,Map,Set,Promise,RegExp,Error,TypeError,parseInt,parseFloat,isNaN,encodeURIComponent,decodeURIComponent,escape,unescape,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),__errs:[],document,navigator:{onLine:true,clipboard:{writeText:async()=>{}}},location:{protocol:'file:',pathname:'/',href:'file:///'},history:{state:{},pushState(){},replaceState(){},back(){}},performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},queueMicrotask:fn=>fn(),setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},alert(){},prompt(){return null},confirm(){return true},localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>Array.from(storage.keys())[i]||null,get length(){return storage.size}},MutationObserver:class{observe(){}disconnect(){}},ResizeObserver:class{observe(){}disconnect(){}},getComputedStyle:()=>({}),URL,Intl,Blob:class{constructor(parts,opts){this.parts=parts;this.type=opts?.type}}});
  ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;ctx.addEventListener=()=>{};ctx.removeEventListener=()=>{};ctx.scrollTo=()=>{};ctx.scrollX=0;ctx.scrollY=0;ctx.pageXOffset=0;ctx.pageYOffset=0;
  document.head.appendChild=function(x){if(x?.tagName==='SCRIPT'&&x.textContent){try{vm.runInContext(x.textContent,ctx,{filename:String(x.textContent.match(/sourceURL=([^\n]+)/)?.[1]||'embedded-runtime.js')})}catch(e){ctx.__errs.push(String(e.stack||e))}}return x};document.documentElement.appendChild=document.head.appendChild;
  const scripts=['js/data/base_content.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/dist/save_core_v12_6.js','js/dist/data_core_v12_6.js','js/legacy/base/main.js','js/dist/systems_core_v12_6.js','js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js','js/dist/canonical_v12_6.js'];
  for(const rel of scripts)try{vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),ctx,{filename:rel})}catch(e){ctx.__errs.push(rel+': '+String(e.stack||e));}
  return {ctx,app,document,storage};
}
const storage=new Map(),f=makeContext(storage),R=f.ctx.RF,C=R.Core.Campaigns,S=R.Core.State,checks={};
checks.version=R.VERSION==='12.6.0'&&R.Core.contract.appVersion==='12.6.0';
checks.schema=R.Core.contract.saveSchema==='12.6.0'&&R.V95.SCHEMA==='12.6.0';
checks.owner=R.Modules.info('systems.hardcore')?.meta?.status==='canonical'&&R.CampaignMode?.version==='12.5.0'&&R.PRODUCTION_FOUNDATION?.systemOwnership?.hardcoreCanonical===true;
// Existing/pre-Hardcore state explicitly migrates to Standard, never Hardcore by inference.
let old=R.newGame('Legacy','traveller','🧭');delete old.campaign;old.saveSchema='11.5.3';old.version='11.5.3';R.Core.Migrations.normalize(old);
checks.legacyBecomesStandard=old.campaign?.mode==='standard'&&old.campaign?.gameOver===false&&old.saveSchema==='12.6.0';
// New Standard remains default, shows deaths record, and creator contains opt-in warning.
let standard=R.newGame('Standard','traveller','🛡️');standard.stats.deaths=3;
checks.standardDefault=standard.campaign?.mode==='standard'&&!standard.campaign?.gameOver;
const standardHtml=R.UI.character(standard),creatorHtml=R.UI.creator();
checks.standardDeaths=standardHtml.includes('💀 Deaths')&&standardHtml.includes('>3</b>')&&!standardHtml.includes('HARDCORE CAMPAIGN');
checks.creatorChoice=creatorHtml.includes('Campaign Rules')&&creatorHtml.includes('Hardcore')&&creatorHtml.includes('One life. Death ends the campaign.');
checks.creatorWarning=creatorHtml.includes('If this character dies, the campaign is permanently over')&&creatorHtml.includes('This choice cannot be changed after creation.');
// Hardcore can only originate through explicit creation options and is highlighted on Character.
let hc=R.newGame('IronClu','traveller','☠️',{mode:'hardcore'});R.state=hc;R.V101.mainMenu=false;
checks.hardcoreCreated=hc.campaign?.mode==='hardcore'&&hc.campaign?.gameOver===false;
checks.hardcoreCharacterBanner=R.UI.character(hc).includes('HARDCORE CAMPAIGN')&&R.UI.character(hc).includes('One life')&&!R.UI.character(hc).includes('💀 Deaths');
// Establish a real persisted Hardcore slot, then die. Legacy revival chain must never run.
R.startNew('IronClu','traveller','☠️',{mode:'hardcore'});const id=C.activeId();R.state.player.level=17;R.state.gold=777;R.state.location='forest';R.state.player.hp=1;R.state.player.stamina=22;R.state.stats.deaths=0;R.state.combat={id:'wolf',enemyId:'wolf',hp:3,maxHp:55,phase:'enemy',v9XpPool:{attack:120},cooldowns:{}};C.saveNow();
const beforeGold=R.state.gold,beforeLoc=R.state.location;R.loseV4Battle();const fallen=R.state;
checks.permadeath=fallen.campaign?.mode==='hardcore'&&fallen.campaign?.gameOver===true&&fallen.player.hp===0&&fallen.player.stamina===0&&fallen.stats.deaths===1&&fallen.combat===null;
checks.noRevivalPenalty=fallen.gold===beforeGold&&fallen.location===beforeLoc;
checks.deathRecord=fallen.campaign?.death?.enemyId==='wolf'&&fallen.campaign?.death?.enemyName===R.DATA.enemies.wolf.name&&fallen.campaign?.death?.location==='forest'&&fallen.campaign?.death?.level===17&&Number.isFinite(fallen.campaign?.endedAt);
checks.memorialRender=f.app.innerHTML.includes('Game Over')&&f.app.innerHTML.includes('HARDCORE CAMPAIGN')&&f.app.innerHTML.includes('Export Memorial')&&f.app.innerHTML.includes('cannot resume');
checks.fallenPersisted=C.readSlot(id)?.state?.campaign?.gameOver===true&&C.backupSummary(id).some(x=>x.ok);
const fallenCreated=fallen.created;R.V95.doConfirm({action:'restart',data:{}});checks.fallenRestartBlocked=R.state?.campaign?.gameOver===true&&R.state?.created===fallenCreated&&R.Core.Campaigns.activeId()===id;
// Duplicate/export/import preserve the final campaign rule and memorial state without reviving it.
const dup=C.duplicate(id,'IronClu Memorial Copy',{activate:false}),dupState=C.readSlot(dup)?.state;
checks.duplicatePreservesFall=dupState?.campaign?.mode==='hardcore'&&dupState?.campaign?.gameOver===true&&dupState?.campaign?.death?.enemyId==='wolf';
const packed=S.packBackup(C.readSlot(id).state,{name:'IronClu Memorial'}),importId=S.importText(packed,{activate:false,name:'IronClu Memorial Import'}),imported=C.readSlot(importId)?.state;
checks.exportImportPreservesFall=imported?.campaign?.mode==='hardcore'&&imported?.campaign?.gameOver===true&&imported?.campaign?.death?.enemyId==='wolf';
// Full reload cannot resume a fallen campaign.
const f2=makeContext(storage),R2=f2.ctx.RF;checks.reloadStillFallen=R2.state?.campaign?.mode==='hardcore'&&R2.state?.campaign?.gameOver===true;
R2.UI.render(R2.state);checks.reloadMemorial=f2.app.innerHTML.includes('Game Over')&&f2.app.innerHTML.includes('permanently concluded');
// Standard death still delegates to the established recovery path and increments exactly once.
const standardStorage=new Map(),sf=makeContext(standardStorage),SR=sf.ctx.RF;SR.startNew('Mortal','traveller','🧑',{mode:'standard'});SR.state.stats.deaths=0;SR.state.gold=1000;SR.state.location='forest';SR.state.player.hp=1;SR.state.combat={id:'wolf',enemyId:'wolf',hp:5,maxHp:55,phase:'enemy',v9XpPool:{},cooldowns:{}};
let standardDeathOk=true;try{SR.loseV4Battle();}catch(e){standardDeathOk=false;sf.ctx.__errs.push('standard death: '+String(e.stack||e));}
checks.standardRecovery=standardDeathOk&&SR.state.campaign?.mode==='standard'&&!SR.state.campaign?.gameOver&&SR.state.stats.deaths===1&&SR.state.player.hp>0&&SR.state.combat===null;
// Restart of an alive Hardcore run preserves campaign rules rather than silently downgrading.
const aliveStorage=new Map(),af=makeContext(aliveStorage),AR=af.ctx.RF;AR.startNew('RestartHardcore','traveller','☠️',{mode:'hardcore'});const aliveId=AR.Core.Campaigns.activeId();const fresh=AR.newGame(AR.state.player.name,AR.state.player.background,AR.state.player.avatar,{mode:AR.state.campaign.mode});checks.restartModePreservable=fresh.campaign?.mode==='hardcore'&&!fresh.campaign?.gameOver&&!!aliveId;
checks.metadata=C.readIndex().some(x=>x.id===id&&x.mode==='hardcore'&&x.gameOver===true);
const compat=fs.readFileSync(path.join(root,'js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js'));checks.compatFrozen=compat.length===64639&&crypto.createHash('sha256').update(compat).digest('hex')==='68d0283ff351fe7c285a04f06be84a2ef38f4cab0454910c0845d0cce6a4620e';
const unexpected=[...f.ctx.__errs,...f2.ctx.__errs,...sf.ctx.__errs,...af.ctx.__errs].filter(x=>!String(x).includes('modalHTML'));
checks.noUnexpectedErrors=unexpected.length===0;
console.log(JSON.stringify({checks,fallen:{campaign:fallen.campaign,gold:fallen.gold,location:fallen.location,deaths:fallen.stats.deaths},unexpectedErrors:unexpected},null,2));
if(Object.values(checks).some(v=>!v))process.exit(2);
