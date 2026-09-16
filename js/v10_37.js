window.RF=window.RF||{};
RF.VERSION='10.37.0';
RF.BUILD={
  version:'10.37.0',
  title:'Mastery Grid',
  built:'16 Sep 2026 • 03:06 BST',
  buildId:'20260916-0306-bst'
};
RF.V1037=RF.V1037||{};

/* Realmforge V10.37 — Mastery Grid
   - Rebuilds the dedicated Skills tab as a compact 3-column mastery grid.
   - Every tile shows icon, skill name, Lv X/100 and live progress to the next level.
   - Tapping a skill opens a richer detail card with XP and mastery information.
*/

(()=>{
const V=RF.V1037;

V.migrate=function(s){
  if(!s)return s;
  s.version='10.37.0';
  s.v1037=s.v1037||{};
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.37.0';
  const oldMig=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(oldMig(s));
}

V.skillMeta={
  attack:{group:'Combat',desc:'Technical melee skill. Improves precision-oriented combat techniques and contributes to weapon effectiveness.'},
  strength:{group:'Combat',desc:'Raw physical power. Raises the force behind melee attacks and powers heavy offensive techniques.'},
  defence:{group:'Combat',desc:'Defensive mastery. Improves armour effectiveness, parrying and techniques built around surviving enemy attacks.'},
  archery:{group:'Combat',desc:'Ranged weapon mastery. Governs bows, ranged techniques and precision from a distance.'},
  magic:{group:'Combat',desc:'Arcane combat mastery. Governs magical attacks, spell techniques and supernatural power.'},
  vitality:{group:'Combat',desc:'Physical resilience. Represents toughness and contributes to surviving dangerous encounters.'},
  mining:{group:'Gathering',desc:'Extract ore and stone from mineral deposits. Higher mastery makes familiar seams easier to work.'},
  woodcutting:{group:'Gathering',desc:'Harvest timber from trees. Skill and equipped axes improve efficiency on increasingly difficult woods.'},
  fishing:{group:'Gathering',desc:'Catch fish from rivers and other waters. Higher levels improve access to more demanding catches.'},
  foraging:{group:'Gathering',desc:'Find useful plants, food and natural materials in the wild.'},
  hunting:{group:'Gathering',desc:'Track and take local game using fieldcraft and timing.'},
  smithing:{group:'Production',desc:'Smelt and work metal at the Greenvale Village Workshop, creating bars, weapons, armour and tools.'},
  cooking:{group:'Production',desc:'Prepare food at campfires or in your Greenvale cottage kitchen.'},
  crafting:{group:'Production',desc:'Create practical equipment and materials at the Greenvale Village Workshop.'},
  herblore:{group:'Production',desc:'Prepare mixtures and potions from gathered ingredients at the Greenvale Village Workshop.'},
  thieving:{group:'World & Social',desc:'Pick pockets, work locks and burglarise properties. Higher mastery helps against more secure targets.'},
  trading:{group:'World & Social',desc:'Commercial knowledge used when dealing with merchants, values and economic opportunities.'},
  exploration:{group:'World & Social',desc:'Field awareness and discovery. Helps uncover routes, hazards, encounters and rare finds while exploring.'},
  speech:{group:'World & Social',desc:'Conversation, persuasion and social confidence used in dialogue and certain non-combat encounters.'}
};
V.meta=id=>V.skillMeta[id]||{group:'Skill',desc:'A developing mastery used throughout your journey.'};
V.progress=function(s,id){
  const sk=s.skills?.[id]||{level:1,xp:0};
  const level=Math.max(1,Math.min(100,Number(sk.level)||1));
  const xp=Math.max(0,Number(sk.xp)||0);
  const prev=RF.xpForLevel(level);
  if(level>=100)return {level,xp,prev,next:prev,into:Math.max(0,xp-prev),span:0,remain:0,pct:100};
  const next=RF.xpForLevel(level+1),span=Math.max(1,next-prev),into=Math.max(0,xp-prev),remain=Math.max(0,next-xp),pct=Math.max(0,Math.min(100,100*into/span));
  return {level,xp,prev,next,into,span,remain,pct};
};
V.num=n=>Math.floor(Number(n)||0).toLocaleString('en-GB');

// Dedicated Skills tab: mastery grid only. Crafting remains in Greenvale's Village Workshop.
RF.UI.skills=function(s){
  const tiles=Object.entries(RF.DATA.skills).map(([id,d])=>{
    const p=V.progress(s,id),m=V.meta(id);
    return `<button class="v1037SkillTile" data-skill-detail="${id}" aria-label="${d.name}, level ${p.level} of 100, ${Math.round(p.pct)} percent to next level">
      <span class="v1037SkillIcon">${d.icon||'✨'}</span>
      <span class="v1037SkillName">${d.name}</span>
      <span class="v1037SkillLevel">Lv ${p.level}/100</span>
      <span class="v1037SkillGroup">${m.group}</span>
      <span class="v1037SkillProgress" aria-hidden="true"><i style="width:${p.pct}%"></i></span>
    </button>`;
  }).join('');
  return `<section class="card v1037SkillsCard">
    <div class="v1037SkillsHead"><div><span class="eyebrow">MASTERY</span><h2>Skills</h2></div><span class="v1037SkillsHint">Tap for details</span></div>
    <div class="sub">Every skill can reach level 100. The bar on each tile shows progress through your current level.</div>
    <div class="v1037SkillGrid">${tiles}</div>
  </section>`;
};

// Upgrade the existing skill-detail modal without changing its data-skill-detail binding.
const modalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  const m=this.modal;
  if(m?.type==='v10SkillDetail'){
    const id=m.id,d=RF.DATA.skills?.[id],p=V.progress(s,id),meta=V.meta(id);
    if(!d)return modalBase(s);
    const currentText=p.level>=100?'Mastery complete':`${V.num(p.into)} / ${V.num(p.span)} XP in Level ${p.level}`;
    return `<div class="modalBack"><div class="modal v1037SkillModal">
      <div class="v1037SkillHero"><div class="v1037SkillHeroIcon">${d.icon||'✨'}</div><div><span class="eyebrow">${meta.group.toUpperCase()} SKILL</span><h2>${d.name}</h2><div class="v1037HeroLevel">Level ${p.level}/100</div></div></div>
      <div class="v1037SkillDesc">${meta.desc}</div>
      <div class="v1037BigProgress"><i style="width:${p.pct}%"></i></div>
      <div class="v1037ProgressLine"><span>${currentText}</span><b>${Math.round(p.pct)}%</b></div>
      <div class="statsGrid v1037SkillStats">
        <div class="statbox"><span>Current level</span><b>${p.level}/100</b></div>
        <div class="statbox"><span>Total XP</span><b>${V.num(p.xp)}</b></div>
        <div class="statbox"><span>XP to next</span><b>${p.level>=100?'MAX':V.num(Math.ceil(p.remain))}</b></div>
        <div class="statbox"><span>Next level</span><b>${p.level>=100?'MAX':`${p.level+1}/100`}</b></div>
      </div>
      ${p.level>=100?`<div class="notice ok v1037MasteryNotice">🏆 Maximum mastery reached.</div>`:`<div class="notice v1037MasteryNotice">✨ ${V.num(Math.ceil(p.remain))} XP until ${d.name} ${p.level+1}/100.</div>`}
      <button class="quietClose" data-v10-close>Close</button>
    </div></div>`;
  }
  return modalBase(s);
};

const st=document.createElement('style');st.id='v1037-mastery-grid-style';st.textContent=`
.v1037SkillsCard{overflow:visible}.v1037SkillsHead{display:flex;align-items:flex-end;justify-content:space-between;gap:12px}.v1037SkillsHead h2{margin:2px 0 0}.v1037SkillsHint{font-size:9px;color:#aa9a80;white-space:nowrap;padding-bottom:4px}
.v1037SkillGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:14px}
.v1037SkillTile{position:relative;min-width:0;min-height:108px;border:1px solid #4d4030;border-radius:14px;background:linear-gradient(180deg,#221c15,#17130f);color:#eadfc5;padding:10px 7px 14px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;text-align:center;overflow:hidden;box-shadow:0 1px 0 #ffffff08 inset;touch-action:manipulation}
.v1037SkillTile:active{transform:scale(.975);border-color:#a37b43}.v1037SkillIcon{font-size:27px;line-height:1;margin:1px 0 6px}.v1037SkillName{font-weight:800;font-size:10.5px;line-height:1.15;min-height:24px;display:flex;align-items:center;justify-content:center;color:#eee2c8;overflow-wrap:anywhere}.v1037SkillLevel{font-family:Georgia,serif;color:#efc86f;font-weight:700;font-size:11px;margin-top:3px}.v1037SkillGroup{font-size:6.5px;text-transform:uppercase;letter-spacing:.08em;color:#8f836f;margin-top:3px}
.v1037SkillProgress{position:absolute;left:0;right:0;bottom:0;height:5px;background:#2c241b}.v1037SkillProgress i{display:block;height:100%;background:linear-gradient(90deg,#9d7030,#e0b65f);box-shadow:0 0 9px #d09c4560}
.v1037SkillModal{max-width:430px}.v1037SkillHero{display:flex;align-items:center;gap:13px}.v1037SkillHeroIcon{width:66px;height:66px;flex:0 0 66px;display:grid;place-items:center;font-size:38px;border-radius:18px;border:1px solid #665035;background:radial-gradient(circle at 40% 30%,#33281a,#1c1711);box-shadow:0 0 20px #d5a35112 inset}.v1037SkillHero h2{margin:2px 0;color:#f0d99f}.v1037HeroLevel{font-family:Georgia,serif;color:#d8b163;font-size:14px;font-weight:700}.v1037SkillDesc{color:#c0b39d;font-size:12px;line-height:1.5;margin:14px 0}.v1037BigProgress{height:10px;border-radius:999px;background:#2c241b;overflow:hidden;border:1px solid #423527}.v1037BigProgress i{display:block;height:100%;background:linear-gradient(90deg,#996b2d,#e8bd66);box-shadow:0 0 12px #d5a04b66}.v1037ProgressLine{display:flex;justify-content:space-between;gap:10px;margin:6px 1px 13px;font-size:8.5px;color:#9e917d}.v1037ProgressLine b{color:#d9bc7b}.v1037SkillStats{margin-top:0}.v1037MasteryNotice{margin-top:12px}
@media(max-width:370px){.v1037SkillGrid{gap:6px}.v1037SkillTile{min-height:103px;padding-left:5px;padding-right:5px}.v1037SkillName{font-size:9.5px}.v1037SkillLevel{font-size:10px}.v1037SkillGroup{font-size:6px}}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
