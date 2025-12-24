using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SafetyPortal.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public AuthController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost("login")]
        [AllowAnonymous] // อนุญาตให้ทุกคนเข้าถึงได้ (แม้ไม่มี Token)
        public IActionResult Login([FromBody] LoginDto request)
        {
            // --- ส่วนตรวจสอบ User/Pass ---
            // ในระยะนี้ใช้ Hardcode: admin / password123 ไปก่อน
            // ถ้าจะเชื่อม Database ค่อยมาแก้ตรงนี้ครับ
            if (request.Username == "admin" && request.Password == "123")
            {
                var token = GenerateJwtToken(request.Username);
                return Ok(new { token });
            }

            return Unauthorized("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        }

        private string GenerateJwtToken(string username)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var keyString = jwtSettings["Key"];
            
            // ป้องกันกรณีลืมใส่ Key ใน appsettings
            if (string.IsNullOrEmpty(keyString))
            {
                throw new Exception("JwtSettings:Key is missing in appsettings.json");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24), // ใช้ UtcNow เสมอ
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}