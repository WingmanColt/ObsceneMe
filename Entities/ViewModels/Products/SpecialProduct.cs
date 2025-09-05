using Entities.Enums;
using Entities.Models;
using System;

namespace Entities.ViewModels.Products
{
    public class SpecialProduct
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public double Price { get; set; }
        public double DiscountRate { get; set; }

        public double Rating { get; set; } = 0.0;
        public int RatingVotes { get; set; } = 0;

        public int CategoryId { get; set; }
        public string CategoryTitle { get; set; }

        public int SubCategoryId { get; set; }
        public string SubCategoryTitle { get; set; }

        public MarketStatus MarketStatus { get; set; }
        public Trademarks Trademark { get; set; }
        public PremiumPackage PremiumPackage { get; set; }
        public ItemType ItemType { get; set; }
        public Status Status { get; set; }

        public List<Images> Images { get; set; } = new List<Images>();
    }
}
