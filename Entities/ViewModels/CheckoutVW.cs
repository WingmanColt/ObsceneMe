using Entities.Enums;

namespace Entities.ViewModels
{
    public class CheckoutVW
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Note { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string Address { get; set; }
        public string Country { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }

        public bool IsGuest { get; set; }
        public bool PickupAtHome { get; set; }
        public string UserId { get; set; }

        public ApproveType ApproveType { get; set; }
        public string CreatedOn { get; set; }
        public string ExpiredOn { get; set; }

    }
}
