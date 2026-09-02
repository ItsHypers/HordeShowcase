import { useState } from 'react'
import { login } from '../../api/adminApi.js'
import styles from './Admin.module.css'

export default function LoginForm({ onLoggedIn }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const ok = await login(username, password)
      if (ok) onLoggedIn()
      else setError('Invalid username or password.')
    } catch (err) {
      setError(err.message || 'Unable to reach the server. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <h2 className={styles.cardTitle}>Admin Login</h2>
      <label className={styles.field}>
        <span>Username</span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
      </label>
      <label className={styles.field}>
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  )
}
