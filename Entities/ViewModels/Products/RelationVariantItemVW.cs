using Entities.Models;

namespace Entities.ViewModels.Products
{
   public class RelationVariantItemVW
    {
        public int Id { get; set; }
      //  public int ProductId { get; set; }
        public int VariantId { get; set; }
        public int VariantItemId { get; set; }

        public IEnumerable<Entities.Models.Variants> Variant { get; set; }
        public IEnumerable<VariantItem> VariantItem { get; set; }
    }
}
