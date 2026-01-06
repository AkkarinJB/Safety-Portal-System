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

        // Accept both enum and string for FormData binding
        public Stop6? Stop6 { get; set; }
        public string? Stop6String { get; set; }

        public RiskRank? Rank { get; set; }
        public string? RankString { get; set; }

        public string? Suggestion { get; set; }

        public string ResponsiblePerson { get; set; } = string.Empty;

        public ReportStatus? Status { get; set; }
        public string? StatusString { get; set; }

        public IFormFile? ImageBefore { get; set; }

        // Helper properties to get parsed values
        public Stop6 GetStop6()
        {
            if (Stop6.HasValue) return Stop6.Value;
            if (!string.IsNullOrEmpty(Stop6String) && int.TryParse(Stop6String, out int stop6Int))
            {
                if (Enum.IsDefined(typeof(Stop6), stop6Int))
                    return (Stop6)stop6Int;
            }
            return Stop6.Other;
        }

        public RiskRank GetRank()
        {
            if (Rank.HasValue) return Rank.Value;
            if (!string.IsNullOrEmpty(RankString) && Enum.TryParse<RiskRank>(RankString, true, out RiskRank parsedRank))
                return parsedRank;
            return RiskRank.C;
        }

        public ReportStatus GetStatus()
        {
            if (Status.HasValue) return Status.Value;
            if (!string.IsNullOrEmpty(StatusString) && Enum.TryParse<ReportStatus>(StatusString, true, out ReportStatus parsedStatus))
                return parsedStatus;
            return ReportStatus.NotYetDone;
        }
    }
}