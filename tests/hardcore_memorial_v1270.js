const fs=require('fs'),vm=require('vm'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
function makeContext(storage=new Map()){
  const listeners=new Map(), menuButtons=[];
  function node(key=''){
    const n={innerHTML:'',textContent:'',value:'',disabled:false,hidden:false,style:{},dataset:{},className:'',files:[],attributes:{},_classes:new Set(),_listeners:{},
      classList:{add(...xs){xs.forEach(x=>n._classes.add(x))},remove(...xs){xs.forEach(x=>n._classes.delete(x))},contains(x){return n._classes.has(x)},toggle(x,on){if(on===undefined){if(n._classes.has(x))n._classes.delete(x);else n._classes.add(x)}else if(on)n._classes.add(x);else n._classes.delete(x)}},
      setAttribute(k,v){n.attributes[k]=String(v)},getAttribute(k){return n.attributes[k]??null},appendChild(){},remove(){},click(){n._listeners.click?.({target:n})},addEventListener(t,fn){n._listeners[t]=fn},removeEventListener(){},querySelectorAll(){return[]},querySelector(sel){if(sel==='b'){n._b=n._b||node('b');return n._b}if(sel==='small'){n._small=n._small||node('small');return n._small}return null},closest(){return null},focus(){},blur(){},matches(){return false},onclick:null,offsetWidth:1,nodeType:1,children:[]};
    if(key)listeners.set(key,n);return n;
  }
  const app=node('app');
  app.querySelector=()=>null;app.querySelectorAll=()=>[];
  const document={visibilityState:'visible',head:node(),body:node(),documentElement:node(),activeElement:null,_menuButtons:menuButtons,
    getElementById:id=>id==='app'?app:node(),createElement(tag){const x=node();x.tagName=String(tag).toUpperCase();return x},
    querySelector(sel){return listeners.get(sel)||node(sel)},
    querySelectorAll(sel){
      if(sel==='[data-v101-load]'){
        menuButtons.length=0;
        const R=ctx.RF,rows=R?.Core?.Campaigns?.readIndex?.()||[];
        for(const m of rows){const b=node();b.dataset.v101Load=m.id;menuButtons.push(b)}
        return menuButtons;
      }
      return [];
    },addEventListener(){},removeEventListener(){}};
  const math=Object.create(Math);math.random=()=>0.5;
  const ctx=vm.createContext({console,Math:math,Date,JSON,Object,Array,String,Number,Boolean,Map,Set,Promise,RegExp,Error,TypeError,parseInt,parseFloat,isNaN,encodeURIComponent,decodeURIComponent,escape,unescape,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),__errs:[],document,navigator:{onLine:true,clipboard:{writeText:async()=>{}}},location:{protocol:'file:',pathname:'/',href:'file:///'},history:{state:{},pushState(){},replaceState(){},back(){}},performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},queueMicrotask:fn=>fn(),setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},alert(){},prompt(){return null},confirm(){return true},localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>Array.from(storage.keys())[i]||null,get length(){return storage.size}},MutationObserver:class{observe(){}disconnect(){}},ResizeObserver:class{observe(){}disconnect(){}},getComputedStyle:()=>({}),URL,Intl,Blob:class{constructor(parts,opts){this.parts=parts;this.type=opts?.type}}});
  ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;ctx.addEventListener=()=>{};ctx.removeEventListener=()=>{};ctx.scrollTo=()=>{};ctx.scrollX=0;ctx.scrollY=0;ctx.pageXOffset=0;ctx.pageYOffset=0;
  document.head.appendChild=function(x){if(x?.tagName==='SCRIPT'&&x.textContent){try{vm.runInContext(x.textContent,ctx,{filename:String(x.textContent.match(/sourceURL=([^\n]+)/)?.[1]||'embedded-runtime.js')})}catch(e){ctx.__errs.push(String(e.stack||e))}}return x};document.documentElement.appendChild=document.head.appendChild;
  const scripts=['js/data/base_content.js','js/legacy/base/state.js','js/legacy/base/ui.js','js/dist/save_core_v12_7.js','js/dist/data_core_v12_7.js','js/legacy/base/main.js','js/dist/systems_core_v12_7.js','js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js','js/dist/canonical_v12_7.js'];
  for(const rel of scripts)try{vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),ctx,{filename:rel})}catch(e){ctx.__errs.push(rel+': '+String(e.stack||e));}
  return {ctx,app,document,storage,listeners,menuButtons};
}
const storage=new Map(),f=makeContext(storage),R=f.ctx.RF,C=R.Core.Campaigns,checks={};
checks.version=R.VERSION==='12.7.0'&&R.Core.contract.appVersion==='12.7.0';
checks.schemaUnchanged=R.Core.contract.saveSchema==='12.6.0'&&R.V95.SCHEMA==='12.6.0';
checks.owner=R.CampaignMode?.version==='12.7.0'&&R.PRODUCTION_FOUNDATION?.systemOwnership?.hardcoreCanonical===true;
R.startNew('HC','traveller','☠️',{mode:'hardcore'});const id=C.activeId();R.V101.mainMenu=false;R.state.player.level=9;R.state.location='crossroads';R.state.combat={id:'wolf',enemyId:'wolf',hp:1,maxHp:55,phase:'enemy',v9XpPool:{},cooldowns:{}};C.saveNow();R.loseV4Battle();
checks.fallen=R.state.campaign?.gameOver===true&&C.readIndex().find(x=>x.id===id)?.gameOver===true;
checks.memorialActions=f.app.innerHTML.includes('Main Menu')&&f.app.innerHTML.includes('Delete Save')&&f.app.innerHTML.includes('Delete this fallen campaign?')&&f.app.innerHTML.includes('Keep Memorial');
// Main Menu must remain authoritative across subsequent passive renders.
f.listeners.get('[data-v125-main-menu]')?._listeners?.click?.();
checks.mainMenuClick=R.V101.mainMenu===true&&f.app.innerHTML.includes('Enter the Realm');
R.UI.render(R.state);checks.passiveRenderStaysMenu=R.V101.mainMenu===true&&f.app.innerHTML.includes('Enter the Realm')&&!f.app.innerHTML.includes('This campaign is permanently concluded');
// Fallen card is decorated from authoritative slot metadata.
R.V101.renderMainMenu();const card=f.menuButtons.find(x=>x.dataset.v101Load===id),title=card?.querySelector('b'),sub=card?.querySelector('small');
checks.fallenCard=!!card&&card.classList.contains('v127FallenSave')&&String(title?.innerHTML).includes('☠️')&&String(title?.innerHTML).includes('FALLEN')&&sub?.textContent.endsWith('Game Over');
checks.fallenCardNoLocation=!String(sub?.textContent).includes('Kingroad Crossroads')&&!String(sub?.textContent).includes('Crossroads');
// Reopen memorial and exercise optional confirmation flow.
R.V101.mainMenu=false;C.loadSlot(id);R.UI.render(R.state);
const del=f.listeners.get('[data-v127-delete-save]'),confirmBox=f.listeners.get('[data-v127-delete-confirm]');del?._listeners?.click?.();checks.deletePrompts=confirmBox?.hidden===false;
f.listeners.get('[data-v127-delete-cancel]')?._listeners?.click?.();checks.cancelPreserves=confirmBox?.hidden===true&&C.readIndex().some(x=>x.id===id)&&!!C.readSlot(id);
del?._listeners?.click?.();f.listeners.get('[data-v127-delete-confirmed]')?._listeners?.click?.();
checks.deleteRemovesSlot=!C.readIndex().some(x=>x.id===id)&&C.readSlot(id)===null&&C.activeId()==='';
checks.deleteReturnsMenu=R.state===null&&R.V101.mainMenu===true&&f.app.innerHTML.includes('Enter the Realm');
checks.deleteRemovesCopies=['primary','backup','recovery'].every(kind=>f.storage.get(C.slotKey(id,kind))==null);
const compat=fs.readFileSync(path.join(root,'js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js'));checks.compatFrozen=compat.length===64639&&crypto.createHash('sha256').update(compat).digest('hex')==='68d0283ff351fe7c285a04f06be84a2ef38f4cab0454910c0845d0cce6a4620e';
const unexpected=f.ctx.__errs.filter(x=>!String(x).includes('modalHTML'));checks.noUnexpectedErrors=unexpected.length===0;
console.log(JSON.stringify({checks,unexpectedErrors:unexpected},null,2));if(Object.values(checks).some(v=>!v))process.exit(2);
