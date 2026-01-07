using SafetyPortal.API.DTOs;

namespace SafetyPortal.API.Services
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<UserDto?> GetUserByIdAsync(int id);
        Task<UserDto> CreateUserAsync(CreateUserDto dto);
        Task<bool> UpdateUserAsync(int id, UpdateUserDto dto);
        Task<bool> DeleteUserAsync(int id);
        Task<bool> ValidateUserCodeAsync(string code, string? excludeUserId = null);
        Task<bool> ValidateUsernameAsync(string username, string? excludeUserId = null);
    }
}

