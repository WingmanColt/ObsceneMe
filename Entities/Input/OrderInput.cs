namespace Entities.Models
{
    public class OrderInput
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string VariantItemTitles { get; set; }

        public int? CheckoutId { get; set; }
        public int? Quantity { get; set; }
        public int? WillEarnRewardPoints { get; set; }
        public double? Tax { get; set; }
        public bool isPayed { get; set; }

        public string CreatedOn { get; set; }
        public string ExpiredOn { get; set; }

        public string PaymentType { get; set; }
        public string ShippingType { get; set; }
        
        public string Currency { get; set; }
        public string Code { get; set; }
        public string UserId { get; set; }

        public string Notes { get; set; }
        public string CancellationReason { get; set; }

        public double? CostPerItem { get; set; }
        public double? DiscountPerItem { get; set; }

        public double TotalCost { get; set; }
        public double TotalDiscount { get; set; }

        public string VisitorID { get; set; }

        // Fast Order
        public string Phone { get; set; }
        public string ProductTitle { get; set; }
    }

}
