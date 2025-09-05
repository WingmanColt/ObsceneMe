using Ardalis.GuardClauses;
using Entities.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models
{
    public class SubCategory
    {
        public int Id { get; set; }
        public string CategoryShortName { get; set; }

        public string Title { get; set; }
        public string Icon { get; set; }
        public string ShortName { get; set; }

        public int ProductsCount { get; set; }

        [NotMapped]
        public CRUD Operation { get; set; }

        public void Update(SubCategoryInput Input)
        {
            Guard.Against.NullOrEmpty(Input.Title, nameof(Input.Title));
            Title = Input.Title;

            Guard.Against.NullOrEmpty(Input.ShortName, nameof(Input.ShortName));
            ShortName = Input.ShortName;

            Guard.Against.NullOrEmpty(Input.CategoryShortName, nameof(Input.CategoryShortName));
            CategoryShortName = Input.CategoryShortName;

            Icon = Input.Icon;
            ProductsCount = Input.ProductsCount;
        }
    }
    public class SubCategoryProductRelation
    {
        public int Id { get; set; }

        public int ProductId { get; set; }
        public int SubCategoryId { get; set; }

        public void Update(SubCategoryProductRelationInput input)
        {
            Guard.Against.NegativeOrZero(input.ProductId, nameof(input.ProductId));
            ProductId = input.ProductId;

            Guard.Against.NegativeOrZero(input.SubCategoryId, nameof(input.SubCategoryId));
            SubCategoryId = input.SubCategoryId;
        }
    }
}
