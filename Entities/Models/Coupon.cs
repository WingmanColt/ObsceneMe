using Ardalis.GuardClauses;
using Entities.Enums;
using Entities.Input;

namespace Entities.Models
{
    public class Coupon
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Code { get; set; }
        public string SpecificUser { get; set; }
        public double Discount { get; set; }
        public CouponState CouponState { get; set; }
         
        public string CreatedOn { get; set; }
        public string ExpiredOn { get; set; }

        public void Update(CouponInput Input)
        {
            Guard.Against.NullOrEmpty(Input.Title, nameof(Input.Title));
            Title = Input.Title;

            Guard.Against.NullOrEmpty(Input.Code, nameof(Input.Code));
            Code = Input.Code;

            Guard.Against.NegativeOrZero(Input.Discount, nameof(Input.Discount));
            Discount = Input.Discount;

            SpecificUser = Input.SpecificUser;
            CouponState = Input.CouponState;

            CreatedOn = DateTime.Now.ToString("dd/MM/yyyy");
            ExpiredOn = DateTime.Now.AddDays(Input.ExpiredOn).ToString("dd/MM/yyyy");
        }
    }


}
