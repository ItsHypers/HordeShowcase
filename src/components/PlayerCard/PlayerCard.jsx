import { useState } from 'react'
import styles from './PlayerCard.module.css'

const BADGE_FLAGS = [
  ['Egg', 'Egg'],
  ['Alpha', 'Alpha'],
  ['Safari', 'Safari'],
  ['Fossil', 'Fossil'],
  ['Swarm', 'Swarm'],
  ['Fishing', 'Fishing'],
  ['Honey Tree', 'Honey'],
  ['Event', 'Event'],
  ['Secret Shiny', 'Secret'],
]

function isTruthyFlag(value) {
  if (value == null) return false
  return ['yes', 'y', 'true', '1'].includes(String(value).trim().toLowerCase())
}

export default function PlayerCard({ player, data, rank }) {
  const [activeKey, setActiveKey] = useState(null)
  const shinies = Object.entries(data.shinies || {})

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.rank}>#{rank + 1}</span>
        <h3 className={styles.name}>{player}</h3>
        <span className={styles.count}>{data.shiny_count} shinies</span>
      </div>
      <div className={styles.grid}>
        {shinies.map(([key, shiny]) => {
          const badges = BADGE_FLAGS.filter(([field]) => isTruthyFlag(shiny[field]))
          const isActive = activeKey === key
          return (
            <div
              key={key}
              className={styles.shinyItem}
              onClick={() => setActiveKey(isActive ? null : key)}
              onMouseEnter={() => setActiveKey(key)}
              onMouseLeave={() => setActiveKey((prev) => (prev === key ? null : prev))}
            >
              {shiny.sprite ? (
                <img src={shiny.sprite} alt={shiny.displayName} loading="lazy" className={styles.sprite} />
              ) : (
                <div className={styles.spriteFallback}>?</div>
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
                        <span key={label} className={styles.badge}>{label}</span>
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
