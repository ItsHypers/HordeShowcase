export const ICON_BASE = `${import.meta.env.BASE_URL}images/Shiny%20Showcase/`

// [field key on shiny record, badge label, icon filename or null if no icon exists]
export const BADGE_FLAGS = [
  ['Egg', 'Egg', 'egg.png'],
  ['Alpha', 'Alpha', null],
  ['Safari', 'Safari', 'safari.png'],
  ['Fossil', 'Fossil', 'fossil.png'],
  ['Swarm', 'Swarm', 'swarm.png'],
  ['Fishing', 'Fishing', 'fishing.png'],
  ['Honey Tree', 'Honey', 'honey.png'],
  ['Event', 'Event', 'event.png'],
  ['Secret Shiny', 'Secret', 'secretshiny.png'],
  ['Killed', 'Killed', 'killed.png'],
]

export const TROPHIES = [
  { file: 'gold.png', label: 'Champion', className: 'rankGold' },
  { file: 'silver.png', label: '', className: 'rankSilver' },
  { file: 'bronze.png', label: '', className: 'rankBronze' },
]

export const TAG_CLASS_BY_LABEL = {
  Secret: 'tagSecret',
  Alpha: 'tagAlpha',
  Egg: 'tagEgg',
  Safari: 'tagSafari',
  Honey: 'tagHoney',
  Fossil: 'tagFossil',
  Fishing: 'tagFishing',
  Swarm: 'tagSwarm',
  Headbutt: 'tagHeadbutt',
  Event: 'tagEvent',
  Fav: 'tagFav',
  Favourite: 'tagFav',
  Favorite: 'tagFav',
  Legend: 'tagLegend',
  Mystery: 'tagMystery',
  Reaction: 'tagReaction',
  Killed: 'tagKilled',
}

export function isTruthyFlag(value) {
  if (value == null) return false
  return ['yes', 'y', 'true', '1'].includes(String(value).trim().toLowerCase())
}

export function getTagClassName(label) {
  return TAG_CLASS_BY_LABEL[label] || 'tagEgg'
}
