// Shared flag definitions for the admin "Add a Shiny" form and the Bulk Add parser.
export const FLAGS = [
  ['Egg', 'Egg'],
  ['Alpha', 'Alpha'],
  ['Safari', 'Safari'],
  ['Fossil', 'Fossil'],
  ['Swarm', 'Swarm'],
  ['Fishing', 'Fishing'],
  ['Honey Tree', 'Honey Tree'],
  ['Event', 'Event'],
  ['Secret Shiny', 'Secret Shiny'],
  ['Favourite', 'Favourite'],
  ['Legendary', 'Legendary'],
  ['Sold', 'Sold'],
  ['Reaction', 'Reaction'],
  ['MysteriousBall', 'Mysterious Ball'],
]

// Shorthand tags accepted in the Bulk Add textarea, e.g. "Bulbasaur (egg, ss)".
const FLAG_ALIASES = {
  egg: 'Egg',
  alpha: 'Alpha',
  safari: 'Safari',
  fossil: 'Fossil',
  swarm: 'Swarm',
  fishing: 'Fishing',
  honey: 'Honey Tree',
  'honey tree': 'Honey Tree',
  event: 'Event',
  ss: 'Secret Shiny',
  secret: 'Secret Shiny',
  'secret shiny': 'Secret Shiny',
  fav: 'Favourite',
  favourite: 'Favourite',
  favorite: 'Favourite',
  legendary: 'Legendary',
  legend: 'Legendary',
  sold: 'Sold',
  reaction: 'Reaction',
  mb: 'MysteriousBall',
  mysteryball: 'MysteriousBall',
  'mysterious ball': 'MysteriousBall',
}

// Resolves a shorthand tag (case-insensitive) to its canonical flag key, or null if unrecognized.
export function resolveFlagTag(tag) {
  return FLAG_ALIASES[tag.trim().toLowerCase()] || null
}

// Builds the Yes/No flag fields expected on a shiny record from a list of resolved flag keys.
export function buildFlagFields(flagKeys = []) {
  const fields = {}
  for (const [key] of FLAGS) fields[key] = flagKeys.includes(key) ? 'Yes' : 'No'
  return fields
}
