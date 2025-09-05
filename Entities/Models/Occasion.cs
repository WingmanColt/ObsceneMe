using Ardalis.GuardClauses;
using Entities.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models
{
    public class Occasion
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Icon { get; set; }
        public string ShortName { get; set; }

        public int ProductsCount { get; set; }


        [NotMapped]
        public CRUD Operation { get; set; }

        [NotMapped]
        public ProductsQuantity CategoriesEnum { get; set; }

        public void Update(OccasionInput Input)
        {
            Guard.Against.NullOrEmpty(Input.Title, nameof(Input.Title));
            Title = Input.Title;

            Guard.Against.NullOrEmpty(Input.ShortName, nameof(Input.ShortName));
            ShortName = Input.ShortName;

            Icon = Input.Icon;
            ProductsCount = Input.ProductsCount;
        }
    }
    public class OccasionProductRelation
    {
        public int Id { get; set; }

        public int ProductId { get; set; }
        public int OccasionId { get; set; }

        public void Update(OccasionProductRelationInput input)
        {
            Guard.Against.NegativeOrZero(input.ProductId, nameof(input.ProductId));
            ProductId = input.ProductId;

            Guard.Against.NegativeOrZero(input.OccasionId, nameof(input.OccasionId));
            OccasionId = input.OccasionId;
        }
    }
}
