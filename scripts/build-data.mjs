// Builds static data for the site from the raw source files at the repo root.
// Run with `npm run build-data` (also runs automatically before dev/build).
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const dataDir = path.join(rootDir, 'data')
const outDir = path.join(rootDir, 'public', 'data')
const outImagesDir = path.join(rootDir, 'public', 'images')
mkdirSync(outDir, { recursive: true })
mkdirSync(outImagesDir, { recursive: true })

const shinyDatabase = JSON.parse(readFileSync(path.join(dataDir, 'shiny_database'), 'utf8'))
writeFileSync(path.join(outDir, 'players.json'), JSON.stringify(shinyDatabase))

// Flattens generation.json's evolution-line groupings into a sorted list of display
// names, used to power the Pokemon autocomplete on the admin "Add a Shiny" form.
const generations = JSON.parse(readFileSync(path.join(dataDir, 'generation.json'), 'utf8'))
const pokemonNames = Object.values(generations)
  .flat(2)
  .map((name) => name.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' '))
  .sort((a, b) => a.localeCompare(b))
writeFileSync(path.join(outDir, 'pokemon-names.json'), JSON.stringify(pokemonNames))

copyFileSync(path.join(rootDir, 'images', 'logo.png'), path.join(outImagesDir, 'logo.png'))

console.log(`[build-data] Wrote ${Object.keys(shinyDatabase).length} players and ${pokemonNames.length} Pokemon names.`)

