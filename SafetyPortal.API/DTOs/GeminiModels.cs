namespace SafetyPortal.API.DTOs
{
    /// <summary>
    /// Shared models for Gemini API requests and responses
    /// </summary>
    public class GeminiContent
    {
        public GeminiPart[] Parts { get; set; } = Array.Empty<GeminiPart>();
    }

    public class GeminiPart
    {
        public string Text { get; set; } = string.Empty;
    }
}

