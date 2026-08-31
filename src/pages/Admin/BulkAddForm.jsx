import { useState } from 'react'
import { addShiny } from '../../api/adminApi.js'
import { resolveFlagTag, buildFlagFields } from './flags.js'
import styles from './Admin.module.css'

const PLACEHOLDER = `Hyper: Meowth (egg), Bulbasaur (SS), Persian (Alpha)
Minish: Magikarp, Skorupi (sold)`

// Splits a line's entry list on commas that aren't inside parentheses.
function splitEntries(text) {
  return (
    text
      .match(/[^,()]+(?:\([^)]*\))?/g)
      ?.map((part) => part.trim())
      .filter(Boolean) || []
  )
}

function parseBulkText(text) {
  const entries = []
  const lineErrors = []

  text.split('\n').forEach((rawLine, lineIndex) => {
    const line = rawLine.trim()
    if (!line) return

    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) {
      lineErrors.push(`Line ${lineIndex + 1}: missing ":" after the player name - "${line}"`)
      return
    }
    const player = line.slice(0, colonIndex).trim()
    const rest = line.slice(colonIndex + 1).trim()
    if (!player || !rest) {
      lineErrors.push(`Line ${lineIndex + 1}: could not parse "${line}"`)
      return
    }

    for (const part of splitEntries(rest)) {
      const match = part.match(/^([^(]+?)\s*(?:\(([^)]*)\))?$/)
      const pokemon = match?.[1]?.trim()
      if (!pokemon) {
        lineErrors.push(`Line ${lineIndex + 1}: could not parse entry "${part}"`)
        continue
      }
      const tags = (match[2] || '').split(/[,/]/).map((t) => t.trim()).filter(Boolean)
      const flagKeys = []
      const unknownTags = []
      for (const tag of tags) {
        const resolved = resolveFlagTag(tag)
        if (resolved) flagKeys.push(resolved)
        else unknownTags.push(tag)
      }
      entries.push({ id: `${lineIndex}-${entries.length}-${pokemon}`, player, pokemon, flagKeys, unknownTags })
    }
  })

  return { entries, lineErrors }
}

export default function BulkAddForm() {
  const [text, setText] = useState('')
  const [preview, setPreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState(null)

  const handleParse = () => {
    setResults(null)
    setPreview(parseBulkText(text))
  }

  const removeEntry = (id) =>
    setPreview((prev) => ({ ...prev, entries: prev.entries.filter((entry) => entry.id !== id) }))

  const handleSubmitAll = async () => {
    if (!preview?.entries.length) return
    setIsSubmitting(true)
    const failures = []
    let successCount = 0

    for (const entry of preview.entries) {
      const shiny = { Pokemon: entry.pokemon, ...buildFlagFields(entry.flagKeys) }
      try {
        await addShiny(entry.player, shiny)
        successCount += 1
      } catch (err) {
        failures.push({ entry, message: err.message || 'Failed to add shiny.' })
      }
    }

    setIsSubmitting(false)
    setResults({ successCount, failures })
    if (!failures.length) {
      setText('')
      setPreview(null)
    }
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Bulk Add</h2>
      <p className={styles.hint}>
        One player per line: <code>Player: Pokemon (tag, tag), Pokemon (tag)</code>. Recognized tags: egg,
        alpha, ss (secret shiny), sold, safari, fossil, swarm, fishing, honey, event, fav, legendary,
        reaction, mb (mysterious ball).
      </p>

      <label className={styles.field}>
        <span>Entries</span>
        <textarea
          className={styles.textarea}
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={PLACEHOLDER}
        />
      </label>

      <button type="button" className={styles.submitButton} onClick={handleParse} disabled={!text.trim()}>
        Preview
      </button>

      {preview && (
        <div className={styles.bulkPreview}>
          {preview.lineErrors.map((err) => (
            <p key={err} className={styles.error}>
              {err}
            </p>
          ))}

          {preview.entries.length > 0 && (
            <ul className={styles.bulkList}>
              {preview.entries.map((entry) => (
                <li key={entry.id} className={styles.bulkItem}>
                  <span>
                    <strong>{entry.pokemon}</strong> → {entry.player}
                    {entry.flagKeys.length > 0 && ` (${entry.flagKeys.join(', ')})`}
                    {entry.unknownTags.length > 0 && (
                      <span className={styles.error}> unknown tag(s): {entry.unknownTags.join(', ')}</span>
                    )}
                  </span>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removeEntry(entry.id)}
                    aria-label={`Remove ${entry.pokemon}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          {preview.entries.length > 0 && (
            <button
              type="button"
              className={styles.submitButton}
              onClick={handleSubmitAll}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : `Add ${preview.entries.length} Shinies`}
            </button>
          )}
        </div>
      )}

      {results && (
        <p className={results.failures.length ? styles.error : styles.success}>
          Added {results.successCount} shin{results.successCount === 1 ? 'y' : 'ies'}.
          {results.failures.length > 0 && ` ${results.failures.length} failed.`}
        </p>
      )}
    </div>
  )
}
