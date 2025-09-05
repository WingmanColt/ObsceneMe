
namespace Entities.ViewModels.Accounts
{
    public class VerificationViewModel
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Email { get; set; }

        public string CreatedOn { get; set; }
        public string ExpiredOn { get; set; }

        public int EmailUserCount { get; set; }
    }
}
