/* Realmforge V10.6 — Criminal Record
   - Expands Law & Infamy with successful/failed pickpockets and burglaries.
   - Tracks jail sentences and cumulative time served.
   - Preserves existing successful crime totals; new failure/jail counters begin from this version.
*/
(function(){
'use strict';
const RF=window.RF;if(!RF)return;
RF.V106=RF.V106||{};RF.V106.version='10.6.0';

RF.migrateV106=function(s){
  if(!s)return s;
  s.stats=s.stats||{};
  if(s.stats.pickpockets==null)s.stats.pickpockets=0;       // existing successful lifts
  if(s.stats.pickpocketsFailed==null)s.stats.pickpocketsFailed=0;
  if(s.stats.burglaries==null)s.stats.burglaries=0;         // existing successful burglaries
  if(s.stats.burglariesFailed==null)s.stats.burglariesFailed=0;
  if(s.stats.jailDays==null)s.stats.jailDays=0;
  if(s.stats.jailSentences==null)s.stats.jailSentences=0;
  s.version='10.6.0';
  return s;
};

// Pickpocket failures. A successful lift already increments stats.pickpockets in V10.5.
const v106LiftBase=RF.liftPurse;
RF.liftPurse=function(){
  const s=RF.state;if(!s)return v106LiftBase?.();
  RF.migrateV106(s);
  const beforeSuccess=s.stats.pickpockets||0;
  const beforeBounty=s.crime?.bounty||0;
  const result=v106LiftBase.apply(this,arguments);
  const failed=(s.stats.pickpockets||0)===beforeSuccess && (s.crime?.bounty||0)>beforeBounty;
  if(failed){s.stats.pickpocketsFailed=(s.stats.pickpocketsFailed||0)+1;RF.save(s)}
  return result;
};

// Burglary failures can happen while entering or while searching inside.
const v106BurgEntryBase=RF.v92BurglaryAttempt;
if(v106BurgEntryBase)RF.v92BurglaryAttempt=function(){
  const s=RF.state;RF.migrateV106(s);const before=s.crime?.bounty||0;
  const result=v106BurgEntryBase.apply(this,arguments);
  if((s.crime?.bounty||0)>before){s.stats.burglariesFailed=(s.stats.burglariesFailed||0)+1;RF.save(s)}
  return result;
};
const v106BurgSearchBase=RF.v92BurglarySearch;
if(v106BurgSearchBase)RF.v92BurglarySearch=function(){
  const s=RF.state;RF.migrateV106(s);const before=s.crime?.bounty||0;
  const result=v106BurgSearchBase.apply(this,arguments);
  if((s.crime?.bounty||0)>before){s.stats.burglariesFailed=(s.stats.burglariesFailed||0)+1;RF.save(s)}
  return result;
};

// Track sentences and time served when surrendering to a bounty hunter.
const v106ResolveBountyBase=RF.resolveBounty;
if(v106ResolveBountyBase)RF.resolveBounty=function(choice){
  const s=RF.state;RF.migrateV106(s);
  const bounty=s.crime?.bounty||0;
  const days=choice==='prison'?Math.max(1,Math.ceil(bounty/60)):0;
  const result=v106ResolveBountyBase.apply(this,arguments);
  if(choice==='prison'&&days>0){
    s.stats.jailDays=(s.stats.jailDays||0)+days;
    s.stats.jailSentences=(s.stats.jailSentences||0)+1;
    RF.save(s);
  }
  return result;
};

RF.v106JailText=function(s){
  const days=s.stats?.jailDays||0;
  if(days<=0)return 'None';
  return `${days} day${days===1?'':'s'}`;
};

// Add the detailed record to the existing Law & Infamy card.
const v106CharBase=RF.UI.character.bind(RF.UI);
RF.UI.character=function(s){
  RF.migrateV106(s);
  let html=v106CharBase(s);
  const marker='<section class="card"><h3>Law & Infamy</h3>';
  const start=html.indexOf(marker);
  if(start<0)return html;
  const end=html.indexOf('</section>',start);
  if(end<0)return html;
  const record=`<hr><div class="sub" style="margin-bottom:8px">Criminal Record</div><div class="statsGrid v106CrimeRecord">
    <div class="statbox"><span>🫳 Pickpockets • Success</span><b>${s.stats.pickpockets||0}</b></div>
    <div class="statbox"><span>🚨 Pickpockets • Failed</span><b>${s.stats.pickpocketsFailed||0}</b></div>
    <div class="statbox"><span>🪟 Burglaries • Success</span><b>${s.stats.burglaries||0}</b></div>
    <div class="statbox"><span>🔔 Burglaries • Failed</span><b>${s.stats.burglariesFailed||0}</b></div>
    <div class="statbox"><span>⛓️ Time in Jail</span><b>${RF.v106JailText(s)}</b></div>
    <div class="statbox"><span>🏚️ Jail Sentences</span><b>${s.stats.jailSentences||0}</b></div>
  </div>`;
  return html.slice(0,end)+record+html.slice(end);
};

if(!document.getElementById('rf-v106-style')){
  const st=document.createElement('style');st.id='rf-v106-style';st.textContent=`
    .v106CrimeRecord .statbox span{font-size:11px;line-height:1.25}
    .v106CrimeRecord .statbox b{font-size:16px}
  `;document.head.appendChild(st);
}

if(RF.state){RF.migrateV106(RF.state);RF.save(RF.state);RF.UI.render(RF.state)}
})();
