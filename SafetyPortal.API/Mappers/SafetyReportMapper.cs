using SafetyPortal.API.DTOs;
using SafetyPortal.API.Models;
using SafetyPortal.API.Enums;

namespace SafetyPortal.API.Mappers
{
    public static class SafetyReportMapper
    {
        public static SafetyReports ToEntity(
            CreateReportDto dto, 
            string? imageBeforeUrl)
        {
            return new SafetyReports
            {
                Area = dto.Area,
                ReportDate = dto.ReportDate,
                Detail = dto.Detail,
                Category = dto.Category,
                Stop6 = dto.GetStop6(),
                Rank = dto.GetRank(),
                Suggestion = dto.Suggestion,
                ResponsiblePerson = dto.ResponsiblePerson,
                ImageBeforeUrl = imageBeforeUrl,
                Status = dto.GetStatus(),
                CreatedAt = DateTime.UtcNow
            };
        }

        public static void UpdateEntity(
            SafetyReports entity,
            UpdateReportDto dto,
            string? imageBeforeUrl,
            string? imageAfterUrl)
        {
            if (!string.IsNullOrEmpty(dto.Area))
                entity.Area = dto.Area;

            if (dto.ReportDate.HasValue)
                entity.ReportDate = dto.ReportDate.Value;

            if (!string.IsNullOrEmpty(dto.Detail))
                entity.Detail = dto.Detail;

            if (!string.IsNullOrEmpty(dto.Category))
                entity.Category = dto.Category;

            if (dto.Stop6.HasValue)
                entity.Stop6 = dto.Stop6.Value;

            if (dto.Rank.HasValue)
                entity.Rank = dto.Rank.Value;

            if (dto.Status.HasValue)
                entity.Status = dto.Status.Value;

            if (!string.IsNullOrEmpty(dto.Suggestion))
                entity.Suggestion = dto.Suggestion;

            if (!string.IsNullOrEmpty(dto.ResponsiblePerson))
                entity.ResponsiblePerson = dto.ResponsiblePerson;

            if (!string.IsNullOrEmpty(imageBeforeUrl))
                entity.ImageBeforeUrl = imageBeforeUrl;

            if (!string.IsNullOrEmpty(imageAfterUrl))
            {
                entity.ImageAfterUrl = imageAfterUrl;
                if (entity.Status == ReportStatus.NotYetDone || entity.Status == ReportStatus.OnProcess)
                {
                    entity.Status = ReportStatus.Done;
                }
            }

            entity.UpdatedAt = DateTime.UtcNow;
        }
    }
}
