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
                Detail = dto.Detail,
                Category = dto.Category,
                Rank = dto.Rank,
                ResponsiblePerson = dto.ResponsiblePerson,
                ImageBeforeUrl = imagePath,
                Status = ReportStatus.NotYetDone,
                CreatedAt = DateTime.UtcNow
            };

            _context.SafetyReports.Add(safetyReport);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSafetyReport", new { id = safetyReport.Id }, safetyReport);
        }

        // 4. PUT: อัปเดตงาน (Fixer ส่งรูป After)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSafetyReport(int id, [FromForm] UpdateReportDto dto)
        {
            var safetyReport = await _context.SafetyReports.FindAsync(id);
            if (safetyReport == null) return NotFound();

            if (dto.ImageAfter != null)
            {
                safetyReport.ImageAfterUrl = await SaveImage(dto.ImageAfter);
                safetyReport.Status = ReportStatus.Done; // ถ้ามีรูป After ถือว่าเสร็จ
            }
            else
            {
                safetyReport.Status = dto.Status;
            }

            if (!string.IsNullOrEmpty(dto.Suggestion))
            {
                safetyReport.Suggestion = dto.Suggestion;
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