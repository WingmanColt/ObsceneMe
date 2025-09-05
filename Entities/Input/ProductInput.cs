using Entities.Enums;
using Entities.Input;
using Entities.ViewModels;
using Entities.ViewModels.Products;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models
{
    public class ProductInput
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string ShortName { get; set; }
        public string Details { get; set; }
        public string Usage { get; set; }
        public string Characteristic { get; set; }
        public string Composition { get; set; }
        public string Description { get; set; }
        public string VideoUrl { get; set; }
        public int Quantity { get; set; }
        public double Price { get; set; }
        public double DiscountRate { get; set; }

        public bool IsFreeShipping { get; set; }
        public bool IsReturnRequestAllowed { get; set; }

        public int ApproveType { get; set; }
        public int ItemType { get; set; }
        public int Status { get; set; }
        public int PremiumPackage { get; set; }
        public int MarketStatus { get; set; }
        public int Trademark { get; set; }
        public int Gender { get; set; }


        public virtual IEnumerable<Category> Category { get; set; } = new List<Category>();
        public virtual IEnumerable<SubCategory> SubCategory { get; set; } = new List<SubCategory>();
        public virtual IEnumerable<Occasion> Occasion { get; set; } = new List<Occasion>();
        public virtual IEnumerable<Brands> Brand { get; set; } = new List<Brands>();
        public virtual IEnumerable<SubBrands> SubBrand { get; set; } = new List<SubBrands>();
        public virtual IEnumerable<Series> Series { get; set; } = new List<Series>();
        public virtual IEnumerable<Images> Image { get; set; } = new List<Images>();
        public virtual IEnumerable<GroupedVariant> GroupedVariants { get; set; } = new List<GroupedVariant>();

        [NotMapped]
        public virtual BundleInput Bundle { get; set; }

        [NotMapped]
        public virtual StoryPageDto StoryPage { get; set; }

        [NotMapped]
        public string StatementType { get; set; }

        [NotMapped]
        public int MockProductsCount { get; set; }
    }
}
