using Microsoft.EntityFrameworkCore;
using SafetyPortal.API.Models;
namespace SafetyPortal.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<SafetyReports> SafetyReports { get; set; }
    }
}