using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SafetyPortal.API.DTOs;
using SafetyPortal.API.Services;

namespace SafetyPortal.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
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
            catch (Exception ex)
            {
                return StatusCode(500, $"AI Error: {ex.Message}");
            }
        }
    }
}