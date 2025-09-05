using Core.Helpers;
using Entities.EmailTemplateModels;
using Entities.Enums;
using Entities.Models;
using Entities.ViewModels.Accounts;
using Microsoft.Extensions.Configuration;
using Services.Dapper;
using Services.Interfaces;

namespace Services
{
    public class spVerification : MainService, IspVerification
    {
        private string StoreName = "spVerification";
        public spVerification(IConfiguration config, ErrorLoggingService errorLogger) : base(config, errorLogger) { }

        public async Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams)
        {
            return await CRUD<T>(StoreName, parameters, action, AutoFindParams);
        }

        public async Task<IAsyncEnumerable<T>> GetAll<T>()
        {
            return await GetAll<T>(StoreName, new { StatementType = "GetAll" });
        }

        public async Task<T> GetByCodeAsync<T>(string code)
        {
            if (String.IsNullOrEmpty(code))
                return default;

            return await GetByAsync<T>(StoreName, new { Code = code, StatementType = "GetByCode" });
        }

        public async Task<int> GetCountByEmailAsync(string email)
        {
            if (String.IsNullOrEmpty(email))
                return default;

            return await GetCountBy(StoreName, new { Email = email, StatementType = "GetCountByEmail" });
        }

        public async Task<T> GetByEmailAndCodeAsync<T>(Verification model)
        {
            if (model is null)
                return default;

            return await GetByAsync<T>(StoreName, new { Email = model.Email, Code = model.Code, StatementType = "GetByEmailAndCode" });         
        }

       /* public async Task<ValidateVerification> ValidateVerificationCodeAsync(int timeBuffer, VerificationRequest req)
        {
            if (req == null || timeBuffer <= 0)
                return new ValidateVerification { Message = "Invalid or expired verification code." };

            var verificationModel = new Verification()
            {
                Email = req.Email,
                Code = req.Code,
                CreatedOn = req.CreatedOn
            };

            var verificationEntity = await GetByEmailAndCodeAsync<Verification>(verificationModel);
            if (verificationEntity == null)
                return new ValidateVerification { Message = "Invalid or expired verification code." };

            // Parse strings into DateTime objects with specified time zone
            DateTime date1Utc = DateTime.ParseExact(req.CreatedOn, "dd/MM/yyyy HH:mm", null, System.Globalization.DateTimeStyles.AssumeUniversal).ToUniversalTime();
            DateTime date2Utc = DateTime.ParseExact(verificationEntity.CreatedOn, "dd/MM/yyyy HH:mm", null, System.Globalization.DateTimeStyles.AssumeUniversal).ToUniversalTime();

            // Compare dates with a buffer of 5 minutes
            TimeSpan buffer = TimeSpan.FromMinutes(timeBuffer);
            bool areWithinBuffer = Math.Abs((date1Utc - date2Utc).TotalMinutes) <= buffer.TotalMinutes;

            if (!areWithinBuffer)
                return new ValidateVerification { Message = "Sorry, your verification code has expired. Try to resend a new code." };
           
            // Verification code is valid
            return new ValidateVerification { Verification = verificationEntity };
        }*/



    }

}
