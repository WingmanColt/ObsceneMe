
using Entities.Enums;

namespace Entities.ViewModels.Products
{
    public class ProductReviewCard
    {
            public int? Id { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string ReviewImage { get; set; }

            public string ReviewComment { get; set; }
            public double ReviewRating { get; set; }
            public int ReviewRatingVotes { get; set; }

            public int? ProductId { get; set; }
            public int? ProductStars { get; set; }
            public string ProductImageUrl { get; set; }
            public string ProductTitle { get; set; }
            public string ProductAbout { get; set; }
            public double ProductPrice { get; set; }
            public double ProductDiscountRate { get; set; }
            public double ProductPositiveRating { get; set; }


        //public AdStatus AdStatus { get; set; }
        public string CreatedOn { get; set; }
    }
}
