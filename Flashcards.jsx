import { useState } from 'react'
import { generateFlashcards } from '../api'

export default function Flashcards() {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [decks, setDecks] = useState([])
  const [activeDeck, setActiveDeck] = useState(null)
  const [cardIdx, setCardIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!notes.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await generateFlashcards(notes)
      const deck = { ...data, id: Date.now() }
      setDecks(prev => [deck, ...prev])
      setActiveDeck(deck)
      setCardIdx(0)
      setFlipped(false)
      setNotes('')
    } catch (e) {
      setError('Failed to generate flashcards. Try again.')
    }
    setLoading(false)
  }

  const handleNext = () => {
    if (cardIdx < activeDeck.cards.length - 1) {
      setCardIdx(prev => prev + 1)
      setFlipped(false)
    } else {
      alert('🎉 Deck complete! Great studying!')
    }
  }

  const handlePrev = () => {
    if (cardIdx > 0) {
      setCardIdx(prev => prev - 1)
      setFlipped(false)
    }
  }

  return (
    <div className="page">
      <div className="page-title">🃏 Flashcards</div>
      <div className="page-sub">Generate decks from your notes</div>

      {/* Generate */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 8 }}>Generate New Deck</div>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Paste your notes or enter a topic… e.g. 'Photosynthesis process and steps'"
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0' }}>
          {['Quadratic equations', 'Periodic table', 'French Revolution', 'DNA replication'].map(t => (
            <button key={t} className="btn btn-secondary"
              style={{ fontSize: 11, padding: '5px 10px' }}
              onClick={() => setNotes(t)}>
              {t}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading || !notes.trim()}>
          {loading ? <><span className="spin">⚙️</span> Generating…</> : '⚡ Generate Flashcards'}
        </button>
        {error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 8 }}>⚠️ {error}</div>}
      </div>

      {/* Active Deck Study */}
      {activeDeck && (
        <div className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>
              {activeDeck.emoji} {activeDeck.deckName} · Card {cardIdx + 1}/{activeDeck.cards.length}
            </div>
            <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: 11 }}
              onClick={() => setActiveDeck(null)}>
              ← Decks
            </button>
          </div>

          {/* Flashcard */}
          <div
            onClick={() => setFlipped(!flipped)}
            style={{
              background: flipped
                ? 'linear-gradient(135deg,#1a2535,#1e2f40)'
                : 'linear-gradient(135deg,#1c1c35,#252540)',
              border: `1px solid ${flipped ? 'var(--accent3)' : 'var(--accent)'}`,
              borderRadius: 'var(--r)',
              padding: 28,
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: 8,
              transition: '.3s'
            }}>
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: .8, marginBottom: 12,
              color: flipped ? 'var(--accent3)' : 'var(--accent2)'
            }}>
              {flipped ? 'Answer' : 'Question'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.5 }}>
              {flipped
                ? activeDeck.cards[cardIdx].back
                : activeDeck.cards[cardIdx].front}
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
            Tap card to flip
          </div>

          {/* Nav */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handlePrev}>← Prev</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleNext}>Next →</button>
          </div>

          {/* Rating */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['😕 Hard', '🙂 OK', '😄 Easy'].map(r => (
              <button key={r} className="btn btn-secondary"
                style={{ flex: 1, fontSize: 12 }}
                onClick={handleNext}>
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Deck List */}
      {!activeDeck && (
        <div>
          <div className="section-title">Your Decks</div>
          {decks.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🃏</div>
              Generate your first deck above!
            </div>
          ) : (
            decks.map(deck => (
              <div key={deck.id} className="card"
                style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 8 }}
                onClick={() => { setActiveDeck(deck); setCardIdx(0); setFlipped(false) }}>
                <div style={{ fontSize: 28 }}>{deck.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{deck.deckName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Tap to study</div>
                </div>
                <div className="badge badge-purple">{deck.cards?.length} cards</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}