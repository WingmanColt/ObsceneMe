using Ardalis.GuardClauses;
using Entities.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models
{
    public class Series
    {
        public int Id { get; set; }
        public string BrandShortName { get; set; }

        public string Title { get; set; }
        public string Icon { get; set; }
        public string ShortName { get; set; }

        public int ProductsCount { get; set; }

        [NotMapped]
        public IEnumerable<SubBrands> SubBrands { get; set; }

        [NotMapped]
        public CRUD Operation { get; set; }

        [NotMapped]
        public ProductsQuantity ProductsQuantity { get; set; }


        public void Update(SeriesInput Input)
        {
            Guard.Against.NullOrEmpty(Input.Title, nameof(Input.Title));
            Title = Input.Title;

            Guard.Against.NullOrEmpty(Input.BrandShortName, nameof(Input.BrandShortName));
            BrandShortName = Input.BrandShortName;

            Guard.Against.NullOrEmpty(Input.ShortName, nameof(Input.ShortName));
            ShortName = Input.ShortName;

            ProductsCount = Input.ProductsCount;
            Icon = Input.Icon;
        }
    }
        public class SeriesProductRelation
    {
        public int Id { get; set; }

        public int ProductId { get; set; }
        public int SeriesId { get; set; }

        public void Update(SeriesProductRelationInput input)
        {
            Guard.Against.NegativeOrZero(input.ProductId, nameof(input.ProductId));
            ProductId = input.ProductId;

            Guard.Against.NegativeOrZero(input.SeriesId, nameof(input.SeriesId));
            SeriesId = input.SeriesId;
        }
    }
}
