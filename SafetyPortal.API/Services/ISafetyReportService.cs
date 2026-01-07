using SafetyPortal.API.DTOs;
using SafetyPortal.API.Models;

namespace SafetyPortal.API.Services
{
    public interface ISafetyReportService
    {
        Task<IEnumerable<SafetyReports>> GetAllReportsAsync();
        Task<SafetyReports?> GetReportByIdAsync(int id);
        Task<SafetyReports> CreateReportAsync(CreateReportDto dto, IFormFile? imageBefore);
        Task<bool> UpdateReportAsync(int id, UpdateReportDto dto, IFormFile? imageBefore, IFormFile? imageAfter);
        Task<bool> DeleteReportAsync(int id);
        Task<(byte[] fileBytes, string contentType)?> GetImageAsync(string imagePath);
    }
}

