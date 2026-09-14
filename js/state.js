window.RF = window.RF || {};
RF.VERSION='1.0.0';
RF.xpForLevel = l => Math.floor(45 * Math.pow(l-1,1.72));
RF.levelFromXp = xp => { let l=1; while(l<100 && xp>=RF.xpForLevel(l+1)) l++; return l; };
RF.newGame = function(name,background,avatar){
  const bg=RF.DATA.backgrounds[background]; const skills={}; Object.keys(RF.DATA.skills).forEach(k=>skills[k]={xp:0,level:1});
  Object.entries(bg.skills||{}).forEach(([k,v])=>{skills[k].level=v; skills[k].xp=RF.xpForLevel(v)});
  const s={version:RF.VERSION,created:Date.now(),player:{name:name||'Wanderer',avatar:avatar||'🧑',level:1,xp:0,hp:100,maxHp:100,stamina:100,maxStamina:100,background},gold:bg.gold,location:'greenvale',day:1,minute:8*60,speed:1,paused:false,weather:'Clear',weatherTimer:180,
  skills,inventory:{rusty_sword:1,...bg.items},equipment:{main:'rusty_sword',head:null,chest:null},flags:{},reputation:{greenvale:0},quests:{first_steps:{active:true,done:false}},kills:{},visited:{greenvale:true},eventHistory:{},log:[],activity:null,combat:null,stats:{enemiesKilled:0,goldEarned:0,itemsCrafted:0,distance:0,playMinutes:0},luck:0,lastReal:Date.now()};
  RF.log(s,'You arrive in Greenvale with little more than your name and a road ahead.','important'); return s;
};
RF.addItem=(s,id,q=1)=>{s.inventory[id]=(s.inventory[id]||0)+q;};
RF.takeItem=(s,id,q=1)=>{if((s.inventory[id]||0)<q)return false;s.inventory[id]-=q;if(s.inventory[id]<=0)delete s.inventory[id];return true;};
RF.hasItems=(s,req)=>Object.entries(req).every(([id,q])=>(s.inventory[id]||0)>=q);
RF.addXp=function(s,skill,amount){const sk=s.skills[skill];if(!sk)return;const before=sk.level;sk.xp+=amount;sk.level=RF.levelFromXp(sk.xp);if(sk.level>before)RF.log(s,`${RF.DATA.skills[skill].name} increased to level ${sk.level}!`,'good');};
RF.addPlayerXp=function(s,amount){const before=s.player.level;s.player.xp+=amount;let target=1+Math.floor(Math.sqrt(s.player.xp/100));s.player.level=Math.min(100,target);if(s.player.level>before){let d=s.player.level-before;s.player.maxHp+=d*4;s.player.hp=s.player.maxHp;s.player.maxStamina+=d*2;s.player.stamina=s.player.maxStamina;RF.log(s,`Character level increased to ${s.player.level}!`,'good');}};
RF.log=function(s,text,type=''){const hh=String(Math.floor(s.minute/60)%24).padStart(2,'0'),mm=String(Math.floor(s.minute%60)).padStart(2,'0');s.log.unshift({t:`D${s.day} ${hh}:${mm}`,text,type});s.log=s.log.slice(0,120);};
RF.save=s=>{s.lastReal=Date.now();localStorage.setItem('realmforge_save',JSON.stringify(s));};
RF.load=()=>{try{return JSON.parse(localStorage.getItem('realmforge_save'))}catch(e){return null}};
RF.exportSave=s=>btoa(unescape(encodeURIComponent(JSON.stringify(s))));
RF.importSave=str=>JSON.parse(decodeURIComponent(escape(atob(str.trim()))));
RF.weaponDamage=s=>{let id=s.equipment.main,item=RF.DATA.items[id];return item?.damage||0};
RF.armor=s=>['head','chest'].reduce((a,slot)=>a+(RF.DATA.items[s.equipment[slot]]?.armor||0),0);
RF.questCheck=function(s){Object.entries(s.quests).forEach(([qid,qstate])=>{if(!qstate.active||qstate.done)return;let q=RF.DATA.quests[qid];let ok=q.objectives.every(o=>{if(o.type==='visit')return !!s.visited[o.target];if(o.type==='skill')return s.skills[o.target].level>=o.value;if(o.type==='flag')return !!s.flags[o.target];if(o.type==='item')return (s.inventory[o.target]||0)>=o.value;if(o.type==='kill')return (s.kills[o.target]||0)>=o.value;return false});if(ok){qstate.done=true;qstate.active=false;s.gold+=q.reward.gold||0;RF.addPlayerXp(s,q.reward.xp||0);if(q.reward.item)RF.addItem(s,q.reward.item,1);RF.log(s,`Quest complete: ${q.name}`,'important');if(q.next&&!s.quests[q.next])s.quests[q.next]={active:true,done:false};}})};
