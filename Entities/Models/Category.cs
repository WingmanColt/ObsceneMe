using Ardalis.GuardClauses;
using Entities.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models
{
    public class Category
    {
        public int Id { get; set; }

        public string Title { get; set; }
        public string Icon { get; set; }
        public string ShortName { get; set; }

        public int? TotalProductsCount { get; set; }

        [NotMapped]
        public CRUD Operation { get; set; }

        public void Update(CategoryInput Input)
        {
            Guard.Against.NullOrEmpty(Input.Title, nameof(Input.Title));
            Title = Input.Title;

            Guard.Against.NullOrEmpty(Input.ShortName, nameof(Input.ShortName));
            ShortName = Input.ShortName;

            Guard.Against.NullOrEmpty(Input.Icon, nameof(Input.Icon));
            Icon = Input.Icon;

            TotalProductsCount = Input.TotalProductsCount;
        }
    }

    public class CategoryProductRelation
    {
        public int Id { get; set; }

        public int ProductId { get; set; }
        public int CategoryId { get; set; }

        public void Update(CategoryProductRelationInput input)
        {
            Guard.Against.NegativeOrZero(input.ProductId, nameof(input.ProductId));
            ProductId = input.ProductId;

            Guard.Against.NegativeOrZero(input.CategoryId, nameof(input.CategoryId));
            CategoryId = input.CategoryId;
        }
    }
}
