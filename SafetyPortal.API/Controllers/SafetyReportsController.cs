using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafetyPortal.API.Data;
using SafetyPortal.API.Models;
using SafetyPortal.API.DTOs; 
using SafetyPortal.API.Enums;
using System.IO;

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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SafetyReports>>> GetSafetyReports()
        {
            return await _context.SafetyReports.OrderByDescending(r => r.CreatedAt).ToListAsync();
        }

        [HttpGet("images/{*imagePath}")]
        [AllowAnonymous]
        public IActionResult GetImage(string imagePath)
        {
            try
            {
                string webRootPath = _environment.WebRootPath;
                if (string.IsNullOrWhiteSpace(webRootPath))
                {
                    webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                }

                if (!imagePath.StartsWith("uploads/"))
                {
                    imagePath = "uploads/" + imagePath;
                }

                string fullPath = Path.Combine(webRootPath, imagePath);

                if (!fullPath.StartsWith(webRootPath, StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest("Invalid image path");
                }

                if (!System.IO.File.Exists(fullPath))
                {
                    return NotFound("Image not found");
                }

                string contentType = "image/jpeg";
                string extension = Path.GetExtension(fullPath).ToLowerInvariant();
                switch (extension)
                {
                    case ".png":
                        contentType = "image/png";
                        break;
                    case ".gif":
                        contentType = "image/gif";
                        break;
                    case ".jpg":
                    case ".jpeg":
                        contentType = "image/jpeg";
                        break;
                    case ".webp":
                        contentType = "image/webp";
                        break;
                }

                var fileBytes = System.IO.File.ReadAllBytes(fullPath);
                return File(fileBytes, contentType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error loading image: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SafetyReports>> GetSafetyReport(int id)
        {
            var safetyReport = await _context.SafetyReports.FindAsync(id);
            if (safetyReport == null) return NotFound();
            return safetyReport;
        }

        [HttpPost]
        public async Task<ActionResult<SafetyReports>> PostSafetyReport([FromForm] CreateReportDto dto)
        {
            string? imagePath = null;
            if (dto.ImageBefore != null)
            {
                imagePath = await SaveImage(dto.ImageBefore);
            }

            // Parse Status from FormData (FormData sends as string)
            ReportStatus status = ReportStatus.NotYetDone;
            if (Request.Form.ContainsKey("status"))
            {
                string statusString = Request.Form["status"].ToString();
                if (Enum.TryParse<ReportStatus>(statusString, true, out ReportStatus parsedStatus))
                {
                    status = parsedStatus;
                }
            }
            else if (dto.Status.HasValue)
            {
                status = dto.Status.Value;
            }

            // Parse Rank from FormData
            RiskRank rank = RiskRank.C;
            if (Request.Form.ContainsKey("rank"))
            {
                string rankString = Request.Form["rank"].ToString();
                if (Enum.TryParse<RiskRank>(rankString, true, out RiskRank parsedRank))
                {
                    rank = parsedRank;
                }
            }
            else if (dto.Rank.HasValue)
            {
                rank = dto.Rank.Value;
            }

            // Parse Stop6 from FormData
            Stop6 stop6 = Stop6.Other;
            if (Request.Form.ContainsKey("stop6"))
            {
                string stop6String = Request.Form["stop6"].ToString();
                if (int.TryParse(stop6String, out int stop6Int))
                {
                    if (Enum.IsDefined(typeof(Stop6), stop6Int))
                    {
                        stop6 = (Stop6)stop6Int;
                    }
                }
            }
            else if (dto.Stop6.HasValue)
            {
                stop6 = dto.Stop6.Value;
            }

            var safetyReport = new SafetyReports
            {
                Area = dto.Area,
                ReportDate = dto.ReportDate,
                Detail = dto.Detail,
                Category = dto.Category,
                Stop6 = stop6,
                Rank = rank,
                Suggestion = dto.Suggestion,
                ResponsiblePerson = dto.ResponsiblePerson,
                ImageBeforeUrl = imagePath,
                Status = status,
                CreatedAt = DateTime.UtcNow
            };

            _context.SafetyReports.Add(safetyReport);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSafetyReport", new { id = safetyReport.Id }, safetyReport);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutSafetyReport(int id, [FromForm] UpdateReportDto dto)
        {
            var safetyReport = await _context.SafetyReports.FindAsync(id);
            if (safetyReport == null) return NotFound();

            if (!string.IsNullOrEmpty(dto.Area))
                safetyReport.Area = dto.Area;
            
            if (dto.ReportDate.HasValue)
                safetyReport.ReportDate = dto.ReportDate.Value;
            
            if (!string.IsNullOrEmpty(dto.Detail))
                safetyReport.Detail = dto.Detail;
            
            if (!string.IsNullOrEmpty(dto.Category))
                safetyReport.Category = dto.Category;
            
            // Parse Stop6 from string if needed
            if (dto.Stop6.HasValue)
            {
                safetyReport.Stop6 = dto.Stop6.Value;
            }
            else if (Request.Form.ContainsKey("stop6"))
            {
                string stop6String = Request.Form["stop6"].ToString();
                if (int.TryParse(stop6String, out int stop6Int))
                {
                    if (Enum.IsDefined(typeof(Stop6), stop6Int))
                    {
                        safetyReport.Stop6 = (Stop6)stop6Int;
                    }
                }
            }
            
            // Parse Rank from string if needed
            if (dto.Rank.HasValue)
            {
                safetyReport.Rank = dto.Rank.Value;
            }
            else if (Request.Form.ContainsKey("rank"))
            {
                string rankString = Request.Form["rank"].ToString();
                if (Enum.TryParse<RiskRank>(rankString, true, out RiskRank parsedRank))
                {
                    safetyReport.Rank = parsedRank;
                }
            }
            
            if (!string.IsNullOrEmpty(dto.Suggestion))
                safetyReport.Suggestion = dto.Suggestion;
            
            if (!string.IsNullOrEmpty(dto.ResponsiblePerson))
                safetyReport.ResponsiblePerson = dto.ResponsiblePerson;
            
            // Parse Status from string if needed
            if (dto.Status.HasValue)
            {
                safetyReport.Status = dto.Status.Value;
            }
            else if (Request.Form.ContainsKey("status"))
            {
                string statusString = Request.Form["status"].ToString();
                if (Enum.TryParse<ReportStatus>(statusString, true, out ReportStatus parsedStatus))
                {
                    safetyReport.Status = parsedStatus;
                }
            }

            if (dto.ImageBefore != null)
            {
                safetyReport.ImageBeforeUrl = await SaveImage(dto.ImageBefore);
            }

            if (dto.ImageAfter != null)
            {
                safetyReport.ImageAfterUrl = await SaveImage(dto.ImageAfter);
                if (safetyReport.Status == ReportStatus.NotYetDone || safetyReport.Status == ReportStatus.OnProcess)
                {
                    safetyReport.Status = ReportStatus.Done;
                }
            }

            safetyReport.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSafetyReport(int id)
        {
            var safetyReport = await _context.SafetyReports.FindAsync(id);
            if (safetyReport == null) return NotFound();

            _context.SafetyReports.Remove(safetyReport);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        private async Task<string> SaveImage(IFormFile imageFile)
        {
            string webRootPath = _environment.WebRootPath;
            if (string.IsNullOrWhiteSpace(webRootPath))
            {
                webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }

            string uploadsFolder = Path.Combine(webRootPath, "uploads");

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            string uniqueFileName = Guid.NewGuid().ToString() + "_" + imageFile.FileName;
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(fileStream);
            }

            return "uploads/" + uniqueFileName;
        }
    }
}