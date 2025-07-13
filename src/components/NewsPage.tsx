import React, { useEffect, useState } from 'react'

interface Article {
  title: string
  link: string
}

const NewsPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/news-uk')
      .then(res => res.json())
      .then(data => setArticles(data.news || []))
      .catch(err => {
        console.error('Failed to load news:', err)
        setError('Failed to load news')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="p-8 text-white">Loading top UK news...</div>
  }
  if (error) {
    return <div className="p-8 text-red-400">{error}</div>
  }

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-semibold mb-4">Top UK News</h1>
      <ul className="list-disc pl-6 space-y-2">
        {articles.map((a, i) => (
          <li key={i}>
            <a
              href={a.link}
              target="_blank"
              rel="noreferrer"
              className="text-primary-400 hover:underline"
            >
              {a.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default NewsPage
