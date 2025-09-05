using Ardalis.GuardClauses;
using Entities.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models
{
    public class Bundle
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int MainProductId { get; set; } // the main product linked to bundle

        public bool IsActive { get; set; }
        public Status Status { get; set; }
        public BundleType Type { get; set; }

        public string CreatedOn { get; set; } = string.Empty;
        public string ExpiredOn { get; set; } = string.Empty;

        public virtual ICollection<BundleItem> BundleItems { get; set; } = new List<BundleItem>();

        public void Update(BundleInput input)
        {
            Guard.Against.NullOrEmpty(input.Name, nameof(input.Name));
            Name = input.Name;

            Guard.Against.NullOrEmpty(input.Description, nameof(input.Description));
            Description = input.Description;

            Guard.Against.NegativeOrZero(input.MainProductId, nameof(input.MainProductId));
            MainProductId = input.MainProductId;

            IsActive = input.IsActive;

            Status = (Status)Enum.Parse(typeof(Status), input.Status.ToString());
            Type = (BundleType)Enum.Parse(typeof(BundleType), input.Type.ToString());

            CreatedOn = DateTime.Now.ToString("dd/MM/yyyy");
            ExpiredOn = DateTime.Now.AddDays(30).ToString("dd/MM/yyyy");

            // You may choose to map BundleItems here based on logic
            BundleItems = input.BundleItems ?? new List<BundleItem>();
        }
    }

    public class BundleItem
    {
        public int Id { get; set; }
        public int BundleId { get; set; }
        public int ProductId { get; set; }

        public string Title { get; set; } = string.Empty;
        public double Price { get; set; }
        public double DiscountRate { get; set; }
        public int Quantity { get; set; }
        public string ImageSrc { get; set; } = string.Empty;

        [ForeignKey("BundleId")]
        public virtual Bundle Bundle { get; set; }
    }
}
