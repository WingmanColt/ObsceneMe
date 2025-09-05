
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models
{

    // Relation between product and (created relation between variant and variant item)
    public class VariantProductRelation
    {
        public int Id { get; set; }

        public int ProductId { get; set; }
        public int VariantAndVariantItemRelationId { get; set; }

        public void Update(VariantProductRelationInput input)
        {
            VariantAndVariantItemRelationId = input.VariantAndVariantItemRelationId;
            ProductId = input.ProductId;
        }
    }


    // Relation between variant and variantItem created at the very begining point.
    public class VariantAndVariantItemRelation
    {
        public int Id { get; set; }

        public int? VariantId { get; set; }
        public int? VariantItemId { get; set; }

        public void Update(VariantAndVariantItemRelationInput input)
        {
            VariantId = input.VariantId;
            VariantItemId = input.VariantItemId;
        }
    }


    public class Variants
    {
        public int Id { get; set; }
        public int vId { get; set; }

        public string Title { get; set; }
        public string Icon { get; set; }


        [NotMapped]
        public virtual IEnumerable<VariantItemInput> VariantItems { get; set; }

        public void Update(VariantsInput input)
        {
            vId = input.vId;
            Title = input.Title;
            Icon = input.Icon;
            VariantItems = input.VariantItems;
        }
    }

    public class VariantItem
    {
        public int Id { get; set; }
        public int vId { get; set; }

        public string Value { get; set; }
        public string Image { get; set; }

        public void Update(VariantItemInput input)
        {
            vId = input.vId;
            Value = input.Value;
            Image = input.Image;
        }
    }
}
