using Entities.Enums;
using Entities.Models;

namespace Entities.ViewModels.Products
{
    public class ProductListing
    {
        public int TotalItems { get; set; }
        public List<ProductListingDetail> Product { get; set; }

    }
    public class ProductListingDetail
    {
        public int Id { get; set; }
        public string Title { get; set; }

        public int Quantity { get; set; }
        public double Price { get; set; }
        public double DiscountRate { get; set; }

        public MarketStatus MarketStatus { get; set; }
        public Trademarks Trademark { get; set; }
        public PremiumPackage PremiumPackage { get; set; }

        public double Rating { get; set; } = 0.0;
        public int RatingVotes { get; set; } = 0;
        public bool IsFreeShipping { get; set; }

        public ItemType ItemType { get; set; }
        public Status Status { get; set; }

        public int CategoryId { get; set; }
        public string CategoryTitle { get; set; }

        public int SubCategoryId { get; set; }
        public string SubCategoryTitle { get; set; }

        public int BrandId { get; set; }
        public string BrandTitle { get; set; }

        public int SeriesId { get; set; }
        public string SeriesTitle { get; set; }

        public int SubBrandId { get; set; }
        public string SubBrandTitle { get; set; }

        public List<Images> Images { get; set; } = new List<Images>();
        public List<Occasion> Occasions { get; set; } = new List<Occasion>();
    }
}
