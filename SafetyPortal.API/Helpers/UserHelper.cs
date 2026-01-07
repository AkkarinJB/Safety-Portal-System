using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using SafetyPortal.API.Enums;

namespace SafetyPortal.API.Helpers
{
    /// <summary>
    /// Helper methods for user and role operations
    /// </summary>
    public static class UserHelper
    {
        /// <summary>
        /// Gets user role from claims
        /// </summary>
        public static UserRole? GetUserRole(ClaimsPrincipal? user)
        {
            if (user == null) return null;

            var roleClaim = user.FindFirst("role") ?? user.FindFirst(ClaimTypes.Role);
            if (roleClaim == null || string.IsNullOrEmpty(roleClaim.Value))
                return null;

            if (Enum.TryParse<UserRole>(roleClaim.Value, true, out var role))
                return role;

            return null;
        }

        /// <summary>
        /// Checks if user has specific role
        /// </summary>
        public static bool HasRole(ClaimsPrincipal? user, UserRole role)
        {
            var userRole = GetUserRole(user);
            return userRole == role;
        }

        /// <summary>
        /// Checks if user has any of the specified roles
        /// </summary>
        public static bool HasAnyRole(ClaimsPrincipal? user, params UserRole[] roles)
        {
            var userRole = GetUserRole(user);
            if (userRole == null) return false;
            return roles.Contains(userRole.Value);
        }

        /// <summary>
        /// Gets username from claims
        /// </summary>
        public static string? GetUsername(ClaimsPrincipal? user)
        {
            return user?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? user?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        }
    }
}

