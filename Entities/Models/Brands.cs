using Ardalis.GuardClauses;
using Entities.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models
{
    public class Brands
    {
        public int Id { get; set; }
        public int TotalProductsCount { get; set; }

        public string Title { get; set; }
        public string Icon { get; set; }
        public string ShortName { get; set; }

        [NotMapped]
        public IEnumerable<Series> Series { get; set; }

        [NotMapped]
        public CRUD Operation { get; set; }

        [NotMapped]
        public ProductsQuantity ProductsQuantity { get; set; }

        public void Update(BrandInput Input)
        {
            Guard.Against.NullOrEmpty(Input.Title, nameof(Input.Title));
            Title = Input.Title;

            Guard.Against.NullOrEmpty(Input.ShortName, nameof(Input.ShortName));
            ShortName = Input.ShortName;

            Icon = Input.Icon;
            Icon = Input.Icon;
            TotalProductsCount = Input.TotalProductsCount;
        }
    }
        public class BrandProductRelation
    {
        public int Id { get; set; }

        public int ProductId { get; set; }
        public int BrandId { get; set; }

        public void Update(BrandProductRelationInput input)
        {
            Guard.Against.NegativeOrZero(input.ProductId, nameof(input.ProductId));
            ProductId = input.ProductId;

            Guard.Against.NegativeOrZero(input.BrandId, nameof(input.BrandId));
            BrandId = input.BrandId;
        }
    }
}
