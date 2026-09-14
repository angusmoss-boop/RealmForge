window.RF = window.RF || {};
RF.VERSION = '8.1.0';

/* Realmforge V8.1 — Combat & Cadence Patch
   - exact 2 second combat recovery with clean expiry
   - deeper Attack / Strength / Defence combat identities
   - more player and enemy techniques
   - once-per-battle special attack
   - butchered active work resets progress to zero
*/

RF.V8 = RF.V8 || {};
RF.V8.actionCooldowns = RF.V8.actionCooldowns || {};
RF.V8.actionCooldowns.combat = 2000;

RF.migrateV81=function(s){
  if(!s)return s;
  s.version='8.1.0';
  s.stats=s.stats||{};
  if(s.stats.specialAttacks==null)s.stats.specialAttacks=0;
  if(s.stats.guardActions==null)s.stats.guardActions=0;
  if(s.combat){
    s.combat.specialUsed=!!s.combat.specialUsed;
    if((s.combat.v8CooldownUntil||0)<=Date.now())s.combat.v8CooldownUntil=0;
  }
  return s;
};
const v81NewGameBase=RF.newGame; RF.newGame=function(...a){return RF.migrateV81(v81NewGameBase(...a));};
const v81LoadBase=RF.load; RF.load=function(){return RF.migrateV81(v81LoadBase());};
const v81ImportBase=RF.importSave; RF.importSave=function(x){return RF.migrateV81(v81ImportBase(x));};
if(RF.state)RF.migrateV81(RF.state);

// ---------- Combat identity ----------
// Defence now contributes directly to effective armour, so levelling it is useful even without pressing Guard.
const v81ArmorBase=RF.armor;
RF.armor=function(s){
  const base=v81ArmorBase(s);
  const defence=s?.skills?.defence?.level||1;
  return base+Math.floor(defence*.38);
};

Object.assign(RF.DATA.abilities,{
  feint:{name:'Feint',icon:'🌀',level:2,skill:'attack',desc:'A deceptive opening that Exposes the enemy for 2 turns.',cost:7,cooldown:2,kind:'status',targetStatus:{id:'exposed',turns:2}},
  brace:{name:'Brace',icon:'🛡️',level:2,skill:'defence',desc:'Set your feet, guard the next blow and recover a little stamina.',cost:0,cooldown:1,kind:'guard',v81Stamina:8},
  cleave:{name:'Cleave',icon:'🪓',level:5,skill:'strength',desc:'A broad, forceful cut. Stronger than Strike but less accurate.',cost:12,cooldown:1,kind:'attack',power:1.38,accuracy:.84},
  shield_bash:{name:'Shield Bash',icon:'💢',level:6,skill:'defence',desc:'A compact defensive strike with a good chance to Stagger.',cost:12,cooldown:2,kind:'attack',power:.92,accuracy:.94,status:{id:'stagger',chance:.48,turns:1}},
  sunder:{name:'Sundering Swing',icon:'⚒️',level:8,skill:'strength',desc:'Drive through armour and leave it Broken.',cost:20,cooldown:3,kind:'attack',power:1.48,accuracy:.80,status:{id:'broken_armor',chance:.82,turns:3}},
  tactical_cut:{name:'Tactical Cut',icon:'♟️',level:9,skill:'attack',desc:'A controlled hit that can Weaken an enemy’s next attacks.',cost:15,cooldown:2,kind:'attack',power:1.15,accuracy:.97,status:{id:'weakened',chance:.62,turns:2}},
  iron_wall:{name:'Iron Wall',icon:'🧱',level:10,skill:'defence',desc:'Guard while forcing the enemy into a weakened attack.',cost:15,cooldown:4,kind:'guard',v81WeakenEnemy:true},
  executioner:{name:'Executioner',icon:'⚔️',level:12,skill:'attack',desc:'A precise finishing strike that becomes brutal against wounded enemies.',cost:22,cooldown:3,kind:'attack',power:1.34,accuracy:.92,v81Execute:true},
  reckless:{name:'Reckless Blow',icon:'☄️',level:13,skill:'strength',desc:'Enormous force, poor accuracy. A hit can Stagger; a miss wastes the opening.',cost:27,cooldown:3,kind:'attack',power:2.15,accuracy:.62,status:{id:'stagger',chance:.5,turns:1}},
  adrenaline_break:{name:'Adrenaline Break',icon:'🌟',level:4,desc:'SPECIAL • Once per battle. A committed attack scaling from Attack and Strength.',cost:0,cooldown:99,kind:'attack',power:2.28,accuracy:.94,crit:.22,oncePerBattle:true,special:true}
});

// Execute gains its advertised finishing bonus.
const v81DamageBase=RF.playerAttackDamage;
RF.playerAttackDamage=function(s,a,magic=false){
  let r=v81DamageBase(s,a,magic);
  if(a?.v81Execute && s.combat && s.combat.hp/s.combat.maxHp<=.32)r.dmg=Math.max(1,Math.round(r.dmg*1.65));
  if(a?.special){
    const atk=s.skills.attack.level||1,str=s.skills.strength.level||1;
    r.dmg=Math.max(1,Math.round(r.dmg*(1+Math.min(.22,(atk+str)/500))));
  }
  return r;
};

// V8 wrapped battleAbility with cadence. Keep that machinery, but validate first,
// enforce once-per-battle specials, and award XP to the combat skill that actually did the work.
const v81BattleAbilityBase=RF.battleAbility;
RF.battleAbility=function(id){
  const s=RF.state,c=s?.combat,a=RF.DATA.abilities[id];
  if(!s||!c||c.phase!=='player'||!a)return;
  if((c.v8CooldownUntil||0)>Date.now()){RF.animateDenied('.abilityGrid');return;}
  if(!RF.unlockedAbilities(s).some(x=>x.id===id))return;
  if((c.cooldowns[id]||0)>0||s.player.stamina<a.cost)return;
  if(a.oncePerBattle&&c.specialUsed){RF.animateDenied(`[data-ability="${id}"]`);return;}

  if(a.oncePerBattle){c.specialUsed=true;s.stats.specialAttacks++;}
  const combatRef=c;
  const out=v81BattleAbilityBase(id);

  // Supplemental XP creates distinct Attack / Strength / Defence growth without taking away existing XP.
  if(id==='attack'){
    RF.addXp(s,'strength',6);
  }else if(['precision','bleeding_cut','feint','tactical_cut','executioner'].includes(id)){
    RF.addXp(s,'strength',3);
  }else if(['power','cleave','sunder','crushing_blow','reckless'].includes(id)){
    RF.addXp(s,'attack',6);
  }else if(['guard','brace','riposte','iron_wall'].includes(id)){
    RF.addXp(s,'defence',id==='iron_wall'?14:id==='riposte'?12:10);
    s.stats.guardActions++;
  }else if(id==='shield_bash'){
    RF.addXp(s,'strength',4);
  }else if(id==='adrenaline_break'){
    RF.addXp(s,'attack',14);RF.addXp(s,'strength',14);
  }

  // Additional supported effects run before the delayed enemy turn fires.
  if(RF.state?.combat===combatRef){
    if(a.v81Stamina)s.player.stamina=Math.min(s.player.maxStamina,s.player.stamina+a.v81Stamina);
    if(a.v81WeakenEnemy)RF.addStatus({statuses:combatRef.enemyStatuses},'weakened',2);
    RF.save(s);RF.UI.render(s);
  }
  return out;
};

// ---------- Enemy move expansion ----------
Object.assign(RF.DATA.enemyMoves,{
  lunge:{name:'Lunge',power:1.18,accuracy:.84},
  rend:{name:'Rend',power:.96,accuracy:.88,status:{id:'bleed',chance:.58,turns:3}},
  headbutt:{name:'Headbutt',power:.94,accuracy:.9,status:{id:'stagger',chance:.38,turns:1}},
  maul:{name:'Maul',power:1.48,accuracy:.7},
  feint:{name:'Feint',power:.55,accuracy:.97,status:{id:'exposed',chance:.72,turns:2}},
  war_cry:{name:'War Cry',kind:'buff',status:{id:'focused',turns:2}},
  shield_rush:{name:'Shield Rush',power:.82,accuracy:.9,status:{id:'stagger',chance:.42,turns:1}},
  tail_sweep:{name:'Tail Sweep',power:.9,accuracy:.91,status:{id:'weakened',chance:.5,turns:2}},
  crushing_bite:{name:'Crushing Bite',power:1.32,accuracy:.82,status:{id:'bleed',chance:.32,turns:2}},
  acid_spit:{name:'Acid Spit',power:.78,accuracy:.9,status:{id:'broken_armor',chance:.48,turns:2}},
  ember_breath:{name:'Ember Breath',power:1.03,accuracy:.86,status:{id:'burn',chance:.68,turns:3}},
  flame_pounce:{name:'Flame Pounce',power:1.28,accuracy:.82,status:{id:'burn',chance:.38,turns:2}},
  undertow:{name:'Undertow',power:.82,accuracy:.9,status:{id:'weakened',chance:.7,turns:2}},
  drowned_grip:{name:'Drowned Grip',power:1.08,accuracy:.88,status:{id:'stagger',chance:.35,turns:1}},
  stone_guard:{name:'Stone Guard',kind:'guard'},
  horn_charge:{name:'Horn Charge',power:1.45,accuracy:.74,status:{id:'stagger',chance:.4,turns:1}},
  skitter:{name:'Skitter',kind:'buff',status:{id:'focused',turns:2}},
  pincer:{name:'Pincer Crush',power:1.22,accuracy:.84},
  venom_spray:{name:'Venom Spray',power:.58,accuracy:.91,status:{id:'poison',chance:.7,turns:3}},
  royal_gaze:{name:'Royal Gaze',kind:'status',status:{id:'weakened',turns:3}},
  flood_call:{name:'Flood Call',power:.92,accuracy:.93,status:{id:'exposed',chance:.7,turns:2}},
  stone_beak:{name:'Stone Beak',power:1.52,accuracy:.79,status:{id:'broken_armor',chance:.5,turns:2}}
});
function v81AddMoves(id,moves){const e=RF.DATA.enemies[id];if(!e)return;e.moves=[...new Set([...(e.moves||[]),...moves])];}
v81AddMoves('rat',['lunge','feint']);
v81AddMoves('wolf',['rend','lunge','war_cry']);
v81AddMoves('bandit',['lunge','feint','shield_rush']);
v81AddMoves('brute',['headbutt','maul','war_cry']);
v81AddMoves('cave_spider',['venom_spray','skitter']);
v81AddMoves('blackthorn_scout',['feint','lunge']);
v81AddMoves('captain_voss',['shield_rush','feint','war_cry']);
v81AddMoves('skeleton',['lunge','rend','brace']);
v81AddMoves('crypt_guard',['shield_rush','stone_guard','rend']);
v81AddMoves('gravewarden',['stone_guard','royal_gaze','drowned_grip']);
v81AddMoves('ridge_raider',['lunge','rend','war_cry']);
v81AddMoves('magma_crawler',['ember_breath','tail_sweep']);
v81AddMoves('meadow_boar',['headbutt','maul']);
v81AddMoves('thorn_adder',['venom_spray','lunge']);
v81AddMoves('feral_hound',['rend','war_cry']);
v81AddMoves('hill_troll',['maul','headbutt','war_cry']);
v81AddMoves('ash_wisp',['ember_breath','drift']);
v81AddMoves('mudcrab',['pincer','stone_guard']);
v81AddMoves('bog_spider',['venom_spray','skitter','web']);
v81AddMoves('mire_wolf',['rend','lunge','war_cry']);
v81AddMoves('fen_croc',['crushing_bite','tail_sweep','undertow']);
v81AddMoves('lantern_wisp',['feint','drift','hex']);
v81AddMoves('drowned_sentinel',['drowned_grip','undertow','stone_guard']);
v81AddMoves('marsh_raider',['feint','lunge','shield_rush']);
v81AddMoves('heron_keeper',['stone_beak','flood_call','royal_gaze','stone_guard']);
v81AddMoves('rogue_stag',['horn_charge','hoof_feint']);
v81AddMoves('quarry_drake',['tail_sweep','acid_spit','stone_guard']);
v81AddMoves('ember_hound',['flame_pounce','ember_breath','rend']);

// ---------- Exact cooldown expiry ----------
// V8's old ticker stopped before doing a final ready-state render. This one explicitly
// zeroes expired timers and renders once more, preventing the UI sticking at 0.1s.
if(RF.v8ActionTicker){clearTimeout(RF.v8ActionTicker);RF.v8ActionTicker=null;}
RF.cooldownRemaining=function(g){
  if(!g)return 0;
  const rem=(g.v8CooldownUntil||0)-Date.now();
  if(rem<=25){g.v8CooldownUntil=0;return 0;}
  return rem;
};
RF.ensureCooldownTicker=function(){
  if(RF.v8ActionTicker)return;
  const tick=()=>{
    RF.v8ActionTicker=null;
    const s=RF.state;if(!s)return;
    const g=RF.actionGame,c=s.combat;
    const grem=g?RF.cooldownRemaining(g):0;
    let crem=0;
    if(c){crem=Math.max(0,(c.v8CooldownUntil||0)-Date.now());if(crem<=25){c.v8CooldownUntil=0;crem=0;}}
    RF.UI.render(s);
    if(grem>0||crem>0)RF.v8ActionTicker=setTimeout(tick,50);
  };
  RF.v8ActionTicker=setTimeout(tick,50);
};
RF.combatReady=function(){
  const c=RF.state?.combat;if(!c)return false;
  const now=Date.now(),until=c.v8CooldownUntil||0;
  if(until>now+25){RF.animateDenied('.abilityGrid');return false;}
  c.v8CooldownUntil=now+2000;
  c.v8CooldownMs=2000;
  RF.state.stats.cooldownActions++;
  RF.ensureCooldownTicker();
  return true;
};

// ---------- Butchered actions reset progress ----------
function resetOnFreshMishap(name,check){
  const base=RF[name];if(typeof base!=='function')return;
  RF[name]=function(...args){
    const g=RF.actionGame,beforeLast=g?.last,beforeMsg=g?.message;
    const out=base.apply(RF,args);
    const now=RF.actionGame;
    if(now&&check(now,beforeLast,beforeMsg)){
      now.progress=0;
      const field='last' in now?'last':'message';
      now[field]=`${now[field]} Progress reset to 0%.`;
      RF.save(RF.state);RF.UI.render(RF.state);
    }
    return out;
  };
}
resetOnFreshMishap('workTap',(g,last)=>g.type==='work'&&g.mishap&&g.last!==last&&/BUTCHERED/.test(g.last||''));
resetOnFreshMishap('productionTap',(g,last)=>g.type==='production'&&g.mishap&&g.last!==last&&/BUTCHERED/.test(g.last||''));
resetOnFreshMishap('hammerForge',(g,last,msg)=>g.type==='forge'&&g.message!==msg&&/workpiece cracks|Material is lost/i.test(g.message||''));

// ---------- UI polish ----------
const v81CombatPopupBase=RF.UI.combatPopup.bind(RF.UI);
RF.UI.combatPopup=function(s){
  let h=v81CombatPopupBase(s),c=s.combat;
  // Never display an expired cooldown, even if a render lands exactly on the boundary.
  if(c&&(c.v8CooldownUntil||0)<=Date.now()+25)c.v8CooldownUntil=0;
  if(RF.DATA.abilities.adrenaline_break){
    h=h.replace('class="abilityBtn ', 'class="abilityBtn '); // harmless anchor for older saves/builds
    h=h.replace(/<button class="abilityBtn ([^"]*)" data-ability="adrenaline_break"/,
      `<button class="abilityBtn $1 specialAbility" data-ability="adrenaline_break"`);
    if(c?.specialUsed){
      h=h.replace(/<button class="abilityBtn ([^"]*)specialAbility([^"]*)" data-ability="adrenaline_break"(?! disabled)/,
        `<button disabled class="abilityBtn $1specialAbility$2" data-ability="adrenaline_break"`);
      h=h.replace('SPECIAL • Once per battle. A committed attack scaling from Attack and Strength.','SPECIAL USED • Available again next battle.');
    }
  }
  return h;
};

// Version notice once on this build.
if(RF.state){
  RF.migrateV81(RF.state);
  if(!RF.state.flags.v81PatchSeen){
    RF.state.flags.v81PatchSeen=true;
    RF.log(RF.state,'V8.1 combat patch: deeper combat skills, expanded move pools, exact 2s recovery and progress-reset mishaps are active.','important');
    RF.save(RF.state);
  }
  RF.UI.render(RF.state);
}
