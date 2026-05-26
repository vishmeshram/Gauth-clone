using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;
using Newtonsoft.Json;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudyController : ControllerBase
    {
        private readonly GeminiService _geminiService;
        private readonly string _dataFile = "problems.json";

        public StudyController(IHttpClientFactory httpClientFactory)
        {
            _geminiService = new GeminiService(httpClientFactory.CreateClient());
        }

        // ── SOLVE TEXT ──
        [HttpPost("solve")]
        public async Task<IActionResult> SolveText([FromBody] SolveTextRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Question))
                return BadRequest(new { error = "Question is required" });

            try
            {
                var result = await _geminiService.SolveTextAsync(request.Question);
                var clean = result.Replace("```json", "").Replace("```", "").Trim();
                var parsed = JsonConvert.DeserializeObject(clean);
                return Ok(parsed);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ── SOLVE IMAGE ──
        [HttpPost("solve/image")]
        public async Task<IActionResult> SolveImage([FromBody] SolveImageRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.ImageBase64))
                return BadRequest(new { error = "Image is required" });

            try
            {
                var result = await _geminiService.SolveImageAsync(request.ImageBase64, request.MimeType);
                var clean = result.Replace("```json", "").Replace("```", "").Trim();
                var parsed = JsonConvert.DeserializeObject(clean);
                return Ok(parsed);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ── GENERATE FLASHCARDS ──
        [HttpPost("flashcards")]
        public async Task<IActionResult> GenerateFlashcards([FromBody] FlashcardRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Notes))
                return BadRequest(new { error = "Notes are required" });

            try
            {
                var result = await _geminiService.GenerateFlashcardsAsync(request.Notes);
                var clean = result.Replace("```json", "").Replace("```", "").Trim();
                var parsed = JsonConvert.DeserializeObject(clean);
                return Ok(parsed);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ── GENERATE QUIZ ──
        [HttpPost("quiz")]
        public async Task<IActionResult> GenerateQuiz([FromBody] QuizRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Topic))
                return BadRequest(new { error = "Topic is required" });

            try
            {
                var result = await _geminiService.GenerateQuizAsync(request.Topic);
                var clean = result.Replace("```json", "").Replace("```", "").Trim();
                var parsed = JsonConvert.DeserializeObject(clean);
                return Ok(parsed);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ── SAVE PROBLEM ──
        [HttpPost("problems")]
        public IActionResult SaveProblem([FromBody] SaveProblemRequest request)
        {
            try
            {
                var problems = LoadProblems();
                var newProblem = new SavedProblem
                {
                    Id = Guid.NewGuid().ToString(),
                    Question = request.Question,
                    Subject = request.Subject,
                    SubjectEmoji = request.SubjectEmoji,
                    SolutionJson = request.SolutionJson,
                    Timestamp = DateTime.Now.ToShortDateString()
                };
                problems.Insert(0, newProblem);
                SaveProblems(problems);
                return Ok(newProblem);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ── GET ALL SAVED PROBLEMS ──
        [HttpGet("problems")]
        public IActionResult GetProblems()
        {
            try
            {
                var problems = LoadProblems();
                return Ok(problems);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ── DELETE PROBLEM ──
        [HttpDelete("problems/{id}")]
        public IActionResult DeleteProblem(string id)
        {
            try
            {
                var problems = LoadProblems();
                problems.RemoveAll(p => p.Id == id);
                SaveProblems(problems);
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ── HELPERS ──
        private List<SavedProblem> LoadProblems()
        {
            if (!System.IO.File.Exists(_dataFile))
                return new List<SavedProblem>();
            var json = System.IO.File.ReadAllText(_dataFile);
            return JsonConvert.DeserializeObject<List<SavedProblem>>(json) ?? new List<SavedProblem>();
        }

        private void SaveProblems(List<SavedProblem> problems)
        {
            var json = JsonConvert.SerializeObject(problems, Formatting.Indented);
            System.IO.File.WriteAllText(_dataFile, json);
        }
    }
}