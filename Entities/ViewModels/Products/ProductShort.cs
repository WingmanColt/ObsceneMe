using Entities.Enums;

namespace Entities.ViewModels.Products
{
    public class ProductShort
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public int Quantity { get; set; }

        public double Price { get; set; }
        public double DiscountRate { get; set; }

        public double Rating { get; set; } = 0.0;
        public int RatingVotes { get; set; } = 0;
        public MarketStatus MarketStatus { get; set; }


        public string Image { get; set; }
    }
}
