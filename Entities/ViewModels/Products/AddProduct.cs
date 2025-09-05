using Entities.Enums;
using Entities.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.ViewModels.Products
{
    public class AddProduct
    {
        public int Id { get; set; }

        public string Title { get; set; }
        public string Details { get; set; }
        public string Usage { get; set; }
        public string Composition { get; set; }
        public string Characteristic { get; set; }
        public string Description { get; set; }
        public string VideoUrl { get; set; }

        public int Quantity { get; set; }

        public double Price { get; set; }
        public double DiscountRate { get; set; }

        public bool IsFreeShipping { get; set; }
        public bool IsReturnRequestAllowed { get; set; }

        public double Rating { get; set; } = 0.0;
        public double PositiveRating { get; set; } = 0.0;
        public int RatingVotes { get; set; } = 0;
        public int Views { get; set; } = 0;
        public int Sold { get; set; } = 0;

        public ApproveType ApproveType { get; set; }
        public ItemType ItemType { get; set; }
        public Status Status { get; set; }
        public PremiumPackage PremiumPackage { get; set; }
        public MarketStatus MarketStatus { get; set; }
        public Trademarks Trademark{ get; set; }

        public virtual IEnumerable<VariantGroupOutput> Variant { get; set; }
        public virtual IEnumerable<GroupedVariant> GroupedVarian { get; set; }

        public virtual IEnumerable<Brands> Brand { get; set; }
        public virtual IEnumerable<Bundle> Bundle { get; set; }
        public virtual IEnumerable<Images> Image { get; set; }

        public virtual IEnumerable<Occasion> Occasion { get; set; }
        public virtual IEnumerable<Category> Category { get; set; }
        public virtual IEnumerable<SubCategory> SubCategory { get; set; }

        [NotMapped]
        public string Src { get; set; }
        // public string StatementType { get; set; }

    }
}
