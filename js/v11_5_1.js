window.RF=window.RF||{};
RF.VERSION='11.5.1';
RF.BUILD={
  version:'11.5.1',
  title:'Wayfinder Hints',
  built:'17 Sep 2026 • 23:28 BST',
  buildId:'20260917-2328-bst'
};
RF.V1151=RF.V1151||{};

/* Realmforge V11.5.1 — Wayfinder Hints
   - Locked World Map destinations no longer expose internal save-flag names.
   - Tapping a locked destination gives a subtle contextual hint for the NEXT step only.
   - Hints advance automatically as the campaign state advances, until the road unlocks.
   - Covers every current flag-locked and skill-locked location without changing progression rules.
*/

(()=>{
'use strict';
const V=RF.V1151;
V.version='11.5.1';
V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
V.skillLevel=(s,id)=>Math.max(1,Number(s?.skills?.[id]?.level)||1);
V.kills=(s,id)=>Math.max(0,Number(s?.kills?.[id])||0);

V.northHint=function(s){
  if(!s?.flags?.woundedMerchantResolved){
    return {title:'The east road has unfinished business',text:'Travellers around Whisperwood and Kingroad Crossroads have been seeing signs of trouble. One of them may know more than they first let on.'};
  }
  if(!s.flags.banditCampKnown){
    return {title:'Stories leave tracks',text:'What you learned on the east road points back toward Kingroad Crossroads. A careful search there may reveal a trail that ordinary traffic has hidden.'};
  }
  if(!s.flags.eastwatchOpen){
    const n=V.kills(s,'bandit')+V.kills(s,'blackthorn_scout');
    if(n<3)return {title:'Eastwatch is still watching from a distance',text:'The watch has little reason to open its doors while Blackthorn still looks like a roadside nuisance. A few decisive victories against their people may change that.'};
    return {title:'The watch should have noticed by now',text:'Blackthorn has taken enough losses to draw official attention. Eastwatch Tower is worth checking again.'};
  }
  if(!s.flags.vossRevealed){
    return {title:'A name is missing from the story',text:'Blackthorn has organisation behind it. Their tougher enforcers are more likely than common raiders to be carrying orders, letters, or names.'};
  }
  if(!s.flags.vossDefeated){
    return {title:'Cut off the head, not another branch',text:'You know who commands Blackthorn now. Their hidden camp is the natural place to press that advantage.'};
  }
  return {title:'The road north is now a matter of permission',text:'With Blackthorn broken, Sergeant Halden at Eastwatch may finally be willing to discuss passage beyond the valley.'};
};

V.flagHint=function(s,flag,id){
  switch(flag){
    case 'banditCampKnown':
      if(!s?.flags?.woundedMerchantResolved)return {title:'Someone has seen too much',text:'Keep an eye on the roads around Whisperwood and Kingroad Crossroads. Trouble there may point toward whoever is hiding beyond the ridge.'};
      return {title:'Blackthorn left a trail',text:'The account you heard points toward Kingroad Crossroads. Search the road itself for signs the bandits failed to hide.'};

    case 'eastwatchOpen': {
      if(!s?.flags?.banditCampKnown)return V.northHint(s);
      const n=V.kills(s,'bandit')+V.kills(s,'blackthorn_scout');
      if(n<3)return {title:'Give the watch a reason to listen',text:'Eastwatch is tracking Blackthorn activity. Driving more of their raiders from the valley may make the tower take you seriously.'};
      return {title:'Eastwatch should be paying attention',text:'Enough Blackthorn fighters have fallen that the guards can no longer dismiss the threat. Try the tower again.'};
    }

    case 'deepMineFound':
      if(V.skillLevel(s,'exploration')<3)return {title:'There are older workings below',text:'The Old Greenvale Mine has signs of passages beyond the obvious tunnels, but spotting the right marks will take a little more experience on the road.'};
      return {title:'Look past the working mine',text:'Old boards and unfamiliar markings inside the Old Greenvale Mine suggest that one tunnel was hidden rather than abandoned. A deliberate search may find it.'};

    case 'wayfarerHallOpen':
      if((s?.player?.level||1)<3&&!s?.flags?.eastwatchOpen)return {title:'The Wayfarers prefer proven travellers',text:'Greenvale’s guild hall does not seem interested in complete newcomers. A little more worldly experience may be enough to draw an invitation.'};
      return {title:'Someone in Greenvale knows the Wayfarers',text:'People connected to the roads and the watch occasionally point capable travellers toward paid work. Ask around rather than looking for an unlocked door.'};

    case 'cryptOpened':
      if(s?.flags?.cryptMarked)return {title:'You already found the breathing stone',text:'The slab beneath Mossbound Ruins is still on your map. Perhaps the question is no longer where the entrance is, but whether you are ready to uncover it.'};
      if(!s?.flags?.vossDefeated&&V.skillLevel(s,'exploration')<6)return {title:'The ruins are hiding a second story',text:'Mossbound Ruins feel older than their surface stones suggest. Greater experience, or new knowledge from the Blackthorn affair, may make the buried signs easier to read.'};
      return {title:'Cold air has to come from somewhere',text:'At Mossbound Ruins, disturbed stone and a thread of unnatural cold may reward patient exploration.'};

    case 'northRoadOpen':
      return V.northHint(s);

    case 'emberdeepKnown':
      if(!s?.flags?.northRoadOpen)return {title:'First reach the country that knows its name',text:V.northHint(s).text};
      if(V.skillLevel(s,'mining')<7)return {title:'Miners keep some roads to themselves',text:'Ironridge workers are reluctant to discuss the old furnace tunnels with casual travellers. More time underground may loosen tongues.'};
      return {title:'Listen for talk of a sealed furnace road',text:'Experienced workers around Ironridge and Redstone Quarry have started whispering about heat where no furnace should still burn.'};

    default:
      return {title:'The road is not ready to reveal itself',text:'Keep progressing through nearby quests, exploration and conversations. The next clue is somewhere in the world you can already reach.'};
  }
};

V.skillHint=function(s,skill,need,id){
  const name=RF.DATA.skills?.[skill]?.name||skill;
  const have=V.skillLevel(s,skill);
  if(id==='ruins')return {title:'The overgrown trail is difficult to read',text:have>=need-1?'The route through the moss is beginning to make sense. A little more field experience should be enough to pick it out.':'Spend more time exploring the valley. The path to these ruins is there, but you are not yet reading the terrain the way an experienced traveller would.'};
  if(id==='drowned_ruins')return {title:'The fen hides its roads under water',text:have>=need-1?'You are close to understanding the safe approach. One more stretch of difficult exploration may make the drowned route readable.':'The route through the flooded ground is too deceptive to follow safely. More experience charting difficult places should help.'};
  return {title:`More ${name} experience will help`,text:`The way is visible, but not yet practical. Spend more time developing ${name} and return when the route feels less uncertain.`};
};

V.progressHint=function(s,id){
  const loc=RF.DATA.locations?.[id];
  if(!loc)return {title:'No clue yet',text:'Nothing useful is known about this route.'};
  if(loc.lockedFlag&&!s?.flags?.[loc.lockedFlag])return V.flagHint(s,loc.lockedFlag,id);
  if(loc.lockedSkill){
    const [skill,need]=Object.entries(loc.lockedSkill)[0]||[];
    if(skill&&V.skillLevel(s,skill)<Number(need||1))return V.skillHint(s,skill,Number(need||1),id);
  }
  return {title:'The route itself is open',text:'Something else along the planned path is currently preventing the journey.'};
};

V.blockedLocation=function(s,dest){
  if(!s||!dest)return dest;
  if(RF.v9LocationUnlocked&&!RF.v9LocationUnlocked(s,dest))return dest;
  const route=RF.V1020?.route?.(s,dest,true)||RF.v9Route?.(s,s.location,dest,true);
  if(route?.path){
    for(const id of route.path.slice(1)){
      if(RF.v9LocationUnlocked&&!RF.v9LocationUnlocked(s,id))return id;
    }
  }
  return dest;
};

// Never expose raw internal save flag names on the World Map.
const oldLockText=RF.v9LockText;
RF.v9LockText=function(s,id){
  const loc=RF.DATA.locations?.[id];if(!loc)return oldLockText?oldLockText(s,id):'';
  if(loc.lockedFlag&&!s?.flags?.[loc.lockedFlag])return 'World progress needed';
  if(loc.lockedSkill){
    const [sk,lv]=Object.entries(loc.lockedSkill)[0]||[];
    if(sk&&V.skillLevel(s,sk)<Number(lv||1))return `More ${RF.DATA.skills?.[sk]?.name||sk} experience needed`;
  }
  return '';
};

// Replace only the LOCKED route-preview presentation. Route calculation and unlock logic stay authoritative.
const modalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  const m=this.modal;
  if(m?.type==='v1020RoutePreview'){
    const dest=m.destination,d=RF.DATA.locations?.[dest];
    const route=RF.V1020?.route?.(s,dest,false)||RF.v9Route?.(s,s.location,dest,false);
    if(dest!==s.location&&!route){
      const potential=RF.V1020?.route?.(s,dest,true)||RF.v9Route?.(s,s.location,dest,true);
      const blocker=V.blockedLocation(s,dest),blockedLoc=RF.DATA.locations?.[blocker];
      const hint=V.progressHint(s,blocker);
      const potentialText=potential?.path?.length>1?`<div class="v1020Potential"><b>Known path:</b> ${(RF.V1020?.routeNames?RF.V1020.routeNames(potential.path):potential.path.map(x=>RF.DATA.locations?.[x]?.name||x)).join(' → ')}</div>`:'';
      const blockerLine=blocker&&blocker!==dest&&blockedLoc?`<small>The route is currently held up around ${V.escape(blockedLoc.name)}.</small>`:'';
      return `<div class="modalBack"><div class="modal v1020RouteModal v1151LockedRoute"><div class="itemHero">${d?.icon||'📍'}</div><span class="eyebrow">WORLD MAP • ROUTE</span><h2>${V.escape(d?.name||'Destination')}</h2><div class="itemDesc">${V.escape(d?.desc||'')}</div><div class="notice v1151RouteClosed"><b>The way is not open yet.</b>${blockerLine}</div><div class="v1151WayfinderHint"><span class="eyebrow">WAYFINDER'S HINT</span><b>${V.escape(hint.title)}</b><p>${V.escape(hint.text)}</p></div>${potentialText}<div class="choices"><button class="choice" data-v1020-route-leave><b>Leave it</b></button></div></div></div>`;
    }
  }
  return modalBase(s);
};

const old=document.getElementById('v1151-wayfinder-style');if(old)old.remove();
const st=document.createElement('style');st.id='v1151-wayfinder-style';st.textContent=`
.v1151RouteClosed{display:flex;flex-direction:column;gap:4px;margin-top:10px}
.v1151RouteClosed>b{color:#edd7a7}.v1151RouteClosed small{color:#aa9a7c;line-height:1.35}
.v1151WayfinderHint{margin:12px 0;padding:14px 15px;border:1px solid rgba(115,160,88,.5);border-radius:14px;background:linear-gradient(180deg,rgba(39,71,38,.36),rgba(24,47,26,.25));box-shadow:inset 3px 0 0 rgba(132,188,101,.75)}
.v1151WayfinderHint>.eyebrow{display:block;color:#b8d99a;margin-bottom:7px;font-size:9px;letter-spacing:.16em}
.v1151WayfinderHint>b{display:block;color:#e6efcf;font-size:15px;line-height:1.25;margin-bottom:6px}
.v1151WayfinderHint>p{margin:0;color:#c5b99e;font-size:13px;line-height:1.48}
`;
document.head.appendChild(st);

// Presentation-only patch: no save migration and no progression flags are changed.
if(RF.state)setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0);
})();
