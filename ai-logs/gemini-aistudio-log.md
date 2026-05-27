# 🟡 Gemini AI Studio Build Log — StudyAI (Gauth Clone)

**Project:** StudyAI Homework & Study Companion (Gauth Clone)
**Developer:** Vishwas Meshram
**Build Date:** May 26, 2026
**AI Tool Used:** Google Gemini (via aistudio.google.com)
**Purpose:** Prompt prototyping and API discovery before wiring into .NET backend

---

## Prompt
What is the correct REST API endpoint and request body format to call Gemini 2.5 Flash for text completion? I want to call it from a C# HttpClient.

## Response
Provided the working endpoint and structure:
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=API_KEY
```

Request body:
```json
{
  "contents": [{
    "parts": [{ "text": "your prompt here" }]
  }]
}
```

Response path to extract text:
```
candidates[0].content.parts[0].text
```

This became the `CallGeminiAsync()` private method and `ExtractText()` helper in `GeminiService.cs`.

---

## Prompt (AI Studio Playground — Text)
Test prompt before writing backend code:

```
You are StudyAI, an expert tutor. Solve this homework problem and respond in this EXACT JSON format only (no markdown, no backticks, just pure JSON):
{
  "subject": "Math|Science|History|Biology|Chemistry|Physics|Literature|Other",
  "subjectEmoji": "relevant emoji",
  "steps": [
    {"title": "Step title", "body": "Explanation", "formula": "optional formula or empty string"}
  ],
  "answer": "The final concise answer",
  "tip": "A helpful study tip"
}
Provide 3-5 clear steps. Problem to solve: Solve 2x + 5 = 13
```

## Response (AI Studio Output)
```json
{
  "subject": "Math",
  "subjectEmoji": "🔢",
  "steps": [
    {"title": "Subtract 5 from both sides", "body": "To isolate the term with x, subtract 5 from both sides of the equation.", "formula": "2x + 5 - 5 = 13 - 5  →  2x = 8"},
    {"title": "Divide both sides by 2", "body": "To solve for x, divide both sides by the coefficient of x, which is 2.", "formula": "2x / 2 = 8 / 2  →  x = 4"},
    {"title": "Verify the solution", "body": "Substitute x = 4 back into the original equation to confirm.", "formula": "2(4) + 5 = 8 + 5 = 13 ✓"}
  ],
  "answer": "x = 4",
  "tip": "Always verify your answer by substituting it back into the original equation."
}
```

**Validated:** Clean JSON, correct structure, no markdown wrapper. This exact prompt went into `GeminiService.SolveTextAsync()`.

**Key learning:** Without `"no markdown, no backticks, just pure JSON"` instruction, Gemini wraps output in ` ```json ``` ` fences. This is why `StudyController.cs` still has the defensive strip:
```csharp
var clean = result.Replace("```json", "").Replace("```", "").Trim();
```

---

## Prompt (AI Studio Playground — Vision)
Uploaded a photo of a printed textbook math problem to test vision capability.

Prompt sent with image:
```
You are StudyAI. Extract the question from this image and solve it. Respond in this EXACT JSON format only (no markdown, no backticks, just pure JSON):
{
  "subject": "...",
  "subjectEmoji": "...",
  "extractedQuestion": "the exact question from the image",
  "steps": [...],
  "answer": "...",
  "tip": "..."
}
```

## Response
Gemini correctly extracted the printed question word-for-word and returned full structured JSON with steps.

**Observations:**
- Printed text: ~100% accurate extraction
- Handwritten problems: ~80% accurate depending on handwriting clarity
- The `extractedQuestion` field is valuable — it shows users what the AI read from their photo, building trust in the result

This confirmed the vision flow before building `GeminiService.SolveImageAsync()`. The `inline_data` multimodal format was validated here first.

---

## Prompt (AI Studio Playground — Flashcards)
```
You are StudyAI. Create exactly 6 educational flashcards from the given notes or topic.
Respond in this EXACT JSON format only (no markdown, no backticks, just pure JSON):
{
  "deckName": "short deck name",
  "emoji": "relevant emoji",
  "cards": [
    {"front": "question or term", "back": "answer or definition"}
  ]
}
Notes or topic: Photosynthesis
```

## Response
Returned exactly 6 cards with accurate biology content. Used 🌿 as emoji. DeckName: "Photosynthesis Basics".

**Issue found during testing:** First attempt without "exactly 6" returned 8 cards. Adding the word "exactly" enforced the count. This wording is now in `GeminiService.GenerateFlashcardsAsync()`.

---

## Prompt (AI Studio Playground — Quiz)
```
You are StudyAI. Create exactly 5 multiple choice quiz questions. Respond in this EXACT JSON format only (no markdown, no backticks, just pure JSON):
{
  "questions": [
    {
      "question": "question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correct": 0,
      "explanation": "why this answer is correct"
    }
  ]
}
The correct field is the 0-based index of the correct option. Topic: Newton's Laws of Motion
```

## Response
Returned 5 well-structured physics MCQs with accurate explanations.

**Design decision validated here:** Using integer index (0,1,2,3) for `correct` instead of a letter (A/B/C/D). This made scoring in `Quiz.jsx` trivial:
```javascript
selected === question.correct  // simple integer comparison
```
vs parsing a letter string. Tested both approaches in AI Studio before committing to the integer format.

---

## Prompt
I'm getting 404 "model not found" for gemini-1.5-flash. How do I find which models are actually available on my API key?

## Response
Provided the model discovery endpoint:
```javascript
fetch('https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY')
  .then(r => r.json())
  .then(d => d.models.forEach(m => console.log(m.name)))
```

Ran this in browser console. Confirmed available models include `gemini-2.5-flash`, `gemini-2.0-flash-lite` etc.

**Result:** Switched to `gemini-2.5-flash` on `v1beta` — the model now used in `GeminiService.cs`.

---

## Prompt
I keep hitting 429 rate limit errors. How do I handle this gracefully and what are the free tier limits?

## Response
- Free tier: 15 requests per minute, 1500 requests per day
- Hitting daily quota means waiting 24 hours OR creating a new API key
- For graceful handling: check HTTP status 429 and return a user-friendly message

**Solution applied:** Created a new Google account to get fresh API quota. Backend returns error JSON with `{ "error": "..." }` shape that frontend displays as the red error banner.

---

## Summary of AI Studio Usage

| What I Did | Outcome |
|---|---|
| Prototyped solve prompt | Validated JSON structure before writing any C# |
| Tested vision with real image | Confirmed printed text extraction works reliably |
| Tested flashcard count enforcement | Found "exactly 6" wording needed |
| Compared int vs letter for quiz correct field | Chose integer — simpler frontend scoring |
| Discovered working model name | `gemini-2.5-flash` on `v1beta` |
| Diagnosed 429 quota issue | Created fresh API key as fix |

**Total prompts tested in AI Studio:** ~12
**Key insight:** Prototyping every prompt in AI Studio before writing backend code saved hours. Iterating on prompt wording takes seconds in the playground vs redeploying the .NET API each time.
