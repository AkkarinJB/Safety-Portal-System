using SafetyPortal.API.DTOs;
using SafetyPortal.API.Models;
using SafetyPortal.API.Repositories;

namespace SafetyPortal.API.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllUsersAsync();
            return users.Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Code = u.Code,
                Role = u.Role,
                FullName = u.FullName,
                Email = u.Email,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt
            });
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null) return null;

            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Code = user.Code,
                Role = user.Role,
                FullName = user.FullName,
                Email = user.Email,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };
        }

        public async Task<UserDto> CreateUserAsync(CreateUserDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Code) || dto.Code.Length != 4 || !dto.Code.All(char.IsDigit))
            {
                throw new ArgumentException("รหัสผ่านต้องเป็นตัวเลข 4 หลัก");
            }

            if (await _userRepository.UserExistsAsync(dto.Code, dto.Username))
            {
                throw new InvalidOperationException("รหัสผ่านหรือชื่อผู้ใช้ซ้ำกัน");
            }

            var user = new User
            {
                Username = dto.Username,
                Code = dto.Code,
                Role = dto.Role,
                FullName = dto.FullName,
                Email = dto.Email,
                IsActive = true
            };

            var createdUser = await _userRepository.CreateUserAsync(user);
            return new UserDto
            {
                Id = createdUser.Id,
                Username = createdUser.Username,
                Code = createdUser.Code,
                Role = createdUser.Role,
                FullName = createdUser.FullName,
                Email = createdUser.Email,
                IsActive = createdUser.IsActive,
                CreatedAt = createdUser.CreatedAt,
                UpdatedAt = createdUser.UpdatedAt
            };
        }

        public async Task<bool> UpdateUserAsync(int id, UpdateUserDto dto)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null) return false;

            if (!string.IsNullOrWhiteSpace(dto.Code))
            {
                if (dto.Code.Length != 4 || !dto.Code.All(char.IsDigit))
                {
                    throw new ArgumentException("รหัสผ่านต้องเป็นตัวเลข 4 หลัก");
                }

                var existingUser = await _userRepository.GetUserByCodeAsync(dto.Code);
                if (existingUser != null && existingUser.Id != id)
                {
                    throw new InvalidOperationException("รหัสผ่านซ้ำกัน");
                }
            }

            if (!string.IsNullOrWhiteSpace(dto.Username))
            {
                var existingUser = await _userRepository.GetUserByUsernameAsync(dto.Username);
                if (existingUser != null && existingUser.Id != id)
                {
                    throw new InvalidOperationException("ชื่อผู้ใช้ซ้ำกัน");
                }
            }

            if (!string.IsNullOrWhiteSpace(dto.Username))
                user.Username = dto.Username;
            if (!string.IsNullOrWhiteSpace(dto.Code))
                user.Code = dto.Code;
            if (dto.Role.HasValue)
                user.Role = dto.Role.Value;
            if (dto.FullName != null)
                user.FullName = dto.FullName;
            if (dto.Email != null)
                user.Email = dto.Email;
            if (dto.IsActive.HasValue)
                user.IsActive = dto.IsActive.Value;

            return await _userRepository.UpdateUserAsync(user);
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            return await _userRepository.DeleteUserAsync(id);
        }

        public async Task<bool> ValidateUserCodeAsync(string code, string? excludeUserId = null)
        {
            if (string.IsNullOrWhiteSpace(code) || code.Length != 4 || !code.All(char.IsDigit))
            {
                return false;
            }

            var existingUser = await _userRepository.GetUserByCodeAsync(code);
            if (existingUser == null) return true;

            if (!string.IsNullOrEmpty(excludeUserId) && int.TryParse(excludeUserId, out var excludeId))
            {
                return existingUser.Id == excludeId;
            }

            return false;
        }

        public async Task<bool> ValidateUsernameAsync(string username, string? excludeUserId = null)
        {
            if (string.IsNullOrWhiteSpace(username))
            {
                return false;
            }

            var existingUser = await _userRepository.GetUserByUsernameAsync(username);
            if (existingUser == null) return true;

            if (!string.IsNullOrEmpty(excludeUserId) && int.TryParse(excludeUserId, out var excludeId))
            {
                return existingUser.Id == excludeId;
            }

            return false;
        }
    }
}

