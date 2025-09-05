using Entities.Enums;

namespace Entities.ViewModels.Products
{
    public class Products
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int Quantity { get; set; }

        public double Price { get; set; }
        public double DiscountRate { get; set; }

        public string Image { get; set; }
    }
}
