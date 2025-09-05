using Entities.Enums;
using Entities.Models;

namespace Entities.ViewModels.Products
{
    public class ProductWithRelations
    {
        public Product Product { get; set; }
        public List<Category> Categories { get; set; } = new List<Category>();
        public List<SubCategory> SubCategories { get; set; } = new List<SubCategory>();
        public List<Occasion> Occasions { get; set; } = new List<Occasion>();
        public List<Brands> Brands { get; set; } = new List<Brands>();
        public List<Series> Series { get; set; } = new List<Series>();
        public List<SubBrands> SubBrands { get; set; } = new List<SubBrands>();
        public List<GroupedVariant> GroupedVariants { get; set; } = new List<GroupedVariant>();
        public List<Images> Images { get; set; } = new List<Images>();

        public BundleVW Bundle { get; set; }
        public StoryPageDto StoryPage { get; set; }
    }
}
