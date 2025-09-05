using Entities.Enums;
using Entities.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.ViewModels.Products
{

    public class ProductVW
    {
        public int Id { get; set; }

        public string Title { get; set; }
        public string Details { get; set; }
        public string Description { get; set; }
        public string VideoUrl { get; set; }

        public int Quantity { get; set; }
        public int CustomerPreferenceQuantity { get; set; }

        public double Price { get; set; }
        public double DiscountRate { get; set; }

        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public Category Category { get; set; }

        public int? SubCategoryId { get; set; }
        public string SubCategoryName { get; set; }
        public SubCategory SubCategory { get; set; }

        public int? BrandId { get; set; }
        public string BrandName { get; set; }
        public Brands Brand { get; set; }

        public string UserId { get; set; }

        public bool IsFreeShipping { get; set; }
        public bool IsReturnRequestAllowed { get; set; }

        public double Rating { get; set; } = 0.0;
        public double PositiveRating { get; set; } = 0.0;
        public int RatingVotes { get; set; } = 0;
        public int Views { get; set; } = 0;
        public int Sold { get; set; } = 0;

        public Bundle Bundle { get; set; }
        public int? BundleId { get; set; }

        public ApproveType ApproveType { get; set; }
        public ItemType ItemType { get; set; }
        public Status Status { get; set; }
        public PremiumPackage PremiumPackage { get; set; }
        public MarketStatus MarketStatus { get; set; }
        public Trademarks Trademark { get; set; }

        public string CreatedOn { get; set; }
        public string ExpiredOn { get; set; }

        public virtual IEnumerable<VariantGroupOutput> Variants { get; set; }
        public virtual IEnumerable<Images> Images { get; set; }
        public virtual IEnumerable<Occasion> Occasions { get; set; }
        public virtual IEnumerable<Review> Reviews { get; set; }

        [NotMapped]
        public string Src { get; set; }
        // public string StatementType { get; set; }

    }
}
