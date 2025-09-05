using Core.Helpers;
using Entities.Enums;
using Entities.Models;
using Entities.ViewModels.Affiliate;
using HireMe.Data.Repository;
using Microsoft.EntityFrameworkCore;
using Services.Interfaces;

namespace Services
{
    public class AffiliateService : IAffiliateService
    {
        private readonly IRepository<AffiliateUser> _affiliateUserRepo;
        private readonly IRepository<AffiliatedOrder> _affiliatedOrderRepo;
        private readonly ErrorLoggingService _errorLogger;

        public AffiliateService(
            ErrorLoggingService errorLogger,
            IRepository<AffiliateUser> affiliateUserRepo,
            IRepository<AffiliatedOrder> affiliatedOrderRepo)
        {
            _affiliateUserRepo = affiliateUserRepo;
            _errorLogger = errorLogger;
            _affiliatedOrderRepo = affiliatedOrderRepo;
        }
        public async Task<List<AffiliateUser>> GetAffiliateUsersAsync()
        {
            return await _affiliateUserRepo.GetAll().ToListAsync();
        }
        public async Task<AffiliateUser?> GetAffiliateUserByUserIdAsync(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                return null;

            return await _affiliateUserRepo.FirstOrDefaultAsync(x => x.UserId == userId);
        }
        public async Task<OperationResult> CreateAffiliatedOrderAsync(string referedByCode, OrderInput order)
        {
            if (string.IsNullOrEmpty(referedByCode))
                return null;

            var user = await _affiliateUserRepo.FirstOrDefaultAsync(x =>
                x.ReferralCode == referedByCode /*&& x.VisitorID != order.VisitorID*/);

            if (user == null)
                return OperationResult.FailureResult("Affiliate user not found, or affiliate abuse is detected.");

            var aOrder = new AffiliatedOrder()
            {
                AffiliateUserId = user.UserId,
                OrderCode = order.Code,
                Status = CommissionStatus.Pending,
                ReferedByCode = referedByCode,
                VisitorID = order.VisitorID,
                CreatedOn = DateTime.Now.ToString("dd MMMM yyyy HH:mm")
            };
            await _affiliatedOrderRepo.AddAsync(aOrder);
            return await AddPendingCashAsync(user.UserId, order.TotalCost);
         }
        public async Task<OperationResult> AddPendingCashAsync(string userId, double amount)
        {
            var user = await _affiliateUserRepo.FirstOrDefaultAsync(x => x.UserId == userId);
            if (user == null)
                return OperationResult.FailureResult("Affiliate user not found.");

            user.PendingCash += Math.Round(amount * (user.CommissionRate / 100.0), 1);

            return await SaveAsync(user, "AddPendingCash");
        }
        public async Task<OperationResult> TransferToApprovedCashAsync(string userId, double amount)
        {
            var user = await _affiliateUserRepo.FirstOrDefaultAsync(x => x.UserId == userId);
            if (user == null)
                return OperationResult.FailureResult("Affiliate user not found.");

            if (user.PendingCash < amount)
                return OperationResult.FailureResult("Not enough pending cash to transfer.");

            user.PendingCash -= amount;
            user.ApprovedCash += amount;

            return await SaveAsync(user, "TransferToApprovedCash");
        }
        public async Task<OperationResult> TransferToPaidCashAsync(string userId, double amount)
        {
            var user = await _affiliateUserRepo.FirstOrDefaultAsync(x => x.UserId == userId);
            if (user == null)
                return OperationResult.FailureResult("Affiliate user not found.");

            if (user.ApprovedCash < amount)
                return OperationResult.FailureResult("Not enough approved cash to transfer.");

            user.ApprovedCash -= amount;
            user.PaidCash += amount;

            return await SaveAsync(user, "TransferToPaidCash");
        }
        public async Task<OperationResult> AddPointsAsync(string userId, int points)
        {
            var user = await _affiliateUserRepo.FirstOrDefaultAsync(x => x.UserId == userId);
            if (user == null)
                return OperationResult.FailureResult("Affiliate user not found.");

            user.Points += points;

            return await SaveAsync(user, "AddPoints");
        }

        public async Task<OperationResult> AddEarningsAsync(string userId, double amount)
        {
            var user = await _affiliateUserRepo.FirstOrDefaultAsync(x => x.UserId == userId);
            if (user == null)
                return OperationResult.FailureResult("Affiliate user not found.");

            user.TotalEarnings += amount;

            return await SaveAsync(user, "AddEarnings");
        }

        public async Task<OperationResult> UpdateCommissionRateAsync(string userId, double newRate)
        {
            var user = await _affiliateUserRepo.FirstOrDefaultAsync(x => x.UserId == userId);
            if (user == null)
                return OperationResult.FailureResult("Affiliate user not found.");

            user.CommissionRate = newRate;

            return await SaveAsync(user, "UpdateCommissionRate");
        }

        public async Task<OperationResult> UpdatePaymentDetailsAsync(PaymentDetailsVW paymentDetails)
        {
            var user = await _affiliateUserRepo.FirstOrDefaultAsync(x => x.UserId == paymentDetails.UserId);
            if (user == null)
                return OperationResult.FailureResult("Affiliate user not found.");

            user.PaymentEmail = paymentDetails.PaymentEmail;
            user.PaymentGateway = paymentDetails.PaymentGateway;

            return await SaveAsync(user, "UpdatePaymentDetailsAsync");
        }

        public async Task<OperationResult> ChangeStatusAsync(string userId, CommissionStatus status)
        {
            var user = await _affiliateUserRepo.FirstOrDefaultAsync(x => x.UserId == userId);
            if (user == null)
                return OperationResult.FailureResult("Affiliate user not found.");

           // user.Status = status;

            return await SaveAsync(user, "ChangeStatus");
        }

        public async Task<OperationResult> IncrementReferralCountAsync(string userId)
        {
            var user = await _affiliateUserRepo.FirstOrDefaultAsync(x => x.UserId == userId);
            if (user == null)
                return OperationResult.FailureResult("Affiliate user not found.");

            user.ReferralCount += 1;

            return await SaveAsync(user, "IncrementReferralCount");
        }

        public async Task<OperationResult> GenerateReferralCode(string userId)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                    return OperationResult.FailureResult("User data is missing.");

                // Check if affiliate user already exists for the given UserId
                var existingAffiliate = await GetAffiliateUserByUserIdAsync(userId);

                if (existingAffiliate == null)
                    return OperationResult.FailureResult("Affiliate user does not exist.");

                string code;
                do
                {
                    code = GenerateReferralCode(userId, 5);
                }
                while (await _affiliateUserRepo.ExistsAsync(x => x.ReferralCode == code));

                existingAffiliate.ReferralCode = code;

                await _affiliateUserRepo.UpdateAsync(existingAffiliate);
                var result = await _affiliateUserRepo.SaveChangesAsync();

                return result.Success
                    ? OperationResult.SuccessResult(code)
                    : OperationResult.FailureResult($"Failed to save changes during GenerateReferralCode.");
            }
            catch (Exception ex)
            {
                _errorLogger.LogException(ex, nameof(GenerateReferralCode), nameof(AccountService));
                return OperationResult.FailureResult($"Error creating affiliate user: {ex.Message}");
            }
        }



        private static string GenerateReferralCode(string userId, int prefixLength = 5)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();

            string prefix = new string(Enumerable.Repeat(chars, prefixLength)
                .Select(s => s[random.Next(s.Length)]).ToArray());

            // Remove dashes first
            var cleanedUserId = userId?.Replace("-", "") ?? "";

            // Safely get last 3 characters or fewer if shorter
            string suffix = cleanedUserId.Length >= 3
                ? cleanedUserId.Substring(cleanedUserId.Length - 3)
                : cleanedUserId;

            if (string.IsNullOrEmpty(suffix))
                suffix = "000";

            return $"{prefix}{suffix}".ToUpper();
        }

        private async Task<OperationResult> SaveAsync(AffiliateUser user, string action)
        {
            try
            {
                await _affiliateUserRepo.UpdateAsync(user);
                var result = await _affiliateUserRepo.SaveChangesAsync();

                return result.Success
                    ? OperationResult.SuccessResult()
                    : OperationResult.FailureResult($"Failed to save changes during {action}.");
            }
            catch (Exception ex)
            {
                _errorLogger.LogException(ex, action, nameof(AffiliateService));
                return OperationResult.FailureResult($"Error during {action}: {ex.Message}");
            }
        }
        public async Task<bool> ValidateReferralCodeAsync(string referralCode, string userId)
        {
            // Basic checks
            if (string.IsNullOrWhiteSpace(referralCode) || referralCode.Length < 8)
                return false;

            // 1. Format check
            var prefix = referralCode.Substring(0, 5);
            var suffix = referralCode.Substring(referralCode.Length - 3);

            bool formatIsValid = prefix.All(char.IsLetterOrDigit) && suffix.All(char.IsLetterOrDigit);
            if (!formatIsValid)
                return false;

            // 2. Suffix matches userId
            if (!string.IsNullOrWhiteSpace(userId))
            {
                var cleanedUserId = userId.Replace("-", "");
                var expectedSuffix = cleanedUserId.Length >= 3
                    ? cleanedUserId.Substring(cleanedUserId.Length - 3)
                    : cleanedUserId;

                if (!suffix.Equals(expectedSuffix, StringComparison.OrdinalIgnoreCase))
                    return false;
            }

            // 3. Existence check in database
            bool exists = await _affiliateUserRepo.ExistsAsync(x => x.ReferralCode == referralCode);
            return exists;
        }


    }
}
