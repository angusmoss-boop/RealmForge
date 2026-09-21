/* Realmforge V11.30.0 — finalize decomposed canonical legacy content registry. */
(() => {
  'use strict';
  const RF=window.RF;
  const api=RF.Content;
  const count=api?.legacyBlockCount?.()||0;
  if(count!==api?.expectedLegacyBlocks)throw new Error(`Realmforge legacy content block count mismatch: ${count}/${api?.expectedLegacyBlocks}`);
  if(RF.Modules?.register)RF.Modules.register('data.legacyContentBlocks',api,{owner:'data',status:'canonical',blocks:count,decomposed:true});
})();
