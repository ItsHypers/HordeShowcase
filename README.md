# Horde's Shiny Showcase

A Horde-themed shiny Pokémon leaderboard, built with React + Vite and deployed to GitHub Pages.

## Data sources

- `data/shiny_database` – raw per-player shiny collections (source of truth, not committed to the client bundle).
- `pokemon-data.json` – used only at build time to resolve sprite URLs and legendary/mythical flags.
- `generation.json` / `osw-encounter-tiers.json` – available for future features (evolution lines, tier points).

`scripts/build-data.mjs` reads these and writes lightweight `public/data/players.json` and
`public/data/species.json` files that the site fetches at runtime. The 34MB `pokemon-data.json`
never ships to the browser.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Runs `build-data` then `vite build`, producing a static site in `dist/`.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and publishes it
to GitHub Pages. Enable Pages for this repo with source set to "GitHub Actions".

The Vite `base` path in `vite.config.js` is set to `/HordeShowcase/` — update it if the repo is
renamed.
