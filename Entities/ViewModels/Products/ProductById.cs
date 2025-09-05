using Entities.Enums;

namespace Entities.ViewModels.Products
{
    public class ProductById
    {
        public int Id { get; set; }

        public string Title { get; set; }
        public string Details { get; set; }

        public int Quantity { get; set; }
        public int CustomerPreferenceQuantity { get; set; }
        public bool IsFreeShipping { get; set; }

        public double Price { get; set; }
        public double DiscountRate { get; set; }

        public double Rating { get; set; } = 0.0;
        public int RatingVotes { get; set; } = 0;

        public PremiumPackage PremiumPackage { get; set; }
        public MarketStatus MarketStatus { get; set; }
        public Trademarks Trademark { get; set; }

        public string Image { get; set; }
    }
}
