namespace SafetyPortal.API.DTOs
{
    /// <summary>
    /// DTO for Gemini API response structure
    /// </summary>
    public class GeminiResponseDto
    {
        public GeminiCandidate[] Candidates { get; set; } = Array.Empty<GeminiCandidate>();
    }

    public class GeminiCandidate
    {
        public GeminiContent Content { get; set; } = new();
    }

    public class GeminiContent
    {
        public GeminiPart[] Parts { get; set; } = Array.Empty<GeminiPart>();
    }

    public class GeminiPart
    {
        public string Text { get; set; } = string.Empty;
    }
}

