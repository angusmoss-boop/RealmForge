(() => {
  'use strict';
  const RF = window.RF;
  const api = {
    start: (...args) => typeof RF.startBattle === 'function' ? RF.startBattle(...args) : RF.spawnEnemy(...args),
    spawn: id => RF.spawnEnemy(id),
    action: action => RF.combatAction(action),
    ability: (...args) => typeof RF.battleAbility === 'function' ? RF.battleAbility(...args) : null,
    enemyTurn: () => RF.enemyBattleTurn ? RF.enemyBattleTurn() : RF.enemyTurn(),
    win: () => RF.winCombat(),
    flee: () => typeof RF.fleeV4 === 'function' ? RF.fleeV4() : RF.combatAction('flee'),
    useItem: id => typeof RF.useBattleItem === 'function' ? RF.useBattleItem(id) : RF.useItem(id),
    damageOutput: state => RF.weaponDamage(state),
    armour: state => RF.armor(state)
  };
  RF.Systems.Combat = RF.Modules.register('systems.combat', api, { owner: 'systems', status: 'canonical-facade', delegatesTo: 'legacy-v11.5.3' });
})();
