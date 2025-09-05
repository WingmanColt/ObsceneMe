using Ardalis.GuardClauses;
using Entities.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models
{
    public class Checkout
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string Address { get; set; }
        public string Country { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }

        public string UserId { get; set; }

        public bool IsGuest { get; set; }
        public bool PickupAtHome { get; set; }

        public ApproveType ApproveType { get; set; }
        public PaymentCondition PaymentCondition { get; set; }

        public string CreatedOn { get; set; }
        public string ExpiredOn { get; set; }

        [NotMapped]
        public string StatementType { get; set; }


        public void Update(CheckoutInput input)
        {
                Guard.Against.NullOrEmpty(input.FullName, nameof(input.FullName), "Please type firstname.");
                FullName = input.FullName;

                Guard.Against.NullOrEmpty(input.Email, nameof(input.Email), "Please type email.");
                Email = input.Email;

                Guard.Against.NullOrEmpty(input.PhoneNumber, nameof(input.PhoneNumber), "Please type phone.");
                PhoneNumber = input.PhoneNumber;

                // Guard.Against.NullOrEmpty(input.Adress, nameof(input.Adress), "Please type adress.");
                Address = input.Address;

                //  Guard.Against.NullOrEmpty(input.Country, nameof(input.Country), "Please type country.");
                Country = input.Country;

                //  Guard.Against.NullOrEmpty(input.Town, nameof(input.Town), "Please type town.");
                City = input.City;

                //   Guard.Against.NullOrEmpty(input.State, nameof(input.State), "Please type state.");
                State = input.State;

                Guard.Against.NullOrEmpty(input.PostalCode, nameof(input.PostalCode), "Please type valid postal code.");
                PostalCode = input.PostalCode;

                IsGuest = input.IsGuest;
                PickupAtHome = input.PickupAtHome;

                ApproveType = input.ApproveType;
                PaymentCondition = input.PaymentCondition;

                // if (!String.IsNullOrEmpty(userId))
                UserId = input.UserId;

                CreatedOn = DateTime.Now.ToString("dd/MM/yyyy");
                ExpiredOn = DateTime.Now.AddDays(30).ToString("dd/MM/yyyy");
            }
        }
    }
