/* Realmforge V11.26.0 — Canonical Collection Foundations.
   Owns the historical V4 collection-log item tracking and collection presentation ancestry.
   Combat remains responsible for battle resolution; Social remains responsible for people/dialogue. */
(() => {
  'use strict';
  const RF=window.RF;
  const fragmentSources={"v4-collection-item-tracking":"const v4AddItem=RF.addItem;RF.addItem=function(s,id,q=1){v4AddItem(s,id,q);if(s.collection)s.collection.items[id]=true};\n","v4-collection-ui":"RF.UI.collectionPanel=function(s){let enemyTotal=Object.keys(RF.DATA.enemies).length,enemySeen=Object.keys(s.collection.enemies).filter(k=>s.collection.enemies[k]>0).length,itemTotal=Object.keys(RF.DATA.items).length,itemSeen=Object.keys(s.collection.items).length,npcSeen=Object.keys(s.collection.npcs).length,abilitySeen=Object.keys(s.collection.abilities).length;return `<section class=\"card\"><h3>Collection Log</h3><div class=\"statsGrid\"><div class=\"statbox\"><span>Bestiary</span><b>${enemySeen}/${enemyTotal}</b></div><div class=\"statbox\"><span>Items</span><b>${itemSeen}/${itemTotal}</b></div><div class=\"statbox\"><span>People</span><b>${npcSeen}</b></div><div class=\"statbox\"><span>Moves Used</span><b>${abilitySeen}</b></div></div><div class=\"list\" style=\"margin-top:10px\">${Object.entries(s.collection.enemies).filter(([,q])=>q>0).slice(0,12).map(([id,q])=>`<div class=\"row\"><div class=\"icon\">${RF.DATA.enemies[id]?.icon||'❓'}</div><div class=\"meta\"><b>${RF.DATA.enemies[id]?.name||id}</b><small>${q} defeated</small></div></div>`).join('')}</div></section>`};\n"};
  const installedFragments=[],done=new Set();
  function runClassic(source,label){
    const script=document.createElement('script');script.type='text/javascript';script.setAttribute('data-rf-canonical-collection-fragment',label);
    script.textContent=source+'\n//# sourceURL=realmforge-canonical:///systems.collection/fragment/'+label+'\n';
    (document.head||document.documentElement).appendChild(script);script.remove();
  }
  function installHistoricalFragment(name){
    if(done.has(name))return false;const source=fragmentSources[name];if(typeof source!=='string')throw new Error('Unknown canonical Collection fragment: '+name);
    runClassic(source,name);done.add(name);installedFragments.push(name);return true;
  }
  const api={installHistoricalFragment,installedFragments,fragmentNames:()=>Object.keys(fragmentSources),panel:s=>RF.UI?.collectionPanel?.(s)||'',enemyKills:(s,id)=>s?.collection?.enemies?.[id]||0,itemSeen:(s,id)=>!!s?.collection?.items?.[id]};
  RF.Systems.Collection=RF.Modules.register('systems.collection',api,{owner:'systems',status:'canonical',historicalFragmentCount:Object.keys(fragmentSources).length,extractedIn:'11.26.0'});
})();
