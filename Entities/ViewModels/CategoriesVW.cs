using Entities.Models;

namespace Entities.ViewModels
{
    public class CategoriesVW
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Icon { get; set; }
        public string ShortName { get; set; }

        public int? SubCategoriesCount { get; set; }
        public int? TotalProductsCount { get; set; }

        public List<SubCategory> SubCategories { get; set; } = new List<SubCategory>();
    }
    public class SubCategoriesVW
    {
        public int SubCategoryId { get; set; }
        public string SubCategoryTitle { get; set; }
        public string SubCategoryIcon { get; set; }
        public string SubCategoryShortName { get; set; }
        public int ProductsCount { get; set; }
    }

}