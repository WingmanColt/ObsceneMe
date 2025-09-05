using Entities.Enums;
using Entities.Models;
using Entities.ViewModels.Products;

namespace Entities.ViewModels
{
    public class OrdersHistoryVW
    {
        public ICollection<OrderHistoryVW> OrderHistoryList { get; set; }
    }

     public class OrderHistoryVW
    {
        public int Id { get; set; }
        public string OrderCode { get; set; }
        public string CreatedOn { get; set; }
        public string PhoneNumber { get; set; }

        public string Country { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }
        public string LogoSrc { get; set; }

        public double Cost { get; set; }
        public double Discount { get; set; }
        public double Shipping { get; set; }
        public int? OrderedQuantity { get; set; }

        public ApproveType ApproveType { get; set; }
        public CurrencyVW Currency { get; set; }
        public List<ProductVW> Products { get; set; }


    }
}
