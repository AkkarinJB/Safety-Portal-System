namespace SafetyPortal.API.DTOs
{
    /// <summary>
    /// DTO for Gemini API request structure
    /// </summary>
    public class GeminiRequestDto
    {
        public GeminiContent[] Contents { get; set; } = Array.Empty<GeminiContent>();
    }
}

