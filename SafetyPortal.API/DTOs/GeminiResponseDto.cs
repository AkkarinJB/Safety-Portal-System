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
}

