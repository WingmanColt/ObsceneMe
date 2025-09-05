using Core.Helpers;
using Entities.EmailTemplateModels;
using Entities.ViewModels.Accounts;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Models;
using Services;
using Services.Interfaces;

namespace eCommerce.Controllers
{
    [ApiController]
    [Produces("application/json")]
    [Route("api/[controller]")]

    public class VerificationController : Controller
    {
        private readonly UserManager<User> _userManager;
        private readonly InMemoryVerificationService _inMemoryVerificationService;

        private readonly IAccountService _accountService;
        private readonly ISendInBlueService _sendInBlueService;

        private readonly string _webName;
        private readonly string _webUrl;
        private readonly string salesEmail;

        private readonly string Facebook;
        private readonly string Instagram;
        private readonly string Tiktok;
        private readonly string Banner;
        private readonly string verificationHtml;

        public VerificationController(
              InMemoryVerificationService inMemoryVerificationService,
              UserManager<User> userManager,
              IAccountService accountService,
              ISendInBlueService sendInBlueService,
              IConfiguration config)
        {
            _inMemoryVerificationService = inMemoryVerificationService;
            _userManager = userManager;

            _accountService = accountService;
            _sendInBlueService = sendInBlueService;

            _webUrl = config.GetValue<string>("WebUrls:userUrl");
            _webName = config.GetValue<string>("SendInBlue-Live:webName");

            salesEmail = config.GetSection("SendInBlue-Live:salesEmail").Value;
            Facebook = config.GetSection("EmailMarketing:Facebook").Value;
            Instagram = config.GetSection("EmailMarketing:Instagram").Value;
            Tiktok = config.GetSection("EmailMarketing:Tiktok").Value;
            Banner = config.GetSection("EmailMarketing:EmailBannerImage").Value;
            verificationHtml = config.GetSection("EmailMarketing:BasePath").Value + config.GetSection("EmailMarketing:VerificationHtml").Value;
        }

        [HttpPost]
        [Route("password-change-verification")]
        public async Task<OperationResult> PasswordChangeVerification([FromBody] VerificationUserViewModel newUser)
        {
            if (newUser is null)
                return OperationResult.FailureResult("Invalid request, please clear your browser cookies and try again.");

            var user = await _userManager.FindByEmailAsync(newUser?.Email);

            if (user is null)
                return OperationResult.FailureResult("User hasn't exists, try again with another email.");

            string verificationCodes = NumHelper.GenerateUniqueNumbersAsString(0, 9, 7);
            _inMemoryVerificationService.StoreVerificationCode(user.Email, verificationCodes);

            var Model = new VerificationModel()
            {
                HtmlContentPath = verificationHtml,
                Code = verificationCodes,
                WebName = _webName,
                WebUrl = _webUrl,
                OurEmail = salesEmail,
                Facebook = Facebook,
                Instagram = Instagram,
                Tiktok = Tiktok,
                Banner = Banner
            };

            var emailSentResult = await _sendInBlueService.SendVerificationEmail(Model, user.Email);
            if (!emailSentResult.Success)
                return OperationResult.FailureResult("Error occurred on Email sending, try again later!");

            return OperationResult.SuccessResult("Verification resend.");
        }


        [HttpPost]
        [Route("confirm-password-change-verification")]
        public async Task<OperationResult> ConfirmPasswordChangeVerification([FromBody] PasswordVerificationRequest req)
        {
            if (req is null)
                return OperationResult.FailureResult("Invalid request, please clear your browser cookies and try again.");

            if (!req.NewPassword.Equals(req.ConfirmNewPassword))
                return OperationResult.FailureResult("The passwords you entered do not match.");

            var verificationModel = new VerificationRequest()
            {
                Email = req.Email,
                Code = req.Code,
                CreatedOn = req.CreatedOn
            };

            var validationResult = _inMemoryVerificationService.ValidateVerificationCodeAsync(15, verificationModel);
            if (!validationResult)
                return OperationResult.FailureResult("Verification Code is expired or invalid!");

            var user = await _userManager.FindByEmailAsync(req.Email);
            if (user is null)
                return OperationResult.FailureResult("User not found, check your email address again.");

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, req.NewPassword);

            if (result.Succeeded)
                return OperationResult.SuccessResult("Email is validated.");

            return OperationResult.FailureResult("Invalid request, please clear your browser cookies and try again.");
        }



        // should handle user and old token but it handle user only right now !
        [HttpGet]
        [Route("resend-verification")]
        public async Task<VerificationResponse> ResendVerification([FromHeader] string Authentication)
        {
            // Validate the token and extract user ID
            var tokenValidationResult = _accountService.ValidateToken(Authentication);
            if (!tokenValidationResult.Success)
                return VerificationResponse.FailureResult("Please login again and try verification."); 
            

            // Retrieve the user from the database using the user ID
            var user = await _userManager.FindByIdAsync(tokenValidationResult.SuccessMessage);
            if (user is null)
                return VerificationResponse.FailureResult("The user does not exist in our database, try again with another email.");
            

            string verificationCodes = NumHelper.GenerateUniqueNumbersAsString(0, 9, 7);
            _inMemoryVerificationService.StoreVerificationCode(user.Email, verificationCodes);

            var Model = new VerificationModel()
            {
                HtmlContentPath = verificationHtml,
                Code = verificationCodes,
                WebName = _webName,
                WebUrl = _webUrl,
                OurEmail = salesEmail,
                Facebook = Facebook,
                Instagram = Instagram,
                Tiktok = Tiktok,
                Banner = Banner
            };

            var emailSentResult = await _sendInBlueService.SendVerificationEmail(Model, user.Email);
            if(!emailSentResult.Success)
            return VerificationResponse.FailureResult("Error occurred on Email sending, try again later!");

            return VerificationResponse.SuccessResult(false, user.Id, verificationCodes, "Verification resend.");
        }
    }
}
