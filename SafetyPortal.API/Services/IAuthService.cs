using SafetyPortal.API.DTOs;

namespace SafetyPortal.API.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> AuthenticateAsync(string code);
    }
}

