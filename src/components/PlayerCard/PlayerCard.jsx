import { useState } from 'react'
import { navigate, playerHref } from '../../lib/navigation.js'
import { BADGE_FLAGS, ICON_BASE, TROPHIES, getTagClassName, isTruthyFlag } from '../../lib/shinyMeta.js'
import styles from './PlayerCard.module.css'

export default function PlayerCard({ player, data, rank, size = 'normal' }) {
  const [activeKey, setActiveKey] = useState(null)
  const [brokenSprites, setBrokenSprites] = useState(() => new Set())
  const shinies = Object.entries(data.shinies || {})
  const trophy = TROPHIES[rank]
  const isLarge = size === 'large'

  return (
    <div className={`${styles.card} ${isLarge ? styles.cardLarge : ''}`}>
      <div className={`${styles.header} ${isLarge ? styles.headerLarge : ''}`}>
        <span className={`${styles.rank} ${isLarge ? styles.rankLarge : ''}`}>#{rank + 1}</span>
        {trophy && (
          <img
            src={`${ICON_BASE}${trophy.file}`}
            alt={trophy.label}
            title={trophy.label}
            className={`${styles.trophy} ${isLarge ? styles.trophyLarge : ''}`}
          />
        )}
        <h3 className={`${styles.name} ${isLarge ? styles.nameLarge : ''} ${trophy ? styles[trophy.className] : ''}`}>
          <a
            href={playerHref(player)}
            className={styles.nameLink}
            onClick={(e) => {
              e.preventDefault()
              navigate(`/player/${encodeURIComponent(player)}`)
            }}
          >
            {trophy ? `${trophy.label} ${player}` : player}
          </a>
        </h3>
        <span className={`${styles.count} ${isLarge ? styles.countLarge : ''}`}>{data.shiny_count} shinies</span>
      </div>
      <div className={`${styles.grid} ${isLarge ? styles.gridLarge : ''}`}>
        {shinies.map(([key, shiny]) => {
          const badges = BADGE_FLAGS.filter(([field]) => isTruthyFlag(shiny[field]))
          const icons = badges.filter(([, , icon]) => icon)
          const isAlpha = isTruthyFlag(shiny.Alpha)
          const isSecret = isTruthyFlag(shiny['Secret Shiny'])
          const isActive = activeKey === key
          return (
            <div
              key={key}
              className={`${styles.shinyItem} ${isLarge ? styles.shinyItemLarge : ''} ${isAlpha ? styles.alphaGlow : ''} ${isSecret ? styles.secretGlow : ''}`}
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
