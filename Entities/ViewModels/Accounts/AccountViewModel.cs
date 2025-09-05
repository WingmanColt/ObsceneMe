using Entities.Models;
using Models;
using System.ComponentModel.DataAnnotations;

namespace Entities.ViewModels.Accounts
{
    public class VerificationResponse
    {
        protected VerificationResponse(bool emailConfirmed, string userId, string token, string messageOutput)
        {
                this.EmailConfirmed = emailConfirmed;
                this.Message = messageOutput;
                this.Token = token;
                this.UserId = userId;
        }
        protected VerificationResponse(string messageOutput)
        {
            this.Message = messageOutput;
        }
        public bool EmailConfirmed { get; set; }
        public string UserId { get; set; }
        public string Token { get; set; }
        public string Message { get; set; }

        public static VerificationResponse SuccessResult(bool emailConfirmed, string userId, string token, string messageOutput)
        {
            return new VerificationResponse(emailConfirmed, userId, token, messageOutput);
        }
        public static VerificationResponse FailureResult(string messageOutput)
        {
            return new VerificationResponse(messageOutput);
        }
    }
    public class AuthResponse
    {
        public bool isAuthenticated { get; set; }
        public bool isEmailConfirmed { get; set; }
        public User User { get; set; }
        public string Token { get; set; }
        public string Message { get; set; }
    }
    public class AccountViewModel 
    {
        [Required]
        [EmailAddress]
        [Display(Name = "Email")]
        public string Email { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "{0} password must be at least {2} and {1} characters.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Confirm Password")]
       // [Compare("Password", ErrorMessage = "Passwords dosen`t match.")]
        public string ConfirmPassword { get; set; }

        [StringLength(20, ErrorMessage = "{0} must be at least {2} and {1} characters", MinimumLength = 3)]
        [Display(Name = "Firstname")]
        public string FirstName { get; set; }

        [StringLength(20, ErrorMessage = "{0} must be at least {2} and {1} characters", MinimumLength = 3)]
        [Display(Name = "Lastname")]
        public string LastName { get; set; }

        [Display(Name = "Remember me")]
        public bool RememberMe { get; set; }

        public string ReturnUrl { get; set; }

        public string ErrorMessage { get; set; }
        //public IList<AuthenticationScheme> ExternalLogins { get; set; }

    }
    public class LoginViewModel
    {
        [Required]
        [EmailAddress]
        [Display(Name = "Email")]
        public string Email { get; set; }

        [Required]
        [StringLength(50, ErrorMessage = "{0} password must be at least {2} and {1} characters.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

    }
    public class VerificationUserViewModel
    {
        public string Email { get; set; }
    }
    public class ResendVerifyViewModel
    {
        public string UserId { get; set; }
        public string OldToken { get; set; }
    }
    public class PasswordVerificationRequest
    {
        public string Email { get; set; }
        public string NewPassword { get; set; }
        public string ConfirmNewPassword { get; set; }
        public string Code { get; set; }
        public string CreatedOn { get; set; }
    }
    public class VerificationRequest
    {
        public string Email { get; set; }
        public string Code { get; set; }
        public string CreatedOn { get; set; }
    }

    public class ValidateVerification
    {
        public string Message { get; set; }
        public Verification Verification { get; set; }
    }

    public class RegisterViewModel
    {
        [Required]
        [EmailAddress]
        [Display(Name = "Email")]
        public string Email { get; set; }

        [Required]
        [StringLength(50, ErrorMessage = "{0} password must be at least {2} and {1} characters.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Confirm Password")]
        // [Compare("Password", ErrorMessage = "Passwords dosen`t match.")]
        public string ConfirmPassword { get; set; }

        [StringLength(50, ErrorMessage = "{0} must be at least {2} and {1} characters", MinimumLength = 3)]
        [Display(Name = "Firstname")]
        public string FirstName{ get; set; }

        [StringLength(50, ErrorMessage = "{0} must be at least {2} and {1} characters", MinimumLength = 3)]
        [Display(Name = "Lastname")]
        public string LastName { get; set; }

        public bool IsAffiliate { get; set; }

    }

    public class PasswordViewModel
    {
        [Required]
        [StringLength(50, ErrorMessage = "{0} password must be at least {2} and {1} characters.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Confirm Password")]
        // [Compare("Password", ErrorMessage = "Passwords dosen`t match.")]
        public string ConfirmPassword { get; set; }

        public string CreatedOn { get; set; }
    }

}