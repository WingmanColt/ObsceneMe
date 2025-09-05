using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.ViewModels
{
    public class GroupedVariant
    {
        public int Id { get; set; } 
        public string Title { get; set; }
        public string Icon { get; set; }

        [NotMapped]
        public virtual IEnumerable<GroupedVariantItem> VariantItems { get; set; } = new List<GroupedVariantItem>();
    }

    public class GroupedVariantItem
    {
        public int Id { get; set; } 
        public int vId { get; set; } // This is VariantId
        public int VVIRelationId { get; set; } // This is relation from variant and variantItem relations table
      
        public string Value { get; set; }
        public string Image { get; set; }

        [NotMapped]
        public bool IsSelected { get; set; }

    }
}
