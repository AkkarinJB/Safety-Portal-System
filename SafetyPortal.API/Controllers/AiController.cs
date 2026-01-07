using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SafetyPortal.API.Attributes;
using SafetyPortal.API.DTOs;
using SafetyPortal.API.Enums;
using SafetyPortal.API.Services;

namespace SafetyPortal.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    [RequireRole(UserRole.Inspector)] // เฉพาะผู้ตรวจสอบเท่านั้นที่สามารถใช้ AI ได้
    public class AiController : ControllerBase
    {
        private readonly GeminiService _geminiService;

        public AiController(GeminiService geminiService)
        {
            _geminiService = geminiService;
        }

        [HttpPost("analyze")]
        public async Task<ActionResult<AiAnalysisResult>> AnalyzeIssue([FromBody] string detail)
        {
            if (string.IsNullOrWhiteSpace(detail))
            {
                return BadRequest("กรุณาระบุรายละเอียดปัญหา");
            }

            try
            {
                var result = await _geminiService.AnalyzeSafetyIssueAsync(detail);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, $"AI service error: {ex.Message}");
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(503, $"AI service unavailable: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"AI Error: {ex.Message}");
            }
        }
    }
}
