namespace SafetyPortal.API.DTOs
{
    public class AiAnalysisResult
    {
        public string Suggestion { get; set; } = string.Empty; 
        public string Category { get; set; } = string.Empty;  
        public string Rank { get; set; } = string.Empty;      
    }
}