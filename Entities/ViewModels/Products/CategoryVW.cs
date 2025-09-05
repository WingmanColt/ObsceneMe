
using Entities.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models
{
    public class CategoryVW
    {
        public int Id { get; set; }
        public int SubCategoriesCount { get; set; }
        public int TotalProductsCount { get; set; }

        public string Title { get; set; }
        public string Icon { get; set; }
        public string ShortName { get; set; }

        [NotMapped]
        public ProductsQuantity ProductsQuantity { get; set; }

    }
}
