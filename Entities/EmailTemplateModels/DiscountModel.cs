
namespace Entities.EmailTemplateModels
{
    public class DiscountModel : BaseModel
    {
        public string Code { get; set; }
        public string ExpirationDate { get; set; }
        public string CustomerName { get; set; }
        public int CustomerId { get; set; }
        public string Banner { get; set; }
    }
}
