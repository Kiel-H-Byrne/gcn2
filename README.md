# Golf Clash Wind Chart Builder

A fast, tap-first tool for building a Golf Clash wind adjustment chart: pick your
clubs, dial in their levels, and read off max/mid/min power-ring adjustments for
any wind speed -- no dropdowns, no PDF generation step.

Open `index.html` directly in a browser, or serve the folder with any static
file server. There's no build step and no dependencies.

## Using it

- Tap a club in the grid to add it to **Your Bag**. It's suggested at the same
  level as the last club you set (or maxed, the first time).
- Set a club's level by tapping a level pill, dragging across the level track,
  or using the +/- buttons -- on either the club card or its bag chip.
- The chart below updates live. Toggle **Wind per Ring** (how much wind each
  additional power ring cancels out) vs **Rings per Wind** (how many rings to
  add for a given wind speed), pick a power mode, and give it a title.
- **Print / Save PDF** uses the browser's print dialog with a print-only layout.

## Keeping club data current

Golf Clash reworks and adds clubs often, so this app ships with a small
**starter dataset** (`data/clubs.js`) bootstrapped from a several-years-old
community snapshot -- treat every number in it as a placeholder, not a source
of truth.

The actual update mechanism is the **Manage Clubs** button in the app itself:

- **Add** a club that's missing, with its own per-level power/accuracy stats.
- **Edit** any club's stats, category, or rarity label.
- **Delete** a club that's been removed or reworked out of the game.
- **Export** your whole club list to a JSON file (a personal backup, or to
  share your data with someone else).
- **Import** a JSON file of clubs (an array of objects shaped like the ones in
  `data/clubs.js`) to bulk-load or restore data.

All of this is saved to `localStorage` in your browser and layered on top of
`data/clubs.js`, so the bundled file itself never needs to be hand-edited for
routine updates. If you want to reset everything to the original starter set,
clear this site's local storage.

## How the math works

`js/wind.js` is a from-scratch port of the wind-adjustment formula published
by the [golf-clash-notebook](https://github.com/golf-clash-notebook/golf-clash-notebook.github.io)
project (MIT licensed) -- accuracy and power stats determine how much wind one
power-meter ring cancels out, with per-category multipliers for how much a
club's ball flight fights the wind. As with that project's own tool, this only
models power and accuracy; it doesn't account for elevation, curl, spin, or
the Magnus effect, so treat the numbers as a strong estimate, not gospel.

This project is not affiliated with Playdemic or Golf Clash.

## Project structure

```
index.html        Markup + SVG icon sprite
css/styles.css     All styling (light/dark theme via CSS variables)
js/wind.js         Wind chart math (no DOM dependencies)
js/app.js          UI state, rendering, club editor
data/clubs.js      Starter club dataset (window.GC_CLUBS)
```
