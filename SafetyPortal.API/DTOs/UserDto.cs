using SafetyPortal.API.Enums;

namespace SafetyPortal.API.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateUserDto
    {
        public string Username { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
    }

    public class UpdateUserDto
    {
        public string? Username { get; set; }
        public string? Code { get; set; }
        public UserRole? Role { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public bool? IsActive { get; set; }
    }
}

