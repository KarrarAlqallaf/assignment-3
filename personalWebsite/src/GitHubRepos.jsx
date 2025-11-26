import { useEffect, useState } from 'react'
import './GitHubRepos.css'

const GitHubRepos = ({
  username = 'KarrarAlqallaf',
  maxRepos = 6,
  language = 'Eng'
}) => {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorType, setErrorType] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadRepos = async () => {
      setLoading(true)
      setErrorType(null)

      try {
        const response = await fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=${maxRepos}`,
          {
            headers: {
              Accept: 'application/vnd.github+json'
            },
            signal: controller.signal
          }
        )

        if (response.status === 403) {
          throw new Error('rate-limit')
        }

        if (!response.ok) {
          throw new Error('generic-error')
        }

        const data = await response.json()
        const cleaned = data
          .filter(repo => !repo.fork)
          .sort(
            (a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
          )
          .slice(0, maxRepos)
          .map(repo => ({
            id: repo.id,
            name: repo.name,
            description: repo.description,
            htmlUrl: repo.html_url,
            language: repo.language,
            stars: repo.stargazers_count,
            updatedAt: repo.pushed_at
          }))

        setRepos(cleaned)
      } catch (error) {
        if (error.name === 'AbortError') {
          return
        }
        setErrorType(error.message === 'rate-limit' ? 'rate-limit' : 'generic')
      } finally {
        setLoading(false)
      }
    }

    loadRepos()

    return () => controller.abort()
  }, [username, maxRepos])

  const labels =
    language === 'Eng'
      ? {
          loading: 'Loading your latest public repositories…',
          empty: 'No public repositories to show yet.',
          rateLimit:
            'GitHub rate limit reached. Please refresh again in a minute.',
          genericError:
            'Something went wrong while talking to GitHub. Please try again.',
          lastUpdated: date =>
            `Updated ${new Date(date).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric'
            })}`
        }
      : {
          loading: 'جاري جلب أحدث المستودعات العامة…',
          empty: 'لا توجد مستودعات عامة للعرض حالياً.',
          rateLimit: 'تم الوصول لحد GitHub، حاول مرة أخرى بعد دقيقة.',
          genericError: 'حدث خطأ أثناء الاتصال بـ GitHub. حاول مرة أخرى.',
          lastUpdated: date =>
            `آخر تحديث ${new Date(date).toLocaleDateString('ar-SA', {
              month: 'short',
              day: 'numeric'
            })}`
        }

  return (
    <section className="repo-section">
      <h3 className="repo-heading">{labels.heading}</h3>

      {loading && <p className="repo-info">{labels.loading}</p>}

      {!loading && errorType && (
        <p className="repo-error">
          {errorType === 'rate-limit' ? labels.rateLimit : labels.genericError}
        </p>
      )}

      {!loading && !errorType && repos.length === 0 && (
        <p className="repo-info">{labels.empty}</p>
      )}

      {!loading && !errorType && repos.length > 0 && (
        <ul className="repo-list">
          {repos.map(repo => (
            <li key={repo.id} className="repo-card">
              <div className="repo-card__body">
                <a
                  className="repo-name"
                  href={repo.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {repo.name}
                </a>
                {repo.description && (
                  <p className="repo-description">{repo.description}</p>
                )}
              </div>
              <div className="repo-meta">
                {repo.language && (
                  <span className="repo-chip">{repo.language}</span>
                )}
                <span className="repo-chip">★ {repo.stars}</span>
                <span className="repo-updated">
                  {labels.lastUpdated(repo.updatedAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default GitHubRepos

