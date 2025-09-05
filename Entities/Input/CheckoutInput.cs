using Entities.Enums;
using Entities.ViewModels.Products;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models
{
    public class CheckoutInput
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string ReferedByCode { get; set; }
        public string VisitorID { get; set; }
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string Address { get; set; }
        public string Country { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }
        public bool IsGuest { get; set; }
        public bool PickupAtHome { get; set; }

        public ApproveType ApproveType { get; set; }
        public PaymentCondition PaymentCondition { get; set; }

        public string CreatedOn { get; set; }
        public string ExpiredOn { get; set; }

        // Custom
        [NotMapped]
        public string Currency { get; set; }

        [NotMapped]
        public double CurrencyPrice { get; set; }

        [NotMapped]
        public string PaymentType { get; set; }

        [NotMapped]
        public string ShippingType { get; set; }

        [NotMapped]
        public IEnumerable<OrderedProduct> Products { get; set; }

        [NotMapped]
        public double Tax { get; set; }

        [NotMapped]
        public bool TaxIncluded { get; set; }

        [NotMapped]
        public PromoCode PromoCode { get; set; }

        [NotMapped]
        public string StatementType { get; set; }

        [NotMapped]
        public double TotalCost { get; set; }

        [NotMapped]
        public double TotalDiscount { get; set; }
    }



}
