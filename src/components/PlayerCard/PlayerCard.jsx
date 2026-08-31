import { useState } from 'react'
import styles from './PlayerCard.module.css'

const ICON_BASE = `${import.meta.env.BASE_URL}images/Shiny%20Showcase/`

// [field key on shiny record, badge label, icon filename or null if no icon exists]
const BADGE_FLAGS = [
  ['Egg', 'Egg', 'egg.png'],
  ['Alpha', 'Alpha', null],
  ['Safari', 'Safari', 'safari.png'],
  ['Fossil', 'Fossil', 'fossil.png'],
  ['Swarm', 'Swarm', 'swarm.png'],
  ['Fishing', 'Fishing', 'fishing.png'],
  ['Honey Tree', 'Honey', 'honey.png'],
  ['Event', 'Event', 'event.png'],
  ['Secret Shiny', 'Secret', 'secretshiny.png'],
]

const TROPHIES = [
  { file: 'gold.png', label: 'Champion', className: 'rankGold' },
  { file: 'silver.png', label: '', className: 'rankSilver' },
  { file: 'bronze.png', label: '', className: 'rankBronze' },
]

const TAG_CLASS_BY_LABEL = {
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
}

function isTruthyFlag(value) {
  if (value == null) return false
  return ['yes', 'y', 'true', '1'].includes(String(value).trim().toLowerCase())
}

function getTagClassName(label) {
  return TAG_CLASS_BY_LABEL[label] || 'tagEgg'
}

export default function PlayerCard({ player, data, rank }) {
  const [activeKey, setActiveKey] = useState(null)
  const [brokenSprites, setBrokenSprites] = useState(() => new Set())
  const shinies = Object.entries(data.shinies || {})
  const trophy = TROPHIES[rank]

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.rank}>#{rank + 1}</span>
        {trophy && (
          <img
            src={`${ICON_BASE}${trophy.file}`}
            alt={trophy.label}
            title={trophy.label}
            className={styles.trophy}
          />
        )}
        <h3 className={`${styles.name} ${trophy ? styles[trophy.className] : ''}`}>
          {trophy ? `${trophy.label} ${player}` : player}
        </h3>
        <span className={styles.count}>{data.shiny_count} shinies</span>
      </div>
      <div className={styles.grid}>
        {shinies.map(([key, shiny]) => {
          const badges = BADGE_FLAGS.filter(([field]) => isTruthyFlag(shiny[field]))
          const icons = badges.filter(([, , icon]) => icon)
          const isAlpha = isTruthyFlag(shiny.Alpha)
          const isSecret = isTruthyFlag(shiny['Secret Shiny'])
          const isActive = activeKey === key
          return (
            <div
              key={key}
              className={`${styles.shinyItem} ${isAlpha ? styles.alphaGlow : ''} ${isSecret ? styles.secretGlow : ''}`}
              onClick={() => setActiveKey(isActive ? null : key)}
              onMouseEnter={() => setActiveKey(key)}
              onMouseLeave={() => setActiveKey((prev) => (prev === key ? null : prev))}
            >
              {shiny.sprite && !brokenSprites.has(key) ? (
                <img
                  src={shiny.sprite}
                  alt={shiny.displayName}
                  loading="lazy"
                  className={styles.sprite}
                  onError={() => setBrokenSprites((prev) => new Set(prev).add(key))}
                />
              ) : (
                <div className={styles.spriteFallback}>?</div>
              )}
              {icons.length > 0 && (
                <div className={styles.iconRow}>
                  {icons.map(([field, label, icon]) => (
                    <img key={field} src={`${ICON_BASE}${icon}`} alt={label} title={label} className={styles.icon} />
                  ))}
                </div>
              )}
              {isActive && (
                <div className={styles.infoBox}>
                  <strong>{shiny.nickname || shiny.displayName}</strong>
                  <div>{shiny.displayName}</div>
                  {shiny.location && <div>{shiny.location}</div>}
                  {shiny.date_caught && <div>{new Date(shiny.date_caught).toLocaleDateString()}</div>}
                  {badges.length > 0 && (
                    <div className={styles.badgeRow}>
                      {badges.map(([, label]) => (
                        <span key={label} className={`${styles.tag} ${styles[getTagClassName(label)]}`}>
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
