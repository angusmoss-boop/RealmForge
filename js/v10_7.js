/* Realmforge V10.7 — Teeth, Steel & Progression
   - Enemy outgoing damage scales meaningfully with enemy level.
   - Character tab shows Character Level progress and XP to next level.
   - Pack capacity grows with Character Level.
   - Enemy inspection shows a threat estimate against current armour.
*/
(function(){
'use strict';
const RF=window.RF;if(!RF)return;
RF.V107=RF.V107||{};RF.V107.version='10.7.0';

RF.migrateV107=function(s){
  if(!s)return s;
  s.version='10.7.0';
  return s;
};
const n0=RF.newGame;RF.newGame=function(...a){return RF.migrateV107(n0(...a))};
const l0=RF.load;RF.load=function(){return RF.migrateV107(l0())};
const i0=RF.importSave;RF.importSave=function(x){return RF.migrateV107(i0(x))};
if(RF.state)RF.migrateV107(RF.state);

// ---------- Character XP clarity ----------
// Existing character formula is: level = 1 + floor(sqrt(totalXP / 100)).
// Therefore level L starts at 100*(L-1)^2 and level L+1 starts at 100*L^2.
RF.characterXpFloor=function(level){level=Math.max(1,Math.min(100,level||1));return 100*Math.pow(level-1,2)};
RF.characterXpNext=function(level){level=Math.max(1,Math.min(100,level||1));return level>=100?RF.characterXpFloor(100):100*Math.pow(level,2)};
RF.characterProgress=function(s){
  const lv=s?.player?.level||1,xp=Math.max(0,s?.player?.xp||0),floor=RF.characterXpFloor(lv),next=RF.characterXpNext(lv);
  if(lv>=100)return {level:lv,xp,floor,next,into:xp-floor,need:0,pct:100};
  const span=Math.max(1,next-floor),into=Math.max(0,xp-floor),need=Math.max(0,next-xp);
  return {level:lv,xp,floor,next,into,need,pct:Math.max(0,Math.min(100,into/span*100))};
};

// ---------- Level-scaled inventory ----------
// Base 28 slots. +1 slot every 2 character levels after level 1.
// Lv 1: 28, Lv 10: 32, Lv 20: 37, Lv 50: 52, Lv 100: 77.
RF.packCapacity=function(s){
  const lv=Math.max(1,s?.player?.level||1);
  return 28+Math.floor((lv-1)/2);
};
RF.packFree=function(s){return Math.max(0,RF.packCapacity(s)-RF.packUsed(s))};

// V8.2 and later code reads RF.V82.PACK_CAP directly. Turn it into a live getter
// so every existing pack/bank/shop path automatically respects level scaling.
try{
  Object.defineProperty(RF.V82,'PACK_CAP',{configurable:true,enumerable:true,get(){return RF.packCapacity(RF.state)}});
}catch(_e){}

// ---------- Combat difficulty ----------
// Preserve authored identity while making enemy level consequential.
RF.v107EnemyDamageRange=function(enemy){
  const lv=Math.max(1,enemy?.level||1),base=enemy?.damage||[2,5];
  // Very low levels stay close to authored numbers. Pressure ramps after level 4.
  const scale=0.92+lv*0.05;
  const pressure=Math.max(0,lv-4)*0.30;
  return [
    Math.max(1,base[0]*scale+pressure),
    Math.max(2,base[1]*scale+pressure)
  ];
};

// Armour should noticeably matter once enemies begin hitting harder.
// This modifier only applies during enemy damage resolution and does not inflate
// the displayed armour stat.
const armorBase=RF.armor;
RF.armor=function(s){
  const value=armorBase(s);
  return RF.V107.enemyResolving?value*1.35:value;
};

// Wrap the current integrated enemy turn (including parry/status/battle summary hooks)
// and temporarily provide the level-scaled damage range.
const enemyTurnBase=RF.enemyBattleTurn;
RF.enemyBattleTurn=function(){
  const s=RF.state,c=s?.combat;
  if(!c)return enemyTurnBase.apply(this,arguments);
  const enemy=RF.DATA.enemies[c.id];
  if(!enemy)return enemyTurnBase.apply(this,arguments);
  const original=enemy.damage;
  enemy.damage=RF.v107EnemyDamageRange(enemy);
  RF.V107.enemyResolving=true;
  try{return enemyTurnBase.apply(this,arguments)}
  finally{RF.V107.enemyResolving=false;enemy.damage=original}
};

RF.v107Threat=function(s,e){
  const armour=armorBase(s)||0,r=RF.v107EnemyDamageRange(e),mitigation=armour*.32*1.35;
  const lo=Math.max(1,Math.round(r[0]-mitigation)),hi=Math.max(1,Math.round(r[1]-mitigation));
  const avg=(lo+hi)/2,hits=(s.player.maxHp||100)/Math.max(1,avg);
  let name='Low';
  if(hits<2.8)name='Extreme';
  else if(hits<4)name='Severe';
  else if(hits<5.5)name='High';
  else if(hits<8)name='Moderate';
  return {name,range:[lo,hi]};
};

// ---------- UI ----------
const charBase=RF.UI.character.bind(RF.UI);
RF.UI.character=function(s){
  let h=charBase(s),p=RF.characterProgress(s),cap=RF.packCapacity(s),used=RF.packUsed(s);
  const header=`<section class="card v107LevelCard"><div class="questTitle"><div><span class="eyebrow">CHARACTER PROGRESSION</span><h2>Level ${p.level}</h2></div><div class="v107LevelBadge">${p.level>=100?'MAX':`${p.need.toLocaleString()} XP to next`}</div></div><div class="v107XpBar"><div style="width:${p.pct}%"></div></div><div class="sub">${p.level>=100?`${p.xp.toLocaleString()} total Character XP • Maximum level reached`:`${p.into.toLocaleString()} / ${(p.next-p.floor).toLocaleString()} XP through Level ${p.level} • ${p.xp.toLocaleString()} total XP`}</div><div class="v107PackLine">🎒 Pack capacity <b>${used}/${cap}</b> slots <span>• +1 slot every 2 Character Levels</span></div></section>`;
  return header+h;
};

const modalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  let h=modalBase(s),m=this.modal;
  if(m?.type==='enemyInspect'&&m.id&&RF.DATA.enemies[m.id]){
    const e=RF.DATA.enemies[m.id],t=RF.v107Threat(s,e);
    const badge=`<div class="v107Threat"><b>⚠️ ${t.name} threat</b><span>Estimated ordinary hit against your current armour: ${t.range[0]}–${t.range[1]}</span></div>`;
    h=h.replace('<div class="choices">',badge+'<div class="choices">');
  }
  return h;
};

if(!document.getElementById('rf-v107-style')){
  const st=document.createElement('style');st.id='rf-v107-style';st.textContent=`
    .v107LevelCard h2{margin:2px 0 0}.v107LevelBadge{font-size:12px;font-weight:800;color:#e7c57d;text-align:right}
    .v107XpBar{height:10px;border-radius:999px;background:#17130e;border:1px solid #51432f;overflow:hidden;margin:12px 0 8px}
    .v107XpBar>div{height:100%;background:linear-gradient(90deg,#9d6c2c,#e0b15b);transition:width .25s ease}
    .v107PackLine{margin-top:10px;padding-top:9px;border-top:1px solid #403629;color:#cfc1a7;font-size:12px}.v107PackLine span{color:#8f8371}
    .v107Threat{margin:10px 0;padding:10px 12px;border:1px solid #665031;border-radius:12px;background:#211a12}.v107Threat b,.v107Threat span{display:block}.v107Threat b{color:#e7c57d}.v107Threat span{font-size:12px;color:#b9aa91;margin-top:3px}
  `;document.head.appendChild(st);
}

if(RF.state){RF.migrateV107(RF.state);RF.save(RF.state);RF.UI.render(RF.state)}
})();
