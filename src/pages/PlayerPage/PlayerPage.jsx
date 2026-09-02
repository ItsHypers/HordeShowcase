import { useEffect, useMemo } from 'react'
import { useShinyData } from '../../hooks/useShinyData'
import PlayerCard from '../../components/PlayerCard/PlayerCard.jsx'
import { navigate } from '../../lib/navigation.js'
import { BADGE_FLAGS, ICON_BASE, TROPHIES, isTruthyFlag } from '../../lib/shinyMeta.js'
import styles from './PlayerPage.module.css'

export default function PlayerPage({ player }) {
  const { data, isLoading, error } = useShinyData()

  useEffect(() => {
    document.title = `${player} - Horde's Shiny Showcase`
    return () => {
      document.title = "Horde's Shiny Showcase"
    }
  }, [player])

  const playerData = data?.[player]

  const rank = useMemo(() => {
    if (!data) return -1
    return Object.entries(data)
      .sort((a, b) => b[1].shiny_count - a[1].shiny_count)
      .findIndex(([name]) => name === player)
  }, [data, player])

  const categoryCounts = useMemo(() => {
    if (!playerData) return []
    const shinies = Object.values(playerData.shinies || {})
    return BADGE_FLAGS.map(([field, label, icon]) => ({
      label,
      icon,
      count: shinies.filter((shiny) => isTruthyFlag(shiny[field])).length,
    })).filter((entry) => entry.count > 0)
  }, [playerData])

  if (isLoading) return <div className="message">Loading the Horde's treasures...</div>
  if (error) return <div className="message">The Horde's archives could not be reached.</div>

  const trophy = TROPHIES[rank]

  return (
    <div className={styles.page}>
      <a
        href={`${import.meta.env.BASE_URL}`}
        className={styles.back}
        onClick={(e) => {
          e.preventDefault()
          navigate('/showcase')
        }}
      >
        ← Back to the Horde
      </a>

      {playerData ? (
        <>
          <div className={styles.banner}>
            {trophy && (
              <img src={`${ICON_BASE}${trophy.file}`} alt={trophy.label} className={styles.bannerTrophy} />
            )}
            <h1 className={styles.bannerName}>{player}</h1>
            <p className={styles.bannerSubtitle}>
              Rank #{rank + 1} of the Horde · {playerData.shiny_count} shinies claimed
            </p>
            {categoryCounts.length > 0 && (
              <div className={styles.statRow}>
                {categoryCounts.map(({ label, icon, count }) => (
                  <span key={label} className={styles.statPill}>
                    {icon && <img src={`${ICON_BASE}${icon}`} alt="" className={styles.statIcon} />}
                    {label} × {count}
                  </span>
                ))}
              </div>
            )}
          </div>

          <PlayerCard player={player} data={playerData} rank={rank} size="large" />
        </>
      ) : (
        <div className="message">No shinies found for {player}.</div>
      )}
    </div>
  )
}
