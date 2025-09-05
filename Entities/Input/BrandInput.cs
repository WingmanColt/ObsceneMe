using Entities.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models
{
    public class BrandInput
    {
        public int Id { get; set; }
        public int TotalProductsCount { get; set; }

        public string Title { get; set; }
        public string Icon { get; set; }
        public string ShortName { get; set; }

        public ProductsQuantity ProductsQuantity { get; set; }
    }
    public class BrandProductRelationInput
    {
        public int ProductId { get; set; }
        public int BrandId { get; set; }

    }
}
