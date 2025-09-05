using Ardalis.GuardClauses;

namespace Entities.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductTitle { get; set; }

        public int? CheckoutId { get; set; }
        public bool? isPayed { get; set; }
        public int? Quantity { get; set; }

        public int? WillEarnRewardPoints { get; set; }
        public double? Tax { get; set; }

        public string Notes { get; set; }
        public string TrackingNumber { get; set; }
        public string CancellationReason { get; set; }

        public string PaymentType { get; set; }
        public string ShippingType { get; set; }

        public double? CostPerItem { get; set; }
        public double? DiscountPerItem { get; set; }

        public double TotalCost { get; set; }
        public double TotalDiscount { get; set; }

        public string Currency { get; set; }
        public string Code { get; set; }

        public string CreatedOn { get; set; }
        public string ExpiredOn { get; set; }

        public string Phone { get; set; }
        public string UserId { get; set; }

        public void Update(OrderInput input)
        {
            Guard.Against.NegativeOrZero(input.ProductId, nameof(input.ProductId));
            ProductId = input.ProductId;

            Guard.Against.NullOrEmpty(input.Currency, nameof(input.Currency));
            Currency = input.Currency;

            Guard.Against.NullOrEmpty(input.Phone, nameof(input.Phone));
            Phone = input.Phone;

            Guard.Against.NullOrEmpty(input.Code, nameof(input.Code));
            Code = input.Code;

            Quantity = input.Quantity;
            WillEarnRewardPoints = input.WillEarnRewardPoints;
            Tax = 0.1;

            isPayed = input.isPayed;
            CheckoutId = input.CheckoutId;

            PaymentType = input.PaymentType;
            ShippingType = input.ShippingType;

            CostPerItem = input.CostPerItem;
            DiscountPerItem = input.DiscountPerItem;

            ProductTitle = input.ProductTitle;

            TotalCost = input.TotalCost;
            TotalDiscount = input.TotalDiscount;
            Currency = input.Currency;

            Notes = input.Notes;
            CancellationReason = input.CancellationReason;
            TrackingNumber = GenerateTrackingNumber();

            CreatedOn = DateTime.Now.ToString("dd MMMM yyyy HH:mm");
            ExpiredOn = DateTime.Now.AddDays(30).ToString("dd MMMM yyyy HH:mm");

            UserId = input.UserId;
        }

        public string GenerateTrackingNumber()
        {
            return $"{CreatedOn}-{ProductId}/{CheckoutId}";
        }
    }
}
