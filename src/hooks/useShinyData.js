import { useEffect, useState } from 'react'
import { fetchShinyData } from '../api/adminApi.js'

const FORM_SLUGS = {
  gastrodon: 'gastrodon-west',
  basculin: 'basculin-red-striped',
}

const normalize = (name) => {
  const slug = name.trim().toLowerCase().replace(/\s+/g, '-')
  return FORM_SLUGS[slug] || slug
}
const toDisplayName = (key) => key.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ')

// Fetches the live shiny showcase data from the Worker (SHINY_DATA KV namespace)
// and attaches a local gif sprite to each shiny.
export function useShinyData() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const base = import.meta.env.BASE_URL

    fetchShinyData()
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

