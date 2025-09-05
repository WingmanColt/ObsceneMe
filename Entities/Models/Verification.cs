using Ardalis.GuardClauses;
using Entities.Input;

namespace Entities.Models
{
    public class Verification
    {
        public int Id { get; set; }

        public string Code { get; set; }
        public string Email { get; set; }

        public string CreatedOn { get; set; }
        public string ExpiredOn { get; set; }

        public void Update(VerificationInput Input)
        {
            Guard.Against.NullOrEmpty(Input.Email, nameof(Input.Email));
            Email = Input.Email;

            Guard.Against.NullOrEmpty(Input.Code, nameof(Input.Code));
            Code = Input.Code;

            CreatedOn = DateTime.Now.ToString("dd/MM/yyyy HH:mm");
            ExpiredOn = DateTime.Now.AddDays(30).ToString("dd/MM/yyyy HH:mm");
        }
    }
}
