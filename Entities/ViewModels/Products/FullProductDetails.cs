using Entities.Models;

namespace Entities.ViewModels.Products
{
    public class FullProductDetails
    {
        public ProductDetails Product { get; set; }

        public List<Images> Images { get; set; }
        public List<Entities.Models.Variants> Variants { get; set; }
        public List<Review> Reviews { get; set; }
        public List<Brands> Brands { get; set; }
        public List<Bundle> Bundles { get; set; }
        public List<Category> Category { get; set; }
        public List<SubCategory> SubCategory { get; set; }
    }
}
