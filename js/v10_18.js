window.RF=window.RF||{};
RF.VERSION='10.18.0';
RF.V1018=RF.V1018||{};

/* Realmforge V10.18 — Forge & Filters
   - Smithing heat cools continuously in real time.
   - Smaller working/perfect heat windows; hammering only nudges heat downward.
   - Repairs Pack/Bank/Shop/Crafting category dropdowns after the V10.9/V10.10 bind regression.
   - Repairs Database section switching and live search filtering.
*/

// ---------- Smithing: passive thermal model ----------
(()=>{
  const old=document.getElementById('v1018-style');if(old)old.remove();
  const st=document.createElement('style');st.id='v1018-style';st.textContent=`
    .heatIdeal{left:52%!important;width:18%!important;background:rgba(255,167,58,.18)!important}
    .heatTrack:after{content:'';position:absolute;left:59%;width:5%;top:0;bottom:0;background:rgba(255,211,111,.18);border-left:1px solid rgba(255,221,139,.75);border-right:1px solid rgba(255,221,139,.75);z-index:3;pointer-events:none}
  `;document.head.appendChild(st);
})();

RF.V1018.idealMin=52;
RF.V1018.idealMax=70;
RF.V1018.perfectMin=59;
RF.V1018.perfectMax=64;
RF.V1018.forgeLast=performance.now();

RF.V1018.updateForgeDom=function(g){
  if(!g||g.type!=='forge')return;
  const heat=Math.max(0,Math.min(100,+g.heat||0));
  const heatText=document.querySelector('.forgeStats span:first-child b');
  if(heatText)heatText.textContent=`${Math.round(heat)}%`;
  const fill=document.querySelector('.heatFill');
  if(fill){
    fill.style.width=`${heat}%`;
    fill.classList.toggle('ideal',heat>=RF.V1018.idealMin&&heat<=RF.V1018.idealMax);
  }
};

RF.V1018.forgeTicker=setInterval(()=>{
  const now=performance.now(),dt=Math.min(1,(now-RF.V1018.forgeLast)/1000);RF.V1018.forgeLast=now;
  const g=RF.actionGame;
  if(!g||g.type!=='forge')return;
  // Hotter metal sheds heat a little faster. At ~60% heat this is about 3.2 points/sec.
  const rate=2.35+Math.max(0,+g.heat||0)*0.014;
  g.heat=Math.max(0,(+g.heat||0)-rate*dt);
  RF.V1018.updateForgeDom(g);
},200);

// Rewrite forge UI copy and ensure the initial glow uses the new tighter range.
const v1018ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  let h=v1018ModalBase(s);
  const g=RF.actionGame;
  if(g?.type==='forge'&&this.modal?.type==='v7Action'){
    const ideal=g.heat>=RF.V1018.idealMin&&g.heat<=RF.V1018.idealMax;
    h=h.replace(/<div class="heatFill(?: ideal)?"/,`<div class="heatFill${ideal?' ideal':''}"`);
    h=h.replace('Best working heat: 48–76%. The narrow centre gives exceptional strikes.','Best working heat: 52–70%. Perfect strikes: 59–64%. Heat falls continuously, so keep an eye on the metal.');
  }
  return h;
};

// Final smithing hammer resolver. Loaded after old cooldown/energy wrappers, so it explicitly owns both.
RF.hammerForge=function(){
  const s=RF.state,g=RF.actionGame;if(!s||!g||g.type!=='forge')return;
  const r=RF.DATA.recipes[g.recipe];if(!r)return;
  const qty=Math.max(1,g.v9Qty||1),need={};Object.entries(r.inputs||{}).forEach(([id,q])=>need[id]=q*qty);
  if(!RF.hasItems(s,need)){
    g.message='⚠️ You no longer have enough materials to finish this work.';
    RF.UI.render(s);return;
  }
  if(RF.actionReady&&!RF.actionReady(g,'forge',RF.V8?.actionCooldowns?.forge||650))return;
  const energy=RF.v10EnergyCost?RF.v10EnergyCost('forge'):3;
  if(RF.v10SpendEnergy&&!RF.v10SpendEnergy(s,energy))return;

  const heat=+g.heat||0;
  const ideal=heat>=RF.V1018.idealMin&&heat<=RF.V1018.idealMax;
  const perfect=heat>=RF.V1018.perfectMin&&heat<=RF.V1018.perfectMax;
  let power=9+Math.floor((s.skills?.smithing?.level||1)/3);
  s.stats.activeTaps=(s.stats.activeTaps||0)+1;

  if(perfect){
    power*=2;g.message=`✨ PERFECT HEAT • +${power} progress`;RF.addXp(s,'smithing',3);
  }else if(ideal){
    g.message=`🔨 Clean strike • +${power} progress`;
  }else{
    power=Math.max(3,Math.floor(power*.45));
    g.integrity-=heat>86?13:7;
    g.message=heat>86?'⚠️ Too hot. Scale flakes from the workpiece.':'⚠️ Too cold. The metal resists.';
  }

  const target=g.v9Target||100;
  g.progress=Math.min(target,(+g.progress||0)+power);
  // Hammering now only knocks a little heat out; passive cooling does most of the thermal work.
  g.heat=Math.max(0,(+g.heat||0)-(2+Math.random()*2));

  if(g.integrity<=0){
    const candidates=Object.keys(r.inputs||{}).filter(id=>(s.inventory[id]||0)>0);
    if(candidates.length)RF.takeItem(s,candidates[0],1);
    g.integrity=45;g.progress=0;s.stats.skillMishaps=(s.stats.skillMishaps||0)+1;
    g.message='💥 The workpiece cracks. Material is lost and progress resets.';
  }
  if(g.progress>=target){
    if(g.v9Qty&&RF.v9FinishBatch)return RF.v9FinishBatch(g);
    return RF.finishForge?.();
  }
  RF.save(s);RF.UI.render(s);
};

// ---------- Repair category/database controls ----------
RF.V1018.bindFilters=function(){
  const s=RF.state;if(!s)return;
  s.v93=s.v93||{inventoryCategory:'all',shopCategory:'all',bankCategory:'all',craftCategory:'all'};
  s.v94=s.v94||{dbType:'enemies',dbSearch:''};

  // Category dropdowns used by Pack, Bank, Shop and Crafting. Use live RF.state instead of stale closures.
  document.querySelectorAll('[data-v93-filter]').forEach(el=>{
    el.onchange=()=>{
      const ss=RF.state;if(!ss)return;ss.v93=ss.v93||{};
      const key=`${el.dataset.v93Filter}Category`;ss.v93[key]=el.value;
      if(el.dataset.v93Filter==='bank'&&RF.V1010?.scroll){RF.V1010.scroll.pack=0;RF.V1010.scroll.bank=0;}
      RF.save?.(ss);RF.UI.render(ss);
    };
  });

  // Database section select had an old addEventListener carrying an undefined state argument.
  // Clone it once to discard that stale listener, then install a live-state handler.
  let type=document.querySelector('[data-db-type]');
  if(type&&!type.dataset.v1018Clean){
    const clean=type.cloneNode(true);clean.dataset.v1018Clean='1';type.replaceWith(clean);type=clean;
  }
  if(type)type.onchange=()=>{
    const ss=RF.state;if(!ss)return;ss.v94=ss.v94||{};ss.v94.dbType=type.value;ss.v94.dbSearch='';
    RF.save?.(ss);RF.UI.render(ss);
  };

  // Live search narrows the current database immediately while preserving cursor/focus.
  const search=document.querySelector('[data-db-search]');
  if(search)search.oninput=()=>{
    const ss=RF.state;if(!ss)return;ss.v94=ss.v94||{};ss.v94.dbSearch=search.value;
    const pos=search.selectionStart??search.value.length;RF.save?.(ss);RF.UI.render(ss);
    requestAnimationFrame(()=>{const el=document.querySelector('[data-db-search]');if(el){el.focus();try{el.setSelectionRange(pos,pos)}catch(_){}}});
  };

  document.querySelectorAll('[data-db-entry]').forEach(b=>b.onclick=()=>{
    const [dbType,id]=(b.dataset.dbEntry||'').split(':');if(!dbType||!id)return;
    RF.UI.modal={type:'dbDetail',dbType,id};RF.UI.render(RF.state);
  });
  document.querySelectorAll('[data-db-close]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(RF.state)});
};

const v1018BindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  // Pass state forward where possible, then overwrite the known stale filter handlers with robust ones.
  try{v1018BindBase(s||RF.state)}catch(err){console.warn('[Realmforge V10.18 bind recovery]',err)}
  RF.V1018.bindFilters();
};

RF.V1018.migrate=function(s){if(!s)return s;s.version='10.18.0';s.v93=s.v93||{};s.v94=s.v94||{dbType:'enemies',dbSearch:''};return s};
if(RF.V95){
  RF.V95.SCHEMA='10.18.0';
  const base=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>RF.V1018.migrate(base(s));
}
if(RF.state){RF.V1018.migrate(RF.state);try{RF.save?.(RF.state)}catch(_){};RF.UI.render(RF.state)}
