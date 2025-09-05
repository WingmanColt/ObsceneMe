
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models
{
    public class VariantProductRelationInput
    {
        public int Id { get; set; }

        public int ProductId { get; set; }
        public int VariantAndVariantItemRelationId { get; set; }
    }
    public class VariantAndVariantItemRelationInput
    {
        public int Id { get; set; }

        public int VariantId { get; set; }
        public int VariantItemId { get; set; }
    }
    public class VariantsInput
    {
        public int Id { get; set; }
        public int vId { get; set; }
        public string Icon { get; set; }
        public string Title { get; set; }

        [NotMapped]
        public virtual IEnumerable<VariantItemInput> VariantItems { get; set; }

        //    public int? VariantItemId { get; set; }
    }
    public class VariantsSeedModel
    {
        public int Id { get; set; }
        public int vId { get; set; }
        public string Icon { get; set; }
        public string Title { get; set; }

        [NotMapped]
        public virtual ICollection<VariantItemInput> VariantItems { get; set; }

        //    public int? VariantItemId { get; set; }
    }
    public class VariantItemInput
    {
        public int Id { get; set; }
        public int vId { get; set; }
        public int VVIRelationId { get; set; }

        public string Value { get; set; }
        public string Image { get; set; }



       // public int VariantId { get; set; }
    }
}
