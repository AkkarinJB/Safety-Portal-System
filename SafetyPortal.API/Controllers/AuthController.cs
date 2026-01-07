using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SafetyPortal.API.DTOs;
using SafetyPortal.API.Services;

namespace SafetyPortal.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            var result = await _authService.AuthenticateAsync(request.Code);
            
            if (result == null)
            {
                return Unauthorized("รหัสไม่ถูกต้อง");
            }

            return Ok(result);
        }
    }
}