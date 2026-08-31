import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useShinyData } from '../../hooks/useShinyData'
import PlayerCard from '../../components/PlayerCard/PlayerCard.jsx'
import SearchBar from '../../components/SearchBar/SearchBar.jsx'
import styles from './ShinyShowcase.module.css'

const INITIAL_COUNT = 10
const BATCH_SIZE = 10
const SHINY_FILTERS = [
  { label: 'Eggs', key: 'Egg' },
  { label: 'Alphas', key: 'Alpha' },
  { label: 'Safari', key: 'Safari' },
  { label: 'Fossils', key: 'Fossil' },
  { label: 'Swarm', key: 'Swarm' },
  { label: 'Fishing', key: 'Fishing' },
  { label: 'Honey Tree', key: 'Honey Tree' },
  { label: 'Secret Shiny', key: 'Secret Shiny' },
  { label: 'Event', key: 'Event' },
  { label: 'Killed', key: 'Killed' },
]

function isTruthyFlag(value) {
  if (value == null) return false
  return ['yes', 'y', 'true', '1'].includes(String(value).trim().toLowerCase())
}

export default function ShinyShowcase() {
  const { data, isLoading, error } = useShinyData()
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState([])
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT)
  const sentinelRef = useRef(null)

  const sortedPlayers = useMemo(() => {
    if (!data) return []
    return Object.entries(data).sort((a, b) => b[1].shiny_count - a[1].shiny_count)
  }, [data])

  const filteredPlayers = useMemo(() => {
    if (!search) return sortedPlayers
    const lower = search.toLowerCase()
    return sortedPlayers.filter(([name]) => name.toLowerCase().includes(lower))
  }, [sortedPlayers, search])

  const playersWithFilteredShinies = useMemo(() => {
    if (!activeFilters.length) return filteredPlayers
    return filteredPlayers
      .map(([player, playerData]) => {
        const shinies = Object.entries(playerData.shinies || {})
        const filtered = Object.fromEntries(
          shinies.filter(([, shiny]) => activeFilters.some((key) => isTruthyFlag(shiny[key]))),
        )
        const count = Object.keys(filtered).length
        if (!count) return null
        return [player, { ...playerData, shinies: filtered, shiny_count: count }]
      })
      .filter(Boolean)
  }, [filteredPlayers, activeFilters])

  const rankMap = useMemo(() => {
    const map = new Map()
    sortedPlayers.forEach(([player], index) => map.set(player, index))
    return map
  }, [sortedPlayers])

  const toggleFilter = useCallback((key) => {
    setActiveFilters((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }, [])

  useEffect(() => {
    setVisibleCount(INITIAL_COUNT)
  }, [search, activeFilters])

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, playersWithFilteredShinies.length))
  }, [playersWithFilteredShinies.length])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && loadMore(), { rootMargin: '400px' })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  if (isLoading) return <div className="message">Loading the Horde's treasures...</div>
  if (error) return <div className="message">The Horde's archives could not be reached.</div>

  const playersToShow = playersWithFilteredShinies.slice(0, visibleCount)
  const hasMore = visibleCount < playersWithFilteredShinies.length

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <button
          type="button"
          className={styles.crestButton}
          onClick={() => { window.location.href = `${import.meta.env.BASE_URL}admin` }}
          aria-label="Horde Crest"
        >
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Horde Crest" className={styles.crest} />
        </button>
        <div>
          <h1 className={styles.title}>Horde's Shiny Showcase</h1>
          <p className={styles.subtitle}>
            {playersWithFilteredShinies.length} champions of the Horde, {' '}
            {sortedPlayers.reduce((sum, [, p]) => sum + p.shiny_count, 0)} shinies claimed for the Horde.
          </p>
        </div>
      </header>

      <SearchBar value={search} onChange={setSearch} />

      <div className={styles.filters}>
        {SHINY_FILTERS.map((filter) => {
          const isActive = activeFilters.includes(filter.key)
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => toggleFilter(filter.key)}
              className={`${styles.filterChip} ${isActive ? styles.filterChipActive : ''}`}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      <div className={styles.showcase}>
        {playersToShow.map(([player, playerData]) => (
          <PlayerCard key={player} player={player} data={playerData} rank={rankMap.get(player)} />
        ))}
      </div>

      {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}

    </div>
  )
}
