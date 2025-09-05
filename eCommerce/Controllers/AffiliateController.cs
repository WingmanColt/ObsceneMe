using Core.Helpers;
using Entities.Enums;
using Entities.Models;
using Entities.ViewModels.Accounts;
using Entities.ViewModels.Affiliate;
using Microsoft.AspNetCore.Mvc;
using Models;
using Services.Interfaces;

namespace eCommerce.Controllers
{
    [Produces("application/json")]
    [ApiController]
    [Route("api/[controller]")]
    public class AffiliateController : ControllerBase
    {
        private readonly IAffiliateService _affiliateService;
        private readonly IspAffiliateProgram _spAffiliateProgram;

        public AffiliateController(IAffiliateService affiliateService, IspAffiliateProgram spAffiliateProgram)
        {
            _affiliateService = affiliateService;
            _spAffiliateProgram = spAffiliateProgram;
        }

        [HttpGet("GetAffiliateUser")]
        public async Task<ActionResult<AffiliateUser>> GetAffiliateUser([FromQuery] string userId)
        {
            try
            {
                var affiliateUser = await _affiliateService.GetAffiliateUserByUserIdAsync(userId);
                if (affiliateUser == null)
                    return NotFound($"Affiliate user not found for userId: {userId}");

                return Ok(affiliateUser);
            }
            catch (Exception ex)
            {
                // Log error if needed
                return StatusCode(500, "Internal server error");
            } 
        }
        [HttpGet("GetAffiliateUsers")]
        public async Task<ActionResult<List<AffiliateUser>>> GetAffiliateUsers()
        {
            try
            {
                var affiliateUser = await _affiliateService.GetAffiliateUsersAsync();
                if (affiliateUser == null)
                    return NotFound($"Affiliate users not found");

                return Ok(affiliateUser);
            }
            catch (Exception ex)
            {
                // Log error if needed
                return StatusCode(500, "Internal server error");
            }
        }
        // GET api/affiliate/performance?affiliateUserId=1&startDateStr=2025-06-01&endDateStr=2025-07-01&status=Paid
        [HttpGet("get-performance")]
        public async Task<IActionResult> GetPerformance([FromQuery] string affiliateUserId, [FromQuery] string startDateStr, [FromQuery] string endDateStr, [FromQuery] int status)
        {
            try
            {
                var performances = await _spAffiliateProgram.GetPerformanceAsync<Performance>(affiliateUserId, startDateStr, endDateStr, status);

                var resultList = new List<Performance>();
                await foreach (var item in performances)
                {
                    resultList.Add(item);
                }

                return Ok(resultList);
            }
            catch (Exception ex)
            {
                // Log error if needed
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("GenerateRefferalCode")]
        public async Task<OperationResult> GenerateReferral(string userId)
        {
            try
            {
                return await _affiliateService.GenerateReferralCode(userId);
            }
            catch (Exception ex)
            {
                return OperationResult.FailureResult($"Server error: {ex.Message}");
            }
        }


        [HttpPost("add-points")]
        public async Task<OperationResult> AddPoints(string userId, int points)
        {
            try
            {
                return await _affiliateService.AddPointsAsync(userId, points);
            }
            catch (Exception ex)
            {
                return OperationResult.FailureResult($"Server error: {ex.Message}");
            }
        }

        [HttpPost("add-earnings")]
        public async Task<OperationResult> AddEarnings(string userId, double amount)
        {
            try
            {
                return await _affiliateService.AddEarningsAsync(userId, amount);
            }
            catch (Exception ex)
            {
                return OperationResult.FailureResult($"Server error: {ex.Message}");
            }
        }

        [HttpPost("update-commission")]
        public async Task<OperationResult> UpdateCommissionRate(string userId, double newRate)
        {
            try
            {
                return await _affiliateService.UpdateCommissionRateAsync(userId, newRate);
            }
            catch (Exception ex)
            {
                return OperationResult.FailureResult($"Server error: {ex.Message}");
            }
        }
        [HttpPost("update-paymentdetails")]
        public async Task<OperationResult> UpdatePaymentDetails(PaymentDetailsVW paymentDetailsInput)
        {
            try
            {
                return await _affiliateService.UpdatePaymentDetailsAsync(paymentDetailsInput);
            }
            catch (Exception ex)
            {
                return OperationResult.FailureResult($"Server error: {ex.Message}");
            }
        }

        [HttpPost("change-status")]
        public async Task<OperationResult> ChangeStatus(string userId, CommissionStatus status)
        {
            try
            {
                return await _affiliateService.ChangeStatusAsync(userId, status);
            }
            catch (Exception ex)
            {
                return OperationResult.FailureResult($"Server error: {ex.Message}");
            }
        }

        [HttpPost("increment-referral")]
        public async Task<OperationResult> IncrementReferral(string userId)
        {
            try
            {
                return await _affiliateService.IncrementReferralCountAsync(userId);
            }
            catch (Exception ex)
            {
                return OperationResult.FailureResult($"Server error: {ex.Message}");
            }
        }

        [HttpPost("add-pending-cash")]
        public async Task<OperationResult> AddPendingCash(string userId, double amount)
        {
            try
            {
                return await _affiliateService.AddPendingCashAsync(userId, amount);
            }
            catch (Exception ex)
            {
                return OperationResult.FailureResult($"Server error: {ex.Message}");
            }
        }
        [HttpPost("transfer-to-approved")]
        public async Task<OperationResult> TransferToApproved(string userId, double amount)
        {
            try
            {
                return await _affiliateService.TransferToApprovedCashAsync(userId, amount);
            }
            catch (Exception ex)
            {
                return OperationResult.FailureResult($"Server error: {ex.Message}");
            }
        }

        [HttpPost("transfer-to-paid")]
        public async Task<OperationResult> TransferToPaid(string userId, double amount)
        {
            try
            {
                return await _affiliateService.TransferToPaidCashAsync(userId, amount);
            }
            catch (Exception ex)
            {
                return OperationResult.FailureResult($"Server error: {ex.Message}");
            }
        }


    }
}
