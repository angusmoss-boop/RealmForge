/* Realmforge V11.11.0 — Canonical Dungeon implementation.
   Mature V11.0 gauntlet behaviour moved out of the compatibility runtime.
   Installed at the original V11.0 execution point; V11.3/V11.4 historical enrichments continue to target RF.V1062. */
(() => {
  'use strict';
  const RF=window.RF;
  let installed=false;
  function installHistoricalV1062() {
    if(installed) return RF.V1062;
    installed=true;
    RF.V1062=RF.V1062||{};
    const V=RF.V1062;
    V.version='11.0.0';
    V.WAVES=8;
    V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

    // New dungeon bosses and reward gear. Equipment requirements remain derived from the same
    // global item-requirement rules as every other piece of gear, so old/new characters stay aligned.
    Object.assign(RF.DATA.items,{
      regent_falchion:{name:'Regent Falchion',icon:'🗡️',type:'weapon',slot:'main',value:445,damage:14,armor:3,rarity:'Epic',desc:'A pale hooked blade taken from the ruler of the lower crypt. +14 damage • +3 armour.'},
      bonewall_buckler:{name:'Bonewall Buckler',icon:'🛡️',type:'armor',slot:'off',value:390,damage:2,armor:8,rarity:'Rare',desc:'Layered grave-iron and ossified plate. +2 damage • +8 armour.'},
      ossuary_coif:{name:'Ossuary Coif',icon:'💀',type:'armor',slot:'head',value:335,damage:2,armor:7,rarity:'Rare',desc:'A funerary helm reinforced with blackened chain. +2 damage • +7 armour.'},
      tombwarden_greaves:{name:'Tombwarden Greaves',icon:'👖',type:'armor',slot:'legs',value:360,damage:2,armor:8,rarity:'Rare',desc:'Heavy greaves engraved with the split-crown seal. +2 damage • +8 armour.'},

      cindermaw_blade:{name:'Cindermaw Blade',icon:'🔥',type:'weapon',slot:'main',value:690,damage:19,armor:4,rarity:'Epic',desc:'A volcanic greatblade whose edge glows after a hard strike. +19 damage • +4 armour.'},
      emberplate_cuirass:{name:'Emberplate Cuirass',icon:'🛡️',type:'armor',slot:'chest',value:735,damage:3,armor:13,rarity:'Epic',desc:'Interlocking forge-plate cooled in mineral steam. +3 damage • +13 armour.'},
      magma_guard:{name:'Magma Guard',icon:'🔰',type:'armor',slot:'off',value:575,damage:4,armor:10,rarity:'Rare',desc:'A heat-scarred shield built from dense Emberdeep slag-steel. +4 damage • +10 armour.'},
      cinderstep_boots:{name:'Cinderstep Boots',icon:'🥾',type:'armor',slot:'boots',value:520,damage:3,armor:9,rarity:'Rare',desc:'Forge boots insulated for cracked lava shelves. +3 damage • +9 armour.'}
    });

    Object.assign(RF.DATA.enemies,{
      ossuary_regent:{name:'Ossuary Regent',icon:'☠️',level:12,hp:305,damage:[14,25],armor:9,xp:860,gold:[115,175],temperament:'boss',moves:['stone_guard','royal_gaze','rend','drowned_grip'],drops:[['crypt_sigil',1,1],['steel_bar',.45,1]],desc:'An ancient grave-lord clad in layered remains and crown-marked iron.'},
      cindermaw_tyrant:{name:'Cindermaw Tyrant',icon:'🐲',level:17,hp:380,damage:[17,30],armor:11,xp:1260,gold:[150,235],temperament:'boss',moves:['ember_breath','flame_pounce','tail_sweep','war_cry'],drops:[['ember_shard',1,2],['steel_bar',.5,1]],desc:'A furnace-scaled predator that has claimed the deepest stable chambers of Emberdeep.'}
    });

    V.DUNGEONS=RF.Config.clone("dungeons.base");

    // The V3 locations are the game's two explicit delve/dungeon locations. The old Delve action
    // is retired from their action rows so the new dedicated Dungeon card owns this interaction.
    Object.keys(V.DUNGEONS).forEach(id=>{
      const l=RF.DATA.locations?.[id];if(!l)return;
      l.dungeon=true;
      if(Array.isArray(l.actions))l.actions=l.actions.filter(a=>a!=='delve');
    });
    if(RF.V94?.bossHomes){RF.V94.bossHomes.ossuary_regent=['crypt'];RF.V94.bossHomes.cindermaw_tyrant=['ember_cave']}

    V.def=loc=>V.DUNGEONS[loc]||null;
    V.record=function(s,loc){s.v1062=s.v1062||{};s.v1062.records=s.v1062.records||{};return s.v1062.records[loc]||(s.v1062.records[loc]={attempts:0,clears:0,bestHp:null})};
    V.active=s=>s?.v1062?.active||null;
    V.isDungeonCombat=s=>!!(s?.combat?.v1062Dungeon&&V.active(s));
    V.clock=function(s){
      if(RF.V1026?.captureClock)return RF.V1026.captureClock(s);
      return {speed:+s?.speed||0,paused:!!s?.paused||(+s?.speed||0)===0,boostRemaining:0};
    };
    V.pause=function(s){if(!s)return;s.speed=0;s.paused=true;if(s.v8)s.v8.boostUntil=0};
    V.restoreClock=function(s,clock){
      if(!s||!clock||RF.isOverEncumbered?.(s))return V.pause(s);
      if(RF.V1026?.restoreClock)return RF.V1026.restoreClock(s,clock);
      s.speed=clock.paused?0:(clock.speed||1);s.paused=s.speed===0;
    };
    V.random=function(seed){
      if(RF.seedHash&&RF.seedRand)return RF.seedRand(RF.seedHash(seed));
      let x=0;for(let i=0;i<seed.length;i++)x=(Math.imul(x,31)+seed.charCodeAt(i))>>>0;
      return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296};
    };
    V.sequence=function(s,loc,attempt){
      const d=V.def(loc),bag=[];d.pool.forEach(([id,w])=>{if(RF.DATA.enemies[id])for(let i=0;i<w;i++)bag.push(id)});
      const rnd=V.random(`${s?.seed||'rf'}|dungeon|${loc}|${s?.day||1}|${attempt}|${Date.now()}`),out=[];
      for(let i=0;i<V.WAVES;i++){
        let pick=bag[Math.floor(rnd()*bag.length)]||d.pool[0][0];
        // Avoid three identical rooms in a row while keeping the sequence genuinely random.
        if(i>1&&out[i-1]===pick&&out[i-2]===pick){const alt=bag.filter(x=>x!==pick);if(alt.length)pick=alt[Math.floor(rnd()*alt.length)]}
        out.push(pick);
      }
      return out;
    };
    V.snapshot=function(s){
      return {gold:+s.gold||0,playerXp:+s.player?.xp||0,inventory:{...(s.inventory||{})},skills:Object.fromEntries(Object.entries(s.skills||{}).map(([id,x])=>[id,+x.xp||0])),hp:+s.player?.hp||0};
    };
    V.itemDiff=function(s,start){
      const out=[];Object.entries(s.inventory||{}).forEach(([id,q])=>{const n=(+q||0)-(+start.inventory?.[id]||0);if(n>0&&RF.DATA.items?.[id])out.push([id,n])});return out;
    };
    V.skillDiff=function(s,start){return Object.entries(s.skills||{}).map(([id,x])=>[id,(+x.xp||0)-(+start.skills?.[id]||0)]).filter(([,n])=>n>0)};
    V.siphonQueue=function(a){
      if(!a||!RF.V10?.queue?.length)return;
      a.pendingQueue=a.pendingQueue||[];a.pendingQueue.push(...RF.V10.queue.splice(0));
    };
    V.releaseQueue=function(a){if(a?.pendingQueue?.length&&RF.V10?.queue)RF.V10.queue.push(...a.pendingQueue)};
    V.identifyBoss=function(s,id){s.v7=s.v7||{};s.v7.research=s.v7.research||{};s.v7.research[id]={level:3,notes:0};};
    V.runLabel=function(a){if(!a)return'';return a.phase==='boss'||a.phase==='bossIntro'?'Boss':`Wave ${Math.max(1,Math.min(V.WAVES,+a.wave||1))}/${V.WAVES}`};

    V.open=function(){
      const s=RF.state,d=V.def(s?.location);if(!s||!d)return;
      if(s.combat||s.activity)return;
      if(RF.isOverEncumbered?.(s))return RF.V1056?.warn?.(s,'Pack must be sorted before entering a dungeon');
      const a=V.active(s);
      RF.UI.modal={type:'v1062DungeonLobby',loc:s.location,resume:!!a&&a.loc===s.location};RF.UI.render(s);
    };
    V.start=function(loc){
      const s=RF.state,d=V.def(loc);if(!s||!d||s.location!==loc||s.combat||s.activity)return;
      if(RF.isOverEncumbered?.(s))return RF.V1056?.warn?.(s,'Pack must be sorted before entering a dungeon');
      const rec=V.record(s,loc);rec.attempts++;
      const clock=V.clock(s);
      const a={loc,wave:1,phase:'wave',sequence:V.sequence(s,loc,rec.attempts),startedDay:s.day,startedMinute:s.minute,clock,snapshot:V.snapshot(s),metrics:{turns:0,damageTaken:0,parries:0,perfectParries:0},pendingQueue:[],gearAwarded:[]};
      s.v1062.active=a;V.siphonQueue(a);V.pause(s);RF.UI.modal=null;RF.save?.(s);V.startWave(s);
    };
    V.startWave=function(s=RF.state){
      const a=V.active(s),d=a&&V.def(a.loc);if(!a||!d||s.combat)return;
      const idx=Math.max(0,Math.min(V.WAVES-1,(+a.wave||1)-1)),id=a.sequence[idx];
      a.phase='wave';V.pause(s);RF.UI.modal=null;RF.startBattle(id,{forced:true,dungeon:true});
      if(s.combat){s.combat.v1062Dungeon={loc:a.loc,wave:a.wave,boss:false};RF.save?.(s);RF.UI.render?.(s)}
    };
    V.showBoss=function(s=RF.state){
      const a=V.active(s),d=a&&V.def(a.loc);if(!a||!d)return;
      a.phase='bossIntro';V.identifyBoss(s,d.boss);V.pause(s);RF.UI.modal={type:'v1062BossIntro',loc:a.loc};RF.save?.(s);RF.UI.render(s);
    };
    V.startBoss=function(s=RF.state){
      const a=V.active(s),d=a&&V.def(a.loc);if(!a||!d||s.combat)return;
      a.phase='boss';V.pause(s);RF.UI.modal=null;RF.startBattle(d.boss,{forced:true,dungeon:true,boss:true});
      if(s.combat){s.combat.v1062Dungeon={loc:a.loc,wave:V.WAVES+1,boss:true};RF.save?.(s);RF.UI.render?.(s)}
    };
    V.addCompletionRewards=function(s,a){
      const d=V.def(a.loc),rec=V.record(s,a.loc),first=rec.clears===0,count=first?2:1;
      s.gold=(+s.gold||0)+d.bonusGold;s.stats=s.stats||{};s.stats.goldEarned=(s.stats.goldEarned||0)+d.bonusGold;
      RF.addPlayerXp?.(s,d.bonusXp);
      d.materials.forEach(([id,q])=>RF.addItem?.(s,id,q));
      const pool=[...d.rewards],rnd=V.random(`${s?.seed||'rf'}|reward|${a.loc}|${rec.clears}|${Date.now()}`);
      for(let i=0;i<count&&pool.length;i++){
        const n=Math.floor(rnd()*pool.length),id=pool.splice(n,1)[0];RF.addItem?.(s,id,1);a.gearAwarded.push(id);
      }
      rec.clears++;rec.bestHp=rec.bestHp==null?Math.ceil(s.player.hp):Math.max(rec.bestHp,Math.ceil(s.player.hp));
      s.stats.dungeonsCleared=(s.stats.dungeonsCleared||0)+1;s.flags=s.flags||{};s.flags[d.flag]=true;
      // Keep the legacy dungeon status objects meaningful for older UI/quests without changing loadouts.
      s.dungeons=s.dungeons||{};
      if(a.loc==='crypt'){s.dungeons.crypt=s.dungeons.crypt||{};s.dungeons.crypt.cleared=true}
      if(a.loc==='ember_cave'){s.dungeons.ember=s.dungeons.ember||{};s.dungeons.ember.cleared=true}
      V.siphonQueue(a);
    };
    V.finishBoss=function(s,a){
      V.addCompletionRewards(s,a);
      const start=a.snapshot,summary={
        loc:a.loc,gold:(+s.gold||0)-(+start.gold||0),playerXp:(+s.player?.xp||0)-(+start.playerXp||0),skills:V.skillDiff(s,start),loot:V.itemDiff(s,start),
        turns:a.metrics.turns||0,damageTaken:a.metrics.damageTaken||0,parries:a.metrics.parries||0,perfectParries:a.metrics.perfectParries||0,hpLeft:Math.ceil(s.player.hp),gear:[...(a.gearAwarded||[])]
      };
      a.summary=summary;a.phase='cleared';V.pause(s);RF.UI.modal={type:'v1062DungeonCleared',loc:a.loc};RF.save?.(s);RF.UI.render(s);
    };
    V.completeAndExit=function(){
      const s=RF.state,a=V.active(s);if(!s||!a)return;
      const clock=a.clock;V.releaseQueue(a);s.v1062.active=null;RF.UI.modal=null;V.restoreClock(s,clock);RF.save?.(s);RF.UI.render(s);
    };
    V.abandon=function(reason='The dungeon run ends here.'){
      const s=RF.state,a=V.active(s);if(!s||!a)return;
      const d=V.def(a.loc),clock=a.clock,progress=Math.max(0,(+a.wave||1)-1);V.releaseQueue(a);s.v1062.active=null;V.pause(s);s.v1062.resumeClock=clock;
      RF.UI.modal={type:'v1062DungeonAbandoned',name:d?.name||'Dungeon',progress,reason};RF.save?.(s);RF.UI.render(s);
    };
    V.closeAbandoned=function(){const s=RF.state,clock=s?.v1062?.resumeClock;if(s?.v1062)delete s.v1062.resumeClock;RF.UI.modal=null;V.restoreClock(s,clock);RF.save?.(s);RF.UI.render(s)};

    // Preserve all existing save/loadout state. V11.0 only adds dungeon records/active-run data.
    V.migrate=function(s){
      if(!s)return s;
      s.v1062=s.v1062||{};s.v1062.records=s.v1062.records||{};
      Object.keys(V.DUNGEONS).forEach(loc=>V.record(s,loc));
      s.version='11.0.0';
      return s;
    };
    /* V11.8: legacy save/migration wrapper extracted to canonical core. */

    // Legacy callers hitting the old Delve action are routed into the new dungeon lobby.
    const actionBase=RF.action;
    RF.action=function(a){if(a==='delve'&&V.def(RF.state?.location))return V.open();return actionBase.apply(this,arguments)};

    // Dedicated World card, matching Bank/Market as a physical location interaction.
    const worldBase=RF.UI.world.bind(RF.UI);
    RF.UI.world=function(s){
      let h=worldBase(s),d=V.def(s?.location);if(!d)return h;
      h=h.replace(/<section class="card v1062DungeonSection">[\s\S]*?<\/section>/g,'');
      const rec=V.record(s,s.location),a=V.active(s),active=a?.loc===s.location;
      const status=active?`${V.runLabel(a)} in progress`:rec.clears?`${rec.clears} clear${rec.clears===1?'':'s'}`:'Uncleared';
      const disabled=(s.activity||s.combat)?'disabled':'';
      const section=`<section class="card v1062DungeonSection"><div class="questTitle"><h3>Dungeon</h3><span class="tag">LV ${d.level}</span></div><button class="action v1062DungeonButton" data-open-dungeon ${disabled}><span class="emoji">${d.icon}</span><b>${V.escape(d.name)}</b><small>${status} • 8 waves + boss</small></button></section>`;
      const market='<section class="card v1054MarketSection';const bank='<section class="card v1014BankSection';const travel='<section class="card"><h3>Travel</h3>';
      if(h.includes(market))h=h.replace(market,section+market);else if(h.includes(bank))h=h.replace(bank,section+bank);else if(h.includes(travel))h=h.replace(travel,section+travel);else h+=section;
      return h;
    };

    // Live wave readout inside the fixed V10.60 combat frame.
    const combatBase=RF.UI.combatPopup.bind(RF.UI);
    RF.UI.combatPopup=function(s){
      let h=combatBase(s),a=V.active(s);if(!h||!a||!s?.combat?.v1062Dungeon)return h;
      const d=V.def(a.loc),label=s.combat.v1062Dungeon.boss?'BOSS':`WAVE ${a.wave}/${V.WAVES}`;
      const strip=`<div class="v1062BattleProgress"><span>${d.icon} ${V.escape(d.name)}</span><b>${label}</b></div>`;
      return h.replace('<div class="v1035Faceoff">',strip+'<div class="v1035Faceoff">');
    };

    // Convert each ordinary battle victory into a dungeon interstitial instead of showing nine
    // separate battle summaries. The complete reward/XP picture is shown once after the boss.
    const winBase=RF.winCombat;
    RF.winCombat=function(){
      const s0=RF.state,c0=s0?.combat,a0=V.active(s0),dungeon=!!(a0&&c0?.v1062Dungeon&&a0.loc===c0.v1062Dungeon.loc),boss=!!c0?.v1062Dungeon?.boss;
      if(!dungeon)return winBase.apply(this,arguments);
      const out=winBase.apply(this,arguments),s=RF.state,a=V.active(s);if(!s||!a)return out;
      const bs=RF.UI.modal?.type==='v10BattleSummary'?RF.UI.modal:null;
      if(bs){a.metrics.turns+=(+bs.turns||0);a.metrics.damageTaken+=(+bs.damageTaken||0);a.metrics.parries+=(+bs.parries||0);a.metrics.perfectParries+=(+bs.perfectParries||0)}
      V.siphonQueue(a);V.pause(s);
      if(boss){V.finishBoss(s,a);return out}
      a.lastCompleted=a.wave;a.phase='between';RF.UI.modal={type:'v1062WaveComplete',loc:a.loc,wave:a.wave};RF.save?.(s);RF.UI.render(s);return out;
    };

    // Fleeing successfully abandons the run. A failed flee simply remains in the current room.
    const fleeBase=RF.fleeV4;
    if(fleeBase)RF.fleeV4=function(){
      const before=V.isDungeonCombat(RF.state),out=fleeBase.apply(this,arguments);
      if(before&&!RF.state?.combat&&V.active(RF.state))V.abandon('You escape the current chamber, but the dungeon run is broken.');
      return out;
    };
    const loseBase=RF.loseV4Battle;
    if(loseBase)RF.loseV4Battle=function(){
      const s0=RF.state,a0=V.active(s0),was=!!(a0&&s0?.combat?.v1062Dungeon),pending=a0?.pendingQueue?[...a0.pendingQueue]:[];
      const out=loseBase.apply(this,arguments),s=RF.state;
      if(was&&s?.v1062){if(pending.length&&RF.V10?.queue)RF.V10.queue.push(...pending);const clock=a0?.clock;s.v1062.active=null;V.restoreClock(s,clock);RF.save?.(s)}
      return out;
    };

    const modalBase=RF.UI.modalHtml.bind(RF.UI);
    RF.UI.modalHtml=function(s){
      const m=this.modal,d=m?.loc&&V.def(m.loc),a=V.active(s);
      if(m?.type==='v1062DungeonLobby'&&d){const rec=V.record(s,m.loc),resume=m.resume&&a?.loc===m.loc;return `<div class="modalBack"><div class="modal v1062DungeonModal"><div class="v1062DungeonHero"><span>${d.icon}</span><div><span class="eyebrow">DUNGEON • LEVEL ${d.level}</span><h2>${V.escape(d.name)}</h2></div></div><p>${V.escape(d.desc)}</p><div class="v1062DungeonStats"><div><small>Structure</small><b>8 waves + boss</b></div><div><small>Clears</small><b>${rec.clears}</b></div><div><small>Best finish</small><b>${rec.bestHp==null?'—':`${rec.bestHp} HP`}</b></div></div>${resume?`<div class="notice good">Current run: ${V.runLabel(a)}.</div>`:''}<div class="choices">${resume?`<button class="choice" data-v1062-resume><b>Resume Run</b><small>Continue from the saved dungeon state.</small></button>`:`<button class="choice dangerChoice" data-v1062-start="${m.loc}"><b>Enter Dungeon</b><small>Health and supplies persist across every fight.</small></button>`}<button class="choice" data-v1062-close><b>Close</b></button></div></div></div>`}
      if(m?.type==='v1062WaveComplete'&&d)return `<div class="modalBack"><div class="modal resultModal v1062Interlude"><div class="resultIcon">⚔️</div><span class="eyebrow">${V.escape(d.name.toUpperCase())}</span><h2>Wave ${m.wave} Complete</h2><div class="itemDesc">The chamber falls quiet. ${m.wave<V.WAVES?'There is no way out but deeper.':'Something much larger waits beyond the final door.'}</div><div class="v1062WavePips">${Array.from({length:V.WAVES},(_,i)=>`<i class="${i<m.wave?'done':''}"></i>`).join('')}<b>👑</b></div><button class="startBtn" data-v1062-next>${m.wave<V.WAVES?`Continue to Wave ${m.wave+1}`:'Approach the Boss'}</button></div></div>`;
      if(m?.type==='v1062BossIntro'&&d){const e=RF.DATA.enemies[d.boss];return `<div class="modalBack"><div class="modal resultModal v1062BossIntro"><div class="resultIcon">${e.icon}</div><span class="eyebrow">FINAL ENCOUNTER</span><h2>Boss — ${V.escape(e.name)}</h2><div class="itemDesc">The final chamber opens. The dungeon's ruler steps forward.</div><div class="v1062BossFacts"><span>Lv ${e.level}</span><span>⚔️ ${RF.V1049?.attackRating?.(e)||Math.round((e.damage[0]+e.damage[1])/2)} attack</span><span>🛡️ ${e.armor} armour</span></div><button class="startBtn" data-v1062-boss>Face the Boss</button></div></div>`}
      if(m?.type==='v1062DungeonCleared'&&d)return `<div class="modalBack"><div class="modal resultModal v1062Cleared"><div class="resultIcon">🏆</div><span class="eyebrow">DUNGEON CLEARED</span><h2>${d.icon} ${V.escape(d.name)}</h2><div class="itemDesc">Nine fights end with the dungeon ruler defeated. The surviving hoard is yours.</div><button class="startBtn" data-v1062-summary>View Dungeon Summary</button></div></div>`;
      if(m?.type==='v1062DungeonSummary'&&d&&m.summary){const x=m.summary;return `<div class="modalBack"><div class="modal battleSummary v1062Summary"><div class="resultIcon">📜</div><span class="eyebrow">DUNGEON SUMMARY • LEVEL ${d.level}</span><h2>${d.icon} ${V.escape(d.name)}</h2><div class="statsGrid"><div class="statbox"><span>Encounters</span><b>8 + Boss</b></div><div class="statbox"><span>Turns</span><b>${x.turns}</b></div><div class="statbox"><span>HP remaining</span><b>${x.hpLeft}</b></div><div class="statbox"><span>Damage taken</span><b>${Math.round(x.damageTaken)}</b></div></div><h3>Total Rewards</h3><div class="resultGains">${x.gold>0?`<div><span>🪙</span><b>+${x.gold} gold</b></div>`:''}${x.playerXp>0?`<div><span>🌟</span><b>+${x.playerXp} Character XP</b></div>`:''}${x.skills.map(([id,n])=>`<div><span>${RF.DATA.skills?.[id]?.icon||'✨'}</span><b>+${Math.round(n)} ${V.escape(RF.DATA.skills?.[id]?.name||id)} XP</b></div>`).join('')}${x.loot.map(([id,n])=>`<div><span>${RF.DATA.items[id]?.icon||'🎁'}</span><b>${V.escape(RF.DATA.items[id]?.name||id)} ×${n}</b></div>`).join('')||'<div><span>▫️</span><b>No item rewards</b></div>'}</div>${x.gear?.length?`<div class="v1062GearBanner">Guaranteed dungeon gear: ${x.gear.map(id=>`${RF.DATA.items[id]?.icon||'🎁'} ${V.escape(RF.DATA.items[id]?.name||id)}`).join(' • ')}</div>`:''}${RF.isOverEncumbered?.(s)?`<div class="notice bad">⚠️ Rewards pushed your Pack over capacity. Sort the Pack before time or travel can resume.</div>`:''}<button class="startBtn" data-v1062-finish>Finish</button></div></div>`}
      if(m?.type==='v1062DungeonAbandoned')return `<div class="modalBack"><div class="modal resultModal"><div class="resultIcon">🚪</div><span class="eyebrow">DUNGEON RUN ENDED</span><h2>${V.escape(m.name)}</h2><div class="itemDesc">${V.escape(m.reason)} You cleared ${m.progress}/${V.WAVES} normal waves before leaving.</div><button class="startBtn" data-v1062-abandon-close>Return to World</button></div></div>`;
      return modalBase(s);
    };

    const bindBase=RF.UI.bind.bind(RF.UI);
    RF.UI.bind=function(s){
      bindBase(s);
      document.querySelectorAll('[data-open-dungeon]').forEach(b=>b.onclick=()=>V.open());
      document.querySelectorAll('[data-v1062-close]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(s)});
      document.querySelectorAll('[data-v1062-start]').forEach(b=>b.onclick=()=>V.start(b.dataset.v1062Start));
      document.querySelectorAll('[data-v1062-next]').forEach(b=>b.onclick=()=>{const a=V.active(s);if(!a)return;if(a.lastCompleted>=V.WAVES)V.showBoss(s);else{a.wave=a.lastCompleted+1;V.startWave(s)}});
      document.querySelectorAll('[data-v1062-boss]').forEach(b=>b.onclick=()=>V.startBoss(s));
      document.querySelectorAll('[data-v1062-summary]').forEach(b=>b.onclick=()=>{const a=V.active(s);if(!a?.summary)return;RF.UI.modal={type:'v1062DungeonSummary',loc:a.loc,summary:a.summary};RF.UI.render(s)});
      document.querySelectorAll('[data-v1062-finish]').forEach(b=>b.onclick=()=>V.completeAndExit());
      document.querySelectorAll('[data-v1062-abandon-close]').forEach(b=>b.onclick=()=>V.closeAbandoned());
      document.querySelectorAll('[data-v1062-resume]').forEach(b=>b.onclick=()=>{const a=V.active(s);if(!a)return;if(a.phase==='between'){RF.UI.modal={type:'v1062WaveComplete',loc:a.loc,wave:a.lastCompleted||a.wave};RF.UI.render(s)}else if(a.phase==='bossIntro')V.showBoss(s);else if(a.phase==='cleared'){RF.UI.modal={type:'v1062DungeonCleared',loc:a.loc};RF.UI.render(s)}else if(a.phase==='boss')V.startBoss(s);else V.startWave(s)});
    };

    const st=document.createElement('style');st.id='v1062-dungeon-gauntlets-style';st.textContent=`
    .v1062DungeonSection{padding-bottom:14px}.v1062DungeonButton{margin:0!important;width:100%!important}.v1062DungeonButton .emoji{font-size:30px}
    .v1062DungeonModal{width:min(470px,100%)}.v1062DungeonHero{display:flex;align-items:center;gap:13px}.v1062DungeonHero>span{width:62px;height:62px;border-radius:17px;display:grid;place-items:center;font-size:38px;background:#2a2016;border:1px solid #654d32}.v1062DungeonHero h2{margin:2px 0 0;color:#efd39a;font-size:26px}.v1062DungeonModal>p{color:#b8aa92;line-height:1.5;font-size:12px}.v1062DungeonStats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:12px 0}.v1062DungeonStats>div{border:1px solid #443527;background:#15100d;border-radius:12px;padding:9px;text-align:center}.v1062DungeonStats small{display:block;color:#897d6c;font-size:8px}.v1062DungeonStats b{display:block;color:#e8d2a3;margin-top:3px;font-size:11px}
    .v1062WavePips{display:flex;align-items:center;justify-content:center;gap:5px;margin:14px 0}.v1062WavePips i{width:17px;height:6px;border-radius:999px;background:#32291f;border:1px solid #54412b}.v1062WavePips i.done{background:#c39147;border-color:#dfb568}.v1062WavePips b{font-size:17px;margin-left:3px}.v1062BossFacts{display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin:12px 0 16px}.v1062BossFacts span{border:1px solid #52402c;border-radius:999px;background:#17110d;padding:6px 9px;color:#d9c29a;font-size:9px}.v1062GearBanner{margin:10px 0;border:1px solid #72552f;border-radius:11px;background:#241a10;padding:9px 10px;color:#efd49e;font-size:10px;line-height:1.4}.v1062Summary .resultGains{max-height:31vh!important}
    .v1062BattleProgress{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:5px 0 8px;border:1px solid #654c2d;border-radius:10px;background:linear-gradient(90deg,#21170e,#17110d);padding:7px 9px;color:#c9b38c;font-size:8px;font-weight:800;letter-spacing:.04em}.v1062BattleProgress b{color:#f2d89e;font-size:9px;text-transform:uppercase}
    @media(max-width:390px){.v1062DungeonHero h2{font-size:23px}.v1062DungeonStats{gap:5px}.v1062DungeonStats>div{padding:7px 5px}.v1062WavePips{gap:4px}.v1062WavePips i{width:14px}}
    `;
    document.head.appendChild(st);

    if(RF.state){
      V.migrate(RF.state);RF.save?.(RF.state);
      setTimeout(()=>{
        const s=RF.state,a=V.active(s);
        // If the app was closed between rooms, make the saved run resumable instead of losing it.
        if(a&&!s.combat&&!RF.UI.modal&&a.loc===s.location)RF.UI.modal={type:'v1062DungeonLobby',loc:a.loc,resume:true};
        if(s&&!RF.V101?.mainMenu)RF.UI.render(s);
      },0);
    }
    return RF.V1062;
  }
  const api={
    installHistoricalV1062,
    get installed(){return installed;},
    namespace:()=>RF.V1062||null,
    open:(...args)=>RF.V1062?.open?.(...args),
    start:(...args)=>RF.V1062?.start?.(...args),
    definition:id=>RF.V1062?.DUNGEONS?.[id]||null,
    definitions:()=>RF.V1062?.DUNGEONS||{},
    baseConfig:()=>RF.Config?.clone('dungeons.base')||{},
    ecosystem:id=>RF.Config?.get('world.ecosystems')?.[id]||null,
    activeRun:state=>state?.v1062?.active||null,
    records:state=>state?.v1062?.records||{}
  };
  RF.Systems.Dungeons=RF.Modules.register('systems.dungeons',api,{owner:'systems',status:'canonical',implementation:'v11.0-equivalent',configOwner:'data.config'});
})();


/* Realmforge V11.25.0 historical dungeon ancestry extension. */
(() => {
  'use strict';
  const RF=window.RF,api=RF.Systems?.Dungeons;if(!api)throw new Error('Canonical Dungeons base missing before V11.25 extension.');
  const stageSources={"js/v11_4.js":"window.RF=window.RF||{};\nRF.VERSION='11.4.0';\nRF.BUILD={\n  version:'11.4.0',\n  title:'Eightfold Dungeons',\n  built:'17 Sep 2026 • 22:25 BST',\n  buildId:'20260917-2225-bst'\n};\nRF.V114=RF.V114||{};\n\n/* Realmforge V11.4 — Eightfold Dungeons\n   - Expands the world to eight persistent 8-wave + boss dungeons.\n   - Every standard combat location now has exactly eight local entity species.\n   - Dungeon waves use the eight entities from that exact location, fought lowest level to highest.\n   - Every dungeon has its own boss and tier-scaled equipment pool, with extra rare boss-drop chances.\n   - Existing active dungeon runs and every Equipment/Tool Belt/Pack/Bank item remain untouched.\n*/\n\n(()=>{\n'use strict';\nconst V=RF.V114;\nV.version='11.4.0';\nV.escape=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]));\n\n// ---------- Entity expansion ----------\nV.addEnemy=function(id,c){\n  const level=+c.level||1,armor=c.armor??Math.max(0,Math.floor((level-1)/3));\n  const hp=c.hp??Math.round(24+level*10.5+armor*3.2);\n  const lo=c.damage?.[0]??Math.max(2,Math.round(1.5+level*.72));\n  const hi=c.damage?.[1]??Math.max(lo+2,Math.round(4+level*1.38));\n  RF.DATA.enemies[id]={name:c.name,icon:c.icon,level,hp,damage:[lo,hi],armor,\n    xp:c.xp??Math.round(18+level*20),gold:c.gold??[0,Math.max(2,Math.round(level*1.7))],\n    temperament:c.temperament||'territorial',moves:c.moves||['bite','brace'],drops:c.drops||[],desc:c.desc||''};\n};\nRF.Config.clone(\"dungeons.v114EntitySpecs\")\n.forEach(([id,c])=>V.addEnemy(id,c));\n\n// ---------- Eight standard entity species per combat location ----------\nV.ECOSYSTEMS=RF.Config.clone(\"world.ecosystems\");\nObject.entries(V.ECOSYSTEMS).forEach(([loc,table])=>{RF.fieldTables[loc]=table.map(x=>[x[0],x[1]])});\n\nV.localDungeonLineup=function(loc){\n  const seen=new Set();\n  return (RF.fieldTables?.[loc]||[]).map(([id])=>id).filter(id=>RF.DATA.enemies?.[id]&&!seen.has(id)&&seen.add(id))\n    .sort((a,b)=>(RF.DATA.enemies[a].level-RF.DATA.enemies[b].level)||RF.DATA.enemies[a].name.localeCompare(RF.DATA.enemies[b].name))\n    .slice(0,8);\n};\n\n// ---------- Tier-scaled equipment ----------\nV.addGear=function(id,c){\n  RF.DATA.items[id]={name:c.name,icon:c.icon,type:c.type||((c.slot==='main')?'weapon':'armor'),slot:c.slot,value:c.value,\n    damage:c.damage||0,armor:c.armor||0,rarity:c.rarity,desc:c.desc||`${c.name}. +${c.damage||0} damage • +${c.armor||0} armour.`};\n};\nRF.Config.clone(\"dungeons.v114GearSpecs\").forEach(([id,c])=>V.addGear(id,c));\n\n// ---------- Eight dungeon bosses ----------\nV.addBoss=function(id,c){\n  RF.DATA.enemies[id]={name:c.name,icon:c.icon,level:c.level,hp:c.hp,damage:c.damage,armor:c.armor,xp:c.xp,gold:c.gold,\n    temperament:'boss',moves:c.moves,drops:c.drops,desc:c.desc};\n};\nconst rareDrops=(gear,base=.11)=>gear.map((id,i)=>[id,Math.max(.045,base-i*.012),1]);\nV.addBoss('ironmaw_broodmother',{name:'Ironmaw Broodmother',icon:'🕷️',level:9,hp:205,damage:[10,19],armor:6,xp:390,gold:[45,80],moves:['venom_bite','web','stone_bite','brace'],drops:[['iron_ore',1,2],...rareDrops(['veinmaw_pick','prospector_buckler','shaft_helm','dustcoat','pit_boots'],.14)],desc:'An enormous mine spider plated in iron-rich stone.'});\nV.addBoss('hollowroot_hart',{name:'Hollowroot Hart',icon:'🦌',level:11,hp:245,damage:[12,22],armor:7,xp:520,gold:[60,105],moves:['gore','hoof_feint','circle','royal_gaze'],drops:[['herb',1,3],...rareDrops(['hollowroot_blade','rootguard','thorncap','barkhide_vest','briarstep_boots'],.13)],desc:'An ancient stag crowned in root and thorn, far too old to be ordinary wildlife.'});\nV.addBoss('buried_foreman',{name:'The Buried Foreman',icon:'👷',level:14,hp:315,damage:[15,26],armor:9,xp:760,gold:[85,140],moves:['club','commanding_strike','stone_guard','roar'],drops:[['silver_ore',1,2],...rareDrops(['buried_edge','deepguard','blacklamp_coif','gallery_mail','understep_boots'],.12)],desc:'A dead foreman still directing a shift that ended generations ago.'});\nV.addBoss('crownwatch_warlord',{name:'Crownwatch Warlord',icon:'👑',level:19,hp:435,damage:[19,33],armor:12,xp:1320,gold:[150,230],moves:['commanding_strike','marked_shot','brace','war_cry'],drops:[['steel_bar',1,2],...rareDrops(['barrow_sabre','warlord_roundshield','crownwatch_helm','marcher_plate','kingroad_greaves'],.10)],desc:'The armoured warlord buried beneath the old northern road, awake and furious.'});\nV.addBoss('redstone_colossus',{name:'Redstone Colossus',icon:'🗿',level:21,hp:510,damage:[21,36],armor:15,xp:1580,gold:[180,275],moves:['stone_guard','club','tail_sweep','war_cry'],drops:[['silver_ore',1,3],...rareDrops(['redstone_maul','quarry_wall','colossus_helm','redstone_plate','scree_boots'],.095)],desc:'A quarry idol the size of a cart, cut loose from the bedrock.'});\nV.addBoss('drowned_heron_sovereign',{name:'Drowned Heron Sovereign',icon:'🐦‍⬛',level:24,hp:590,damage:[24,41],armor:16,xp:2050,gold:[235,350],moves:['royal_gaze','flood_call','stone_beak','drowned_grip'],drops:[['royal_seal',1,1],['drowned_coin',1,4],...rareDrops(['heron_spear','tidewall_shield','drowned_crown','heron_scale_mail','undertow_greaves'],.085)],desc:'A crowned marsh revenant wearing the shape of the dynasty carved throughout the ruins.'});\n\n// Existing dungeon rulers are strengthened and gain larger rare equipment pools.\nObject.assign(RF.DATA.enemies.ossuary_regent,{level:18,hp:410,damage:[18,32],armor:12,xp:1190,gold:[135,205],drops:[['crypt_sigil',1,1],['steel_bar',.5,1],...rareDrops(['regent_falchion','bonewall_buckler','ossuary_coif','tombwarden_greaves','regent_crown','cryptlord_mace'],.10)]});\nObject.assign(RF.DATA.enemies.cindermaw_tyrant,{level:22,hp:545,damage:[22,38],armor:14,xp:1775,gold:[205,310],drops:[['ember_shard',1,3],['steel_bar',.6,1],...rareDrops(['cindermaw_blade','emberplate_cuirass','magma_guard','cinderstep_boots','tyrant_crown','heartforge_greatblade'],.09)]});\n\n// ---------- Dungeon definitions ----------\nconst D=RF.V1062;\nObject.assign(D.DUNGEONS,RF.Config.clone(\"dungeons.v114Additions\"));\n// Re-tier the two original dungeons and broaden their reward pools without invalidating records.\nObject.assign(D.DUNGEONS.crypt,RF.Config.clone(\"dungeons.cryptOverride\"));\nObject.assign(D.DUNGEONS.ember_cave,RF.Config.clone(\"dungeons.emberOverride\"));\n\n// Every dungeon points at the eight standard entities from that exact location.\nObject.entries(D.DUNGEONS).forEach(([loc,d])=>{\n  const lineup=V.localDungeonLineup(loc);\n  d.pool=lineup.map(id=>[id,1]);\n  d.localLineup=lineup;\n  const l=RF.DATA.locations?.[loc];if(l)l.dungeon=true;\n});\n\n// New runs are deterministic by local ecology: all eight local entities, lowest level first.\n// Existing active runs keep their already-saved sequence exactly as it was.\nD.sequence=function(s,loc,attempt){\n  const d=D.def(loc);if(!d)return[];\n  const lineup=V.localDungeonLineup(loc);\n  if(lineup.length===8)return lineup;\n  return (d.localLineup||[]).slice(0,8);\n};\n\nif(RF.V94?.bossHomes){\n  Object.assign(RF.V94.bossHomes,RF.Config.clone(\"dungeons.bossHomes\"));\n}\n\n// Enrich dungeon Database rows/details with difficulty and the local-wave rule.\nif(RF.V113?.dungeonEntries){\n  const dbBase=RF.V113.dungeonEntries.bind(RF.V113);\n  RF.V113.dungeonEntries=function(s){\n    return dbBase(s).map(row=>{\n      const d=D.def(row.id);return d?{...row,sub:`Lv ${d.level} • ${d.difficulty||'Dungeon'} • ${RF.DATA.locations?.[row.id]?.icon||'📍'} ${RF.DATA.locations?.[row.id]?.name||row.id} • ${d.region||RF.DATA.locations?.[row.id]?.region||'Unknown region'}${D.record(s,row.id).clears?` • ${D.record(s,row.id).clears} clear${D.record(s,row.id).clears===1?'':'s'}`:''}`} : row;\n    }).sort((a,b)=>(a.sortLevel-b.sortLevel)||a.name.localeCompare(b.name));\n  };\n}\n\n// Dungeon cards now make the ordered local-gauntlet rule explicit.\nconst worldBase=RF.UI.world.bind(RF.UI);\nRF.UI.world=function(s){\n  let h=worldBase(s),d=D.def(s?.location);if(!d)return h;\n  h=h.replace(/(<section class=\"card v1062DungeonSection\">[\\s\\S]*?<small>)([\\s\\S]*?)(<\\/small>[\\s\\S]*?<\\/section>)/,\n    (m,a,b,c)=>a+`${b.split(' • 8 waves + boss')[0]} • ${d.difficulty||'Dungeon'} • 8 local waves + boss`+c);\n  return h;\n};\n\nV.validate=function(){\n  const badEco=Object.entries(V.ECOSYSTEMS).filter(([loc])=>V.localDungeonLineup(loc).length!==8);\n  const dungeons=Object.keys(D.DUNGEONS);\n  const badDungeon=dungeons.filter(loc=>V.localDungeonLineup(loc).length!==8||!D.DUNGEONS[loc].boss||!RF.DATA.enemies[D.DUNGEONS[loc].boss]);\n  return {ecosystems:Object.keys(V.ECOSYSTEMS).length,badEco,dungeons:dungeons.length,badDungeon};\n};\n\nV.migrate=function(s){\n  if(!s)return s;\n  s.v114=s.v114||{};\n  s.v1062=s.v1062||{};s.v1062.records=s.v1062.records||{};\n  Object.keys(D.DUNGEONS).forEach(loc=>D.record(s,loc));\n  // Encounter caches are disposable world-state snapshots; clear only those so the expanded\n  // eight-species ecosystems appear immediately. Active combat/dungeon sequences are untouched.\n  s.encounters=s.encounters||{};\n  Object.keys(V.ECOSYSTEMS).forEach(loc=>{if(!s.combat||s.location!==loc)delete s.encounters[loc]});\n  s.version='11.4.0';\n  return s;\n};\n/* V11.8: legacy save/migration wrapper extracted to canonical core. */\n\nconst oldStyle=document.getElementById('v114-eightfold-dungeons-style');if(oldStyle)oldStyle.remove();\nconst st=document.createElement('style');st.id='v114-eightfold-dungeons-style';st.textContent=`\n.v1062DungeonSection .action small{line-height:1.35}\n.v113DungeonDetail .dbChips span{white-space:nowrap}\n`;\ndocument.head.appendChild(st);\n\nif(RF.state){\n  V.migrate(RF.state);RF.save?.(RF.state);\n  setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0);\n}\n})();\n"};
  const fragmentSources={"v3-delve-action-ui":"const v3ActionButton=RF.UI.actionButton.bind(RF.UI);RF.UI.actionButton=function(a,s){if(a==='delve')return `<button class=\"action danger\" data-action=\"delve\" ${s.activity||s.combat?'disabled':''}><span class=\"emoji\">🕯️</span><b>Delve Deeper</b><small>Dungeon combat & rare loot</small></button>`;return v3ActionButton(a,s)};\n"};
  const installedStages=api.installedStages||[];api.installedStages=installedStages;const stageSet=new Set(installedStages);
  const installedFragments=api.installedFragments||[];api.installedFragments=installedFragments;const fragmentSet=new Set(installedFragments);
  const priorStage=typeof api.installHistoricalStage==='function'?api.installHistoricalStage.bind(api):null;
  const priorFragment=typeof api.installHistoricalFragment==='function'?api.installHistoricalFragment.bind(api):null;
  function run(source,label,kind){const script=document.createElement('script');script.type='text/javascript';script.setAttribute('data-rf-canonical-dungeon-'+kind,label);script.textContent=source+'\n//# sourceURL=realmforge-canonical:///systems.dungeons/'+kind+'/'+label+'\n';(document.head||document.documentElement).appendChild(script);script.remove();}
  api.installHistoricalStage=function(name){if(stageSet.has(name))return false;if(Object.prototype.hasOwnProperty.call(stageSources,name)){run(stageSources[name],name,'stage');stageSet.add(name);installedStages.push(name);return true;}if(priorStage)return priorStage(name);throw new Error('Unknown canonical Dungeons stage: '+name);};
  api.installHistoricalFragment=function(name){if(fragmentSet.has(name))return false;if(Object.prototype.hasOwnProperty.call(fragmentSources,name)){run(fragmentSources[name],name,'fragment');fragmentSet.add(name);installedFragments.push(name);return true;}if(priorFragment)return priorFragment(name);throw new Error('Unknown canonical Dungeons fragment: '+name);};
  api.stageNames=()=>Object.keys(stageSources);api.fragmentNames=()=>Object.keys(fragmentSources);
})();
