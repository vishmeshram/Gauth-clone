# Gauth-clone
 Your Ai Companion for homework
# 🎓 StudyAI — AI Homework & Study Companion

> A Gauth clone — point your camera at any problem and get instant AI-powered step-by-step solutions.

## 🌟 Features
- 📷 **Camera Scan** — upload photo of any problem, AI reads and solves it
- ✏️ **Text Input** — type any question and get step-by-step explanation
- ⚡ **AI Solutions** — powered by Google Gemini 2.5 Flash
- 🃏 **Flashcard Generator** — paste notes, AI creates study decks instantly
- 🧠 **Quiz Mode** — AI generates 5 MCQs on any topic with explanations
- 📚 **Problem Library** — save and revisit solved problems by subject
- 🎯 **Subject Detection** — auto-detects Math, Science, History, Biology etc.

## 🛠️ Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, mobile-first |
| Backend | .NET 9 Web API (C#) |
| AI | Google Gemini 2.5 Flash |
| Storage | JSON file (no database needed) |
| Styling | Custom CSS dark theme |

## 📁 Project Structure
Gauth-clone/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx       # Text + camera input, solution display
│   │   │   ├── Flashcards.jsx # Deck generation + flip cards
│   │   │   ├── Quiz.jsx       # AI quiz with scoring
│   │   │   └── Saved.jsx      # Problem library
│   │   ├── App.jsx            # Tab navigation
│   │   ├── App.css            # Dark theme styles
│   │   └── api.js             # Backend API calls
├── backend/
│   ├── Controllers/
│   │   └── StudyController.cs # All API endpoints
│   ├── Services/
│   │   └── GeminiService.cs   # Gemini AI integration
│   ├── Models/
│   │   └── Models.cs          # Request/response models
│   └── Program.cs             # App setup + CORS
├── ai-logs/
│   └── claude-build-log.md    # AI development logs
└── README.md
## 🚀 Setup & Run

### Prerequisites
- Node.js 18+
- .NET 9 SDK
- Google Gemini API key (free at aistudio.google.com)

### 1. Clone the repo
```bash
git clone https://github.com/vishmeshram/Gauth-clone.git
cd Gauth-clone
```

### 2. Run Backend
```bash
cd backend
echo GEMINI_API_KEY=your_gemini_key_here > .env
dotnet run
# Runs on http://localhost:5082
```

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### 4. Open the app
http://localhost:5173
## 🔌 API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/study/solve` | Solve text problem |
| POST | `/api/study/solve/image` | Solve from image |
| POST | `/api/study/flashcards` | Generate flashcard deck |
| POST | `/api/study/quiz` | Generate 5 MCQ quiz |
| GET | `/api/study/problems` | Get saved problems |
| POST | `/api/study/problems` | Save a problem |
| DELETE | `/api/study/problems/{id}` | Delete a problem |

## 📱 Screenshots
*App running on mobile-first dark theme*

## 🤖 AI Integration
- All Gemini API calls go through the .NET backend (API key stays secure)
- Structured JSON prompts ensure consistent AI responses
- Supports both text and image (vision) inputs
- Prompt engineered for educational step-by-step explanations

## 📝 Reflection
**What went well:**
- Gemini AI returns excellent structured JSON when prompted correctly
- .NET + React separation made debugging easier
- Mobile-first CSS approach matched Gauth's design closely

**Challenges:**
- Gemini model names changed — had to discover available models via API
- Free tier quota limits required fresh API key
- EF Core version mismatch with .NET 9 — switched to JSON file storage

**What I'd improve:**
- Add user authentication
- Deploy to cloud (Azure + Vercel)
- Add real spaced repetition algorithm
- Support more file formats (PDF, diagrams)
