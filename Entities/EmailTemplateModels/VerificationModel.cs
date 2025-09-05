
namespace Entities.EmailTemplateModels
{
    public class VerificationModel : BaseModel
    {
        public string Code { get; set; }
        public string Banner { get; set; }
    }
}
