
using Entities.Enums;

namespace Entities.Models
{
    public class AffiliatedOrder
    {
        public int Id { get; set; }
        public string AffiliateUserId { get; set; }
        public string OrderCode { get; set; }
        public string ReferedByCode { get; set; }

        public CommissionStatus Status { get; set; } // Pending, Approved, Paid

        public string VisitorID { get; set; }
        public string CreatedOn { get; set; }
    }
}
