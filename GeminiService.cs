using System.Text;
using Newtonsoft.Json;

namespace backend.Services
{
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private const string BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
        public GeminiService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? "";
        }

        public async Task<string> SolveTextAsync(string question)
        {
            var prompt = $@"You are StudyAI, an expert tutor. Solve this homework problem and respond in this EXACT JSON format only (no markdown, no backticks, just pure JSON):
{{
  ""subject"": ""Math|Science|History|Biology|Chemistry|Physics|Literature|Other"",
  ""subjectEmoji"": ""relevant emoji"",
  ""steps"": [
    {{""title"": ""Step title"", ""body"": ""Explanation"", ""formula"": ""optional formula or empty string""}}
  ],
  ""answer"": ""The final concise answer"",
  ""tip"": ""A helpful study tip""
}}
Provide 3-5 clear steps. Problem to solve: {question}";

            return await CallGeminiAsync(prompt);
        }

        public async Task<string> SolveImageAsync(string imageBase64, string mimeType)
        {
            var prompt = @"You are StudyAI. Extract the question from this image and solve it. Respond in this EXACT JSON format only (no markdown, no backticks, just pure JSON):
{
  ""subject"": ""Math|Science|History|Biology|Chemistry|Physics|Literature|Other"",
  ""subjectEmoji"": ""relevant emoji"",
  ""extractedQuestion"": ""the exact question from the image"",
  ""steps"": [
    {""title"": ""Step title"", ""body"": ""Explanation"", ""formula"": ""optional formula or empty string""}
  ],
  ""answer"": ""The final concise answer"",
  ""tip"": ""A helpful study tip""
}";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new object[]
                        {
                            new
                            {
                                inline_data = new
                                {
                                    mime_type = mimeType,
                                    data = imageBase64
                                }
                            },
                            new { text = prompt }
                        }
                    }
                }
            };

            var json = JsonConvert.SerializeObject(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"{BASE_URL}?key={_apiKey}", content);
            var responseString = await response.Content.ReadAsStringAsync();
            return ExtractText(responseString);
        }

        public async Task<string> GenerateFlashcardsAsync(string notes)
        {
            var prompt = $@"You are StudyAI. Create exactly 6 educational flashcards from the given notes or topic. Respond in this EXACT JSON format only (no markdown, no backticks, just pure JSON):
{{
  ""deckName"": ""short deck name"",
  ""emoji"": ""relevant emoji"",
  ""cards"": [
    {{""front"": ""question or term"", ""back"": ""answer or definition""}}
  ]
}}
Notes or topic: {notes}";

            return await CallGeminiAsync(prompt);
        }

        public async Task<string> GenerateQuizAsync(string topic)
        {
            var prompt = $@"You are StudyAI. Create exactly 5 multiple choice quiz questions. Respond in this EXACT JSON format only (no markdown, no backticks, just pure JSON):
{{
  ""questions"": [
    {{
      ""question"": ""question text"",
      ""options"": [""A"", ""B"", ""C"", ""D""],
      ""correct"": 0,
      ""explanation"": ""why this answer is correct""
    }}
  ]
}}
The correct field is the 0-based index of the correct option. Topic: {topic}";

            return await CallGeminiAsync(prompt);
        }

        private async Task<string> CallGeminiAsync(string prompt)
        {
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var json = JsonConvert.SerializeObject(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"{BASE_URL}?key={_apiKey}", content);
            var responseString = await response.Content.ReadAsStringAsync();
            return ExtractText(responseString);
        }

        private string ExtractText(string geminiResponse)
        {
            try
            {
                dynamic parsed = JsonConvert.DeserializeObject(geminiResponse)!;
                return parsed.candidates[0].content.parts[0].text;
            }
            catch
            {
                return geminiResponse;
            }
        }
    }
}
