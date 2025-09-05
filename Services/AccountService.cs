using Core.Helpers;
using Entities.Models;
using Entities.ViewModels.Accounts;
using Google.Apis.Auth;  
using HireMe.Data.Repository;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Models;
using Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Services
{
    public class AccountService : IAccountService
    {
        private readonly ErrorLoggingService _errorLogger;
        private readonly SymmetricSecurityKey _authSigningKey;
        private readonly JwtSecurityTokenHandler _tokenHandler;

        private readonly UserManager<User> _userManager;
        private readonly IRepository<User> _userRepository;
        private readonly IRepository<AffiliateUser> _affiliateUserRepository;
        private readonly IConfiguration _configuration;

        public AccountService(
            IConfiguration configuration,
            ErrorLoggingService errorLogger,
            UserManager<User> userManager,
            IRepository<User> userRepository,
            IRepository<AffiliateUser> affiliateUserRepository)
        {
            _configuration = configuration;
            _userManager = userManager;
            _errorLogger = errorLogger;
            _userRepository = userRepository;
            _affiliateUserRepository = affiliateUserRepository;

            string secretKey = _configuration["Authentication:SecurityKey"];

            if (string.IsNullOrWhiteSpace(secretKey))
            {
                throw new Exception("JWT secret key is missing in configuration.");
            }

            byte[] keyBytes = Encoding.UTF8.GetBytes(secretKey);
            if (keyBytes.Length < 32)
            {
                throw new Exception("JWT secret key must be at least 32 characters long.");
            }

            _authSigningKey = new SymmetricSecurityKey(keyBytes);
            _tokenHandler = new JwtSecurityTokenHandler();
        }

        public async Task<AuthResponse> LoginWithGoogleAsync(string idToken)
        {
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = new[] { _configuration["Authentication:Google:ClientId"] } // use the ClientId, not ValidAudiences
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

                // Try find user by email
                var user = await _userManager.FindByEmailAsync(payload.Email);
                if (user == null)
                {
                    // Create new user if not found
                    user = new User
                    {
                        Email = payload.Email,
                        UserName = payload.Email.GetUntilOrEmpty("@"),
                        EmailConfirmed = true,
                        FirstName = payload.GivenName,
                        LastName = payload.FamilyName,
                        FullName = $"{payload.GivenName} {payload.FamilyName}",
                        PictureName = payload.Picture, // or whatever your property for picture URL is
                        isExternal = true,
                        SignInSocialEnable = true,
                        Country = !string.IsNullOrEmpty(payload.Locale) ? payload.Locale : "Bulgaria"// or set a default country if not available
                    };

                    var createResult = await _userManager.CreateAsync(user);
                    if (!createResult.Succeeded)
                    {
                        return new AuthResponse
                        {
                            isAuthenticated = false,
                            Message = "Failed to create user from Google login."
                        };
                    }
                } 

                var userRoles = await _userManager.GetRolesAsync(user);

                var authClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                };
                foreach (var userRole in userRoles)
                    authClaims.Add(new Claim(ClaimTypes.Role, userRole));

                var token = GenerateToken(authClaims);

                return new AuthResponse
                {
                    Token = token,
                    isAuthenticated = true,
                    User = user
                };
            }
            catch (Exception ex)
            {
                _errorLogger.LogException(ex, nameof(LoginWithGoogleAsync), nameof(AccountService));
                return new AuthResponse
                {
                    isAuthenticated = false,
                    Message = "Google token validation failed."
                };
            }
        }

        public string GenerateToken(IEnumerable<Claim> claims)
        {
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Issuer = _configuration["Authentication:Schemes:Bearer:ValidIssuer"],
                Audience = _configuration["Authentication:Schemes:Bearer:ValidAudiences"],
                Expires = DateTime.UtcNow.AddDays(Convert.ToInt64(_configuration["Authentication:TokenExpireDays"])),
                SigningCredentials = new SigningCredentials(_authSigningKey, SecurityAlgorithms.HmacSha256),
                Subject = new ClaimsIdentity(claims)
            };

            var token = _tokenHandler.CreateToken(tokenDescriptor);
            return _tokenHandler.WriteToken(token);
        }
        public bool IsTokenValid(string token)
        {
            return !string.IsNullOrEmpty(token);
        }
        public OperationResult ValidateToken(string token)
        {
            if (!IsTokenValid(token))
            {
                return OperationResult.FailureResult("Token is empty or not valid.");
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Authentication:SecurityKey"]);

            try
            {
                var tokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),

                    ValidateIssuer = true,
                    ValidIssuer = _configuration["Authentication:Schemes:Bearer:ValidIssuer"],

                    ValidateAudience = false, // If you want audience validation, set this to true
                    ClockSkew = TimeSpan.Zero // Ensures exact expiration time check
                };

                // Validate the token
                tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var userIdClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == "nameid");

                // Ensure the claim exists before accessing its value
                if (userIdClaim == null)
                {
                    return OperationResult.FailureResult("Token does not contain the required 'nameid' claim.");
                }
                var result = OperationResult.SuccessResult(userIdClaim.Value);
                return result;
            }
            catch (SecurityTokenExpiredException)
            {
                return OperationResult.FailureResult("Token has expired.");
            }
            catch (SecurityTokenException ex)
            {
                return OperationResult.FailureResult($"Token validation failed: {ex.Message}");
            }
            catch (Exception ex)
            {
                return OperationResult.FailureResult($"Unexpected error during token validation: {ex.Message}");
            }
        }



        public async Task<OperationResult> UpdateUser(User user, User newUser)
        {
            try
            {
                if (newUser is null)
                    return OperationResult.FailureResult("New user data is missing.");

                // Update user properties
                if (!string.IsNullOrEmpty(newUser.Email))
                {
                    user.Email = newUser.Email;
                    user.NormalizedEmail = newUser.Email.ToUpperInvariant();
                    user.UserName = newUser.Email.GetUntilOrEmpty("@");
                    user.NormalizedUserName = newUser.Email.GetUntilOrEmpty("@").ToUpperInvariant();
                }

                user.EmailConfirmed = newUser.EmailConfirmed;

                // Save changes
                await _userRepository.SaveChangesAsync();

                return OperationResult.SuccessResult("User updated successfully.");
            }
            catch (Exception ex)
            {
                // Log or handle the exception as needed
                _errorLogger.LogException(ex, nameof(UpdateUser), nameof(AccountService));
                return OperationResult.FailureResult($"Error updating user: {ex.Message}");
            }
        }

        public async Task<OperationResult> CreateAffiliateUser(User user)
        {
            try
            {
                if (user is null)
                    return OperationResult.FailureResult("User data is missing.");

                var affiliateUser = new AffiliateUser();
                affiliateUser.UserId = user.Id;
                affiliateUser.CommissionRate = 10.0; // 10%
                await _affiliateUserRepository.AddAsync(affiliateUser);

                var result = await _affiliateUserRepository.SaveChangesAsync();
                if (result.Success)
                    return OperationResult.SuccessResult(affiliateUser.Id);
                else 
                    return OperationResult.FailureResult($"Error creating affiliate user.");

            }
            catch (Exception ex)
            {
                // Log or handle the exception as needed
                _errorLogger.LogException(ex, nameof(CreateAffiliateUser), nameof(AccountService));
                return OperationResult.FailureResult($"Error creating affiliate user: {ex.Message}");
            }
        }

    }
}
