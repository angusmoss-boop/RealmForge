window.RF = window.RF || {};
RF.VERSION = '5.0.0';

/* Realmforge V5 — Hearth & Harvest */

Object.assign(RF.DATA.skills, {
  firemaking: { name: 'Firemaking', icon: '🔥' }
});

Object.assign(RF.DATA.items, {
  tin_ore: { name:'Tin Ore', icon:'⚪', type:'material', value:5, desc:'Soft pale ore used in bronze work.' },
  willow_logs: { name:'Willow Logs', icon:'🌿', type:'material', value:8, desc:'Light flexible timber.' },
  yew_logs: { name:'Yew Logs', icon:'🌲', type:'material', value:18, rarity:'Uncommon', desc:'Dense timber from ancient yews.' },
  wild_berries: { name:'Wild Berries', icon:'🫐', type:'food', value:5, desc:'Tart berries. Restores 6 health.', heal:6 },
  cave_mushroom: { name:'Cave Mushroom', icon:'🍄', type:'material', value:9, desc:'Pale edible fungus.' },
  trout: { name:'Silverrun Trout', icon:'🐟', type:'material', value:11, desc:'A healthy river trout.' },
  river_eel: { name:'River Eel', icon:'〰️', type:'material', value:17, rarity:'Uncommon', desc:'Rich river eel.' },
  cooked_trout: { name:'Fire-roasted Trout', icon:'🍽️', type:'food', value:24, desc:'Restores 30 health.', heal:30 },
  smoked_eel: { name:'Smoked River Eel', icon:'🥘', type:'food', value:34, rarity:'Uncommon', desc:'Restores 38 health.', heal:38 },
  berry_skewer: { name:'Warm Berry Skewer', icon:'🍡', type:'food', value:12, desc:'Restores 14 health.', heal:14 },
  charcoal: { name:'Charcoal', icon:'◼️', type:'material', value:9, desc:'Concentrated fuel.' }
});

RF.DATA.resourceDefs = {
  copper: { name:'Copper Vein', icon:'🟤', skill:'mining', level:1, item:'copper_ore', xp:18, duration:9, yield:[1,2], max:8, regen:40, desc:'Common, forgiving ore.' },
  tin: { name:'Tin Vein', icon:'⚪', skill:'mining', level:1, item:'tin_ore', xp:19, duration:9, yield:[1,2], max:6, regen:45, desc:'Useful companion metal to copper.' },
  iron: { name:'Iron Seam', icon:'⛏️', skill:'mining', level:4, item:'iron_ore', xp:30, duration:12, yield:[1,2], max:6, regen:65, desc:'Harder rock, better metal.' },
  coal: { name:'Coal Face', icon:'⚫', skill:'mining', level:6, item:'coal', xp:34, duration:13, yield:[1,2], max:5, regen:75, desc:'Fuel for serious smithing.' },
  silver: { name:'Silver Thread', icon:'🌙', skill:'mining', level:12, item:'silver_ore', xp:54, duration:16, yield:[1,1], max:3, regen:120, desc:'Rare bright ore.' },
  ember: { name:'Emberglass Seam', icon:'🔸', skill:'mining', level:18, item:'ember_shard', xp:82, duration:20, yield:[1,1], max:2, regen:180, desc:'Volcanic crystal that hums faintly.' },
  oak: { name:'Oak', icon:'🌳', skill:'woodcutting', level:1, item:'logs', xp:20, duration:10, yield:[1,2], max:9, regen:50, desc:'Reliable timber.' },
  willow: { name:'Willow', icon:'🌿', skill:'woodcutting', level:5, item:'willow_logs', xp:31, duration:12, yield:[1,2], max:7, regen:65, desc:'Fast-growing river timber.' },
  yew: { name:'Ancient Yew', icon:'🌲', skill:'woodcutting', level:14, item:'yew_logs', xp:58, duration:16, yield:[1,1], max:3, regen:150, desc:'Slow-growing and valuable.' },
  riverfish: { name:'Riverfish Shoal', icon:'🐟', skill:'fishing', level:1, item:'fish', xp:20, duration:11, yield:[1,2], max:8, regen:45, desc:'Small common fish.' },
  trout: { name:'Trout Pool', icon:'🎣', skill:'fishing', level:5, item:'trout', xp:32, duration:13, yield:[1,1], max:6, regen:65, desc:'Clear-water trout.' },
  eel: { name:'Deep Eel Hole', icon:'〰️', skill:'fishing', level:11, item:'river_eel', xp:50, duration:16, yield:[1,1], max:3, regen:110, desc:'Best near dusk and dawn.' },
  herb: { name:'Greenleaf Patch', icon:'🌿', skill:'foraging', level:1, item:'herb', xp:14, duration:8, yield:[1,2], max:7, regen:40, desc:'Medicinal greenleaf.' },
  berries: { name:'Berry Thicket', icon:'🫐', skill:'foraging', level:2, item:'wild_berries', xp:17, duration:8, yield:[1,3], max:8, regen:35, desc:'Tart edible berries.' },
  mushroom: { name:'Cave Mushroom Cluster', icon:'🍄', skill:'foraging', level:7, item:'cave_mushroom', xp:30, duration:10, yield:[1,2], max:4, regen:80, desc:'Pale fungi from damp stone.' }
};

RF.DATA.locationResources = {
  mine:['copper','tin','iron','coal'],
  deep_mine:['iron','coal','silver'],
  quarry:['iron','coal','silver'],
  ember_cave:['coal','ember'],
  forest:['oak','willow','yew','herb','berries'],
  river:['riverfish','trout','eel','willow','herb'],
  sunmeadow:['herb','berries','oak'],
  greenvale:['herb','berries'],
  ruins:['herb','mushroom'],
  crypt:['mushroom'],
  crossroads:['berries']
};

RF.DATA.campRecipes = {
  cooked_fish:{ name:'Cook Riverfish', icon:'🍣', level:1, input:'fish', output:'cooked_fish', xp:18, time:7, desc:'Simple hot food.' },
  cooked_meat:{ name:'Roast Meat', icon:'🍖', level:1, input:'raw_meat', output:'cooked_meat', xp:20, time:8, desc:'A proper trail meal.' },
  berry_skewer:{ name:'Warm Berry Skewer', icon:'🍡', level:2, input:'wild_berries', qty:2, output:'berry_skewer', xp:22, time:6, desc:'Quick food over coals.' },
  cooked_trout:{ name:'Roast Trout', icon:'🐟', level:5, input:'trout', output:'cooked_trout', xp:34, time:9, desc:'Restorative river food.' },
  smoked_eel:{ name:'Smoke River Eel', icon:'🥘', level:10, input:'river_eel', output:'smoked_eel', xp:52, time:12, desc:'Rich food with a long trail-life.' },
  charcoal:{ name:'Burn Charcoal', icon:'◼️', level:8, input:'logs', qty:2, output:'charcoal', xp:38, time:12, skill:'firemaking', desc:'Turn timber into concentrated fuel.' }
};

RF.migrateV5 = function(s) {
  if (!s) return s;
  s.version = '5.0.0';
  s.skills = s.skills || {};
  if (!s.skills.firemaking) s.skills.firemaking = { xp:0, level:1 };
  s.resources = s.resources || {};
  s.camp = s.camp || { location:null, expiresAt:0, quality:0 };
  s.buffs = s.buffs || {};
  s.stats = s.stats || {};
  if (s.stats.resourcesGathered == null) s.stats.resourcesGathered = 0;
  if (s.stats.firesLit == null) s.stats.firesLit = 0;
  if (s.stats.mealsCooked == null) s.stats.mealsCooked = 0;
  if (s.stats.discoveries == null) s.stats.discoveries = 0;
  return s;
};

const v5NewGameBase = RF.newGame;
RF.newGame = function(...args) { return RF.migrateV5(v5NewGameBase(...args)); };
const v5LoadBase = RF.load;
RF.load = function() { return RF.migrateV5(v5LoadBase()); };
const v5ImportBase = RF.importSave;
RF.importSave = function(x) { return RF.migrateV5(v5ImportBase(x)); };

RF.totalMinutes = function(s) { return (s.day - 1) * 1440 + s.minute; };

RF.resourceState = function(s, key) {
  const d = RF.DATA.resourceDefs[key];
  if (!d) return null;
  const now = RF.totalMinutes(s);
  if (!s.resources[key]) s.resources[key] = { charges:d.max, last:now };
  const r = s.resources[key];
  const elapsed = Math.max(0, now - r.last);
  if (r.charges < d.max && elapsed >= d.regen) {
    const n = Math.floor(elapsed / d.regen);
    r.charges = Math.min(d.max, r.charges + n);
    r.last += n * d.regen;
  } else if (r.charges >= d.max) {
    r.last = now;
  }
  return r;
};

RF.resourcesHere = function(s) {
  return (RF.DATA.locationResources[s.location] || [])
    .map(key => [key, RF.DATA.resourceDefs[key], RF.resourceState(s, key)])
    .filter(x => !!x[1]);
};

RF.openResourceMenu = function(kind) {
  const s = RF.state;
  RF.UI.modal = { type:'resourceMenu', kind, list:RF.resourcesHere(s).filter(x => x[1].skill === kind) };
  RF.UI.render(s);
};

RF.activitySnapshot = function(s) {
  const xp = {}, levels = {};
  Object.entries(s.skills || {}).forEach(([k,v]) => { xp[k] = v.xp; levels[k] = v.level; });
  return { xp, levels, items:{...(s.inventory || {})}, gold:s.gold, playerXp:s.player.xp };
};

RF.makeResult = function(s, before, title, icon) {
  if (!before) return null;
  const gains = [];
  Object.entries(s.inventory || {}).forEach(([id,q]) => {
    const delta = q - (before.items[id] || 0);
    if (delta > 0 && RF.DATA.items[id]) gains.push({ icon:RF.DATA.items[id].icon, label:`${RF.DATA.items[id].name} ×${delta}` });
  });
  Object.entries(s.skills || {}).forEach(([id,sk]) => {
    const delta = sk.xp - (before.xp[id] || 0);
    if (delta > 0) gains.push({ icon:RF.DATA.skills[id]?.icon || '⭐', label:`+${delta} ${RF.DATA.skills[id]?.name || id} XP` });
    if (sk.level > (before.levels[id] || 1)) gains.push({ icon:'⬆️', label:`${RF.DATA.skills[id]?.name || id} Lv ${sk.level}` });
  });
  if (s.gold > before.gold) gains.push({ icon:'🪙', label:`+${s.gold-before.gold} gold` });
  if (s.player.xp > before.playerXp) gains.push({ icon:'🌟', label:`+${s.player.xp-before.playerXp} character XP` });
  if (!gains.length) return null;
  return { type:'activityResult', title:title || 'Activity Complete', icon:icon || '✨', gains };
};

const v5StartActivityBase = RF.startActivity;
RF.startActivity = function(type, label, duration, data={}) {
  if (RF.state && !data.__v5before) data.__v5before = RF.activitySnapshot(RF.state);
  return v5StartActivityBase(type, label, duration, data);
};

RF.startGather = function(key) {
  const s = RF.state;
  const d = RF.DATA.resourceDefs[key];
  const r = RF.resourceState(s, key);
  if (!d || !r || r.charges <= 0) return;
  if ((s.skills[d.skill]?.level || 1) < d.level) return;
  RF.UI.modal = null;
  RF.startActivity('v5gather', `${d.icon} Gathering ${d.name}`, d.duration, { resource:key });
};

RF.finishV5Gather = function(a) {
  const s = RF.state;
  const d = RF.DATA.resourceDefs[a.resource];
  const r = RF.resourceState(s, a.resource);
  if (!d || !r) { s.activity = null; return; }
  const qty = d.yield[0] + Math.floor(Math.random() * (d.yield[1] - d.yield[0] + 1));
  r.charges = Math.max(0, r.charges - 1);
  r.last = RF.totalMinutes(s);
  RF.addItem(s, d.item, qty);
  RF.addXp(s, d.skill, d.xp * qty);
  s.stats.resourcesGathered += qty;
  RF.log(s, `You gather ${qty} × ${RF.DATA.items[d.item].name}.`, 'good');
  if (Math.random() < 0.08) {
    const bonus = d.skill === 'mining' ? 'coal' : d.skill === 'woodcutting' ? 'herb' : 'wild_berries';
    if (RF.DATA.items[bonus]) {
      RF.addItem(s, bonus, 1);
      RF.log(s, `While working, you also find ${RF.DATA.items[bonus].name}.`, 'important');
    }
  }
  if (Math.random() < 0.035) {
    s.stats.discoveries++;
    const coins = 6 + Math.floor(Math.random() * 12);
    s.gold += coins;
    RF.log(s, `A weathered coin-cache turns up beneath the dirt. +${coins}g.`, 'important');
  }
  s.activity = null;
  RF.questCheck(s);
  RF.save(s);
  const pop = RF.makeResult(s, a.__v5before, `${d.name} Worked`, d.icon);
  if (pop) RF.UI.modal = pop;
  RF.UI.render(s);
};

const v5FinishActivityBase = RF.finishActivity;
RF.finishActivity = function(a) {
  if (a.type === 'v5gather') return RF.finishV5Gather(a);
  if (a.type === 'v5cook') return RF.finishV5Cook(a);
  v5FinishActivityBase(a);
  const s = RF.state;
  if (!s) return;
  const pop = RF.makeResult(s, a.__v5before, a.label || 'Activity Complete', '✨');
  if (pop && !s.combat && !RF.UI.modal) {
    RF.UI.modal = pop;
    RF.UI.render(s);
  }
};

const v5FinishCraftBase = RF.finishCraft;
RF.finishCraft = function(a) {
  v5FinishCraftBase(a);
  const s = RF.state;
  if (!s) return;
  const pop = RF.makeResult(s, a.__v5before, 'Crafting Complete', '🔨');
  if (pop && !RF.UI.modal) { RF.UI.modal = pop; RF.UI.render(s); }
};

RF.canCamp = function(s) {
  return !['greenvale','guildhall','ironridge','mill','watchtower','crypt','deep_mine'].includes(s.location);
};

RF.fireActive = function(s) {
  return !!(s.camp && s.camp.location === s.location && s.camp.expiresAt > RF.totalMinutes(s));
};

RF.openFireMenu = function() {
  if (!RF.canCamp(RF.state)) return;
  RF.UI.modal = { type:'fireMenu' };
  RF.UI.render(RF.state);
};

RF.lightFire = function(logType) {
  const s = RF.state;
  if (!RF.canCamp(s)) return;
  if ((s.inventory[logType] || 0) < 1) return;
  RF.takeItem(s, logType, 1);
  const quality = logType === 'yew_logs' ? 3 : logType === 'willow_logs' ? 2 : 1;
  const duration = 45 + quality * 20;
  s.camp = { location:s.location, expiresAt:RF.totalMinutes(s) + duration, quality };
  const xp = 18 + quality * 12;
  RF.addXp(s, 'firemaking', xp);
  s.stats.firesLit++;
  RF.log(s, `You light a campfire. It should last about ${duration} game minutes.`, 'good');
  RF.UI.modal = { type:'activityResult', title:'Campfire Lit', icon:'🔥', gains:[
    { icon:'🔥', label:`+${xp} Firemaking XP` },
    { icon:'⏳', label:`Burn time: ${duration} game min` }
  ]};
  RF.save(s);
  RF.UI.render(s);
};

RF.openCookMenu = function() {
  if (!RF.fireActive(RF.state)) return RF.openFireMenu();
  RF.UI.modal = { type:'cookMenu' };
  RF.UI.render(RF.state);
};

RF.cookAtFire = function(id) {
  const s = RF.state;
  const r = RF.DATA.campRecipes[id];
  if (!r || !RF.fireActive(s)) return;
  const skill = r.skill || 'cooking';
  const need = r.qty || 1;
  if ((s.skills[skill]?.level || 1) < r.level) return;
  if ((s.inventory[r.input] || 0) < need) return;
  RF.UI.modal = null;
  RF.startActivity('v5cook', `Cooking ${r.name}`, r.time, { campRecipe:id });
};

RF.finishV5Cook = function(a) {
  const s = RF.state;
  const r = RF.DATA.campRecipes[a.campRecipe];
  if (!r) { s.activity = null; return; }
  const skill = r.skill || 'cooking';
  const need = r.qty || 1;
  RF.takeItem(s, r.input, need);
  const success = 0.90 + Math.min(0.09, Math.max(0, (s.skills[skill].level - r.level) * 0.01));
  if (Math.random() <= success) {
    RF.addItem(s, r.output, 1);
    RF.addXp(s, skill, r.xp);
    s.stats.mealsCooked++;
    RF.log(s, `${r.name} succeeds.`, 'good');
  } else {
    RF.addXp(s, skill, Math.ceil(r.xp * 0.35));
    RF.log(s, `You burn the ${RF.DATA.items[r.input]?.name || 'food'}. Culinary tragedy.`, 'bad');
  }
  s.activity = null;
  RF.questCheck(s);
  RF.save(s);
  const pop = RF.makeResult(s, a.__v5before, r.name, '🍳');
  if (pop) RF.UI.modal = pop;
  RF.UI.render(s);
};

RF.restByFire = function() {
  const s = RF.state;
  if (!RF.fireActive(s) || s.activity || s.combat) return;
  const before = RF.activitySnapshot(s);
  s.player.hp = Math.min(s.player.maxHp, s.player.hp + 24);
  s.player.stamina = Math.min(s.player.maxStamina, s.player.stamina + 35);
  RF.advanceWorld(20);
  RF.addXp(s, 'vitality', 10);
  RF.log(s, 'You sit by the fire and listen to the world around you.', 'good');
  RF.save(s);
  RF.UI.modal = RF.makeResult(s, before, 'Twenty Minutes by the Fire', '🔥') || { type:'message', title:'Rested', text:'The fire crackles. Nothing asks anything of you for a little while.' };
  RF.UI.render(s);
};

const v5ActionBase = RF.action;
RF.action = function(a) {
  if (a === 'mine') return RF.openResourceMenu('mining');
  if (a === 'woodcut') return RF.openResourceMenu('woodcutting');
  if (a === 'fish') return RF.openResourceMenu('fishing');
  if (a === 'forage') return RF.openResourceMenu('foraging');
  if (a === 'fire') return RF.openFireMenu();
  if (a === 'cook') return RF.openCookMenu();
  if (a === 'fire_rest') return RF.restByFire();
  return v5ActionBase(a);
};

RF.UI.resourceCard = function(s) {
  const rs = RF.resourcesHere(s);
  if (!rs.length) return '';
  const groups = {};
  rs.forEach(row => {
    const skill = row[1].skill;
    if (!groups[skill]) groups[skill] = [];
    groups[skill].push(row);
  });
  const icons = { mining:'⛏️', woodcutting:'🪓', fishing:'🎣', foraging:'🌿' };
  const rows = Object.entries(groups).map(([skill,list]) => {
    const summary = list.map(([,d,r]) => `${d.name} ${r.charges}/${d.max}`).join(' • ');
    return `<button class="resourceGroup" data-open-resource="${skill}"><span>${icons[skill] || '🧰'}</span><b>${RF.DATA.skills[skill]?.name || skill}</b><small>${summary}</small></button>`;
  }).join('');
  return `<section class="card"><h3>Local Resources <span class="tag">LIVE</span></h3><div class="sub">Resources deplete as you work them and recover as game time passes.</div><div class="resourceSummary">${rows}</div></section>`;
};

RF.UI.campCard = function(s) {
  if (!RF.canCamp(s)) return '';
  const active = RF.fireActive(s);
  const left = active ? Math.max(0, Math.ceil(s.camp.expiresAt - RF.totalMinutes(s))) : 0;
  if (active) {
    return `<section class="card hearth"><h3>🔥 Camp & Fieldcraft</h3><div class="notice">A campfire is burning here • ~${left} min remaining.</div><div class="grid2" style="margin-top:8px"><button class="action primary" data-action="cook"><span class="emoji">🍳</span><b>Cook Food</b><small>Use the campfire</small></button><button class="action" data-action="fire_rest"><span class="emoji">🫖</span><b>Sit by Fire</b><small>20 min • recover</small></button></div></section>`;
  }
  return `<section class="card hearth"><h3>🔥 Camp & Fieldcraft</h3><div class="sub">Carry logs and make a temporary fire almost anywhere.</div><button class="action" data-action="fire" style="width:100%;margin-top:8px"><span class="emoji">🔥</span><b>Start a Fire</b><small>Choose timber • train Firemaking</small></button></section>`;
};

const v5WorldBase = RF.UI.world.bind(RF.UI);
RF.UI.world = function(s) {
  let base = v5WorldBase(s);
  const insert = this.resourceCard(s) + this.campCard(s);
  return base.replace('<section class="card"><h3>World Feed</h3>', insert + '<section class="card"><h3>World Feed</h3>');
};

const v5ActionButtonBase = RF.UI.actionButton.bind(RF.UI);
RF.UI.actionButton = function(a, s) {
  const skillMap = { mine:'mining', woodcut:'woodcutting', fish:'fishing', forage:'foraging' };
  const labels = { mine:['⛏️','Mine Ore'], woodcut:['🪓','Chop Trees'], fish:['🎣','Fish Waters'], forage:['🌿','Forage Plants'] };
  if (skillMap[a]) {
    const n = RF.resourcesHere(s).filter(x => x[1].skill === skillMap[a]).length;
    const label = labels[a];
    return `<button class="action" data-action="${a}" ${s.activity||s.combat?'disabled':''}><span class="emoji">${label[0]}</span><b>${label[1]}</b><small>${n} resource type${n===1?'':'s'} available</small></button>`;
  }
  return v5ActionButtonBase(a, s);
};

const v5ModalBase = RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml = function(s) {
  const m = this.modal;
  if (m?.type === 'activityResult') {
    return `<div class="modalBack"><div class="modal resultModal"><div class="resultIcon">${m.icon || '✨'}</div><h2>${m.title}</h2><div class="resultGains">${m.gains.map(g => `<div><span>${g.icon}</span><b>${g.label}</b></div>`).join('')}</div><button class="startBtn" data-close-result>Continue</button></div></div>`;
  }
  if (m?.type === 'resourceMenu') {
    const buttons = (m.list || []).map(([key,d,r]) => {
      const level = s.skills[d.skill]?.level || 1;
      const ready = level >= d.level && r.charges > 0;
      const extra = level < d.level ? ` • Need Lv ${d.level}` : r.charges <= 0 ? ' • Depleted' : '';
      return `<button class="choice" data-gather="${key}" ${ready?'':'disabled'}><b>${d.icon} ${d.name} • ${r.charges}/${d.max}</b><small>${RF.DATA.skills[d.skill].name} Lv ${d.level} • ${d.desc}${extra}</small></button>`;
    }).join('');
    return `<div class="modalBack"><div class="modal"><h2>${RF.DATA.skills[m.kind]?.icon || '🧰'} Choose Resource</h2><div class="sub">Choose exactly what you want to gather.</div><div class="choices">${buttons || '<div class="sub">Nothing suitable here.</div>'}</div><button class="quietClose" data-close-result>Close</button></div></div>`;
  }
  if (m?.type === 'fireMenu') {
    const logIds = ['logs','willow_logs','yew_logs'].filter(id => (s.inventory[id] || 0) > 0);
    const buttons = logIds.map(id => `<button class="choice" data-light-fire="${id}"><b>${RF.DATA.items[id].icon} ${RF.DATA.items[id].name} ×${s.inventory[id]}</b><small>Consume 1 log</small></button>`).join('');
    return `<div class="modalBack"><div class="modal"><div class="resultIcon">🔥</div><h2>Build a Campfire</h2><div class="sub">Better timber burns longer and grants more Firemaking XP.</div><div class="choices">${buttons || '<div class="notice">You need logs. Chop some timber first.</div>'}</div><button class="quietClose" data-close-result>Close</button></div></div>`;
  }
  if (m?.type === 'cookMenu') {
    const buttons = Object.entries(RF.DATA.campRecipes).map(([id,r]) => {
      const skill = r.skill || 'cooking';
      const need = r.qty || 1;
      const level = s.skills[skill]?.level || 1;
      const can = level >= r.level && (s.inventory[r.input] || 0) >= need;
      return `<button class="choice" data-camp-cook="${id}" ${can?'':'disabled'}><b>${r.icon} ${r.name}</b><small>${RF.DATA.skills[skill].name} Lv ${r.level} • needs ${need}× ${RF.DATA.items[r.input].name} • ${r.desc}</small></button>`;
    }).join('');
    return `<div class="modalBack"><div class="modal"><h2>🍳 Cook at Campfire</h2><div class="sub">Food is prepared one item at a time.</div><div class="choices">${buttons}</div><button class="quietClose" data-close-result>Close</button></div></div>`;
  }
  return v5ModalBase(s);
};

const v5BindBase = RF.UI.bind.bind(RF.UI);
RF.UI.bind = function(s) {
  v5BindBase(s);
  document.querySelectorAll('[data-open-resource]').forEach(b => b.onclick = () => RF.openResourceMenu(b.dataset.openResource));
  document.querySelectorAll('[data-gather]').forEach(b => b.onclick = () => RF.startGather(b.dataset.gather));
  document.querySelectorAll('[data-light-fire]').forEach(b => b.onclick = () => RF.lightFire(b.dataset.lightFire));
  document.querySelectorAll('[data-camp-cook]').forEach(b => b.onclick = () => RF.cookAtFire(b.dataset.campCook));
  document.querySelectorAll('[data-close-result]').forEach(b => b.onclick = () => { RF.UI.modal = null; RF.UI.render(RF.state); });
};


const v5UseItemBase = RF.useItem;
RF.useItem = function(id) {
  const s = RF.state;
  const had = (s?.inventory?.[id] || 0) > 0;
  const out = v5UseItemBase(id);
  if (had && id === 'cooked_trout') {
    s.buffs.steadyHands = 3;
    RF.log(s, 'Steady Hands: your next 3 advanced weapon techniques hit a little harder.', 'good');
  }
  if (had && id === 'smoked_eel') {
    s.buffs.roadfed = 3;
    RF.log(s, 'Roadfed: your next 3 journeys are 12% faster.', 'good');
  }
  if (had && (id === 'cooked_trout' || id === 'smoked_eel')) { RF.save(s); RF.UI.render(s); }
  return out;
};

const v5FinishTravelBase = RF.finishTravel;
RF.finishTravel = function(a) {
  v5FinishTravelBase(a);
  const s = RF.state;
  if (!s) return;
  const pop = RF.makeResult(s, a.__v5before, `Arrived: ${RF.DATA.locations[s.location]?.name || 'Destination'}`, '🧭');
  if (pop && !s.combat && !RF.UI.modal) { RF.UI.modal = pop; RF.UI.render(s); }
};

const v5DamageBase = RF.playerAttackDamage;
RF.playerAttackDamage = function(s, a, magic=false) {
  const result = v5DamageBase(s, a, magic);
  if (s.buffs?.steadyHands > 0 && a?.accuracy < 1) result.dmg = Math.round(result.dmg * 1.06);
  return result;
};

const v5BattleAbilityBase = RF.battleAbility;
RF.battleAbility = function(id) {
  const s = RF.state;
  const before = s?.buffs?.steadyHands || 0;
  const out = v5BattleAbilityBase(id);
  if (before > 0 && s?.combat && ['power','precision','bleeding_cut','crushing_blow','volley'].includes(id)) {
    s.buffs.steadyHands = Math.max(0, before - 1);
  }
  return out;
};

const v5TravelBase = RF.travel;
RF.travel = function(id) {
  const s = RF.state;
  if (s?.buffs?.roadfed > 0 && !s.activity && !s.combat) {
    const min = RF.DATA.locations[s.location]?.neighbors?.[id];
    const dest = RF.DATA.locations[id];
    if (min && dest && (!dest.lockedFlag || s.flags[dest.lockedFlag])) {
      s.buffs.roadfed--;
      return RF.startActivity('travel', `Travelling to ${dest.name}`, Math.max(2, Math.round(min * 0.88)), { target:id, from:s.location });
    }
  }
  return v5TravelBase(id);
};

if (RF.state) {
  RF.migrateV5(RF.state);
  RF.log(RF.state, 'Realmforge V5 awakened: visible resources, campfires, field cooking and activity result popups are active.', 'important');
  RF.save(RF.state);
  RF.UI.render(RF.state);
}
