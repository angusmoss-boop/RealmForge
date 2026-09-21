/* Realmforge V11.30.0 — assemble canonical base content into RF.DATA. */
(()=>{
  'use strict';
  const source=window.RF_BASE_CONTENT_SOURCE||{};
  window.RF=window.RF||{};
  window.RF.DATA=source;
  try{delete window.RF_BASE_CONTENT_SOURCE;}catch(_){}
})();
