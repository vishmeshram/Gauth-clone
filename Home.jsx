import { useState } from 'react'
import { solveText, solveImage, saveP } from '../api'

export default function Home({ switchTab }) {
  const [inputTab, setInputTab] = useState('text')
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [solution, setSolution] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [imageBase64, setImageBase64] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  const examples = [
    { label: '🔢 Algebra', q: 'Solve: 2x + 5 = 13' },
    { label: '⚡ Physics', q: "What is Newton's second law of motion?" },
    { label: '📜 History', q: 'Explain the causes of World War I' },
    { label: '🧬 Biology', q: 'How does cellular respiration work?' },
  ]

  const handleSolveText = async () => {
    if (!question.trim()) return
    setLoading(true)
    setError('')
    setSolution(null)
    setSaved(false)
    try {
      const data = await solveText(question)
      setSolution(data)
    } catch (e) {
      setError('Failed to get solution. Please try again.')
    }
    setLoading(false)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      setImageBase64(base64)
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSolveImage = async () => {
    if (!imageBase64) return
    setLoading(true)
    setError('')
    setSolution(null)
    setSaved(false)
    try {
      const data = await solveImage(imageBase64)
      setSolution(data)
      if (data.extractedQuestion) setQuestion(data.extractedQuestion)
    } catch (e) {
      setError('Failed to analyze image. Try a clearer photo.')
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!solution) return
    try {
      await saveP({
        question: question || 'Scanned problem',
        subject: solution.subject || 'Other',
        subjectEmoji: solution.subjectEmoji || '📚',
        solutionJson: JSON.stringify(solution)
      })
      setSaved(true)
    } catch (e) {
      alert('Failed to save problem.')
    }
  }

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>Good day, Student 👋</div>
        <div className="page-title">What problem can I<br /><span style={{ color: 'var(--accent2)' }}>solve for you today?</span></div>
      </div>

      {/* Input Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Input Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {['text', 'camera'].map(tab => (
            <div key={tab}
              onClick={() => setInputTab(tab)}
              style={{
                flex: 1, padding: '10px', textAlign: 'center',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                color: inputTab === tab ? 'var(--accent2)' : 'var(--text2)',
                borderBottom: inputTab === tab ? '2px solid var(--accent2)' : '2px solid transparent',
                transition: '.15s'
              }}>
              {tab === 'text' ? '✏️ Type' : '📷 Scan'}
            </div>
          ))}
        </div>

        <div style={{ padding: 12 }}>
          {inputTab === 'text' ? (
            <>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Type any homework problem… e.g. 'Solve x² + 5x + 6 = 0'"
                onKeyDown={e => e.key === 'Enter' && e.ctrlKey && handleSolveText()}
              />
              {/* Example chips */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0' }}>
                {examples.map(ex => (
                  <button key={ex.label} className="btn btn-secondary"
                    style={{ fontSize: 11, padding: '5px 10px' }}
                    onClick={() => setQuestion(ex.q)}>
                    {ex.label}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary" onClick={handleSolveText} disabled={loading || !question.trim()}>
                {loading ? <span className="spin">⚙️</span> : '⚡'} Solve with AI
              </button>
            </>
          ) : (
            <>
              <label style={{
                display: 'block', background: 'var(--surface2)',
                border: '2px dashed var(--border)', borderRadius: 'var(--r2)',
                padding: 24, textAlign: 'center', cursor: 'pointer', marginBottom: 8
              }}>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                {imagePreview
                  ? <img src={imagePreview} alt="preview" style={{ width: '100%', borderRadius: 8, maxHeight: 180, objectFit: 'contain' }} />
                  : <>
                    <div style={{ fontSize: 36, marginBottom: 6 }}>📸</div>
                    <div style={{ fontSize: 13, color: 'var(--text2)' }}>Tap to upload problem image</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Supports math, diagrams, printed text</div>
                  </>
                }
              </label>
              {imageBase64 && (
                <button className="btn btn-primary" onClick={handleSolveImage} disabled={loading}>
                  {loading ? <span className="spin">⚙️</span> : '🔍'} Analyze & Solve
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(248,113,113,.1)', border: '1px solid var(--red)', borderRadius: 'var(--r2)', padding: 12, marginBottom: 12, fontSize: 13, color: 'var(--red)' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="card fade-in">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[60, 100, 85, 92, 70].map((w, i) => (
              <div key={i} className="skeleton" style={{ height: 14, width: `${w}%` }} />
            ))}
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
              🤖 AI is solving this…
            </div>
          </div>
        </div>
      )}

      {/* Solution */}
      {solution && !loading && (
        <div className="card fade-in">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="badge badge-purple">{solution.subjectEmoji} {solution.subject}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: 12 }}
                onClick={handleSave} disabled={saved}>
                {saved ? '⭐ Saved' : '☆ Save'}
              </button>
              <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: 12 }}
                onClick={() => switchTab('flashcards')}>
                🃏 Cards
              </button>
              <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: 12 }}
                onClick={() => switchTab('quiz')}>
                🧠 Quiz
              </button>
            </div>
          </div>

          {/* Question */}
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border)', lineHeight: 1.5 }}>
            ❓ {question || solution.extractedQuestion}
          </div>

          {/* Steps */}
          {solution.steps?.map((step, i) => (
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
          <div className="answer-box">
            <div className="answer-label">✅ Answer</div>
            <div className="answer-val">{solution.answer}</div>
          </div>

          {/* Tip */}
          {solution.tip && (
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text2)', background: 'var(--surface2)', padding: '10px 12px', borderRadius: 'var(--r3)' }}>
              💡 <strong>Tip:</strong> {solution.tip}
            </div>
          )}
        </div>
      )}

      {/* Quick Access */}
      <div style={{ marginTop: 8 }}>
        <div className="section-title">Quick Access</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { icon: '🃏', title: 'Flashcards', sub: 'Review concepts', tab: 'flashcards' },
            { icon: '🧠', title: 'Quiz Mode', sub: 'Test yourself', tab: 'quiz' },
            { icon: '📚', title: 'Saved', sub: 'Your library', tab: 'saved' },
            { icon: '📐', title: 'Try Calculus', sub: 'Example problem', q: 'Find the derivative of f(x) = x³ + 2x² - 5x + 3' },
          ].map((item, i) => (
            <div key={i} className="card" style={{ cursor: 'pointer', marginBottom: 0 }}
              onClick={() => item.tab ? switchTab(item.tab) : setQuestion(item.q)}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}