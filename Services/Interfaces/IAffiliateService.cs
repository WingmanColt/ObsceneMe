using Core.Helpers;
using Entities.Enums;
using Entities.Models;
using Entities.ViewModels.Affiliate;

namespace Services.Interfaces
{
    public interface IAffiliateService
    {
        Task<OperationResult> CreateAffiliatedOrderAsync(string referedByCode, OrderInput Order);

        Task<AffiliateUser?> GetAffiliateUserByUserIdAsync(string userId);
        Task<OperationResult> AddEarningsAsync(string userId, double amount);
        Task<OperationResult> AddPointsAsync(string userId, int points);
        Task<OperationResult> ChangeStatusAsync(string userId, CommissionStatus status);
        Task<OperationResult> GenerateReferralCode(string userId);
        Task<OperationResult> IncrementReferralCountAsync(string userId);
        Task<OperationResult> UpdateCommissionRateAsync(string userId, double newRate);
        Task<OperationResult> UpdatePaymentDetailsAsync(PaymentDetailsVW paymentDetails);

        Task<OperationResult> TransferToPaidCashAsync(string userId, double amount);
        Task<OperationResult> TransferToApprovedCashAsync(string userId, double amount);
        Task<OperationResult> AddPendingCashAsync(string userId, double amount);

        Task<List<AffiliateUser>> GetAffiliateUsersAsync();
        Task<bool> ValidateReferralCodeAsync(string referralCode, string userId);
    }
}