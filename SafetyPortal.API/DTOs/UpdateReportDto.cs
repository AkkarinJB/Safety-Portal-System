using SafetyPortal.API.Enums;
using Microsoft.AspNetCore.Http;

namespace SafetyPortal.API.DTOs
{
    public class UpdateReportDto
    {
        public ReportStatus Status { get; set; }

        public IFormFile? ImageAfter { get; set; }
        
        public string? Suggestion { get; set; }
    }
}