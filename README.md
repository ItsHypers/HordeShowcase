# Horde's Shiny Showcase

A Horde-themed shiny Pokémon leaderboard, built with React + Vite and deployed to GitHub Pages.

## Data sources

- `data/shiny_database` – raw per-player shiny collections (source of truth, not committed to the client bundle).
- `data/generation.json` – full Pokedex grouped by generation/evolution line; flattened at build time into `public/data/pokemon-names.json`, which powers the admin "Add a Shiny" autocomplete.
- `data/pokemon-data.json` / `data/osw-encounter-tiers.json` – available for future features (species metadata, tier points).
- `images/logo.png` – source site logo, copied to `public/images/logo.png` at build time.
- `public/images/pokemon_gifs/` – local animated gif sprites, one per species (normalized lowercase, hyphenated filename).

`scripts/build-data.mjs` reads the `data/` source files and writes the lightweight
`public/data/players.json` and `public/data/pokemon-names.json` files that the site
fetches at runtime, and copies `images/logo.png` into `public/images/`. Sprites are
resolved client-side to `images/pokemon_gifs/<normalized-name>.gif` instead of a
generated species map.


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
