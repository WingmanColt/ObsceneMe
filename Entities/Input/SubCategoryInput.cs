using Entities.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models
{
    public class SubCategoryInput
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Icon { get; set; }
        public string ShortName { get; set; }
        public string CategoryShortName { get; set; }
        public int ProductsCount { get; set; }

        [NotMapped]
        public ProductsQuantity CountEnum { get; set; }
    }
    public class SubCategoryProductRelationInput
    {
        public int ProductId { get; set; }
        public int SubCategoryId { get; set; }

    }
}
