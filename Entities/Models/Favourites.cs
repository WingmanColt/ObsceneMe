using Ardalis.GuardClauses;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models
{
    public class Favourites
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int ProductId { get; set; }

        public string CreatedOn { get; set; }
        public string ExpiredOn { get; set; }

        [NotMapped]
        public string StatementType { get; set; }

        public void Update(FavouriteInput input)
        {
            Id = input.Id;

            Guard.Against.NegativeOrZero(input.ProductId, nameof(input.ProductId));
            ProductId = input.ProductId;

            Guard.Against.NullOrEmpty(input.UserId, nameof(input.UserId));
            UserId = input.UserId;

            CreatedOn = DateTime.Now.ToString("dd/MM/yyyy");
            ExpiredOn = DateTime.Now.AddDays(90).ToString("dd/MM/yyyy");
        }

    }
}
