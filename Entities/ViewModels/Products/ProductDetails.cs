using Entities.Enums;
using Entities.Models;

namespace Entities.ViewModels.Products
{
    public class ProductDetails
    {
        public int Id { get; set; }

        public string Title { get; set; }
        public string Details { get; set; }
        public string Usage { get; set; }
        public string Characteristic { get; set; }
        public string Composition { get; set; }
        public string Description { get; set; }
        public string VideoUrl { get; set; }

        public int Quantity { get; set; }
        public bool IsFreeShipping { get; set; }

        public double Price { get; set; }
        public double DiscountRate { get; set; }

        public double Rating { get; set; } = 0.0;
        public double PositiveRating { get; set; } = 0.0;
        public int RatingVotes { get; set; } = 0;

        public Status Status { get; set; }
        public PremiumPackage PremiumPackage { get; set; }
        public MarketStatus MarketStatus { get; set; }
        public Trademarks Trademark { get; set; }
        public ItemType ItemType { get; set; }


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

        public string OccasionIds { get; set; }

        public List<Images> Images { get; set; }
        public List<Review> Reviews { get; set; }
        public List<GroupedVariant> Variants { get; set; }

        // Story Page
        public StoryPageDto StoryPage { get; set; }  // single StoryPage object

        public BundleVW Bundle { get; set; }
    }

}
