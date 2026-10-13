# D&D 5e Character Sheet

A single-page D&D 5e (2014) character sheet: automated rolls, combat turn tracker, spells, inventory with nested containers, companions, Roll20 dice, and live sync between devices.

**Live site:** served from [`docs/`](docs/) by GitHub Pages.

- Each character has a private link: `…/?c=<id>`. The character itself is stored in Firebase (Firestore), not in this repo, and stays in sync live on every device that has the link open.
- Opening the site without `?c=` starts a new character that is saved in that browser only.
- When a new version is pushed, open sheets show a "Sheet updated — tap to reload" banner.

## Building

```
cd sheet
python3 build.py                 # builds the blank sheet (DnD_Character_Sheet.html)
python3 build_pages.py ../docs   # builds the Pages site into docs/
```

`sheet/src` is the app code, `sheet/data` the rules content (SRD 5.1 plus short summaries), `sheet/ext` the Roll20 companion extension that the sheet can download. `sheet/pages_config.json` is the Firebase web config (public by design; access is controlled by Firestore rules).
