import { useState } from 'react'
import { generateQuiz } from '../api'

export default function Quiz() {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  const [phase, setPhase] = useState('setup') // setup | quiz | result

  const topics = ['Quadratic Equations', "Newton's Laws", 'Cell Biology', 'World War II']

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await generateQuiz(topic)
      setQuestions(data.questions)
      setCurrentQ(0)
      setSelected(null)
      setScore(0)
      setShowResult(false)
      setPhase('quiz')
    } catch (e) {
      setError('Failed to generate quiz. Try again.')
    }
    setLoading(false)
  }

  const handleSelect = (idx) => {
    if (selected !== null) return
    setSelected(idx)
    if (idx === questions[currentQ].correct) {
      setScore(prev => prev + 1)
    }
  }

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1)
      setSelected(null)
    } else {
      const pct = Math.round((score + (selected === questions[currentQ].correct ? 1 : 0)) / questions.length * 100)
      setResults(prev => [{
        topic,
        score: score + (selected === questions[currentQ].correct ? 1 : 0),
        total: questions.length,
        pct,
        date: new Date().toLocaleDateString()
      }, ...prev])
      setPhase('result')
    }
  }

  const handleRestart = () => {
    setCurrentQ(0)
    setSelected(null)
    setScore(0)
    setPhase('quiz')
  }

  const handleNewQuiz = () => {
    setTopic('')
    setQuestions([])
    setPhase('setup')
  }

  const letters = ['A', 'B', 'C', 'D']
  const finalScore = phase === 'result'
    ? results[0]?.score ?? 0
    : score
  const finalPct = phase === 'result'
    ? results[0]?.pct ?? 0
    : 0

  return (
    <div className="page">
      <div className="page-title">🧠 Quiz Mode</div>
      <div className="page-sub">Test your knowledge with AI questions</div>

      {/* Setup Phase */}
      {phase === 'setup' && (
        <>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 8 }}>Generate a Quiz</div>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Enter topic… e.g. 'Photosynthesis' or paste your notes"
              style={{ minHeight: 70 }}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0' }}>
              {topics.map(t => (
                <button key={t} className="btn btn-secondary"
                  style={{ fontSize: 11, padding: '5px 10px' }}
                  onClick={() => setTopic(t)}>
                  {t}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" onClick={handleGenerate} disabled={loading || !topic.trim()}>
              {loading ? <><span className="spin">⚙️</span> Generating Quiz…</> : '🧠 Start AI Quiz'}
            </button>
            {error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 8 }}>⚠️ {error}</div>}
          </div>

          {/* Past Results */}
          <div className="section-title">Past Results</div>
          {results.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📊</div>
              No quizzes taken yet
            </div>
          ) : (
            results.map((r, i) => (
              <div key={i} className="card"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{r.topic}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{r.date}</div>
                </div>
                <div style={{
                  fontSize: 16, fontWeight: 700,
                  color: r.pct >= 80 ? 'var(--green)' : r.pct >= 60 ? 'var(--yellow)' : 'var(--red)'
                }}>
                  {r.score}/{r.total}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* Quiz Phase */}
      {phase === 'quiz' && questions.length > 0 && (
        <div className="fade-in">
          {/* Progress */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
                borderRadius: 3,
                width: `${((currentQ) / questions.length) * 100}%`,
                transition: 'width .4s ease'
              }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>
              Question {currentQ + 1} of {questions.length} · Score: {score}
            </div>
          </div>

          {/* Question Card */}
          <div className="card">
            <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.5, marginBottom: 16 }}>
              {questions[currentQ].question}
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {questions[currentQ].options.map((opt, i) => {
                let bg = 'var(--surface2)'
                let border = 'var(--border)'
                let color = 'var(--text)'
                if (selected !== null) {
                  if (i === questions[currentQ].correct) {
                    bg = 'rgba(52,211,153,.1)'; border = 'var(--green)'
                  } else if (i === selected && i !== questions[currentQ].correct) {
                    bg = 'rgba(248,113,113,.1)'; border = 'var(--red)'
                  }
                }
                return (
                  <button key={i}
                    onClick={() => handleSelect(i)}
                    disabled={selected !== null}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--r2)',
                      border: `1px solid ${border}`,
                      background: bg,
                      color,
                      fontSize: 13,
                      cursor: selected !== null ? 'default' : 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      display: 'flex',
                      gap: 10,
                      alignItems: 'center',
                      transition: '.15s'
                    }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'var(--surface3)',
                      fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, color: 'var(--text2)'
                    }}>{letters[i]}</span>
                    {opt}
                  </button>
                )
              })}
            </div>

            {/* Explanation */}
            {selected !== null && (
              <div className="fade-in" style={{
                background: 'var(--surface2)',
                borderRadius: 'var(--r2)',
                padding: 12, marginTop: 12,
                fontSize: 13, color: 'var(--text2)',
                lineHeight: 1.5,
                borderLeft: '3px solid var(--accent)'
              }}>
                💡 {questions[currentQ].explanation}
              </div>
            )}
          </div>

          {/* Next Button */}
          {selected !== null && (
            <button className="btn btn-primary fade-in" onClick={handleNext}>
              {currentQ < questions.length - 1 ? 'Next Question →' : 'See Results 🏆'}
            </button>
          )}
        </div>
      )}

      {/* Result Phase */}
      {phase === 'result' && (
        <div className="fade-in" style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: 56, fontWeight: 700, marginBottom: 8 }}>
            {results[0]?.score}/{results[0]?.total}
          </div>
          <div style={{ fontSize: 15, color: 'var(--text2)', marginBottom: 8 }}>
            {finalPct >= 80 ? 'Excellent work! 🎉' : finalPct >= 60 ? 'Good job! Keep practicing 📚' : 'Keep studying — you\'ll get it! 💪'}
          </div>
          <div style={{ fontSize: 28, marginBottom: 24 }}>
            {finalPct >= 80 ? '⭐⭐⭐' : finalPct >= 60 ? '⭐⭐' : '⭐'}
          </div>
          <button className="btn btn-primary" style={{ marginBottom: 8 }} onClick={handleRestart}>
            Try Again 🔄
          </button>
          <button className="btn btn-secondary" onClick={handleNewQuiz}>
            New Topic
          </button>
        </div>
      )}
    </div>
  )
}