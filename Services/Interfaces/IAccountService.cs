using Core.Helpers;
using Entities.ViewModels.Accounts;
using Models;
using System.Security.Claims;

namespace Services.Interfaces
{
    public interface IAccountService
    {
        Task<AuthResponse> LoginWithGoogleAsync(string idToken);
        Task<OperationResult> CreateAffiliateUser(User user);
        Task<OperationResult> UpdateUser(User user, User newUser);
        string GenerateToken(IEnumerable<Claim> claims);
        bool IsTokenValid(string token);
        OperationResult ValidateToken(string token);
    }
}