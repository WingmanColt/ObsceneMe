using Core.Helpers;
using Entities.EmailTemplateModels;
using Entities.Enums;
using Entities.Input;
using Entities.Models;
using Entities.ViewModels.Accounts;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Models;
using Services;
using Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace eCommerce.Controllers
{
    [ApiController]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {

        private readonly IConfiguration _config;
        private readonly InMemoryVerificationService _inMemoryVerificationService;
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        private readonly IAccountService _accountService;
        private readonly ISendInBlueService _sendInBlueService;
        private readonly IspVerification _verificationService;

        private readonly string _webName;
        private readonly string _webUrl;
        private readonly string salesEmail;

        private readonly string facebook;
        private readonly string instagram;
        private readonly string tiktok;
        private readonly string banner;
        private readonly string verificationHtml;

        public AccountController(
            InMemoryVerificationService inMemoryVerificationService,
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            RoleManager<IdentityRole> roleManager,
            IAccountService accountService,
            IspVerification verificationService,
            ISendInBlueService sendInBlueService,
            IConfiguration config)
        {
            _inMemoryVerificationService = inMemoryVerificationService;
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;

            _accountService = accountService;
            _verificationService = verificationService;
            _sendInBlueService = sendInBlueService;

            _config = config;   
            _webUrl = config.GetValue<string>("WebUrls:userUrl");
            _webName = config.GetValue<string>("SendInBlue-Live:webName");

            salesEmail = config.GetSection("SendInBlue-Live:salesEmail").Value;
            facebook = config.GetSection("EmailMarketing:Facebook").Value;
            instagram = config.GetSection("EmailMarketing:Instagram").Value;
            tiktok = config.GetSection("EmailMarketing:Tiktok").Value;
            banner = config.GetSection("EmailMarketing:EmailBannerImage").Value;

            verificationHtml = config.GetSection("EmailMarketing:BasePath").Value + config.GetSection("EmailMarketing:VerificationHtml").Value;

        }



        [HttpGet("get-current-user")]
        public async Task<AuthResponse> GetCurrentUser([FromHeader] string Authentication)
        {
            // Validate the token and extract user ID
            var tokenValidationResult = _accountService.ValidateToken(Authentication);
            if (!tokenValidationResult.Success)
            {
                return new AuthResponse { isAuthenticated = false, Message = tokenValidationResult.FailureMessage };
            }

            // Retrieve the user from the database using the user ID
            var user = await _userManager.FindByIdAsync(tokenValidationResult.SuccessMessage);
            if (user is null)
            {
                return new AuthResponse { isAuthenticated = false, Message = "User not found." };
            }

            // Return the user's authentication status and details
            return new AuthResponse
            {
                isAuthenticated = true,
                isEmailConfirmed = user.EmailConfirmed,
                User = user
            };
        }

        [HttpPost]
        [Route("check-user-email")]
        public async Task<AuthResponse> IsEmailExists([FromBody] VerificationUserViewModel newUser)
        {
            if (newUser is null)
                return new AuthResponse { Message = "Requested email does not exists" };


            var isEmailExists = await _userManager.FindByEmailAsync(newUser.Email);

            if (isEmailExists is null)
                return new AuthResponse { Message = "Requested email does not exists" };

            return new AuthResponse { User = isEmailExists };
        }

        [HttpPost]
        [Route("update-user-email")]
        public async Task<OperationResult> UpdateEmail([FromHeader] string Authentication, [FromBody] VerificationUserViewModel newUser)
        {
            // Validate the token and extract user ID
            var tokenValidationResult = _accountService.ValidateToken(Authentication);
            if (!tokenValidationResult.Success)
            {
                return tokenValidationResult;
            }

            // Retrieve the user from the database using the user ID
            var user = await _userManager.FindByIdAsync(tokenValidationResult.SuccessMessage);
            if (user is null)
            {
                return OperationResult.FailureResult("The user does not exist in our database.");
            }

            if (user.Email == newUser.Email)
                return OperationResult.SuccessResult("Email updated successfully.");
            else
            {
                var isEmailExists = await _userManager.FindByEmailAsync(newUser.Email);

                if (isEmailExists is not null)
                    return OperationResult.FailureResult("Requested email already exists.");
            }

            user.Email = newUser.Email;
            user.NormalizedEmail = newUser.Email.ToUpperInvariant();
            user.UserName = newUser.Email.GetUntilOrEmpty("@");
            user.NormalizedUserName = newUser.Email.GetUntilOrEmpty("@").ToUpperInvariant();

            var updateResult = await _userManager.UpdateAsync(user);

            if(updateResult.Succeeded)
                return OperationResult.SuccessResult("Email updated successfully.");

            return OperationResult.FailureResult("Failed to update email.");
        }

        [HttpPost]
        [Route("update-user")]
        public async Task<OperationResult> UpdateUser([FromHeader] string Authentication, [FromBody] User newUser)
        {
            // Validate the token and extract user ID
            var tokenValidationResult = _accountService.ValidateToken(Authentication);
            if (!tokenValidationResult.Success)
            {
                return tokenValidationResult;
            }

            // Retrieve the user from the database using the user ID
            var user = await _userManager.FindByIdAsync(tokenValidationResult.SuccessMessage);
            if (user is null)
            {
                return OperationResult.FailureResult("The user does not exist in our database.");
            }

            // If email is different, check if new email already exists
            if (!string.Equals(user.Email, newUser.Email, StringComparison.OrdinalIgnoreCase))
            {
                var existingUserWithEmail = await _userManager.FindByEmailAsync(newUser.Email);
                if (existingUserWithEmail != null && existingUserWithEmail.Id != user.Id)
                {
                    return OperationResult.FailureResult("Requested email already exists.");
                }
            }

            // Update user properties and save changes
            var updateSuccess = await UpdateUserEmail(user, newUser);
            if (!updateSuccess)
            {
                return OperationResult.FailureResult("Failed to update user details.");
            }

            // Since UpdateUserEmail already calls _userManager.UpdateAsync(user),
            // no need to call it again here.

            return OperationResult.SuccessResult("User updated successfully.");
        }

        // Helper method, ensure it returns success/failure properly
        private async Task<bool> UpdateUserEmail(User user, User newUser)
        {
            user.Email = newUser.Email;
            user.NormalizedEmail = newUser.Email.ToUpperInvariant();

            var userNamePart = newUser.Email.GetUntilOrEmpty("@");
            user.UserName = userNamePart;
            user.NormalizedUserName = userNamePart.ToUpperInvariant();

            user.PhoneNumber = newUser.PhoneNumber;
            user.Address = newUser.Address;
            user.City = newUser.City;
            user.Country = newUser.Country;
            user.State = newUser.State;
            user.PostalCode = newUser.PostalCode;

            user.FullName = newUser.FullName;
            user.FirstName = newUser.FullName.GetUntilOrEmpty(" ");
            user.LastName = newUser.FullName.LastWord();

            var updateResult = await _userManager.UpdateAsync(user);

            return updateResult.Succeeded;
        }



        [HttpPost]
        [Route("set-user-affiliate")]
        public async Task<OperationResult> SetUserAffiliate([FromHeader] string Authentication)
        {
            // Validate the token and extract user ID
            var tokenValidationResult = _accountService.ValidateToken(Authentication);
            if (!tokenValidationResult.Success)
            {
                return tokenValidationResult;
            }

            // Retrieve the user from the database using the user ID
            var user = await _userManager.FindByIdAsync(tokenValidationResult.SuccessMessage);
            if (user is null)     
                return OperationResult.FailureResult("The user does not exist in our database.");
            
            if (!user.IsAffiliate) 
            {
                var createAffiliateUserResult = await _accountService.CreateAffiliateUser(user);
                if(!createAffiliateUserResult.Success)
                    return OperationResult.FailureResult("Affiliate User was not created.");

                user.IsAffiliate = true;
                user.AffiliateUserId = createAffiliateUserResult.Id;

                var updateResult = await _userManager.UpdateAsync(user);

                if (!updateResult.Succeeded)
                    return OperationResult.FailureResult("Affiliate User was not created.");

            }
            return OperationResult.SuccessResult("Affiliate User was created successfully.");
        }

        [HttpPost]
        [Route("change-password")]
        public async Task<OperationResult> ChangePassword([FromHeader] string Authentication, [FromBody] PasswordViewModel req)
        {
            if (req is null)
                return OperationResult.FailureResult("Invalid request, please clear your browser cookies and try again.");
            
            // Validate the token and extract user ID
            var tokenValidationResult = _accountService.ValidateToken(Authentication);
            if (!tokenValidationResult.Success)
            {
                return tokenValidationResult;
            }

            // Retrieve the user from the database using the user ID
            var user = await _userManager.FindByIdAsync(tokenValidationResult.SuccessMessage);
            if (user is null)
            {
                return OperationResult.FailureResult("The user does not exist in our database.");
            }

            if (!req.Password.Equals(req.ConfirmPassword))
                return OperationResult.FailureResult("The passwords you entered do not match.");

            if (!DateHelper.IsWithinMinutesInterval(req.CreatedOn, "dd/MM/yyyy HH:mm", 1))
                return OperationResult.FailureResult("Password changing must be within 1 minute.");


            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, req.ConfirmPassword);

            if (result.Succeeded)
                return OperationResult.SuccessResult("Password is changed successfully.");

            return OperationResult.FailureResult("Invalid request, please clear your browser cookies and try again.");
        }

        [HttpPost]
        [Route("register")]
        [AllowAnonymous]
        public async Task<VerificationResponse> Register(RegisterViewModel model, string role)
        {
            var userExists = await _userManager.FindByEmailAsync(model.Email);
            if (userExists != null)
                return VerificationResponse.FailureResult("User already exists.");

            int? affiliateUserId = null;
            if (model.IsAffiliate)
            {
                var createAffiliateUserResult = await _accountService.CreateAffiliateUser(userExists);

                if (createAffiliateUserResult.Success)
                    affiliateUserId = int.Parse(createAffiliateUserResult.SuccessMessage);
            }


            User user = new User()
            {
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Email.GetUntilOrEmpty("@"),
                FirstName = model.FirstName,
                LastName = model.LastName,
                FullName = model.FirstName + ' ' + model.LastName,
                EmailConfirmed = false,
                IsAffiliate = model.IsAffiliate,
                AffiliateUserId = affiliateUserId
            };
            var createUserResult = await _userManager.CreateAsync(user, model.Password);
            if (!createUserResult.Succeeded)
                return VerificationResponse.FailureResult("Please check user details and try again.");

            await AddUserToRole(user, role).ConfigureAwait(false);

            string verificationCodes = NumHelper.GenerateUniqueNumbersAsString(0, 9, 7);
            _inMemoryVerificationService.StoreVerificationCode(user.Email, verificationCodes);

            var Model = new VerificationModel()
            {
                HtmlContentPath = verificationHtml,
                Code = verificationCodes,
                WebName = _webName,
                WebUrl = _webUrl,
                OurEmail = salesEmail,
                Facebook = facebook,
                Instagram = instagram,
                Tiktok = tiktok,
                Banner = banner
            };

            var emailSentResult = await _sendInBlueService.SendVerificationEmail(Model, user.Email);
            if (!emailSentResult.Success)
                return VerificationResponse.FailureResult("Error occurred on Email sending, try again later!");

            return VerificationResponse.SuccessResult(false, user.Id, verificationCodes, "User is created successfully.");
        }

        [HttpPost]
        [Route("login")]
        [AllowAnonymous]
        public async Task<AuthResponse> Login(LoginViewModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return new AuthResponse { isAuthenticated = false, Message = "The user does not exist in our database" };

            if (!await _userManager.CheckPasswordAsync(user, model.Password))
                return new AuthResponse { isAuthenticated = false, Message = "Invalid username or password" };

            var userRoles = await _userManager.GetRolesAsync(user);
            var authClaims = new List<Claim>
            {
                new (ClaimTypes.NameIdentifier, user.Id),
                new (JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };
            foreach (var userRole in userRoles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, userRole));
            }
            string token = _accountService.GenerateToken(authClaims);

            // Return the authentication status along with the token
            return new AuthResponse { Token = token, isAuthenticated = true, User = user };
        }

        [HttpPost]
        [Route("login2")]
        [AllowAnonymous]
        public async Task<IActionResult> LoginWithGoogle(GoogleAuthDto request)
        {
            var response = await _accountService.LoginWithGoogleAsync(request.IdToken);
            if (!response.isAuthenticated)
                return Unauthorized(new { message = response.Message });

            return Ok(response);
        }
      
        [HttpPost("logout")]
        public async Task<OperationResult> Logout([FromHeader] string Authentication)
        {
            // Validate the token and extract user ID
            var tokenValidationResult = _accountService.ValidateToken(Authentication);
            if (!tokenValidationResult.Success)
            {
                return tokenValidationResult;
            }

            // Retrieve the user from the database using the user ID
            var user = await _userManager.FindByIdAsync(tokenValidationResult.SuccessMessage);
            if (user is null)
            {
                return OperationResult.FailureResult("The user does not exist in our database.");
            }

            if (_signInManager.IsSignedIn(User))
            {
                await _signInManager.SignOutAsync();
                HttpContext.Response.Cookies.Delete("Authentication");
                HttpContext.Response.Cookies.Delete(".AspNetCore.Cookies");
            }
            return OperationResult.SuccessResult();
        }

        [HttpPost]
        [Route("confirm-user")]
        public async Task<OperationResult> Confirmation([FromHeader] string Authentication, [FromBody] VerificationRequest req)
        {
            // Validate the token and extract user ID
            var tokenValidationResult = _accountService.ValidateToken(Authentication);
            if (!tokenValidationResult.Success)      
                return tokenValidationResult;
            

            // Retrieve the user from the database using the user ID
            var user = await _userManager.FindByIdAsync(tokenValidationResult.SuccessMessage);
            if (user is null)
                return OperationResult.FailureResult("The user does not exist in our database.");
            

            var validationResult = _inMemoryVerificationService.ValidateVerificationCodeAsync(2, req);
            if (!validationResult)
                return OperationResult.FailureResult("Verification Code is expired or invalid!");

            user.EmailConfirmed = true;

            var updateResult = await _userManager.UpdateAsync(user);

            if (!updateResult.Succeeded)
                return OperationResult.FailureResult("Failed to confirm email address.");

            return OperationResult.SuccessResult("Email address confirmed successfully.");
        }


        /*[HttpPost("login-with-google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleAuthDto model)
        {
            GoogleJsonWebSignature.Payload payload;
            try
            {
                payload = await GoogleJsonWebSignature.ValidateAsync(model.IdToken);
            }
            catch
            {
                return Unauthorized("Invalid Google token");
            }

            var email = payload.Email;

            // Optional: Create or find user in your DB
            // var user = _userService.GetOrCreateUser(email);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Authentication:SecurityKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["uthentication:Schemes:Bearer:ValidIssue"],
                audience: _config["Authentication:Schemes:Bearer:ValidAudiences:0"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(int.Parse(_config["Authentication:TokenExpireDays"] ?? "30")),
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new AuthResponse
            {
                isAuthenticated = true,
                Token = jwt,
                User = new User { Email = payload.Email }
            });
        }*/
        private async Task AddUserToRole(User user, string role)
        {
            if (String.IsNullOrEmpty(role))
                return;

            if (!await _roleManager.RoleExistsAsync(role))
                await _roleManager.CreateAsync(new IdentityRole(role));

            if (await _roleManager.RoleExistsAsync(role))
                await _userManager.AddToRoleAsync(user, role);
        }


        /*  private async Task CreateRole()
          {
              await _roleManager.CreateAsync(new IdentityRole("Admin"));
              await _roleManager.CreateAsync(new IdentityRole("Moderator"));
              await _roleManager.CreateAsync(new IdentityRole("Vendor"));
              await _roleManager.CreateAsync(new IdentityRole("User"));
          }*/


    }
}
