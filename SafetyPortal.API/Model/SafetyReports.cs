using System.ComponentModel.DataAnnotations;
using SafetyPortal.API.Enums;

namespace SafetyPortal.API.Models
{
    public class SafetyReports
    {
        public int Id { get; set; }

        [Required]
        public string Area { get; set; } = string.Empty; 

        [Required]
        public DateTime ReportDate { get; set; } = DateTime.UtcNow; // วัน/เดือน/ปี ที่รายงาน

        [Required]
        public string Detail { get; set; } = string.Empty; 

        public string? Category { get; set; } 

        public Stop6 Stop6 { get; set; } = Stop6.Other; // Stop6 category

        public RiskRank Rank { get; set; } = RiskRank.C;

        public string? Suggestion { get; set; } // ข้อแนะนำในการแก้ไขปัญหา

        public string ResponsiblePerson { get; set; } = string.Empty; 

        public string? ImageBeforeUrl { get; set; } 
        public string? ImageAfterUrl { get; set; } 

        public ReportStatus Status { get; set; } = ReportStatus.NotYetDone;

        public int Progress => Status switch
        {
            ReportStatus.NotYetDone => 0,
            ReportStatus.OnProcess => 50,
            ReportStatus.Done => 100,
            _ => 0
        };

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}