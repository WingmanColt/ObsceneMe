using Entities.Enums;

namespace Entities.Models
{
    public class PreCheckoutInput
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string PostalCode { get; set; }

        public string CreatedOn { get; set; }
        public string ExpiredOn { get; set; }

        public PaymentCondition PaymentCondition { get; set; }

    }

}
