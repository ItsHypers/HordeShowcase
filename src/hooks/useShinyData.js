import { useEffect, useState } from 'react'

const normalize = (name) => name.trim().toLowerCase().replace(/\s+/g, '-')

// Fetches the pre-built player + species data and merges sprite info onto each shiny.
export function useShinyData() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const base = import.meta.env.BASE_URL

    Promise.all([
      fetch(`${base}data/players.json`).then((r) => {
        if (!r.ok) throw new Error(`Failed to load players: ${r.status}`)
        return r.json()
      }),
      fetch(`${base}data/species.json`).then((r) => {
        if (!r.ok) throw new Error(`Failed to load species: ${r.status}`)
        return r.json()
      }),
    ])
      .then(([players, species]) => {
        if (cancelled) return
        const merged = {}
        for (const [player, playerData] of Object.entries(players)) {
          const shinies = {}
          for (const [key, shiny] of Object.entries(playerData.shinies || {})) {
            const info = species[normalize(shiny.Pokemon)]
            shinies[key] = {
              ...shiny,
              sprite: info?.sprite ?? null,
              spriteDefault: info?.spriteDefault ?? null,
              displayName: info?.name ?? shiny.Pokemon,
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
