using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SafetyPortal.API.DTOs;
using SafetyPortal.API.Enums;
using SafetyPortal.API.Helpers;
using SafetyPortal.API.Models;
using SafetyPortal.API.Services;
using SafetyPortal.API.Mappers;

namespace SafetyPortal.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SafetyReportsController : ControllerBase
    {
        private readonly ISafetyReportService _reportService;

        public SafetyReportsController(ISafetyReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SafetyReports>>> GetSafetyReports()
        {
            var reports = await _reportService.GetAllReportsAsync();
            return Ok(reports);
        }

        [HttpGet("images/{*imagePath}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetImage(string imagePath)
        {
            try
            {
                var result = await _reportService.GetImageAsync(imagePath);
                if (result == null)
                {
                    return NotFound("Image not found");
                }

                return File(result.Value.fileBytes, result.Value.contentType);
            }
            catch (ArgumentException ex)
            {
                return BadRequest($"Invalid image path: {ex.Message}");
            }
            catch (FileNotFoundException)
            {
                return NotFound("Image file not found");
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, $"Access denied: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error loading image: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SafetyReports>> GetSafetyReport(int id)
        {
            var report = await _reportService.GetReportByIdAsync(id);
            if (report == null) return NotFound();
            return Ok(report);
        }

        [HttpPost]
        [RequireRole(UserRole.Inspector)] // เฉพาะผู้ตรวจสอบเท่านั้นที่สามารถสร้างรายงานใหม่ได้
        public async Task<ActionResult<SafetyReports>> PostSafetyReport([FromForm] CreateReportDto dto)
        {
            try
            {
                if (Request.Form.ContainsKey("status"))
                    dto.StatusString = Request.Form["status"].ToString();
                if (Request.Form.ContainsKey("rank"))
                    dto.RankString = Request.Form["rank"].ToString();
                if (Request.Form.ContainsKey("stop6"))
                    dto.Stop6String = Request.Form["stop6"].ToString();

                var report = await _reportService.CreateReportAsync(dto, dto.ImageBefore);
                return CreatedAtAction(nameof(GetSafetyReport), new { id = report.Id }, report);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, $"Invalid operation: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating report: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutSafetyReport(int id, [FromForm] UpdateReportDto dto)
        {
            try
            {
                var userRole = UserHelper.GetUserRole(User);
                var report = await _reportService.GetReportByIdAsync(id);
                
                if (report == null) return NotFound();

                // ผู้แก้ไขไม่สามารถแก้ไขรายละเอียดปัญหาและข้อแนะนำได้
                if (userRole == UserRole.Editor)
                {
                    // อนุญาตให้แก้ไขเฉพาะ: status, imageAfter, responsiblePerson
                    // ไม่ให้แก้ไข: area, detail, category, stop6, rank, suggestion, imageBefore
                    dto.Area = null;
                    dto.Detail = null;
                    dto.Category = null;
                    dto.Stop6 = null;
                    dto.Rank = null;
                    dto.Suggestion = null;
                    dto.ImageBefore = null;
                }

                if (Request.Form.ContainsKey("status") && Enum.TryParse<Enums.ReportStatus>(Request.Form["status"].ToString(), true, out var status))
                    dto.Status = status;
                if (Request.Form.ContainsKey("rank") && Enum.TryParse<Enums.RiskRank>(Request.Form["rank"].ToString(), true, out var rank))
                    dto.Rank = rank;
                if (Request.Form.ContainsKey("stop6") && int.TryParse(Request.Form["stop6"].ToString(), out var stop6Int) && Enum.IsDefined(typeof(Enums.Stop6), stop6Int))
                    dto.Stop6 = (Enums.Stop6)stop6Int;

                var success = await _reportService.UpdateReportAsync(id, dto, dto.ImageBefore, dto.ImageAfter);
                if (!success) return NotFound();

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, $"Invalid operation: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating report: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [RequireRole(UserRole.Inspector)] // เฉพาะผู้ตรวจสอบเท่านั้นที่สามารถลบรายงานได้
        public async Task<IActionResult> DeleteSafetyReport(int id)
        {
            var success = await _reportService.DeleteReportAsync(id);
            if (!success) return NotFound();

            return NoContent();
        }
    }
}