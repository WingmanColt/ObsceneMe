using Entities.Models;
using Entities.ViewModels.Products;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.ViewModels
{
    public class InvoiceVW
    {

        public string FullName { get; set; }
        public string Note { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Adress { get; set; }
        public string Country { get; set; }
        public string Town { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }

        public bool PickupAtHome { get; set; }
        public int? Quantity { get; set; }
        public string Code { get; set; }
        public string CreatedOn { get; set; }

        public string ProductTitle { get; set; }
        public string Currency { get; set; }
        public double CurrencyPrice { get; set; }
        public string PaymentType { get; set; }

        public double? CostPerItem { get; set; }
        public double? DiscountPerItem { get; set; }
        public double? Discount { get; set; }
        public double? Cost { get; set; }

        public List<ProductVW> Products { get; set; }
    }
}
