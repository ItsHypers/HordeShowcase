// Builds static data for the site from the raw source files at the repo root.
// Run with `npm run build-data` (also runs automatically before dev/build).
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outDir = path.join(rootDir, 'public', 'data')
mkdirSync(outDir, { recursive: true })

const shinyDatabase = JSON.parse(readFileSync(path.join(rootDir, 'data', 'shiny_database'), 'utf8'))
const pokemonData = JSON.parse(readFileSync(path.join(rootDir, 'pokemon-data.json'), 'utf8'))

// A handful of species stored in pokemon-data.json only under a specific form key.
const FORM_ALIASES = {
  darmanitan: 'darmanitan-standard',
  basculin: 'basculin-red-striped',
}

const spriteUrl = (id, shiny) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shiny ? 'shiny/' : ''}${id}.png`

const toDisplayName = (key) => key.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ')

function normalize(name) {
  return name.trim().toLowerCase().replace(/\s+/g, '-')
}

function resolveSpecies(pokemonName) {
  const norm = normalize(pokemonName)
  const candidates = [norm, FORM_ALIASES[norm], norm.replace(/-f$|-m$/, '')]
  for (const key of candidates) {
    if (key && pokemonData[key]) {
      const entry = pokemonData[key]
      return {
        id: entry.id,
        isLegendary: Boolean(entry.is_legendary),
        isMythical: Boolean(entry.is_mythical),
      }
    }
  }
  return null
}

// Build a lookup of every species seen in the shiny database so the frontend
// can fetch a small species map instead of duplicating sprite URLs per shiny.
const speciesMap = {}
const unresolved = new Set()

for (const player of Object.values(shinyDatabase)) {
  for (const shiny of Object.values(player.shinies || {})) {
    const norm = normalize(shiny.Pokemon)
    if (speciesMap[norm]) continue
    const resolved = resolveSpecies(shiny.Pokemon)
    if (!resolved) {
      unresolved.add(shiny.Pokemon)
      continue
    }
    speciesMap[norm] = {
      name: toDisplayName(norm),
      sprite: spriteUrl(resolved.id, true),
      spriteDefault: spriteUrl(resolved.id, false),
      isLegendary: resolved.isLegendary,
      isMythical: resolved.isMythical,
    }
  }
}

if (unresolved.size) {
  console.warn(`[build-data] Could not resolve sprite for: ${[...unresolved].join(', ')}`)
}

writeFileSync(path.join(outDir, 'players.json'), JSON.stringify(shinyDatabase))
writeFileSync(path.join(outDir, 'species.json'), JSON.stringify(speciesMap))
copyFileSync(path.join(rootDir, 'logo.png'), path.join(rootDir, 'public', 'logo.png'))

console.log(`[build-data] Wrote ${Object.keys(shinyDatabase).length} players and ${Object.keys(speciesMap).length} species.`)
