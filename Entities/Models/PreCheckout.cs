using Ardalis.GuardClauses;
using Entities.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models
{
    public class PreCheckout
    {
        public int Id { get; set; }

        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string PostalCode { get; set; }

        public PaymentCondition PaymentCondition { get; set; }

        public string CreatedOn { get; set; }
        public string ExpiredOn { get; set; }

        [NotMapped]
        public string StatementType { get; set; }


        public void Update(PreCheckoutInput input)
        {
            Guard.Against.NullOrEmpty(input.FullName, nameof(input.FullName), "Please type Full Name.");
            FullName = input.FullName;

            Guard.Against.NullOrEmpty(input.Email, nameof(input.Email), "Please type Email.");
            Email = input.Email;

            Guard.Against.NullOrEmpty(input.PhoneNumber, nameof(input.PhoneNumber), "Please type Phone.");
            PhoneNumber = input.PhoneNumber;

            Guard.Against.NullOrEmpty(input.PostalCode, nameof(input.PostalCode), "Please type valid Postal code.");
            PostalCode = input.PostalCode;

            PaymentCondition = input.PaymentCondition;

            CreatedOn = DateTime.Now.ToString("dd/MM/yyyy");
            ExpiredOn = DateTime.Now.AddDays(30).ToString("dd/MM/yyyy");
        }
    }
}
