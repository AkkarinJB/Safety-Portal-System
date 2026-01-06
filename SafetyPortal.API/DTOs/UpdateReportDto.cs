using SafetyPortal.API.Enums;
using Microsoft.AspNetCore.Http;

namespace SafetyPortal.API.DTOs
{
    public class UpdateReportDto
    {
        public string? Area { get; set; }
        public DateTime? ReportDate { get; set; }
        public string? Detail { get; set; }
        public string? Category { get; set; }
        public Stop6? Stop6 { get; set; }
        public RiskRank? Rank { get; set; }
        public string? Suggestion { get; set; }
        public string? ResponsiblePerson { get; set; }
        public ReportStatus? Status { get; set; }

        public IFormFile? ImageBefore { get; set; }
        public IFormFile? ImageAfter { get; set; }
    }
}