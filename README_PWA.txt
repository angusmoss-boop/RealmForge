Realmforge V9.5 — Installable PWA Package

WHAT THIS IS
This package is ready to be hosted over HTTPS and installed to an Android/Samsung home screen as a standalone app.

FILES ADDED/UPDATED
- manifest.webmanifest
- sw.js
- icons/icon-192.png
- icons/icon-512.png
- maskable app icons
- PWA/mobile metadata in index.html

IMPORTANT
A PWA must normally be served from HTTPS (or localhost for testing).
Opening index.html directly from Downloads using file:// will run the game, but Android will generally not offer the proper standalone Install App experience.

RECOMMENDED HOSTING
GitHub Pages is free and suitable for this static game.

INSTALL ON SAMSUNG
1. Host this folder on HTTPS.
2. Open the hosted Realmforge URL in Chrome or Samsung Internet.
3. Chrome: menu (⋮) > Add to Home screen / Install app.
   Samsung Internet: menu > Add page to > Home screen, or Install app if offered.
4. Launch Realmforge from the new home-screen icon.
5. It should open in standalone portrait mode without the normal browser chrome.

SAVE SAFETY
Your Realmforge campaign saves remain browser/PWA local storage associated with the hosted site origin.
Use Realmforge's Export Save periodically as an external backup.
If you change to a completely different domain/host later, browser-local saves will not automatically move with you; use Export/Import.

UPDATES
When replacing files on the same host, keep the same URL/domain. The service worker uses a network-first strategy and updates its cache automatically.
If a major update appears stale, fully close Realmforge and reopen it, or clear the site's cache (not site data if you have not exported your saves).

GITHUB PAGES QUICK SETUP
1. Create a new GitHub repository, e.g. realmforge.
2. Upload the CONTENTS of this folder to the repository root.
3. Repository Settings > Pages.
4. Source: Deploy from a branch.
5. Branch: main, folder: / (root), Save.
6. GitHub will provide an HTTPS URL.
7. Open that URL on your Samsung and install it to the home screen.
