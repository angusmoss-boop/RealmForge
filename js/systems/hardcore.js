/* Realmforge V12.5.0 — Hardcore Campaign Rules.
   Final canonical owner for campaign mode selection, permadeath and character-record presentation. */
(() => {
  'use strict';
  const RF=window.RF;
  if(!RF?.UI||!RF.Core?.Campaigns||!RF.Core?.State)throw new Error('Hardcore campaign rules require canonical UI and persistence.');

  const api={
    version:'12.5.0',
    mode:s=>s?.campaign?.mode==='hardcore'?'hardcore':'standard',
    isHardcore:s=>s?.campaign?.mode==='hardcore',
    isGameOver:s=>s?.campaign?.mode==='hardcore'&&s?.campaign?.gameOver===true
  };

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // ----- Character creation -----
  const creatorBase=RF.UI.creator.bind(RF.UI);
  RF.UI.creator=function(){
    let h=creatorBase();
    const block=`<div class="field v125ModeField"><label>Campaign Rules</label>
      <div class="v125ModeGrid">
        <button type="button" class="v125ModeChoice selected" data-v125-standard><span>🛡️</span><b>Standard</b><small>Defeat hurts, but your journey continues.</small></button>
        <button type="button" class="v125ModeChoice hardcore" data-v125-hardcore-open><span>☠️</span><b>Hardcore</b><small>One life. Death ends the campaign.</small></button>
      </div>
      <div class="v125ModeNote" data-v125-mode-note>Standard campaign • Defeat uses Realmforge's normal recovery rules.</div>
    </div>
    <div class="v125HardcoreConfirm" data-v125-hardcore-confirm hidden>
      <div class="v125HardcoreWarning"><span class="v125Skull">☠️</span><div><b>Enable Hardcore?</b><p>If this character dies, the campaign is permanently over. The fallen save remains as a memorial, but it cannot be resumed or revived.</p><strong>This choice cannot be changed after creation.</strong></div></div>
      <div class="v125ConfirmActions"><button type="button" data-v125-hardcore-enable>Enable Hardcore</button><button type="button" data-v125-hardcore-cancel>Cancel</button></div>
    </div>`;
    return h.replace('<button id="startGame" class="startBtn">',block+'<button id="startGame" class="startBtn">');
  };

  const bindCreatorBase=RF.UI.bindCreator.bind(RF.UI);
  RF.UI.bindCreator=function(){
    bindCreatorBase();
    let mode='standard';
    const standard=document.querySelector('[data-v125-standard]'),hardcore=document.querySelector('[data-v125-hardcore-open]');
    const confirmBox=document.querySelector('[data-v125-hardcore-confirm]'),note=document.querySelector('[data-v125-mode-note]');
    const applyMode=next=>{
      mode=next;
      standard?.classList.toggle('selected',next==='standard');
      hardcore?.classList.toggle('selected',next==='hardcore');
      if(note)note.innerHTML=next==='hardcore'
        ? '<b>☠ Hardcore campaign</b> • One life. Death permanently ends this campaign.'
        : "Standard campaign • Defeat uses Realmforge's normal recovery rules.";
    };
    standard?.addEventListener('click',()=>applyMode('standard'));
    hardcore?.addEventListener('click',()=>{if(confirmBox)confirmBox.hidden=false;});
    document.querySelector('[data-v125-hardcore-enable]')?.addEventListener('click',()=>{applyMode('hardcore');if(confirmBox)confirmBox.hidden=true;});
    document.querySelector('[data-v125-hardcore-cancel]')?.addEventListener('click',()=>{if(confirmBox)confirmBox.hidden=true;});
    const start=document.getElementById('startGame');
    if(start)start.onclick=()=>{
      const name=document.getElementById('charName')?.value?.trim()||'';
      if(!name){document.getElementById('charName')?.focus();return;}
      const chosen=document.querySelector('.bgopt.sel')?.dataset?.bg||'farmer';
      const avatar=document.getElementById('avatar')?.value||'🧑';
      RF.startNew(name,chosen,avatar,{mode});
    };
  };

  // ----- Character record -----
  const characterBase=RF.UI.character.bind(RF.UI);
  RF.UI.character=function(s){
    let h=characterBase(s);
    if(api.isHardcore(s)){
      const banner=`<section class="v125HardcoreBanner"><div><span>☠️</span><div><b>HARDCORE CAMPAIGN</b><small>One life • Death permanently ends this run</small></div></div><strong>ALIVE</strong></section>`;
      const firstEnd=h.indexOf('</section>');
      if(firstEnd>=0)h=h.slice(0,firstEnd+10)+banner+h.slice(firstEnd+10);
    }else{
      const deaths=Math.max(0,Number(s?.stats?.deaths)||0);
      h=h.replace('<section class="card"><h3>Lifetime</h3><div class="statsGrid">',`<section class="card"><h3>Lifetime</h3><div class="statsGrid"><div class="statbox v125DeathStat"><span>💀 Deaths</span><b>${deaths}</b></div>`);
    }
    return h;
  };

  // ----- Hardcore permadeath -----
  const loseBase=RF.loseV4Battle;
  RF.loseV4Battle=function(...args){
    const s=RF.state;
    if(!api.isHardcore(s))return loseBase?.apply(this,args);
    if(!s||api.isGameOver(s))return false;
    const combat=s.combat||{},enemy=RF.DATA?.enemies?.[combat.id],enemyName=enemy?.name||'an unknown foe';
    s.stats=s.stats||{};s.stats.deaths=(s.stats.deaths||0)+1;
    s.campaign=s.campaign||{};s.campaign.mode='hardcore';s.campaign.gameOver=true;s.campaign.endedAt=Date.now();
    s.campaign.death={enemyId:combat.id||null,enemyName,day:s.day||1,minute:s.minute||0,location:s.location||'unknown',level:s.player?.level||1};
    if(s.player){s.player.hp=0;s.player.stamina=0;}
    s.combat=null;s.activity=null;s.speed=0;s.paused=true;
    RF.log?.(s,`Hardcore death: ${s.player?.name||'The wanderer'} fell to ${enemyName}. This campaign is over.`,'bad');
    RF.UI.modal=null;RF.save(s);RF.UI.render(s);return false;
  };

  function deathPlace(s){
    const d=s?.campaign?.death||{},loc=RF.DATA?.locations?.[d.location]?.name||d.location||'Unknown';
    return {d,loc};
  }
  function gameOverHtml(s){
    const {d,loc}=deathPlace(s),mins=Math.max(0,Number(d.minute)||0),hh=String(Math.floor(mins/60)%24).padStart(2,'0'),mm=String(Math.floor(mins%60)).padStart(2,'0');
    return `<main class="v125GameOver">
      <section class="v125Memorial">
        <div class="v125GameOverMark">☠️</div><span class="v125GameOverEyebrow">HARDCORE CAMPAIGN</span>
        <h1>Game Over</h1><h2>${esc(s.player?.avatar||'🧑')} ${esc(s.player?.name||'Wanderer')}</h2>
        <p>${esc(s.player?.name||'Your wanderer')} fell to <b>${esc(d.enemyName||'an unknown foe')}</b>. This campaign is permanently concluded.</p>
        <div class="v125MemorialGrid">
          <div><small>Final Level</small><b>${Number(d.level)||s.player?.level||1}</b></div>
          <div><small>Day</small><b>${Number(d.day)||s.day||1} • ${hh}:${mm}</b></div>
          <div><small>Location</small><b>${esc(loc)}</b></div>
          <div><small>Total XP</small><b>${Number(s.player?.xp||0).toLocaleString()}</b></div>
          <div><small>Enemies Defeated</small><b>${Number(s.stats?.enemiesKilled||0).toLocaleString()}</b></div>
          <div><small>Gold</small><b>${Number(s.gold||0).toLocaleString()}g</b></div>
        </div>
        <div class="v125FinalRule">☠ The save is preserved as a memorial, but gameplay cannot resume.</div>
        <div class="v125GameOverActions">
          <button data-v125-new-character><span>✨</span><b>New Character</b><small>Begin a separate campaign</small></button>
          <button data-v125-main-menu><span>🏰</span><b>Main Menu</b><small>Return to campaign selection</small></button>
          <button data-v125-export-final><span>📤</span><b>Export Memorial</b><small>Keep a portable final save</small></button>
        </div>
      </section>
    </main>`;
  }
  function bindGameOver(){
    document.querySelector('[data-v125-main-menu]')?.addEventListener('click',()=>{
      RF.Core.Campaigns.saveNow?.();if(RF.V101){RF.V101.mainMenu=true;RF.V101.renderMainMenu?.();}
    });
    document.querySelector('[data-v125-new-character]')?.addEventListener('click',()=>{
      RF.Core.Campaigns.saveNow?.();RF.Core.Campaigns.activate('',null);RF.state=null;RF.UI.modal=null;
      if(RF.V1011)RF.V1011.allowCreator=true;if(RF.V101)RF.V101.mainMenu=false;RF.UI.render(null);
    });
    document.querySelector('[data-v125-export-final]')?.addEventListener('click',async()=>{
      const btn=document.querySelector('[data-v125-export-final]');
      try{
        const r=await RF.Core.State.exportSlot(RF.Core.Campaigns.activeId());
        if(btn){const b=btn.querySelector?.('b');if(b)b.textContent=r?.method==='file'?'Memorial Exported':'Memorial Copied';}
      }catch(err){console.warn(err);if(btn){const b=btn.querySelector?.('b');if(b)b.textContent='Export Failed';}}
    });
  }

  const renderBase=RF.UI.render.bind(RF.UI);
  RF.UI.render=function(s){
    if(s&&api.isGameOver(s)){
      const root=document.getElementById('app');if(!root)return;
      root.innerHTML=gameOverHtml(s);bindGameOver(s);return root.innerHTML;
    }
    return renderBase(s);
  };

  const style=document.createElement('style');style.id='rf-hardcore-v125-style';style.textContent=`
    .v125ModeField{margin-top:14px}.v125ModeGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.v125ModeChoice{min-height:96px;padding:12px 10px;border:1px solid #46392a;border-radius:16px;background:#17130f;color:#c8b89c;text-align:left}.v125ModeChoice>span{display:block;font-size:22px}.v125ModeChoice b,.v125ModeChoice small{display:block}.v125ModeChoice b{margin-top:5px;color:#e6d2ab;font-size:13px}.v125ModeChoice small{margin-top:4px;color:#8e826f;font-size:9px;line-height:1.35}.v125ModeChoice.selected{border-color:#b9873d;background:linear-gradient(145deg,rgba(168,111,39,.21),#18130e);box-shadow:inset 0 0 0 1px rgba(220,174,97,.12)}.v125ModeChoice.hardcore.selected{border-color:#a84d43;background:linear-gradient(145deg,rgba(133,45,39,.28),#190f0d)}.v125ModeNote{margin-top:8px;padding:9px 10px;border:1px solid #3a3025;border-radius:12px;background:#12100d;color:#968875;font-size:9px;line-height:1.45}.v125ModeNote b{color:#e6a095}
    .v125HardcoreConfirm{margin-top:10px;padding:12px;border:1px solid #7f3f39;border-radius:16px;background:linear-gradient(145deg,#25110f,#160d0c);box-shadow:0 12px 30px rgba(0,0,0,.25)}.v125HardcoreWarning{display:grid;grid-template-columns:38px minmax(0,1fr);gap:10px}.v125Skull{font-size:28px}.v125HardcoreWarning b{color:#f0b0a1;font:700 15px Georgia,serif}.v125HardcoreWarning p{margin:5px 0;color:#d2b8ad;font-size:10px;line-height:1.45}.v125HardcoreWarning strong{color:#e7c98d;font-size:9px}.v125ConfirmActions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:11px}.v125ConfirmActions button{min-height:42px;border:1px solid #574332;border-radius:12px;background:#211812;color:#dbc59e;font-weight:800}.v125ConfirmActions button:first-child{border-color:#a34840;background:#3a1714;color:#f3b6aa}
    .v125HardcoreBanner{margin:0 0 14px;padding:11px 13px;border:1px solid rgba(192,75,63,.55);border-radius:17px;background:radial-gradient(circle at 90% 10%,rgba(184,70,52,.18),transparent 40%),linear-gradient(140deg,#24100e,#16100d);display:flex;align-items:center;justify-content:space-between;gap:10px;box-shadow:0 10px 28px rgba(0,0,0,.22)}.v125HardcoreBanner>div{display:flex;align-items:center;gap:10px}.v125HardcoreBanner>div>span{font-size:27px}.v125HardcoreBanner b,.v125HardcoreBanner small{display:block}.v125HardcoreBanner b{color:#f0b1a1;font-size:12px;letter-spacing:.08em}.v125HardcoreBanner small{margin-top:2px;color:#b99c91;font-size:9px}.v125HardcoreBanner>strong{padding:5px 8px;border:1px solid rgba(219,144,93,.35);border-radius:999px;color:#e8c17f;font-size:9px;letter-spacing:.1em}
    .v125DeathStat{border-color:rgba(126,92,71,.55)!important}.v125SaveHardcore{color:#e2a194;font-size:9px}.v125SaveFallen{color:#d07869;font-size:9px}
    .v125GameOver{min-height:100dvh;display:grid;place-items:center;padding:max(24px,env(safe-area-inset-top)) 18px max(24px,env(safe-area-inset-bottom));background:radial-gradient(circle at 50% 8%,rgba(130,34,28,.23),transparent 35%),linear-gradient(#0e0908,#070606);color:#e6d8bd}.v125Memorial{width:min(620px,100%);padding:22px;border:1px solid #69382f;border-radius:26px;background:radial-gradient(circle at 80% 0,rgba(169,67,45,.12),transparent 35%),#17100e;box-shadow:0 30px 90px rgba(0,0,0,.75);text-align:center}.v125GameOverMark{font-size:54px}.v125GameOverEyebrow{display:block;margin-top:6px;color:#b86f60;font-size:9px;font-weight:900;letter-spacing:.22em}.v125Memorial h1{margin:7px 0 2px;color:#edb2a4;font:700 38px Georgia,serif}.v125Memorial h2{margin:0;color:#ead4a7;font:700 22px Georgia,serif}.v125Memorial>p{margin:14px auto;max-width:470px;color:#bbaa94;font-size:11px;line-height:1.6}.v125MemorialGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;text-align:left}.v125MemorialGrid>div{padding:10px 11px;border:1px solid #392a23;border-radius:13px;background:#110d0b}.v125MemorialGrid small,.v125MemorialGrid b{display:block}.v125MemorialGrid small{color:#826f61;font-size:8px;text-transform:uppercase;letter-spacing:.08em}.v125MemorialGrid b{margin-top:3px;color:#dbc7a1;font-size:11px}.v125FinalRule{margin-top:12px;padding:10px;border:1px solid #743c34;border-radius:13px;background:#24110f;color:#dca99d;font-size:9px;font-weight:800}.v125GameOverActions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:14px}.v125GameOverActions button{min-height:92px;padding:10px 7px;border:1px solid #4e3829;border-radius:15px;background:#1c1511;color:#d9c49e}.v125GameOverActions span,.v125GameOverActions b,.v125GameOverActions small{display:block}.v125GameOverActions span{font-size:20px}.v125GameOverActions b{margin-top:4px;font-size:10px}.v125GameOverActions small{margin-top:3px;color:#897a68;font-size:7.5px;line-height:1.35}@media(max-width:430px){.v125ModeGrid{grid-template-columns:1fr}.v125GameOverActions{grid-template-columns:repeat(2,minmax(0,1fr))}.v125GameOverActions button:first-child{grid-column:1/-1}.v125MemorialGrid{grid-template-columns:1fr 1fr}}
  `;document.head.appendChild(style);

  RF.CampaignMode=RF.Modules.register('systems.hardcore',api,{owner:'systems',status:'canonical',introducedIn:'12.5.0',persistent:true,saveSchema:'12.5.0'});
})();
