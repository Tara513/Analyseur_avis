export type Sentiment = 'positif' | 'négatif' | 'neutre' | 'mitigé'

export interface AspectAnalysis {
  aspect: string
  sentiment: 'positif' | 'négatif' | 'neutre'
  score: number
  description: string
}

export interface SubjectAnalysis {
  name: string
  overall_sentiment: Sentiment
  overall_score: number
  summary: string
  strengths: string[]
  weaknesses: string[]
  key_aspects: AspectAnalysis[]
}

export interface AnalysisResult {
  title: string
  subjects: SubjectAnalysis[]
  conclusion: string
}
