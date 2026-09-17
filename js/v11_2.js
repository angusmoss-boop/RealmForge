window.RF=window.RF||{};
RF.VERSION='11.2.0';
RF.BUILD={
  version:'11.2.0',
  title:'Requirement Integrity',
  built:'17 Sep 2026 • 20:59 BST',
  buildId:'20260917-2059-bst'
};
RF.V112=RF.V112||{};

/* Realmforge V11.2 — Requirement Integrity
   - Audits standard skill-gated interactions so meeting a requirement exactly always counts.
   - Repairs legacy/stale skill level-vs-XP mismatches without reducing any earned progress.
   - Resource gathering now clearly shows YOUR level and the required level separately.
   - Applies requirement normalization before gathering, crafting, cooking, equipment, travel,
     excavation and ability unlock checks.
   - Folds the V11.1.1 Database top-right X polish into V11.2, so V11.0 users only need
     v11_1.js + v11_2.js to jump straight to the current build.
*/

(()=>{
'use strict';
const V=RF.V112;
V.version='11.2.0';
V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
V.num=n=>Math.max(0,Math.floor(Number(n)||0));

V.skillLevel=function(s,id){
  const sk=s?.skills?.[id];
  if(!sk)return 1;
  const stored=Math.max(1,Math.min(100,V.num(sk.level)||1));
  const xp=Math.max(0,Number(sk.xp)||0);
  const byXp=typeof RF.levelFromXp==='function'?Math.max(1,Math.min(100,RF.levelFromXp(xp))):stored;
  return Math.max(stored,byXp);
};
RF.effectiveSkillLevel=V.skillLevel;
RF.meetsSkillRequirement=function(s,id,required=1){return V.skillLevel(s,id)>=Math.max(1,V.num(required)||1)};

// Old campaigns could theoretically carry a stale `level` value even though their XP had
// already crossed the threshold (or the reverse after old dev/import operations). Preserve the
// highest earned state in either representation and make both agree. Never lower progress.
V.normalizeSkill=function(s,id){
  if(!s)return 1;
  s.skills=s.skills||{};
  const sk=s.skills[id]=s.skills[id]||{xp:0,level:1};
  const level=V.skillLevel(s,id);
  const floor=typeof RF.xpForLevel==='function'?Math.max(0,Number(RF.xpForLevel(level))||0):0;
  sk.level=level;
  sk.xp=Math.max(Math.max(0,Number(sk.xp)||0),floor);
  return level;
};
V.normalizeSkills=function(s){
  if(!s)return s;
  for(const id of Object.keys(RF.DATA?.skills||{}))V.normalizeSkill(s,id);
  return s;
};
RF.normalizeSkillRequirements=V.normalizeSkills;

V.requirementText=function(s,skill,required){
  const have=V.skillLevel(s,skill),need=Math.max(1,V.num(required)||1),name=RF.DATA?.skills?.[skill]?.name||skill;
  return {have,need,name,met:have>=need,text:`Your ${name} Lv ${have} • Requires Lv ${need}`};
};

// ---- Standard requirement entry points -------------------------------------
V.wrapNormalize=function(obj,key){
  const fn=obj?.[key];if(typeof fn!=='function'||fn.__v112Normalized)return;
  const wrapped=function(){if(RF.state)V.normalizeSkills(RF.state);return fn.apply(this,arguments)};
  wrapped.__v112Normalized=true;obj[key]=wrapped;
};
[
  [RF,'openResourceMenu'],[RF,'startActionGame'],[RF,'startGather'],
  [RF,'cookAtFire'],[RF,'v9StartCraftQty'],[RF,'startExcavation'],
  [RF,'travel'],[RF,'v9LocationUnlocked'],[RF,'v9LockText'],[RF,'unlockedAbilities']
].forEach(([o,k])=>V.wrapNormalize(o,k));
if(RF.V1024)V.wrapNormalize(RF.V1024,'startHomeCook');

// Equipment requirement checks are cheap and central enough to make explicitly effective-level aware.
if(typeof RF.canEquipItem==='function'){
  const canEquipBase=RF.canEquipItem;
  RF.canEquipItem=function(s,id){V.normalizeSkills(s);return canEquipBase.apply(this,arguments)};
}
if(typeof RF.v93Req==='function'){
  RF.v93Req=function(s,id){
    const it=RF.DATA.items?.[id],r=RF.itemRequirement?.(it);if(!r)return'';
    const have=V.skillLevel(s,r.skill),name=RF.DATA.skills?.[r.skill]?.name||r.skill;
    return `${name} Lv ${r.level}${have<r.level?` • You ${have}`:''}`;
  };
}

// The current V10.56 craft analyser is the final owner of workshop readiness. Keep its material
// logic intact, but always feed it a normalized skill state first.
if(RF.V1056?.craftAnalysis){
  const craftBase=RF.V1056.craftAnalysis.bind(RF.V1056);
  RF.V1056.craftAnalysis=function(s,id){V.normalizeSkills(s);return craftBase(s,id)};
  if(RF.V1019)RF.V1019.craftAnalysis=RF.V1056.craftAnalysis;
  if(RF.V1015){
    RF.V1015.craftAnalysis=RF.V1056.craftAnalysis;
    RF.V1015.recipeState=function(s,id,r){
      const a=RF.V1056.craftAnalysis(s,id),lvl=V.skillLevel(s,r.skill);
      if(lvl<(r.level||1))return {label:`LV ${r.level}`,ready:false};
      if(a.materialMax<1)return {label:'MATS',ready:false};
      return {label:'READY',ready:true};
    };
  }
  RF.v9MaxCraft=function(s,id){return RF.V1056.craftAnalysis(s,id).max};
}

// Exact-level excavation readiness is also rendered in V7 directly. Normalizing before every final
// render means all legacy direct `s.skills.*.level` checks see the same canonical state.
if(RF.UI?.render){
  const renderBase=RF.UI.render.bind(RF.UI);
  RF.UI.render=function(s){V.normalizeSkills(s);return renderBase(s)};
}

// ---- Resource chooser clarity + exact requirement gating -------------------
// Replace only this one modal after all earlier modal wrappers have loaded.
if(RF.UI?.modalHtml){
  const modalBase=RF.UI.modalHtml.bind(RF.UI);
  RF.UI.modalHtml=function(s){
    const m=this.modal;
    if(m?.type==='resourceMenu'){
      V.normalizeSkills(s);
      const buttons=(m.list||[]).map(([key,d,r])=>{
        const req=V.requirementText(s,d.skill,d.level),depleted=(r?.charges||0)<=0;
        const over=!!RF.isOverEncumbered?.(s);
        const ready=req.met&&!depleted&&!over;
        let status='';
        if(!req.met)status=` • Need ${req.need-req.have} level${req.need-req.have===1?'':'s'}`;
        else if(depleted)status=' • Depleted';
        else if(over)status=' • Pack over capacity';
        return `<button class="choice v112ResourceChoice" data-gather="${V.escape(key)}" ${ready?'':'disabled'}><b>${d.icon} ${V.escape(d.name)} • ${r.charges}/${d.max}</b><small>${V.escape(req.text)} • ${V.escape(d.desc||'')}${V.escape(status)}</small></button>`;
      }).join('');
      return `<div class="modalBack"><div class="modal v112ResourceModal"><button type="button" class="v112ModalX" data-close-result aria-label="Close">✕</button><h2>${RF.DATA.skills[m.kind]?.icon||'🧰'} Choose Resource</h2><div class="sub">Choose exactly what you want to gather. Meeting a level requirement exactly counts.</div><div class="choices">${buttons||'<div class="sub">Nothing suitable here.</div>'}</div></div></div>`;
    }
    return modalBase(s);
  };
}

// ---- Database detail polish folded forward from V11.1.1 -------------------
// This deliberately makes V11.1.1 optional for anyone jumping from V11.0 straight to 11.2.
if(typeof RF.v94DetailHtml==='function'){
  const detailBase=RF.v94DetailHtml;
  RF.v94DetailHtml=function(){
    let h=detailBase.apply(this,arguments);if(!h)return h;
    if(!h.includes('v112DbClose')){
      h=h.replace('<div class="modal dbModal">','<div class="modal dbModal v112DbModal"><button type="button" class="v112DbClose" data-db-close aria-label="Close">✕</button>');
      h=h.replace('<button class="quietClose" data-db-close>Close</button>','');
    }
    return h;
  };
}

V.migrate=function(s){
  if(!s)return s;
  s.v112=s.v112||{};
  V.normalizeSkills(s);
  s.version='11.2.0';
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='11.2.0';
  const om=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>V.migrate(om(s));
}

const oldStyle=document.getElementById('v112-requirement-integrity-style');if(oldStyle)oldStyle.remove();
const st=document.createElement('style');st.id='v112-requirement-integrity-style';st.textContent=`
.v112ResourceModal{position:relative;padding-top:22px!important;padding-right:18px!important}
.v112ModalX,.v112DbClose{position:absolute;top:14px;right:14px;z-index:4;width:48px;height:48px;border-radius:15px;border:1px solid rgba(201,159,84,.35);background:linear-gradient(180deg,rgba(63,46,27,.92),rgba(30,22,15,.98));color:#f0d59a;font-size:27px;font-weight:400;line-height:1;display:grid;place-items:center;box-shadow:inset 0 1px rgba(255,255,255,.05);touch-action:manipulation}
.v112ModalX:active,.v112DbClose:active{background:linear-gradient(180deg,rgba(91,64,29,.98),rgba(48,33,18,.98))}
.v112ResourceModal>h2{padding-right:54px}
.v112ResourceChoice small{line-height:1.42}
.v112DbModal{position:relative;padding-top:28px!important;padding-right:18px!important}
.v112DbModal>.eyebrow{padding-right:58px}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
