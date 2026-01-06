using System.ComponentModel.DataAnnotations;
using SafetyPortal.API.Enums;
using Microsoft.AspNetCore.Http;

namespace SafetyPortal.API.DTOs
{
    public class CreateReportDto
    {
        [Required]
        public string Area { get; set; } = string.Empty;

        [Required]
        public DateTime ReportDate { get; set; } = DateTime.UtcNow;

        [Required]
        public string Detail { get; set; } = string.Empty;

        public string? Category { get; set; }

        public Stop6 Stop6 { get; set; } = Stop6.Other;

        public RiskRank Rank { get; set; } = RiskRank.C;

        public string? Suggestion { get; set; }

        public string ResponsiblePerson { get; set; } = string.Empty;

        public ReportStatus Status { get; set; } = ReportStatus.NotYetDone;

        public IFormFile? ImageBefore { get; set; }
    }
}