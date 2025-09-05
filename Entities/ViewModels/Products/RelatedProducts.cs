
using Entities.Enums;
using Entities.Models;

namespace Entities.ViewModels.Products
{
    public class GetRelatedProducts
    {
        public int Take { get; set; }
        public int CategoryId { get; set; }
        public int SubCategoryId { get; set; }
    }

    public class RelatedProduct
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public double Price { get; set; }
        public double DiscountRate { get; set; }

        public double Rating { get; set; } = 0.0;
        public int RatingVotes { get; set; } = 0;
        public int Sold { get; set; }


        public bool IsFreeShipping { get; set; }
        public MarketStatus MarketStatus { get; set; }
        public PremiumPackage PremiumPackage { get; set; }
        public Trademarks Trademark { get; set; }

        public int CategoryId { get; set; }
        public string CategoryTitle { get; set; }

        public int SubCategoryId { get; set; }
        public string SubCategoryTitle { get; set; }

        public List<Images> Images { get; set; } = new List<Images>();
    }
}
