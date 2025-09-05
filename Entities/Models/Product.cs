using Ardalis.GuardClauses;
using Entities.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models
{
    public class Product
    { 
        public int Id { get; set; }
        public string Title { get; set; }
        public string ShortName { get; set; }
        public string Details { get; set; }
        public string Usage { get; set; }
        public string Characteristic { get; set; }
        public string Composition { get; set; }
        public string Description { get; set; }
        public string VideoUrl { get; set; }

        public int Quantity { get; set; }
        public double Price { get; set; }
        public double DiscountRate { get; set; }

        public bool IsFreeShipping { get; set; }
        public bool IsReturnRequestAllowed { get; set; }

        public int? Views { get; set; } = 0;
        public int? Sold { get; set; } = 0;

        public double Rating { get; set; } = 0.0;
        public double PositiveRating { get; set; } = 0.0;

        public int RatingVotes { get; set; } = 0;
        public int VotedUsers { get; set; } = 0;

        public PremiumPackage PremiumPackage { get; set; }
        public ApproveType ApproveType { get; set; }
        public ItemType ItemType { get; set; }
        public Status Status { get; set; }
        public Gender Gender { get; set; }
        public MarketStatus MarketStatus { get; set; }
        public Trademarks Trademark { get; set; }

        public string CreatedOn { get; set; }
        public string ExpiredOn { get; set; }

        [NotMapped]
        public string StatementType { get; set; }

        public void Update(ProductInput input)
        {
            Id = input.Id;

            Guard.Against.NullOrEmpty(input.Title, nameof(input.Title));
            Title = input.Title;

            Guard.Against.NullOrEmpty(input.ShortName, nameof(input.ShortName));
            ShortName = input.ShortName;

            Guard.Against.NullOrEmpty(input.Details, nameof(input.Details));
            Details = input.Details;

            Guard.Against.NullOrEmpty(input.Description, nameof(input.Description));
            Description = input.Description;

            Characteristic = input.Characteristic;
            Composition = input.Composition;
            Usage = input.Usage;

            VideoUrl = input.VideoUrl;
            IsReturnRequestAllowed = input.IsReturnRequestAllowed;

            ApproveType = ApproveType.Success;

            ItemType = (ItemType)Enum.Parse(typeof(ItemType), input.ItemType.ToString());
            Status = (Status)Enum.Parse(typeof(Status), input.Status.ToString());
            Gender = (Gender)Enum.Parse(typeof(Gender), input.Gender.ToString());
            MarketStatus = (MarketStatus)Enum.Parse(typeof(MarketStatus), input.MarketStatus.ToString());
            Trademark = (Trademarks)Enum.Parse(typeof(Trademarks), input.Trademark.ToString());
            PremiumPackage = (PremiumPackage)Enum.Parse(typeof(PremiumPackage), input.PremiumPackage.ToString());

            Guard.Against.NegativeOrZero(input.Quantity, nameof(input.Quantity));
            Quantity = input.Quantity;

            Guard.Against.NegativeOrZero(input.Price, nameof(input.Price));
            Price = input.Price;

            DiscountRate = input.DiscountRate;

            CreatedOn = DateTime.Now.ToString("dd/MM/yyyy");
            ExpiredOn = DateTime.Now.AddDays(90).ToString("dd/MM/yyyy");

        }

    }
}
