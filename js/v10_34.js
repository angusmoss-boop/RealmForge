window.RF=window.RF||{};
RF.VERSION='10.34.0';
RF.BUILD={
  version:'10.34.0',
  title:'Earned Finds',
  built:'16 Sep 2026 • 01:35 BST',
  buildId:'20260916-0135-bst'
};
RF.V1034=RF.V1034||{};

/* Realmforge V10.34 — Earned Finds
   - Retires the old V7 static location lockboxes that appeared automatically on arrival.
   - Locked treasure is now exclusively created by the Explore discovery system.
   - Explore-discovered chests remain persistent local Actions until opened or jammed.
*/

(()=>{
const V=RF.V1034;
V.LEGACY_LOCKS=new Set(['ruins_chest','deep_cache','fen_coffer','ironridge_safe']);

// Mark the old V7 definitions as retired rather than deleting them outright. Keeping the
// definitions avoids breaking an ancient in-flight save/modal while making it impossible
// for the normal world UI to treat them as discoveries the player actually found.
for(const id of V.LEGACY_LOCKS){
  if(RF.DATA?.lockSites?.[id])RF.DATA.lockSites[id].v1034Retired=true;
}

V.migrate=function(s){
  if(!s)return s;
  s.version='10.34.0';
  s.v1034=s.v1034||{};
  s.v1034.legacyStaticLocksRetired=true;
  return s;
};

const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.34.0';
  const oldMig=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(oldMig(s));
}

// V7's context panel used this function to display every unopened lockSite whose location
// matched the player's current location. Those were authored content, not discovered finds.
// Explore chests use s.v1025.chests and the V10.27 Actions integration instead, so the V7
// "Locked Finds" list should now always be empty.
RF.v7LocksHere=function(){return []};

// Safety guard in case an old/stale DOM element or ancient save tries to launch one of the
// retired static locks directly. Do not allow it to re-enter the obsolete reward path.
const startLockBase=RF.startLockpick;
RF.startLockpick=function(id){
  if(V.LEGACY_LOCKS.has(id)){
    const s=RF.state;
    if(s){
      RF.UI.modal={
        type:'message',
        title:'No Locked Find Here',
        text:'Locked finds are now discoveries made through Explore. This old static lockbox has been retired.'
      };
      RF.UI.render(s);
    }
    return;
  }
  return startLockBase?.apply(this,arguments);
};

// If the update is applied while one of the obsolete V7 locks is somehow already active,
// safely close it and restore the clock rather than leaving the player inside a retired UI.
if(RF.actionGame?.type==='lockpick'&&V.LEGACY_LOCKS.has(RF.actionGame.id)){
  const s=RF.state;
  const resume=RF.actionGame.resumeSpeed;
  RF.actionGame=null;
  RF.UI.modal=null;
  RF.v7ClearTimer?.();
  if(s&&!s.combat)s.speed=resume??1;
}

if(RF.state){
  V.migrate(RF.state);
  RF.save?.(RF.state);
  // One clean render removes an already-visible V7 Locked Finds panel after hot reload.
  setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0);
}
})();
