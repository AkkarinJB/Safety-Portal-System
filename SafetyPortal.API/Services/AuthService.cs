using Microsoft.IdentityModel.Tokens;
using SafetyPortal.API.DTOs;
using SafetyPortal.API.Enums;
using SafetyPortal.API.Repositories;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SafetyPortal.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _configuration;
        
        private readonly IUserRepository _userRepository;

        // Role-based access codes (fallback สำหรับ SuperAdmin)
        private readonly Dictionary<string, UserRole> _accessCodes = new()
        {
            { "9999", UserRole.SuperAdmin } // SuperAdmin fallback
        };

        public AuthService(IConfiguration configuration, IUserRepository userRepository)
        {
            _configuration = configuration;
            _userRepository = userRepository;
        }

        public async Task<LoginResponseDto?> AuthenticateAsync(string code)
        {
            // ตรวจสอบจาก database ก่อน
            var user = await _userRepository.GetUserByCodeAsync(code);
            
            if (user != null && user.IsActive)
            {
                var token = GenerateJwtToken(user.Username, user.Role);
                return new LoginResponseDto
                {
                    Token = token,
                    Role = user.Role.ToString(),
                    Username = user.Username
                };
            }

            // Fallback สำหรับ SuperAdmin (ถ้ายังไม่มีใน database)
            if (_accessCodes.TryGetValue(code, out var role))
            {
                var username = role == UserRole.SuperAdmin ? "admin" : 
                              role == UserRole.Inspector ? "inspector" : "editor";
                var token = GenerateJwtToken(username, role);
                
                return new LoginResponseDto
                {
                    Token = token,
                    Role = role.ToString(),
                    Username = username
                };
            }

            return null;
        }

        private string GenerateJwtToken(string username, UserRole role)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var keyString = jwtSettings["Key"];

            if (string.IsNullOrEmpty(keyString))
            {
                throw new InvalidOperationException("JwtSettings:Key is missing in appsettings.json");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, role.ToString()),
                new Claim("role", role.ToString()) // Custom claim for easier access
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

