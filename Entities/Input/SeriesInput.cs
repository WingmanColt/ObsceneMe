
using Entities.Enums;

namespace Entities.Models
{
    public class SeriesInput
    {
        public int Id { get; set; }
        public string BrandShortName { get; set; }

        public string Title { get; set; }
        public string Icon { get; set; }
        public string ShortName { get; set; }

        public int ProductsCount { get; set; }

        public ProductsQuantity ProductsQuantity { get; set; }
    }

    public class SeriesProductRelationInput
    {
        public int ProductId { get; set; }
        public int SeriesId { get; set; }

    }
}
