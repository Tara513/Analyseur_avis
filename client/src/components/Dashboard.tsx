import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts'
import type { AnalysisResult, SubjectAnalysis } from '../types/analysis'

const SENTIMENT_COLOR: Record<string, string> = {
  positif: '#059669',
  négatif: '#dc2626',
  neutre:  '#64748b',
  mitigé:  '#d97706',
}

const SENTIMENT_BG: Record<string, string> = {
  positif: '#ecfdf5',
  négatif: '#fef2f2',
  neutre:  '#f8fafc',
  mitigé:  '#fffbeb',
}

const SENTIMENT_EMOJI: Record<string, string> = {
  positif: '😊', négatif: '😟', neutre: '😐', mitigé: '🤔',
}

interface SubjectCardProps {
  subject: SubjectAnalysis
  color: string
}

function ScoreArc({ score, color }: { score: number; color: string }) {
  const r = 52; const cx = 64; const cy = 64
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="10"/>
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth="10"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 64 64)"
        style={{ transition: 'stroke-dashoffset .8s ease' }}
      />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="800" fill={color}>{score}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#94a3b8">/100</text>
    </svg>
  )
}

function SubjectCard({ subject, color }: SubjectCardProps) {
  const radarData = subject.key_aspects.map(a => ({
    subject: a.aspect,
    score: a.score,
    fullMark: 100,
  }))

  const barData = subject.key_aspects.map(a => ({
    name: a.aspect,
    score: a.score,
    fill: SENTIMENT_COLOR[a.sentiment] ?? color,
  }))

  return (
    <div className="subject-card">
      {/* Subject header */}
      <div className="subject-header">
        <div>
          <h2 className="subject-name">{subject.name}</h2>
          <p className="subject-summary">{subject.summary}</p>
        </div>
        <div className="subject-score-col">
          <ScoreArc score={subject.overall_score} color={color} />
          <span
            className="sentiment-badge"
            style={{
              background: SENTIMENT_BG[subject.overall_sentiment],
              color: SENTIMENT_COLOR[subject.overall_sentiment],
              display: 'inline-flex', alignItems: 'center', gap: '.3rem',
              padding: '.25rem .75rem', borderRadius: '99px',
              fontSize: '.78rem', fontWeight: 700, textTransform: 'capitalize',
            }}
          >
            {SENTIMENT_EMOJI[subject.overall_sentiment]} {subject.overall_sentiment}
          </span>
        </div>
      </div>

      {/* Aspects charts */}
      <div className="subject-charts">
        <div className="card">
          <div className="card-title">Aspects clés — Radar</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Radar name={subject.name} dataKey="score" stroke={color} fill={color} fillOpacity={0.18} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">Scores par aspect</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 80 }} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={76} />
              <Tooltip formatter={(v: number) => [`${v}/100`, 'Score']} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Aspect details */}
      <div className="aspects-grid">
        {subject.key_aspects.map((a, i) => (
          <div className="aspect-chip" key={i}>
            <div className="aspect-chip-header">
              <span className="aspect-name">{a.aspect}</span>
              <span
                className="aspect-score"
                style={{ color: SENTIMENT_COLOR[a.sentiment] }}
              >{a.score}</span>
            </div>
            <p className="aspect-desc">{a.description}</p>
            <div className="aspect-bar-bg">
              <div
                className="aspect-bar-fill"
                style={{ width: `${a.score}%`, background: SENTIMENT_COLOR[a.sentiment] }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Strengths / Weaknesses */}
      <div className="sw-row">
        <div className="card">
          <div className="card-title">Points forts</div>
          <ul className="points-list">
            {subject.strengths.map((s, i) => (
              <li key={i}><span className="point-icon pos">✓</span>{s}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <div className="card-title">Points faibles</div>
          <ul className="points-list">
            {subject.weaknesses.map((w, i) => (
              <li key={i}><span className="point-icon neg">✕</span>{w}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/* Comparison bar for multiple subjects */
function ComparisonBar({ subjects }: { subjects: SubjectAnalysis[] }) {
  const PALETTE = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed']
  const data = subjects.map((s, i) => ({
    name: s.name,
    score: s.overall_score,
    fill: PALETTE[i % PALETTE.length],
  }))

  return (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <div className="card-title">Comparaison globale</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={56} margin={{ top: 8, right: 16, bottom: 8, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v: number) => [`${v}/100`, 'Score']} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="score" radius={[8, 8, 0, 0]} label={{ position: 'top', fontSize: 13, fontWeight: 700, fill: '#475569' }}>
            {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface Props {
  result: AnalysisResult
  query: string
  onBack: () => void
}

const PALETTE = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed']

export default function Dashboard({ result, query, onBack }: Props) {
  const multi = result.subjects.length > 1

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <button className="btn-back" onClick={onBack}>← Nouvelle analyse</button>
        <div style={{ flex: 1 }}>
          <div className="dashboard-title">{result.title}</div>
          <div className="dashboard-subject">— {query}</div>
        </div>
      </div>

      {/* Comparison bar (multi only) */}
      {multi && <ComparisonBar subjects={result.subjects} />}

      {/* Per-subject cards */}
      {result.subjects.map((subject, i) => (
        <SubjectCard key={i} subject={subject} color={PALETTE[i % PALETTE.length]} />
      ))}

      {/* Conclusion */}
      <div className="card conclusion-card">
        <div className="card-title">Conclusion</div>
        <p className="summary-text">{result.conclusion}</p>
      </div>
    </div>
  )
}
