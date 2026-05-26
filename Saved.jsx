import { useState, useEffect } from 'react'
import { getProblems, deleteProblem } from '../api'

export default function Saved({ switchTab }) {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProblems()
  }, [])

  const loadProblems = async () => {
    setLoading(true)
    try {
      const data = await getProblems()
      setProblems(data)
    } catch (e) {
      setError('Failed to load problems.')
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this problem?')) return
    try {
      await deleteProblem(id)
      setProblems(prev => prev.filter(p => p.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch (e) {
      alert('Failed to delete.')
    }
  }

  const filters = ['all', 'Math', 'Science', 'Physics', 'Chemistry', 'Biology', 'History', 'Other']

  const filtered = filter === 'all'
    ? problems
    : problems.filter(p => p.subject === filter)

  const parseSolution = (jsonStr) => {
    try { return JSON.parse(jsonStr) }
    catch { return null }
  }

  // Detail View
  if (selected) {
    const sol = parseSolution(selected.solutionJson)
    return (
      <div className="page">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}
            onClick={() => setSelected(null)}>
            ← Back
          </button>
          <div style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>Solution Detail</div>
          <button className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: 12, color: 'var(--red)', borderColor: 'var(--red)' }}
            onClick={() => handleDelete(selected.id)}>
            🗑️
          </button>
        </div>

        <div className="card fade-in">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="badge badge-purple">
              {selected.subjectEmoji} {selected.subject}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{selected.timestamp}</span>
          </div>

          {/* Question */}
          <div style={{
            fontSize: 13, color: 'var(--text2)', marginBottom: 14,
            paddingBottom: 14, borderBottom: '1px solid var(--border)', lineHeight: 1.5
          }}>
            ❓ {selected.question}
          </div>

          {/* Steps */}
          {sol?.steps?.map((step, i) => (
            <div key={i} className="step">
              <div className="step-num">{i + 1}</div>
              <div>
                <div className="step-title">{step.title}</div>
                <div className="step-body">{step.body}</div>
                {step.formula && <div className="step-formula">{step.formula}</div>}
              </div>
            </div>
          ))}

          {/* Answer */}
          {sol?.answer && (
            <div className="answer-box">
              <div className="answer-label">✅ Answer</div>
              <div className="answer-val">{sol.answer}</div>
            </div>
          )}

          {/* Tip */}
          {sol?.tip && (
            <div style={{
              marginTop: 10, fontSize: 12, color: 'var(--text2)',
              background: 'var(--surface2)', padding: '10px 12px', borderRadius: 'var(--r3)'
            }}>
              💡 <strong>Tip:</strong> {sol.tip}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }}
            onClick={() => switchTab('flashcards')}>
            🃏 Make Flashcard
          </button>
          <button className="btn btn-secondary" style={{ flex: 1 }}
            onClick={() => switchTab('quiz')}>
            🧠 Quiz Me
          </button>
        </div>
      </div>
    )
  }

  // List View
  return (
    <div className="page">
      <div className="page-title">📚 Problem Library</div>
      <div className="page-sub">All your saved solutions</div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto',
        paddingBottom: 8, marginBottom: 12, scrollbarWidth: 'none'
      }}>
        {filters.map(f => (
          <button key={f}
            className="btn"
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0,
              background: filter === f ? 'var(--accent)' : 'var(--surface2)',
              color: filter === f ? '#fff' : 'var(--text2)',
              border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`
            }}>
            {f}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 70, borderRadius: 12 }} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(248,113,113,.1)', border: '1px solid var(--red)',
          borderRadius: 'var(--r2)', padding: 12, fontSize: 13, color: 'var(--red)'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="empty">
          <div className="empty-icon">📖</div>
          {filter === 'all'
            ? 'Solve problems and save them to build your library!'
            : `No ${filter} problems saved yet`}
        </div>
      )}

      {/* Problem List */}
      {!loading && filtered.map(problem => (
        <div key={problem.id}
          className="card"
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', marginBottom: 8, padding: '12px 14px'
          }}
          onClick={() => setSelected(problem)}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'var(--surface2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0
          }}>
            {problem.subjectEmoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 500, marginBottom: 3,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {problem.question}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>
              <span className="badge badge-purple" style={{ marginRight: 6 }}>
                {problem.subject}
              </span>
              {problem.timestamp}
            </div>
          </div>
          <div style={{ color: 'var(--text3)', fontSize: 18, flexShrink: 0 }}>›</div>
        </div>
      ))}
    </div>
  )
}