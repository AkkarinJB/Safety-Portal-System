namespace SafetyPortal.API.DTOs
{
    /// <summary>
    /// DTO for Gemini API request structure
    /// </summary>
    public class GeminiRequestDto
    {
        public GeminiContent[] Contents { get; set; } = Array.Empty<GeminiContent>();
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

