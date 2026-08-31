import { useEffect, useState } from 'react'
import { getMockSubmissions } from '../api/adminApi.js'

const FORM_SLUGS = {
  gastrodon: 'gastrodon-west',
  basculin: 'basculin-red-striped',
}

const normalize = (name) => {
  const slug = name.trim().toLowerCase().replace(/\s+/g, '-')
  return FORM_SLUGS[slug] || slug
}
const toDisplayName = (key) => key.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ')

// Fetches the pre-built player data and attaches a local gif sprite to each shiny.
export function useShinyData() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const base = import.meta.env.BASE_URL

    fetch(`${base}data/players.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load players: ${r.status}`)
        return r.json()
      })
      .then((players) => {
        if (cancelled) return
        const merged = {}
        for (const [player, playerData] of Object.entries(players)) {
          const shinies = {}
          for (const [key, shiny] of Object.entries(playerData.shinies || {})) {
            const norm = normalize(shiny.Pokemon)
            shinies[key] = {
              ...shiny,
              sprite: `${base}images/pokemon_gifs/${norm}.gif`,
              displayName: toDisplayName(norm),
            }
          }
          merged[player] = { ...playerData, shinies }
        }

        // Fold in shinies added via the admin mock backend until a real backend exists.
        for (const { player, shiny, submittedAt } of getMockSubmissions()) {
          if (!merged[player]) merged[player] = { shiny_count: 0, shinies: {} }
          const norm = normalize(shiny.Pokemon)
          merged[player].shinies[`mock-${submittedAt}`] = {
            ...shiny,
            sprite: `${base}images/pokemon_gifs/${norm}.gif`,
            displayName: toDisplayName(norm),
          }
        }
        for (const playerData of Object.values(merged)) {
          playerData.shiny_count = Object.keys(playerData.shinies).length
        }

        setData(merged)
      })
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setIsLoading(false))

    return () => {
      cancelled = true
    }
  }, [])

  return { data, isLoading, error }
}

