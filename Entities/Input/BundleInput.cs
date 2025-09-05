using Entities.Enums;
using Entities.ViewModels.Products;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models
{
    public class BundleInput
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int MainProductId { get; set; } // the main product linked to bundle

        public bool IsActive { get; set; }

        public Status Status { get; set; }
        public BundleType Type { get; set; }

        public virtual ICollection<BundleItem> BundleItems { get; set; }

        [NotMapped]
        public string StatementType { get; set; }
    }

}
