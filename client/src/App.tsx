import { useState } from 'react'
import ReviewInput from './components/ReviewInput'
import Dashboard from './components/Dashboard'
import type { AnalysisResult } from './types/analysis'

export default function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [query, setQuery] = useState('')

  function handleResult(data: AnalysisResult, q: string) {
    setResult(data)
    setQuery(q)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (result) {
    return (
      <Dashboard
        result={result}
        query={query}
        onBack={() => { setResult(null); setQuery('') }}
      />
    )
  }

  return <ReviewInput onResult={handleResult} />
}
