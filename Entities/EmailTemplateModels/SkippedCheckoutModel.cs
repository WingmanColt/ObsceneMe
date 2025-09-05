
namespace Entities.EmailTemplateModels
{
    public class SkippedCheckoutModel : BaseModel
    {
        public string CustomerName { get; set; }
        public int CustomerId { get; set; }
        public string Banner { get; set; }
    }
}
