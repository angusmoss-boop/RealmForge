/* Realmforge V11.24.0 — Canonical Specialist Actions.
   Exact historical fragments execute synchronously at their original compatibility boundaries. */
(() => {
  'use strict';
  const RF=window.RF;
  const fragmentSources={"v7-specialist-core":"RF.V7={timer:null};\nRF.v7ClearTimer=function(){if(RF.V7.timer){clearInterval(RF.V7.timer);clearTimeout(RF.V7.timer);RF.V7.timer=null}};\nRF.v7Resume=function(){let g=RF.actionGame;if(g?.resumeSpeed!=null&&RF.state&&!RF.state.combat)RF.state.speed=g.resumeSpeed;RF.actionGame=null;RF.UI.modal=null;RF.v7ClearTimer();RF.UI.render(RF.state)};\nRF.v7Tool=function(s,skill){return RF.bestTool?RF.bestTool(s,skill):null};\n","v7-potion-experiment":"// ---------- Potion experimentation ----------\nRF.startPotionLab=function(){let s=RF.state,resume=s.speed;s.speed=0;RF.actionGame={type:'potionLab',ingredients:[],resumeSpeed:resume,message:'Choose two reagents. Known formulae are recorded after successful discoveries.'};RF.UI.modal={type:'v7Action'};RF.UI.render(s)};\nRF.potionIngredient=function(id){let g=RF.actionGame,s=RF.state;if(!g||g.type!=='potionLab'||(s.inventory[id]||0)<1)return;if(g.ingredients.includes(id)){g.ingredients=g.ingredients.filter(x=>x!==id)}else if(g.ingredients.length<2)g.ingredients.push(id);RF.UI.render(s)};\nRF.brewExperiment=function(){let s=RF.state,g=RF.actionGame;if(!g||g.type!=='potionLab'||g.ingredients.length!==2)return;let [a,b]=g.ingredients.sort(),key=`${a}|${b}`,result=RF.DATA.potionExperiments[key],before=RF.activitySnapshot(s);RF.takeItem(s,a,1);RF.takeItem(s,b,1);RF.advanceWorld(9);if(result){let discovered=!s.v7.formulas[key];s.v7.formulas[key]=result;RF.addItem(s,result,1);RF.addXp(s,'herblore',discovered?85:32);if(discovered)s.stats.potionsDiscovered++;g.message=discovered?`✨ New formula discovered: ${RF.DATA.items[result].name}`:`You reproduce ${RF.DATA.items[result].name}.`;}else{let success=Math.random()<.22+Math.min(.38,s.skills.herblore.level*.018);if(success){RF.addItem(s,'field_tonic',1);RF.addXp(s,'herblore',26);g.message='The mixture is not elegant, but it stabilises into a useful Field Tonic.';}else{RF.addXp(s,'herblore',8);g.message='💨 The mixture curdles into medicinal-smelling foam. Nothing usable remains.';}}RF.save(s);s.speed=g.resumeSpeed??s.speed;RF.actionGame=null;RF.UI.modal=RF.makeResult(s,before,result?'Experiment Successful':'Experiment Complete','🧪')||{type:'message',title:'Experiment Complete',text:g.message};RF.UI.render(s)};\n"};
  const installedFragments=[],fragmentSet=new Set();
  function runClassic(source,label){
    const script=document.createElement('script');script.type='text/javascript';
    script.setAttribute('data-rf-canonical-systems-specialist-fragment',label);
    script.textContent=source+'\n//# sourceURL=realmforge-canonical:///systems.specialist/fragment/'+label+'\n';
    (document.head||document.documentElement).appendChild(script);script.remove();
  }
  function installHistoricalFragment(name){
    if(fragmentSet.has(name))return false;const source=fragmentSources[name];
    if(typeof source!=='string')throw new Error('Unknown canonical Specialist Actions fragment: '+name);
    runClassic(source,name);fragmentSet.add(name);installedFragments.push(name);return true;
  }
  const api={installHistoricalFragment,installedFragments,fragmentNames:()=>Object.keys(fragmentSources),resume:()=>RF.v7Resume?.(),tool:(s,skill)=>RF.v7Tool?.(s,skill),startPotionLab:()=>RF.startPotionLab?.()};
  RF.Systems.Specialist=RF.Modules.register('systems.specialist',api,{owner:'systems',status:'canonical',historicalFragmentCount:Object.keys(fragmentSources).length,extractedIn:'11.24.0'});
})();
