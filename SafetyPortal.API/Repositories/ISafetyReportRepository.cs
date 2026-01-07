using SafetyPortal.API.Models;

namespace SafetyPortal.API.Repositories
{
    public interface ISafetyReportRepository
    {
        Task<IEnumerable<SafetyReports>> GetAllAsync();
        Task<SafetyReports?> GetByIdAsync(int id);
        Task<SafetyReports> CreateAsync(SafetyReports report);
        Task<SafetyReports> UpdateAsync(SafetyReports report);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}

