window.RF=window.RF||{};
RF.VERSION='10.35.0';
RF.BUILD={
  version:'10.35.0',
  title:'Battle Lines',
  built:'16 Sep 2026 • 02:38 BST',
  buildId:'20260916-0238-bst'
};
RF.V1035=RF.V1035||{};

/* Realmforge V10.35 — Battle Lines
   - Rebuilds the tactical combat popup for a compact phone-first layout.
   - Player and enemy now face each other side by side, player left / enemy right.
   - Combat actions and usable items are compact 3-column tile grids.
   - Combat training focus persists between battles instead of resetting to Attack.
*/

(()=>{
const V=RF.V1035;
V.FOCI=['attack','strength','defence'];

V.validFocus=f=>V.FOCI.includes(f)?f:'attack';
V.migrate=function(s){
  if(!s)return s;
  s.version='10.35.0';
  s.v1035=s.v1035||{};
  // If the update lands during a battle, preserve what the player is using right now.
  const live=s.combat?.v9Focus;
  s.v1035.combatFocus=V.validFocus(live||s.v1035.combatFocus||s.v9?.combatFocus||'attack');
  s.v9=s.v9||{};
  s.v9.combatFocus=s.v1035.combatFocus;
  if(s.combat)s.combat.v9Focus=s.v1035.combatFocus;
  return s;
};

const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.35.0';
  const oldMig=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(oldMig(s));
}

// Persist the chosen training focus immediately. V9 originally stored this only on the
// temporary combat object, which disappears at the end of every fight.
const focusBase=RF.v9SetFocus;
RF.v9SetFocus=function(f){
  f=V.validFocus(f);
  const s=RF.state;
  if(s){
    s.v1035=s.v1035||{};s.v1035.combatFocus=f;
    s.v9=s.v9||{};s.v9.combatFocus=f;
  }
  const out=focusBase?.call(RF,f);
  if(s?.combat)s.combat.v9Focus=f;
  RF.save?.(s);
  return out;
};

// Every new battle inherits the last selected focus. Do this after the full older startBattle
// chain has initialised combat so old V9's default-to-Attack cannot overwrite it.
const startBase=RF.startBattle;
RF.startBattle=function(id,opts={}){
  const s=RF.state;
  const wanted=V.validFocus(s?.v1035?.combatFocus||s?.v9?.combatFocus||'attack');
  const out=startBase?.apply(this,arguments);
  if(RF.state?.combat){
    RF.state.combat.v9Focus=wanted;
    RF.state.v1035=RF.state.v1035||{};RF.state.v1035.combatFocus=wanted;
    RF.state.v9=RF.state.v9||{};RF.state.v9.combatFocus=wanted;
    RF.save?.(RF.state);
    RF.UI.render?.(RF.state);
  }
  return out;
};

V.statuses=t=>(t||[]).map(x=>`<span class="statusChip ${x.id}">${RF.statusName(x.id)} ${x.turns}</span>`).join('');
V.usableItems=s=>Object.entries(s.inventory||{}).filter(([id,q])=>q>0&&RF.DATA.items[id]&&(RF.DATA.items[id].heal||RF.DATA.items[id].stamina)).map(([id,q])=>({id,q,it:RF.DATA.items[id]}));
V.hpPct=(n,max)=>Math.max(0,Math.min(100,100*n/Math.max(1,max)));

// Final combat renderer. It deliberately keeps the established playerPane/enemyPane,
// abilityBtn and data-* hooks so hit animations, cooldowns and all existing battle logic remain intact.
RF.UI.combatPopup=function(s){
  const c=s.combat;if(!c)return'';
  const e=RF.DATA.enemies[c.id];if(!e)return'';
  const statuses=V.statuses;
  const abilities=RF.unlockedAbilities(s);
  const items=V.usableItems(s);
  const focus=V.validFocus(c.v9Focus||s.v1035?.combatFocus||s.v9?.combatFocus||'attack');
  const pool=c.v9XpPool||{attack:0,strength:0,defence:0};
  const rem=Math.max(0,(c.v8CooldownUntil||0)-Date.now());
  const globallyLocked=c.phase!=='player'||rem>20;
  const def=s.skills.defence?.level||1;
  const parryChance=Math.round(Math.min(.88,.32+def*.022+(s.skills.attack?.level||1)*.0035)*100);
  const parryReflect=Math.round(Math.min(.72,.16+def*.021)*100);
  const companion=s.companion?`<div class="v1035Companion">${RF.DATA.npcs[s.companion.id]?.icon||'🧭'} ${RF.DATA.npcs[s.companion.id]?.name||'Companion'} • Bond ${s.companion.bond}</div>`:'';

  const actionTiles=abilities.map(a=>{
    const cd=c.cooldowns[a.id]||0;
    const used=!!(a.oncePerBattle&&c.specialUsed);
    const disabled=globallyLocked||s.player.stamina<a.cost||cd>0||used;
    const cost=a.cost?`${a.cost} STA`:'FREE';
    const note=used?'USED':cd?`CD ${cd}`:cost;
    return `<button class="v1035ActionTile abilityBtn ${a.id==='attack'?'primary':''} ${a.special?'specialAbility':''}" data-ability="${a.id}" ${disabled?'disabled':''}><span class="v1035TileIcon">${a.icon}</span><b>${a.name}</b><small>${note}</small></button>`;
  }).join('')+
  `<button class="v1035ActionTile abilityBtn v1035Parry" data-parry ${globallyLocked?'disabled':''}><span class="v1035TileIcon">🛡️</span><b>Parry</b><small>~${parryChance}% catch</small></button>`+
  `<button class="v1035ActionTile v1035Flee" data-v4-flee ${globallyLocked?'disabled':''}><span class="v1035TileIcon">🏃</span><b>Flee</b><small>Attempt escape</small></button>`;

  const itemTiles=items.map(({id,q,it})=>{
    let effect=[];if(it.heal)effect.push(`+${it.heal} HP`);if(it.stamina)effect.push(`+${it.stamina} STA`);
    return `<button class="v1035ItemTile" data-battle-item="${id}" ${globallyLocked?'disabled':''}><span class="v1035TileIcon">${it.icon}</span><b>${it.name}</b><small>×${q}${effect.length?` • ${effect.join(' / ')}`:''}</small></button>`;
  }).join('');

  return `<div class="modalBack battleBack v1035BattleBack"><div class="modal battleModal v1035BattleModal">
    <div class="v1035BattleTop"><span class="eyebrow">TACTICAL BATTLE • TURN ${c.turn}</span><span class="phaseTag">${c.phase==='player'?'YOUR TURN':'ENEMY TURN'}</span></div>
    <div class="v1035Faceoff">
      <div class="playerPane v1035Fighter v1035Player">
        <div class="v1035FighterHead"><span class="v1035Portrait">${s.player.avatar}</span><div><b>${s.player.name}</b><small>Lv ${s.player.level}</small></div></div>
        <div class="v1035HpLine"><span>HP</span><b>${Math.max(0,Math.ceil(s.player.hp))}/${s.player.maxHp}</b></div>
        <div class="bar"><div class="fill hp" style="width:${V.hpPct(s.player.hp,s.player.maxHp)}%"></div></div>
        <div class="v1035Resource">⚡ ${Math.floor(s.player.stamina)}/${s.player.maxStamina} STA</div>
        <div class="statusRow">${statuses(c.playerStatuses)}</div>${companion}
      </div>
      <div class="v1035Vs">⚔️</div>
      <div class="enemyPane v1035Fighter v1035Enemy">
        <div class="v1035FighterHead enemy"><span class="v1035Portrait">${e.icon}</span><div><b>${e.name}</b><small>Lv ${e.level} • ${e.temperament||'hostile'}</small></div></div>
        <div class="v1035HpLine"><span>HP</span><b>${Math.max(0,Math.ceil(c.hp))}/${c.maxHp}</b></div>
        <div class="bar"><div class="fill hp" style="width:${V.hpPct(c.hp,c.maxHp)}%"></div></div>
        <div class="v1035Resource">🛡️ ${e.armor||0} ARMOUR</div>
        <div class="statusRow">${statuses(c.enemyStatuses)}</div>
      </div>
    </div>
    <div class="battleLog v1035BattleLog">${c.log.map(x=>`<div class="${x.type||''}">${typeof x==='string'?x:x.text}</div>`).join('')}</div>
    <div class="combatFocus v1035Focus"><div class="v1035SectionHead"><span class="eyebrow">COMBAT TRAINING</span><span>${RF.DATA.skills[focus]?.icon||'⚔️'} ${RF.DATA.skills[focus]?.name||focus}</span></div><div class="focusBtns">${V.FOCI.map(f=>`<button data-combat-focus="${f}" class="${focus===f?'active':''}" ${c.phase!=='player'?'disabled':''}>${RF.DATA.skills[f].icon} ${RF.DATA.skills[f].name}<small>${Math.round(pool[f]||0)} XP</small></button>`).join('')}</div></div>
    ${rem>20?`<div class="v1035Recover">Recovering ${(rem/1000).toFixed(1)}s</div>`:''}
    <div class="battleSectionTitle v1035SectionTitle">Actions</div>
    <div class="v1035ActionGrid">${actionTiles}</div>
    ${items.length?`<div class="battleSectionTitle v1035SectionTitle">Items</div><div class="v1035ItemGrid">${itemTiles}</div>`:''}
    <div class="v1035ParryNote">Parry: ~${parryChance}% catch chance • reflection scales with Defence (~${parryReflect}% of blocked force).</div>
  </div></div>`;
};

// CSS is injected here so the GitHub patch remains just the usual small JS layer.
const st=document.createElement('style');st.id='v1035-combat-style';st.textContent=`
.v1035BattleBack{padding:6px;align-items:center}
.v1035BattleModal{width:min(680px,calc(100vw - 12px));max-width:680px;max-height:97vh;padding:12px 12px calc(12px + env(safe-area-inset-bottom));overflow:auto}
.v1035BattleTop{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px}
.v1035Faceoff{display:grid;grid-template-columns:minmax(0,1fr) 24px minmax(0,1fr);gap:6px;align-items:stretch;margin-bottom:7px}
.v1035Fighter{min-width:0;padding:8px;border:1px solid #49392b;border-radius:12px;background:#14110ed9}
.v1035Player{border-color:#5b694d}.v1035Enemy{border-color:#6d4438}
.v1035FighterHead{display:flex;align-items:center;gap:7px;min-width:0;margin-bottom:6px}.v1035FighterHead.enemy{justify-content:flex-start}
.v1035Portrait{width:34px;height:34px;flex:0 0 34px;display:grid;place-items:center;border-radius:50%;font-size:22px;background:#211a13;border:1px solid #554230}
.v1035FighterHead div{min-width:0}.v1035FighterHead b{display:block;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#f0dfba}.v1035FighterHead small{display:block;font-size:8px;color:#9f9481;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.v1035HpLine{display:flex;justify-content:space-between;gap:5px;font-size:8px;color:#948b7c;margin-bottom:3px}.v1035HpLine b{color:#dacbae;font-size:9px}
.v1035Faceoff .bar{height:7px}.v1035Resource{font-size:8px;color:#aaa08d;margin-top:4px}.v1035Faceoff .statusRow{margin-top:4px;min-height:0}.v1035Faceoff .statusChip{font-size:7px;padding:2px 4px}
.v1035Vs{display:grid;place-items:center;font-size:15px;opacity:.65}.v1035Companion{font-size:7px;color:#c8ad7c;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.v1035BattleLog{max-height:74px;margin:6px 0 7px;padding:6px;font-size:9px}.v1035BattleLog div{padding:2px 0}
.v1035Focus{margin:6px 0 7px;padding:7px}.v1035SectionHead{display:flex;align-items:center;justify-content:space-between;gap:7px;font-size:9px;color:#e5cc96}.v1035Focus .focusBtns{margin:5px 0 0;gap:5px}.v1035Focus .focusBtns button{min-height:45px;padding:5px 2px;font-size:9px}.v1035Focus .focusBtns small{font-size:7px}
.v1035SectionTitle{margin:8px 0 5px}
.v1035ActionGrid,.v1035ItemGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.v1035ActionTile,.v1035ItemTile{min-width:0;min-height:67px;border:1px solid #493d2f;background:#191611;color:#eadfc5;border-radius:12px;padding:7px 4px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;line-height:1.05}
.v1035ActionTile.primary{border-color:#a67536;background:#302416}.v1035ActionTile.specialAbility{border-color:#7d668e}.v1035Parry{border-color:#5f7f99!important}.v1035Flee{border-color:#6b4038;background:#241714}
.v1035ActionTile:active,.v1035ItemTile:active{transform:scale(.985)}.v1035ActionTile:disabled,.v1035ItemTile:disabled{opacity:.34;filter:grayscale(.45) saturate(.45);transform:none!important}
.v1035TileIcon{font-size:20px;line-height:1.1}.v1035ActionTile b,.v1035ItemTile b{font-size:9px;width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v1035ActionTile small,.v1035ItemTile small{font-size:7px;color:#9e9484;line-height:1.1;width:100%;overflow:hidden;text-overflow:ellipsis}
.v1035Recover{text-align:center;font-size:8px;color:#bfa977;margin:2px 0 4px}.v1035ParryNote{margin-top:7px;text-align:center;font-size:7px;color:#847b6e;line-height:1.3}
@media(max-width:390px){.v1035BattleModal{padding:9px}.v1035Faceoff{grid-template-columns:minmax(0,1fr) 18px minmax(0,1fr);gap:4px}.v1035Fighter{padding:6px}.v1035Portrait{width:30px;height:30px;flex-basis:30px;font-size:19px}.v1035ActionGrid,.v1035ItemGrid{grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}.v1035ActionTile,.v1035ItemTile{min-height:63px;padding:6px 3px}}
`;
document.head.appendChild(st);

if(RF.state){
  V.migrate(RF.state);
  RF.save?.(RF.state);
  setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0);
}
})();
