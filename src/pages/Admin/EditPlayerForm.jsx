import { useEffect, useState } from 'react'
import { deletePlayer, deleteShiny, fetchShinyData, fetchPokemonNames, renamePlayer, reorderShinies, updateShiny } from '../../api/adminApi.js'
import { FLAGS, buildFlagFields } from './flags.js'
import { isTruthyFlag } from '../../lib/shinyMeta.js'
import styles from './Admin.module.css'

const EMPTY_FORM = { pokemon: '', nickname: '', dateCaught: '', encounterMethod: '', encounterCount: '', location: '', nature: '', ivs: '', reactionLink: '', flags: {} }
const FORM_SLUGS = { gastrodon: 'gastrodon-west', basculin: 'basculin-red-striped' }

function spriteUrl(pokemon) {
  const slug = pokemon.trim().toLowerCase().replace(/\s+/g, '-')
  return `${import.meta.env.BASE_URL}images/pokemon_gifs/${FORM_SLUGS[slug] || slug}.gif`
}

function toForm(shiny) {
  const date = shiny.date_caught ? new Date(shiny.date_caught) : null
  return {
    pokemon: shiny.Pokemon || '', nickname: shiny.nickname || '',
    dateCaught: date && !Number.isNaN(date.valueOf()) ? date.toISOString().slice(0, 10) : '',
    encounterMethod: shiny.encounter_method || '', encounterCount: shiny.encounter_count ?? '',
    location: shiny.location || '', nature: shiny.nature || '', ivs: shiny.ivs || '',
    reactionLink: shiny['Reaction Link'] || '',
    flags: Object.fromEntries(FLAGS.map(([key]) => [key, String(shiny[key]).toLowerCase() === 'yes'])),
  }
}

function toShiny(form) {
  const date = form.dateCaught ? new Date(form.dateCaught) : null
  return {
    Pokemon: form.pokemon, nickname: form.nickname || null, date_caught: date ? date.toISOString() : null,
    Month: date ? date.toLocaleString('en-US', { month: 'long' }) : null, Year: date ? String(date.getFullYear()) : null,
    encounter_method: form.encounterMethod || null, encounter_count: form.encounterCount ? Number(form.encounterCount) : null,
    location: form.location || null, nature: form.nature || null, ivs: form.ivs || null,
    'Reaction Link': form.reactionLink || '', ...buildFlagFields(Object.keys(form.flags).filter((key) => form.flags[key])),
  }
}

export default function EditPlayerForm() {
  const [players, setPlayers] = useState({})
  const [player, setPlayer] = useState('')
  const [playerSearch, setPlayerSearch] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [shinyId, setShinyId] = useState('')
  const [shinyOrder, setShinyOrder] = useState([])
  const [draggedId, setDraggedId] = useState(null)
  const [species, setSpecies] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState(null)

  const loadPlayers = async () => {
    const data = await fetchShinyData()
    setPlayers(data)
    return data
  }

  useEffect(() => {
    loadPlayers().catch(() => setStatus({ type: 'error', message: 'Unable to load players.' }))
    fetchPokemonNames().then(setSpecies).catch(() => setSpecies([]))
  }, [])

  useEffect(() => {
    if (shinyId) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [shinyId])

  const playerShinies = players[player]?.shinies || {}
  const storedOrder = players[player]?.shiny_order || Object.keys(playerShinies)
  const shinies = (shinyOrder.length ? shinyOrder : storedOrder)
    .filter((id) => playerShinies[id])
    .map((id) => [id, playerShinies[id]])
  const updateField = (field, value) => setForm((previous) => ({ ...previous, [field]: value }))
  const toggleFlag = (key) => setForm((previous) => ({ ...previous, flags: { ...previous.flags, [key]: !previous.flags[key] } }))

  const selectPlayer = (value) => {
    setPlayer(value)
    setPlayerName(value)
    setShinyId('')
    setShinyOrder(value ? players[value].shiny_order || Object.keys(players[value].shinies || {}) : [])
    setForm(EMPTY_FORM)
    setStatus(null)
  }

  const searchPlayer = (value) => {
    setPlayerSearch(value)
    selectPlayer(Object.hasOwn(players, value) ? value : '')
  }

  const selectShiny = (value) => {
    setShinyId(value)
    setForm(value ? toForm(players[player].shinies[value]) : EMPTY_FORM)
    setStatus(null)
  }

  const returnToList = () => {
    setShinyId('')
    setForm(EMPTY_FORM)
    setStatus(null)
  }

  const handleRename = async (event) => {
    event.preventDefault()
    if (!player) return
    setIsSubmitting(true)
    setStatus(null)
    try {
      const result = await renamePlayer(player, playerName)
      await loadPlayers()
      setPlayer(result.player)
      setPlayerSearch(result.player)
      setPlayerName(result.player)
      setStatus({ type: 'success', message: 'Player updated.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to update player.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSave = async (event) => {
    event.preventDefault()
    if (!player || !shinyId) return
    setIsSubmitting(true)
    setStatus(null)
    try {
      await updateShiny(player, shinyId, toShiny(form))
      await loadPlayers()
      setStatus({ type: 'success', message: 'Shiny updated.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to update shiny.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!player || !id || !window.confirm('Delete this shiny permanently?')) return
    setIsSubmitting(true)
    setStatus(null)
    try {
      await deleteShiny(player, id)
      await loadPlayers()
      setShinyOrder((previous) => previous.filter((shinyId) => shinyId !== id))
      if (id === shinyId) {
        setShinyId('')
        setForm(EMPTY_FORM)
      }
      setStatus({ type: 'success', message: 'Shiny deleted.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to delete shiny.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDrop = async (targetId) => {
    if (!draggedId || draggedId === targetId) return
    const previousOrder = shinies.map(([id]) => id)
    const nextOrder = previousOrder.filter((id) => id !== draggedId)
    nextOrder.splice(nextOrder.indexOf(targetId), 0, draggedId)
    setDraggedId(null)
    setShinyOrder(nextOrder)
    setIsSubmitting(true)
    setStatus(null)
    try {
      await reorderShinies(player, nextOrder)
    } catch (error) {
      setShinyOrder(previousOrder)
      setStatus({ type: 'error', message: error.message || 'Failed to reorder shinies.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePlayer = async () => {
    if (!player || !window.confirm(`Delete ${player} and all of their shinies permanently?`)) return
    setIsSubmitting(true)
    setStatus(null)
    try {
      await deletePlayer(player)
      await loadPlayers()
      setPlayer('')
      setPlayerSearch('')
      setPlayerName('')
      setShinyId('')
      setForm(EMPTY_FORM)
      setStatus({ type: 'success', message: 'Player deleted.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to delete player.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Edit Player</h2>
      <label className={styles.field}><span>Player</span><input list="edit-player-list" value={playerSearch} onChange={(event) => searchPlayer(event.target.value)} placeholder="Search players" /><datalist id="edit-player-list">{Object.keys(players).sort((a, b) => a.localeCompare(b)).map((name) => <option key={name} value={name} />)}</datalist></label>
      {player && <form className={styles.compactForm} onSubmit={handleRename}><label className={styles.field}><span>Player Name</span><input value={playerName} onChange={(event) => setPlayerName(event.target.value)} required /></label><div className={styles.formActions}><button type="submit" className={styles.submitButton} disabled={isSubmitting}>Save Player</button><button type="button" className={styles.deleteButton} onClick={handleDeletePlayer} disabled={isSubmitting}>Delete Player</button></div></form>}
      {player && !shinyId && <div className={styles.shinyList}><h3 className={styles.listTitle}>Shinies</h3>{shinies.map(([id, shiny]) => <article key={id} draggable={!isSubmitting} className={`${styles.shinyRow} ${draggedId === id ? styles.shinyRowDragging : ''}`} onDragStart={() => setDraggedId(id)} onDragEnd={() => setDraggedId(null)} onDragOver={(event) => event.preventDefault()} onDrop={() => handleDrop(id)}><img className={`${styles.shinySprite} ${isTruthyFlag(shiny.Sold) || isTruthyFlag(shiny.Killed) ? styles.shinySpriteUnavailable : ''}`} src={spriteUrl(shiny.Pokemon)} alt="" /><span className={styles.shinyName}>{shiny.nickname || shiny.Pokemon}<small>{shiny.nickname && shiny.Pokemon} #{id}</small></span><div className={styles.shinyActions}><button type="button" className={styles.editButton} onClick={() => selectShiny(id)}>Edit</button><button type="button" className={styles.deleteButton} onClick={() => handleDelete(id)} disabled={isSubmitting}>Delete</button></div></article>)}</div>}
      {shinyId && <form className={styles.editForm} onSubmit={handleSave}>
        <button type="button" className={styles.backButton} onClick={returnToList}>Back to List</button>
        <label className={styles.field}><span>Pokemon*</span><input list="edit-species-list" value={form.pokemon} onChange={(event) => updateField('pokemon', event.target.value)} required /><datalist id="edit-species-list">{species.map((name) => <option key={name} value={name} />)}</datalist></label>
        <label className={styles.field}><span>Nickname</span><input value={form.nickname} onChange={(event) => updateField('nickname', event.target.value)} /></label>
        <div className={styles.row}><label className={styles.field}><span>Date Caught</span><input type="date" value={form.dateCaught} onChange={(event) => updateField('dateCaught', event.target.value)} /></label><label className={styles.field}><span>Encounter Count</span><input type="number" min="0" value={form.encounterCount} onChange={(event) => updateField('encounterCount', event.target.value)} /></label></div>
        <div className={styles.row}><label className={styles.field}><span>Encounter Method</span><input value={form.encounterMethod} onChange={(event) => updateField('encounterMethod', event.target.value)} /></label><label className={styles.field}><span>Location</span><input value={form.location} onChange={(event) => updateField('location', event.target.value)} /></label></div>
        <div className={styles.row}><label className={styles.field}><span>Nature</span><input value={form.nature} onChange={(event) => updateField('nature', event.target.value)} /></label><label className={styles.field}><span>IVs</span><input value={form.ivs} onChange={(event) => updateField('ivs', event.target.value)} /></label></div>
        <label className={styles.field}><span>Reaction Link</span><input value={form.reactionLink} onChange={(event) => updateField('reactionLink', event.target.value)} /></label>
        <fieldset className={styles.flagGrid}><legend>Flags</legend>{FLAGS.map(([key, label]) => <label key={key} className={styles.checkbox}><input type="checkbox" checked={Boolean(form.flags[key])} onChange={() => toggleFlag(key)} /><span>{label}</span></label>)}</fieldset>
        <div className={styles.formActions}><button type="submit" className={styles.submitButton} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Shiny'}</button><button type="button" className={styles.deleteButton} onClick={() => handleDelete(shinyId)} disabled={isSubmitting}>Delete Shiny</button></div>
      </form>}
      {status && <p className={status.type === 'error' ? styles.error : styles.success}>{status.message}</p>}
    </div>
  )
}