window.RF=window.RF||{};
RF.VERSION='10.23.0';

/* Realmforge V10.23 — Second Wind
   - Passive Energy recovery is now a clear +1 Energy every 3 simulated minutes.
   - Recovery only accumulates while world time actually advances.
   - No fractional/ceiling-display phantom Energy and no banking recovery while already full.
*/

(function(){
'use strict';
const RF=window.RF;if(!RF)return;
RF.V1023=RF.V1023||{};
RF.V1023.version='10.23.0';
RF.V1023.minutesPerEnergy=3;

RF.migrateV1023=function(s){
  if(!s)return s;
  s.version='10.23.0';
  s.flags=s.flags||{};
  s.v1023=s.v1023||{};
  let carry=Number(s.v1023.energyRecoveryMinutes);
  if(!Number.isFinite(carry)||carry<0)carry=0;
  s.v1023.energyRecoveryMinutes=Math.min(RF.V1023.minutesPerEnergy-0.0001,carry);
  return s;
};

const v1023New=RF.newGame;RF.newGame=function(...a){return RF.migrateV1023(v1023New(...a))};
const v1023Load=RF.load;RF.load=function(){return RF.migrateV1023(v1023Load())};
const v1023Import=RF.importSave;RF.importSave=function(x){return RF.migrateV1023(v1023Import(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.23.0';
  const oldMig=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=function(s){return RF.migrateV1023(oldMig(s))};
}

// V10 + V10.22 together added 0.04 Energy per simulated minute. Let the existing
// world/travel logic run, then replace only that legacy passive gain with an exact
// integer pulse: +1 Energy per 3 simulated minutes. Travel Energy spending remains intact.
const v1023AdvanceBase=RF.advanceWorld;
RF.advanceWorld=function(minutes){
  const s0=RF.state;
  const mins=Math.max(0,Number(minutes)||0);
  if(!s0?.player||mins<=0)return v1023AdvanceBase.apply(this,arguments);

  RF.migrateV1023(s0);
  const before=Math.max(0,Number(s0.player.energy)||0);
  const max=Math.max(1,Number(s0.player.maxEnergy)||RF.V1022?.maxEnergy?.(s0.player.level)||100);
  const travelBefore=Math.max(0,Number(s0.stats?.travelEnergySpent)||0);

  const out=v1023AdvanceBase.apply(this,arguments);
  const s=RF.state;
  if(!s?.player)return out;
  RF.migrateV1023(s);

  const travelAfter=Math.max(0,Number(s.stats?.travelEnergySpent)||0);
  const travelSpent=Math.max(0,travelAfter-travelBefore);

  // Accumulate only real simulated minutes. Reaching max Energy discards leftover time,
  // preventing players from storing a hidden instant refill while already rested.
  let carry=Math.max(0,Number(s.v1023.energyRecoveryMinutes)||0);
  let recovered=0;
  if(before<max){
    carry+=mins;
    recovered=Math.floor(carry/RF.V1023.minutesPerEnergy);
    carry-=recovered*RF.V1023.minutesPerEnergy;
  }else{
    carry=0;
  }

  const afterRecovery=Math.min(max,before+recovered);
  s.player.energy=Math.max(0,afterRecovery-travelSpent);
  if(s.player.energy>=max)carry=0;
  s.v1023.energyRecoveryMinutes=carry;
  return out;
};

// Update the exhaustion copy so the new rate is visible rather than described as merely "slow".
const v1023ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  let h=v1023ModalBase(s);
  if(this.modal?.type==='v1022TravelEnergy'){
    h=h.replace('or let world time pass to recover slowly.','or let world time pass: you recover 1 Energy every 3 in-game minutes.');
  }
  return h;
};

if(RF.state){
  RF.migrateV1023(RF.state);
  if(!RF.state.flags.v1023Seen){
    RF.state.flags.v1023Seen=true;
    RF.log(RF.state,'V10.23: passive Energy now recovers by 1 point every 3 in-game minutes.','important');
  }
  RF.save(RF.state);RF.UI.render(RF.state);
}
})();
