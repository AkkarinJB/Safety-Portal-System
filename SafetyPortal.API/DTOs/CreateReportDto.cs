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
        public string Detail { get; set; } = string.Empty;

        public string? Category { get; set; }

        public RiskRank Rank { get; set; } = RiskRank.C;

        public string ResponsiblePerson { get; set; } = string.Empty;

        public IFormFile? ImageBefore { get; set; }
    }
}