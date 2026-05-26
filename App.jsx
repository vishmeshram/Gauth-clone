import { useState } from 'react'
import Home from './pages/Home'
import Flashcards from './pages/Flashcards'
import Quiz from './pages/Quiz'
import Saved from './pages/Saved'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div className="app">
      {/* Pages */}
      <div className="pages">
        {activeTab === 'home' && <Home switchTab={setActiveTab} />}
        {activeTab === 'flashcards' && <Flashcards />}
        {activeTab === 'quiz' && <Quiz />}
        {activeTab === 'saved' && <Saved switchTab={setActiveTab} />}
      </div>

      {/* Bottom Nav */}
      <div className="bottom-nav">
        <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>
          <span>🏠</span>
          <span>Home</span>
        </button>
        <button className={activeTab === 'flashcards' ? 'active' : ''} onClick={() => setActiveTab('flashcards')}>
          <span>🃏</span>
          <span>Cards</span>
        </button>
        <button className={activeTab === 'quiz' ? 'active' : ''} onClick={() => setActiveTab('quiz')}>
          <span>🧠</span>
          <span>Quiz</span>
        </button>
        <button className={activeTab === 'saved' ? 'active' : ''} onClick={() => setActiveTab('saved')}>
          <span>📚</span>
          <span>Saved</span>
        </button>
      </div>
    </div>
  )
}

export default App