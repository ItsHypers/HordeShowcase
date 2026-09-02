import { useEffect, useState } from 'react'
import { createPost, deletePost, fetchPosts, updatePost } from '../../api/adminApi.js'
import styles from './Admin.module.css'

const EMPTY_FORM = { title: '', description: '', photos: '', link: '', linkLabel: '' }

export default function AddPostForm() {
  const [posts, setPosts] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState(null)

  const loadPosts = () => fetchPosts().then(setPosts).catch(() => setPosts([]))

  useEffect(() => {
    loadPosts()
  }, [])

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleEdit = (post) => {
    setEditingId(post.id)
    setForm({
      title: post.title || '',
      description: post.description || '',
      photos: (post.photos || []).join('\n'),
      link: post.link || '',
      linkLabel: post.linkLabel || '',
    })
    setStatus(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setStatus(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus(null)

    const photos = form.photos
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const post = {
      title: form.title,
      description: form.description,
      photos,
      link: form.link,
      linkLabel: form.linkLabel,
    }

    try {
      if (editingId) {
        await updatePost(editingId, post)
        setStatus({ type: 'success', message: `Updated "${form.title}".` })
      } else {
        await createPost(post)
        setStatus({ type: 'success', message: `Posted "${form.title}" to the home page.` })
      }
      setEditingId(null)
      setForm(EMPTY_FORM)
      await loadPosts()
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to save post.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post permanently?')) return
    setStatus(null)
    try {
      await deletePost(id)
      if (id === editingId) handleCancelEdit()
      await loadPosts()
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to delete post.' })
    }
  }

  return (
    <>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h2 className={styles.cardTitle}>{editingId ? 'Edit Home Page Post' : 'New Home Page Post'}</h2>

        <label className={styles.field}>
          <span>Title*</span>
          <input value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
        </label>

        <label className={styles.field}>
          <span>Description</span>
          <textarea
            className={styles.textarea}
            rows={4}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>Photo Links</span>
          <textarea
            className={styles.textarea}
            rows={3}
            value={form.photos}
            onChange={(e) => updateField('photos', e.target.value)}
            placeholder={'One image URL per line'}
          />
          <p className={styles.hint}>Paste one or more image links, one per line.</p>
        </label>

        <div className={styles.row}>
          <label className={styles.field}>
            <span>Link</span>
            <input
              value={form.link}
              onChange={(e) => updateField('link', e.target.value)}
              placeholder="https://..."
            />
          </label>
          <label className={styles.field}>
            <span>Link Label</span>
            <input
              value={form.linkLabel}
              onChange={(e) => updateField('linkLabel', e.target.value)}
              placeholder="e.g. Join the Event"
            />
          </label>
        </div>

        {status && (
          <p className={status.type === 'error' ? styles.error : styles.success}>{status.message}</p>
        )}

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : editingId ? 'Save Post' : 'Post to Home Page'}
          </button>
          {editingId && (
            <button type="button" className={styles.backButton} onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className={styles.shinyList}>
        <h3 className={styles.listTitle}>Existing Posts</h3>
        {posts.map((post) => (
          <article key={post.id} className={styles.shinyRow}>
            <span className={styles.shinyName}>
              {post.title}
              <small>{post.photos?.length || 0} photo(s)</small>
            </span>
            <div className={styles.shinyActions}>
              <button type="button" className={styles.editButton} onClick={() => handleEdit(post)}>
                Edit
              </button>
              <button type="button" className={styles.deleteButton} onClick={() => handleDelete(post.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
        {!posts.length && <p className={styles.hint}>No posts yet.</p>}
      </div>
    </>
  )
}
