using Entities.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models
{
    public class Images
    {
        public int Id { get; set; }
        public string Src { get; set; }
        public bool isExternal { get; set; }
        public int? VariantId { get; set; }
        public int ProductId { get; set; }
        public ImageType ImageType { get; set; }

        [NotMapped]
        public CRUD Operation { get; set; }

    }
}
