using Entities.ViewModels;
using Entities.ViewModels.Products;

namespace Entities.EmailTemplateModels
{
    public class InvoiceModel : BaseModel
    {

        public string CustomerId { get; set; }
        public string Phone { get; set; }
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public string OrderCode { get; set; }
        public string OrderDate { get; set; }
        public string Address { get; set; }
        public string Country { get; set; }
        public string Town { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }
        public string Currency { get; set; }
        public double CurrencyPrice { get; set; }
        public string TotalCost { get; set; }
        public string TotalAmount { get; set; }
        public string TotalDiscount { get; set; }

        public string PaymentMethod { get; set; }
        public string ShippingType { get; set; }
        public string Notes { get; set; }

        public IEnumerable<OrderedProduct> OrderedProduct { get; set; }

}

}
