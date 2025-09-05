namespace Entities.Models
{
    public class CategoryInput
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Icon { get; set; }
        public string ShortName { get; set; }

        public int? SubCategoriesCount { get; set; }
        public int? TotalProductsCount { get; set; }

    }
    public class CategoryProductRelationInput
    {
        public int ProductId { get; set; }
        public int CategoryId { get; set; }

    }
}
