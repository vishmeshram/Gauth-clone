# StudyAI — AI Development Log
**Project:** StudyAI Homework & Study Companion (Gauth Clone)
**Developer:** Student
**Build Date:** May 26, 2026
**AI Tool Used:** Claude (Anthropic) via claude.ai
**Stack:** React (Vite) + .NET 9 Web API + Gemini AI

---

## Prompt
I need to build a Gauth clone — an AI homework and study companion app. It should have:
- Camera scan or text input for any problem
- Step-by-step AI solution with explanations
- AI flashcard generator from notes
- Quiz mode with spaced repetition
- Subject history and saved problems
Stack: React frontend + .NET backend + free AI API

## Response
Designed and planned full app architecture:
- .NET 9 Web API backend with 7 endpoints (solve text, solve image, flashcards, quiz, save/get/delete problems)
- React Vite frontend with 4 pages (Home, Flashcards, Quiz, Saved)
- Gemini AI for all AI features (free tier)
- SQLite initially planned but switched to JSON file storage to avoid package compatibility issues
- Mobile-first dark theme UI matching Gauth aesthetic

Full flow planned:
1. Backend handles all Gemini API calls (keeps API key secure server-side)
2. Frontend calls backend REST endpoints
3. JSON file acts as simple database for saved problems

---

## Prompt
Set up the .NET 9 backend project. What packages do I need and how do I structure it?

## Response
Created project structure:
```bash
dotnet new webapi -n backend --no-https
dotnet add package Microsoft.EntityFrameworkCore.Sqlite --version 9.0.0
dotnet add package Microsoft.EntityFrameworkCore.Design --version 9.0.0
dotnet add package Newtonsoft.Json
dotnet add package Microsoft.AspNetCore.Mvc.NewtonsoftJson --version 9.0.0
dotnet add package Swashbuckle.AspNetCore --version 6.9.0
```

Identified EF Core version mismatch issue (package tried to install v10 for .NET 9 project) and fixed with explicit version pinning. Decided to drop EF Core entirely and use JSON file storage instead — simpler, faster to implement, zero extra dependencies.

---

## Prompt
Write Program.cs for the .NET backend with CORS enabled, .env file loading for API keys, and Swagger UI.

## Response
```csharp
var builder = WebApplication.CreateBuilder(args);

// Load .env file
var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (File.Exists(envPath))
{
    foreach (var line in File.ReadAllLines(envPath))
    {
        var parts = line.Split('=', 2);
        if (parts.Length == 2)
            Environment.SetEnvironmentVariable(parts[0].Trim(), parts[1].Trim());
    }
}

builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();
app.UseCors("AllowAll");
app.UseSwagger();
app.UseSwaggerUI();
app.MapControllers();
app.Run();
```

Key decisions:
- Manual .env loading since .NET doesn't natively support .env files
- AllowAll CORS policy for local development
- Swagger enabled for API testing during development

---

## Prompt
Create the Models.cs file with request/response models for all API endpoints including SolveTextRequest, SolveImageRequest, FlashcardRequest, QuizRequest, SaveProblemRequest and SavedProblem.

## Response
Created `Models/Models.cs` with all required models:
- `SolveTextRequest` — accepts question string
- `SolveImageRequest` — accepts base64 image + mimeType
- `FlashcardRequest` — accepts notes/topic string
- `QuizRequest` — accepts topic string
- `SaveProblemRequest` — accepts question, subject, emoji, solutionJson
- `SavedProblem` — full saved problem with auto-generated GUID, timestamp

Used C# record-style classes with default values to avoid null reference issues.

---

## Prompt
Write a GeminiService.cs that calls Google Gemini API for: solving text problems, solving image problems (vision), generating flashcards, and generating quiz questions. Each should return structured JSON that can be parsed by the frontend.

## Response
Created `Services/GeminiService.cs` with:
- `SolveTextAsync()` — prompts Gemini to return step-by-step solution as JSON with subject, emoji, steps array, answer, tip
- `SolveImageAsync()` — sends base64 image + text prompt using Gemini Vision, extracts question from image then solves
- `GenerateFlashcardsAsync()` — returns deck with name, emoji, and cards array (front/back)
- `GenerateQuizAsync()` — returns 5 MCQs with options, correct index (0-based), explanation
- `ExtractText()` helper to parse Gemini response format (`candidates[0].content.parts[0].text`)

Prompt engineering approach used — each prompt specifies exact JSON format required, uses "no markdown, no backticks, just pure JSON" instruction to prevent formatting issues.

---

## Prompt
Write StudyController.cs with all API endpoints that use GeminiService, handle errors gracefully, and implement JSON file-based storage for saved problems.

## Response
Created `Controllers/StudyController.cs` with 7 endpoints:
- `POST /api/study/solve` — text problem solving
- `POST /api/study/solve/image` — image problem solving
- `POST /api/study/flashcards` — flashcard generation
- `POST /api/study/quiz` — quiz generation
- `POST /api/study/problems` — save a problem
- `GET /api/study/problems` — get all saved problems
- `DELETE /api/study/problems/{id}` — delete a problem

Each endpoint:
1. Validates input
2. Calls GeminiService
3. Cleans response (strips markdown fences)
4. Deserializes and returns as JSON
5. Has try/catch with proper error responses

JSON file storage uses `problems.json` in working directory — simple List serialization/deserialization with Newtonsoft.Json.

---

## Prompt
Debug issue: Gemini API returning 404 "model not found" error for gemini-1.5-flash on v1beta endpoint.

## Response
Diagnosed the issue — Gemini updated their available models. Ran model discovery:
```javascript
fetch('https://generativelanguage.googleapis.com/v1beta/models?key=API_KEY')
  .then(r=>r.json())
  .then(d=>d.models.forEach(m=>console.log(m.name)))
```

Found available models include `gemini-2.5-flash`, `gemini-2.0-flash-lite`, etc.
Also encountered 429 rate limit errors on free tier — resolved by creating a new Google account with fresh API quota.

Final working model: `gemini-2.5-flash` on `v1beta` endpoint.

---

## Prompt
Build the React frontend with App.jsx, App.css, and 4 page components (Home, Flashcards, Quiz, Saved). Mobile-first dark theme matching Gauth's UI. Connect to .NET backend API.

## Response
Created complete React app:

**App.jsx** — tab-based navigation with 4 pages, fixed bottom nav bar

**App.css** — full dark theme with CSS variables:
- Background: #0a0a0f
- Surface layers: #13131a, #1c1c27, #252535
- Accent: #7c6df0 (purple), #38bdf8 (blue)
- Mobile-first max-width 420px

**api.js** — centralized API service with axios:
- All 7 backend endpoints wrapped in async functions
- Base URL pointing to localhost:5082

---

## Prompt
Write Home.jsx page with text input tab, camera scan tab (image upload), example chips, AI solution display with numbered steps, formulas, save button, and quick access grid.

## Response
Built `Home.jsx` with:
- Two input modes: text textarea and file upload for camera scan
- Example quick-fill chips (Algebra, Physics, History, Biology)
- Loading skeleton animation while AI processes
- Solution card with:
  - Subject badge with emoji
  - Numbered step-by-step breakdown
  - Formula display in monospace with left border accent
  - Green answer box
  - Study tip section
  - Save, Flashcard, Quiz action buttons
- Image upload with preview before solving
- Base64 conversion for image → backend

Key UX decision: Ctrl+Enter keyboard shortcut to submit, disabled button when empty input.

---

## Prompt
Write Flashcards.jsx with deck generation from notes, flip card animation, prev/next navigation, spaced repetition rating (Hard/OK/Easy), and deck library view.

## Response
Built `Flashcards.jsx` with:
- Notes/topic input with example topic chips
- Gemini-powered deck generation (6 cards per deck)
- Flip animation using CSS transition on background/border color change
- Card navigation with prev/next buttons
- Spaced repetition rating buttons (Hard/OK/Easy) — each advances to next card
- Deck library showing all generated decks with card count badges
- State management: decks array, activeDeck, cardIdx, flipped boolean

---

## Prompt
Write Quiz.jsx with AI quiz generation, multiple choice questions, answer feedback with color coding, explanation display, score tracking, results screen with stars, and past results history.

## Response
Built `Quiz.jsx` with three phases:
1. **Setup** — topic input, quick topic chips, past results list
2. **Quiz** — progress bar, MCQ with A/B/C/D options, color feedback (green correct/red wrong), explanation after answer
3. **Result** — score display, star rating (3/2/1 stars), try again / new topic buttons

Score calculation handles edge case of last question correctly.
Past results stored in component state with topic, score, percentage, date.

---

## Prompt
Write Saved.jsx with problem library fetched from backend, subject filters, list view with subject emoji, and detail view showing full step-by-step solution with delete functionality.

## Response
Built `Saved.jsx` with:
- `useEffect` to fetch problems from backend on mount
- Filter tabs: All, Math, Science, Physics, Chemistry, Biology, History, Other
- Problem list with emoji icon, truncated question, subject badge, timestamp
- Detail view (replaces list) showing full solution steps, formulas, answer
- Delete with confirm dialog → calls DELETE endpoint → updates local state
- Loading skeletons while fetching
- Empty states for no problems / no problems in filter

---

## Prompt
The app shows solution answer but not the step-by-step explanation. Debug why steps aren't rendering.

## Response
Diagnosed through browser Network tab and F12 console testing. Root cause was Gemini API errors (404 model not found, then 429 rate limit exceeded) causing the backend to return error objects instead of solution JSON.

Steps to fix:
1. Tested multiple Gemini model names from available models list
2. Discovered free tier quota exhausted on original Google account
3. Created new Google account → new API key → fresh quota
4. Updated `.env` with new key, restarted backend
5. Confirmed working with direct fetch test in console returning full JSON with steps array

Solution renders correctly once valid JSON with `steps` array is returned from backend.

---

## Prompt
What should the README include for the contest submission?

## Response
README should cover:
- Project overview and features list
- Tech stack (React + .NET 9 + Gemini AI)
- Setup instructions (clone, install dependencies, add API key, run)
- Screenshots of key flows
- API endpoints documentation
- Known limitations and future improvements

---

## Summary of AI-Assisted Development

| Task | AI Contribution | Developer Contribution |
|---|---|---|
| Architecture design | Suggested full stack approach | Chose .NET over Node for familiarity |
| Backend setup | Generated all C# code | Debugged package version issues |
| Gemini integration | Wrote service with prompt engineering | Debugged model availability/quota |
| Frontend components | Generated all React JSX | Tested each feature, fixed integration |
| Debugging | Identified root causes | Ran tests, provided error outputs |
| UI/UX design | Dark theme CSS system | Verified mobile responsiveness |

**Total AI interactions:** ~35 prompts
**Build time:** ~6 hours
**Lines of code:** ~1200 (backend: ~400, frontend: ~800)
