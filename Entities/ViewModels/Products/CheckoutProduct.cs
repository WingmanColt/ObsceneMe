using Entities.Enums;

namespace Entities.ViewModels.Products
{
    public class OrderedProduct
    {
        public int Id { get; set; }
        public string Title { get; set; }

        public int Sold { get; set; }
        public int Quantity { get; set; }
        public int CustomerPreferenceQuantity { get; set; }
        public bool IsFreeShipping { get; set; }

        public double Price { get; set; }
        public double DiscountRate { get; set; }

        public PremiumPackage PremiumPackage { get; set; }
        public MarketStatus MarketStatus { get; set; }

        public IEnumerable<GroupedVariant> SelectedVariants { get; set; }
    }

}

