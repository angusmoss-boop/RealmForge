# Realmforge content packs

This directory is the normal home for **new V12+ content**.

A pack is a readable JavaScript source file that calls `RF.Authoring.registerPack(...)`,
`RF.Authoring.item(...)`, `RF.Authoring.enemy(...)`, and the other canonical authoring helpers.

`tools/build_content.js` automatically appends `*.js` files in this directory to the Data bundle
in lexical filename order. Prefix filenames when order matters, for example:

- `10_greenvale_expansion.js`
- `20_mirefen_expansion.js`

Do not add chronological `v12_1.js` patch files for ordinary content. Content belongs here;
mechanic changes belong to their canonical system owner.
