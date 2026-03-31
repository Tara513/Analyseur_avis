import { useState } from 'react'
import type { AnalysisResult } from '../types/analysis'

interface Props {
  onResult: (result: AnalysisResult, query: string) => void
}

const EXAMPLES = [
  'iPhone 15 vs Samsung Galaxy S24',
  'Netflix vs Disney+',
  'MacBook Pro M3',
  'Tesla Model 3',
  'ChatGPT vs Gemini',
  'AirPods Pro',
]

export default function ReviewInput({ onResult }: Props) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur serveur')
      onResult(data, query.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="input-page">
      <div className="input-card">
        <div className="input-logo">
          <div className="input-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <div>
            <h1>Galaad</h1>
            <span>Analyseur d'Avis IA</span>
          </div>
        </div>

        <p style={{ fontSize: '.925rem', color: 'var(--text-2)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          Tape ce que tu veux analyser — un produit, un service, une marque ou une comparaison.
          Claude analysera les opinions du public et générera un dashboard complet.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="search-bar">
            <span className="search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              className="search-input"
              type="text"
              placeholder="Ex: Compare iPhone 15 et Samsung Galaxy S24…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
              disabled={loading}
            />
            {query && !loading && (
              <button type="button" className="search-clear" onClick={() => setQuery('')}>✕</button>
            )}
          </div>

          <div className="examples-row">
            <span className="examples-label">Exemples :</span>
            {EXAMPLES.map(ex => (
              <button
                key={ex}
                type="button"
                className="example-chip"
                onClick={() => setQuery(ex)}
                disabled={loading}
              >
                {ex}
              </button>
            ))}
          </div>

          {error && (
            <div className="error-banner">
              <span>⚠️</span> {error}
            </div>
          )}

          <button className="btn-analyze" type="submit" disabled={loading || !query.trim()}>
            {loading ? (
              <>
                <span className="spinner" />
                Analyse en cours…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                Analyser
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
