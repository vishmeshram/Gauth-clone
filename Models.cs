namespace backend.Models
{
    public class SolveTextRequest
    {
        public string Question { get; set; } = "";
    }

    public class SolveImageRequest
    {
        public string ImageBase64 { get; set; } = "";
        public string MimeType { get; set; } = "image/jpeg";
    }

    public class FlashcardRequest
    {
        public string Notes { get; set; } = "";
    }

    public class QuizRequest
    {
        public string Topic { get; set; } = "";
    }

    public class SaveProblemRequest
    {
        public string Question { get; set; } = "";
        public string Subject { get; set; } = "";
        public string SubjectEmoji { get; set; } = "";
        public string SolutionJson { get; set; } = "";
    }

    public class SavedProblem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Question { get; set; } = "";
        public string Subject { get; set; } = "";
        public string SubjectEmoji { get; set; } = "";
        public string SolutionJson { get; set; } = "";
        public string Timestamp { get; set; } = DateTime.Now.ToShortDateString();
    }
}
