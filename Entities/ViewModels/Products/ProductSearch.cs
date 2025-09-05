
using Entities.Enums;
using Entities.Models;
using Entities.ViewModels.Variants;

namespace Entities.ViewModels.Products
{
    public class ProductSearch
    {
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int? LastProductId { get; set; }

        public string SearchString { get; set; }
        public int? CategoryId { get; set; }
        public string CategoryTitle { get; set; }
        public int? SubCategoryId { get; set; }
        public string SubCategoryTitle { get; set; }

        public int? GenderId { get; set; }
        public int? RatingId { get; set; }
        public int? StatusId { get; set; }

        public int? MinPrice { get; set; }
        public int? MaxPrice { get; set; }

        public IEnumerable<Trademark> Trademarks { get; set; }
        public IEnumerable<BrandsVW> Brands { get; set; }
        public IEnumerable<BrandSeriesVW> BrandSeries { get; set; }
        public IEnumerable<SubBrands> SubBrands { get; set; }
        public IEnumerable<Occasion> Occasions { get; set; }

        public string SortBy { get; set; }
        public string SortDirection { get; set; }

    }

    public class Trademark
    {
        public int Id { get; set; }
        public string Label { get; set; }
    }
}
