using Microsoft.EntityFrameworkCore;
using SafetyPortal.API.Data;
using SafetyPortal.API.Models;

namespace SafetyPortal.API.Repositories
{
    public class SafetyReportRepository : ISafetyReportRepository
    {
        private readonly AppDbContext _context;

        public SafetyReportRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SafetyReports>> GetAllAsync()
        {
            return await _context.SafetyReports
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<SafetyReports?> GetByIdAsync(int id)
        {
            return await _context.SafetyReports.FindAsync(id);
        }

        public async Task<SafetyReports> CreateAsync(SafetyReports report)
        {
            _context.SafetyReports.Add(report);
            await _context.SaveChangesAsync();
            return report;
        }

        public async Task<SafetyReports> UpdateAsync(SafetyReports report)
        {
            _context.Entry(report).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return report;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var report = await _context.SafetyReports.FindAsync(id);
            if (report == null) return false;

            _context.SafetyReports.Remove(report);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.SafetyReports.AnyAsync(r => r.Id == id);
        }
    }
}

