import { useEffect, useState } from 'react'
import { addShiny, fetchPlayerNames, fetchPokemonNames } from '../../api/adminApi.js'
import { FLAGS, buildFlagFields } from './flags.js'
import styles from './Admin.module.css'

const EMPTY_FORM = {
  player: '',
  pokemon: '',
  nickname: '',
  dateCaught: '',
  encounterMethod: '',
  encounterCount: '',
  location: '',
  nature: '',
  ivs: '',
  reactionLink: '',
  flags: {},
}

export default function AddShinyForm() {
  const [players, setPlayers] = useState([])
  const [species, setSpecies] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    fetchPlayerNames().then(setPlayers).catch(() => setPlayers([]))
    fetchPokemonNames().then(setSpecies).catch(() => setSpecies([]))
  }, [])

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))
  const toggleFlag = (key) =>
    setForm((prev) => ({ ...prev, flags: { ...prev.flags, [key]: !prev.flags[key] } }))

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !isSubmitting) {
      event.preventDefault()
      event.currentTarget.requestSubmit()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus(null)

    const date = form.dateCaught ? new Date(form.dateCaught) : null
    const shiny = {
      Pokemon: form.pokemon,
      nickname: form.nickname || null,
      date_caught: date ? date.toISOString() : null,
      Month: date ? date.toLocaleString('en-US', { month: 'long' }) : null,
      Year: date ? String(date.getFullYear()) : null,
      encounter_method: form.encounterMethod || null,
      encounter_count: form.encounterCount ? Number(form.encounterCount) : null,
      location: form.location || null,
      nature: form.nature || null,
      ivs: form.ivs || null,
      'Reaction Link': form.reactionLink || '',
      ...buildFlagFields(Object.keys(form.flags).filter((key) => form.flags[key])),
    }

    try {
      await addShiny(form.player, shiny)
      setStatus({ type: 'success', message: `Added ${form.pokemon} to ${form.player}'s showcase.` })
      setForm(EMPTY_FORM)
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to add shiny.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={styles.card} onKeyDown={handleKeyDown} onSubmit={handleSubmit}>
      <h2 className={styles.cardTitle}>Add a Shiny</h2>

      <label className={styles.field}>
        <span>Player*</span>
        <input
          list="admin-player-list"
          value={form.player}
          onChange={(e) => updateField('player', e.target.value)}
          placeholder="Existing or new player name"
          required
        />
        <datalist id="admin-player-list">
          {players.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </label>

      <label className={styles.field}>
        <span>Pokémon*</span>
        <input
          list="admin-species-list"
          value={form.pokemon}
          onChange={(e) => updateField('pokemon', e.target.value)}
          required
        />
        <datalist id="admin-species-list">
          {species.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </label>

      <label className={styles.field}>
        <span>Nickname</span>
        <input value={form.nickname} onChange={(e) => updateField('nickname', e.target.value)} />
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Date Caught</span>
          <input
            type="date"
            value={form.dateCaught}
            onChange={(e) => updateField('dateCaught', e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Encounter Count</span>
          <input
            type="number"
            min="0"
            value={form.encounterCount}
            onChange={(e) => updateField('encounterCount', e.target.value)}
          />
        </label>
      </div>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Encounter Method</span>
          <input
            value={form.encounterMethod}
            onChange={(e) => updateField('encounterMethod', e.target.value)}
            placeholder="e.g. 5x horde"
          />
        </label>
        <label className={styles.field}>
          <span>Location</span>
          <input value={form.location} onChange={(e) => updateField('location', e.target.value)} />
        </label>
      </div>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Nature</span>
          <input value={form.nature} onChange={(e) => updateField('nature', e.target.value)} />
        </label>
        <label className={styles.field}>
          <span>IVs</span>
          <input value={form.ivs} onChange={(e) => updateField('ivs', e.target.value)} />
        </label>
      </div>

      <label className={styles.field}>
        <span>Reaction Link</span>
        <input value={form.reactionLink} onChange={(e) => updateField('reactionLink', e.target.value)} />
      </label>

      <fieldset className={styles.flagGrid}>
        <legend>Flags</legend>
        {FLAGS.map(([key, label]) => (
          <label key={key} className={styles.checkbox}>
            <input type="checkbox" checked={Boolean(form.flags[key])} onChange={() => toggleFlag(key)} />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>

      {status && (
        <p className={status.type === 'error' ? styles.error : styles.success}>{status.message}</p>
      )}

      <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add Shiny'}
      </button>
    </form>
  )
}
