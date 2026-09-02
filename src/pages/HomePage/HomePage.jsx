import { useEffect, useState } from 'react'
import { fetchPosts } from '../../api/adminApi.js'
import SiteNav from '../../components/SiteNav/SiteNav.jsx'
import { navigate } from '../../lib/navigation.js'
import { readCache, writeCache } from '../../lib/cache.js'
import styles from './HomePage.module.css'

export default function HomePage() {
  const [posts, setPosts] = useState(() => readCache('posts'))
  const [error, setError] = useState(null)

  useEffect(() => {
    const cached = readCache('posts')
    fetchPosts()
      .then((data) => {
        writeCache('posts', data)
        setPosts(data)
      })
      .catch(() => !cached && setError('The Horde bulletin could not be reached.'))
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <button
          type="button"
          className={styles.crestButton}
          onClick={() => navigate('/admin')}
          aria-label="Horde Crest"
        >
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Horde Crest" className={styles.crest} />
        </button>
        <div>
          <h1 className={styles.title}>Welcome to the Horde</h1>
          <p className={styles.subtitle}>Events, socials, and news from the clan.</p>
        </div>
      </header>

      <SiteNav active="/" />

      {error && <div className="message">{error}</div>}
      {!error && !posts && <div className="message">Loading the Horde's bulletin...</div>}
      {!error && posts && posts.length === 0 && (
        <div className="message">No posts yet - check back soon.</div>
      )}

      <div className={styles.feed}>
        {posts?.map((post) => (
          <article key={post.id} className={styles.post}>
            <h2 className={styles.postTitle}>{post.title}</h2>
            {post.description && <p className={styles.postDescription}>{post.description}</p>}
            {post.photos?.length > 0 && (
              <div className={styles.photoGrid}>
                {post.photos.map((photo, index) => (
                  <img key={photo + index} src={photo} alt="" className={styles.photo} loading="lazy" />
                ))}
              </div>
            )}
            {post.link && (
              <a href={post.link} target="_blank" rel="noopener noreferrer" className={styles.postLink}>
                {post.linkLabel || 'View Link'}
              </a>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
