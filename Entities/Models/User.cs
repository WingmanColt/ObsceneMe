using Entities.Enums;
using Microsoft.AspNetCore.Identity;

namespace Models
{
    public class User : IdentityUser
    {
        public string FullName { get; set; }

        [PersonalData]
        public string FirstName { get; set; }

        [PersonalData]
        public string LastName { get; set; }

        [PersonalData]
        public string PictureName { get; set; }


        public string Country { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string PostalCode { get; set; }
        public string State { get; set; }


        [PersonalData]
        public Roles Role { get; set; }
        public DateTime ActivityOn { get; set; }


        // Settings
        public bool EmailNotifyEnable { get; set; } = true;
        public bool SignInSocialEnable { get; set; } = true;

        public bool isExternal { get; set; }

        public bool IsAffiliate { get; set; }
        public int? AffiliateUserId { get; set; }
    }
}