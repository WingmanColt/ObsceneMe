using Entities.Enums;
using Entities.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.ViewModels.Products
{
    public class BundleVW
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

        public List<BundleItemVW> BundleItems { get; set; } = new();


        [NotMapped]
        public string StatementType { get; set; }
    }
    public class BundleItemVW
    {
        public int Id { get; set; }
        public int BundleId { get; set; }
        public int ProductId { get; set; }

        public string Title { get; set; } = string.Empty;
        public double Price { get; set; }
        public double DiscountRate { get; set; }
        public int Quantity { get; set; }
        public string ImageSrc { get; set; } = string.Empty;

        [NotMapped]
        public bool Checked { get; set; } = true;
    }
}
