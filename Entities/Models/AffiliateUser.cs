
using Entities.Enums;

namespace Entities.Models
{
    public class AffiliateUser
    {
        public int Id { get; set; }
        public string ReferralCode { get; set; }

        public int ReferralCount { get; set; } = 0;
        public double TotalEarnings { get; set; } = 0.0;
        public double CommissionRate { get; set; } = 0.0;


        public double PaidCash { get; set; } = 0.0;
        public double ApprovedCash { get; set; } = 0.0;
        public double PendingCash { get; set; } = 0.0;
        public int Points { get; set; } = 0;

        public string PaymentEmail { get; set; }
        public string PaymentGateway { get; set; }

        public string UserId { get; set; }
        public string VisitorID { get; set; }

    }
}
