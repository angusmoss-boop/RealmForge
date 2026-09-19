/* Realmforge V11.12.0 — Canonical Quest Journal.
   Owns the V9.3 quest discovery/journal/detail interaction formerly embedded in compatibility.
   Later quest data and progression hooks can extend the same RF.Systems.Quests contract. */
(() => {
  'use strict';
  const RF=window.RF;
  let installed=false;
  function installHistoricalV93(){
    if(installed)return RF.V93;
    installed=true;
    RF.V93.questMeta={
      first_steps:{source:'Story',giver:'Your own curiosity',auto:true,summary:'Learn the rhythm of Greenvale and establish yourself as a capable traveller.'},
      missing_caravan:{source:'Story',giver:'Greenvale road rumours',auto:true,summary:'Investigate the caravan that vanished on the eastern road.'},
      blackthorn:{source:'Story',giver:'Blackthorn evidence',auto:true,summary:'Follow the token back to the gang operating beyond Greenvale.'},
      greenvale_teeth:{source:'Greenvale Noticeboard',location:'greenvale',summary:'Cull predators troubling the farms around Sunmeadow.'},
      river_provisions:{source:'Greenvale Noticeboard',location:'greenvale',summary:'Bring fresh fish and prove you know your way around a river.'},
      miners_due:{source:'Brann / Mine Notice',location:'mine',summary:'Replace valuable ore lost after a mine support failure.'},
      woodland_ledger:{source:'Elira',location:'forest',summary:'Help document Whisperwood and its more territorial inhabitants.'},
      ironridge_contract:{source:'Ironridge Contract Board',location:'ironridge',summary:'Reduce dangerous drakes around Redstone Quarry.'},
      marsh_medicine:{source:'Nessa Vale',location:'reedmere',summary:'Gather fen reagents for Reedmere medicine.'},
      field_notes:{source:'Maelin Quill',location:'mirewatch',summary:'Collect practical combat observations on dangerous Mirefen wildlife.'},
      locksmiths_errand:{source:'Cobb Rill',location:'reedmere',summary:'Demonstrate sufficient finesse for a suspiciously legitimate locksmith.'}
    };
    RF.v93OfferVisible=function(s,id){let q=RF.DATA.quests[id],m=RF.V93.questMeta[id];if(!q||!m||m.auto||s.quests[id]?.done||s.quests[id]?.active)return false;if(m.location&&s.location!==m.location)return false;
      if(id==='ironridge_contract'&&!s.visited?.ironridge)return false;if(['marsh_medicine','locksmiths_errand'].includes(id)&&!s.visited?.reedmere)return false;if(id==='field_notes'&&!s.visited?.mirewatch)return false;return true};
    RF.v93AcceptQuest=function(id){let s=RF.state,q=RF.DATA.quests[id];if(!q||s.quests[id]?.done)return;s.quests[id]={active:true,done:false};delete s.questAbandoned[id];RF.log(s,`Quest accepted: ${q.name}`,'important');RF.save(s);RF.UI.modal={type:'questDetail',id};RF.UI.render(s)};
    RF.v93AbandonQuest=function(id){let s=RF.state,qs=s.quests[id];if(!qs?.active)return;delete s.quests[id];s.questAbandoned[id]=true;RF.log(s,`Quest abandoned: ${RF.DATA.quests[id]?.name||id}`);RF.save(s);RF.UI.modal=null;RF.UI.render(s)};
    RF.v93RewardText=function(q){let r=q?.reward||{},a=[];if(r.gold)a.push(`${r.gold}g`);if(r.xp)a.push(`${r.xp} character XP`);if(r.item&&RF.DATA.items[r.item])a.push(`${RF.DATA.items[r.item].icon} ${RF.DATA.items[r.item].name}`);return a.join(' • ')||'No listed reward'};

    RF.UI.quests=function(s){let active=Object.entries(s.quests||{}).filter(([,qs])=>qs.active&&!qs.done),done=Object.entries(s.quests||{}).filter(([,qs])=>qs.done),offers=Object.keys(RF.DATA.quests).filter(id=>RF.v93OfferVisible(s,id));let row=(id,qs,label)=>{let q=RF.DATA.quests[id],m=RF.V93.questMeta[id]||{};if(!q)return'';return `<button class="row quest browseRow ${qs?.done?'done':''}" data-quest-detail="${id}" data-quest-state="${label}"><div class="meta"><div class="questTitle"><b>${q.name}</b><span class="tag">${label}</span></div><small>${m.summary||q.desc}</small></div><span class="chev">›</span></button>`};return `<section class="card"><h2>📜 Quest Journal</h2><div class="sub">Quests are discovered through story events, people, noticeboards and exploration. Tap any entry for objectives, source, requirements and rewards.</div></section>${offers.length?`<section class="card"><h3>Available Here</h3><div class="list">${offers.map(id=>row(id,null,'AVAILABLE')).join('')}</div></section>`:''}<section class="card"><h3>Active</h3><div class="list">${active.length?active.map(([id,qs])=>row(id,qs,'ACTIVE')).join(''):'<div class="sub">No active quests.</div>'}</div></section><section class="card"><h3>Completed</h3><div class="list">${done.length?done.map(([id,qs])=>row(id,qs,'DONE')).join(''):'<div class="sub">No completed quests yet.</div>'}</div></section>`};

    const questModalBase=RF.UI.modalHtml.bind(RF.UI);
    RF.UI.modalHtml=function(s){let m=this.modal;
      if(m?.type==='questDetail'){let q=RF.DATA.quests[m.id],qs=s.quests[m.id],meta=RF.V93.questMeta[m.id]||{},isOffer=!qs||(!qs.active&&!qs.done);if(!q)return'';let objs=q.objectives.map(o=>`<div class="objective detailObj">${this.objDone(s,o)?'✅':'⬜'} ${o.text}</div>`).join('');return `<div class="modalBack"><div class="modal questModal"><span class="eyebrow">${qs?.done?'COMPLETED':qs?.active?'ACTIVE QUEST':'QUEST OFFER'}</span><h2>📜 ${q.name}</h2><div class="itemDesc">${q.desc}</div><div class="questInfo"><b>Source</b><span>${meta.source||meta.giver||'World event'}</span></div>${meta.giver?`<div class="questInfo"><b>Giver</b><span>${meta.giver}</span></div>`:''}<h3>Objectives</h3>${objs}<h3>Rewards</h3><div class="notice good">${RF.v93RewardText(q)}</div><div class="choices">${isOffer?`<button class="choice" data-quest-accept="${m.id}"><b>Accept Quest</b></button>`:''}${qs?.active?`<button class="choice dangerChoice" data-quest-abandon="${m.id}"><b>Abandon Quest</b><small>You can reacquire it from its source later.</small></button>`:''}<button class="choice" data-quest-close><b>Close</b></button></div></div></div>`}
      return questModalBase(s);
    };

    const questBindBase=RF.UI.bind.bind(RF.UI);
    RF.UI.bind=function(s){questBindBase(s);
      document.querySelectorAll('[data-quest-detail]').forEach(b=>b.onclick=()=>{RF.UI.modal={type:'questDetail',id:b.dataset.questDetail};RF.UI.render(s)});document.querySelectorAll('[data-quest-accept]').forEach(b=>b.onclick=()=>RF.v93AcceptQuest(b.dataset.questAccept));document.querySelectorAll('[data-quest-abandon]').forEach(b=>b.onclick=()=>RF.v93AbandonQuest(b.dataset.questAbandon));document.querySelectorAll('[data-quest-close]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(s)});
    };
    return RF.V93;
  }

  const api={
    installHistoricalV93,
    get installed(){return installed;},
    check:s=>RF.questCheck(s),
    accept:id=>typeof RF.v93AcceptQuest==='function'?RF.v93AcceptQuest(id):null,
    abandon:id=>typeof RF.v93AbandonQuest==='function'?RF.v93AbandonQuest(id):null,
    visible:(s,id)=>typeof RF.v93OfferVisible==='function'?RF.v93OfferVisible(s,id):true,
    requirementText:(...a)=>typeof RF.v93Req==='function'?RF.v93Req(...a):'',
    journal:s=>RF.UI.quests?.(s)||''
  };
  RF.Systems.Quests=RF.Modules.register('systems.quests',api,{owner:'systems',status:'canonical',historicalStage:'v9.3'});
})();
