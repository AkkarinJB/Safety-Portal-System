using System.Linq;
using Microsoft.AspNetCore.Authorization;
using SafetyPortal.API.Enums;

namespace SafetyPortal.API.Attributes
{
    /// <summary>
    /// Authorization attribute to require specific role(s)
    /// </summary>
    public class RequireRoleAttribute : AuthorizeAttribute
    {
        public RequireRoleAttribute(params UserRole[] roles)
        {
            var roleNames = roles.Select(r => r.ToString()).ToArray();
            Roles = string.Join(",", roleNames);
        }
    }
}

