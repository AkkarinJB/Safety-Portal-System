using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafetyPortal.API.Data;
using SafetyPortal.API.Models;
using SafetyPortal.API.DTOs; 
using SafetyPortal.API.Enums;

namespace SafetyPortal.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SafetyReportsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public SafetyReportsController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // 1. GET: ดึงข้อมูลทั้งหมด
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SafetyReports>>> GetSafetyReports()
        {
            return await _context.SafetyReports.OrderByDescending(r => r.CreatedAt).ToListAsync();
        }

        // 2. GET: ดึงตาม ID
        [HttpGet("{id}")]
        public async Task<ActionResult<SafetyReports>> GetSafetyReport(int id)
        {
            var safetyReport = await _context.SafetyReports.FindAsync(id);
            if (safetyReport == null) return NotFound();
            return safetyReport;
        }

        // 3. POST: สร้างรายการใหม่ (รับ DTO + ไฟล์รูป)
        [HttpPost]
        public async Task<ActionResult<SafetyReports>> PostSafetyReport([FromForm] CreateReportDto dto)
        {
            string? imagePath = null;
            if (dto.ImageBefore != null)
            {
                imagePath = await SaveImage(dto.ImageBefore);
            }

            var safetyReport = new SafetyReports
            {
                Area = dto.Area,
                ReportDate = dto.ReportDate,
                Detail = dto.Detail,
                Category = dto.Category,
                Stop6 = dto.Stop6,
                Rank = dto.Rank,
                Suggestion = dto.Suggestion,
                ResponsiblePerson = dto.ResponsiblePerson,
                ImageBeforeUrl = imagePath,
                Status = dto.Status,
                CreatedAt = DateTime.UtcNow
            };

            _context.SafetyReports.Add(safetyReport);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSafetyReport", new { id = safetyReport.Id }, safetyReport);
        }

        // 4. PUT: อัปเดตงาน
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSafetyReport(int id, [FromForm] UpdateReportDto dto)
        {
            var safetyReport = await _context.SafetyReports.FindAsync(id);
            if (safetyReport == null) return NotFound();

            // อัปเดต fields ที่ส่งมา
            if (!string.IsNullOrEmpty(dto.Area))
                safetyReport.Area = dto.Area;
            
            if (dto.ReportDate.HasValue)
                safetyReport.ReportDate = dto.ReportDate.Value;
            
            if (!string.IsNullOrEmpty(dto.Detail))
                safetyReport.Detail = dto.Detail;
            
            if (!string.IsNullOrEmpty(dto.Category))
                safetyReport.Category = dto.Category;
            
            if (dto.Stop6.HasValue)
                safetyReport.Stop6 = dto.Stop6.Value;
            
            if (dto.Rank.HasValue)
                safetyReport.Rank = dto.Rank.Value;
            
            if (!string.IsNullOrEmpty(dto.Suggestion))
                safetyReport.Suggestion = dto.Suggestion;
            
            if (!string.IsNullOrEmpty(dto.ResponsiblePerson))
                safetyReport.ResponsiblePerson = dto.ResponsiblePerson;
            
            if (dto.Status.HasValue)
                safetyReport.Status = dto.Status.Value;

            // อัปเดตรูปภาพ
            if (dto.ImageBefore != null)
            {
                safetyReport.ImageBeforeUrl = await SaveImage(dto.ImageBefore);
            }

            if (dto.ImageAfter != null)
            {
                safetyReport.ImageAfterUrl = await SaveImage(dto.ImageAfter);
                if (safetyReport.Status == ReportStatus.NotYetDone || safetyReport.Status == ReportStatus.OnProcess)
                {
                    safetyReport.Status = ReportStatus.Done; // ถ้ามีรูป After ถือว่าเสร็จ
                }
            }

            safetyReport.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // 5. DELETE: ลบงาน
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSafetyReport(int id)
        {
            var safetyReport = await _context.SafetyReports.FindAsync(id);
            if (safetyReport == null) return NotFound();

            _context.SafetyReports.Remove(safetyReport);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // --- Helper Function: SaveImage (มีตัวเดียวเท่านั้น) ---
        private async Task<string> SaveImage(IFormFile imageFile)
        {
            // 1. หา path ของ wwwroot ที่ถูกต้อง
            string webRootPath = _environment.WebRootPath;
            if (string.IsNullOrWhiteSpace(webRootPath))
            {
                webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }

            // 2. ระบุโฟลเดอร์ uploads (แค่ชั้นเดียวพอ)
            string uploadsFolder = Path.Combine(webRootPath, "uploads");

            // 3. ถ้าไม่มี ให้สร้าง
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // 4. ตั้งชื่อไฟล์และบันทึก
            string uniqueFileName = Guid.NewGuid().ToString() + "_" + imageFile.FileName;
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(fileStream);
            }

            // 5. Return path
            return "uploads/" + uniqueFileName;
        }
    }
}