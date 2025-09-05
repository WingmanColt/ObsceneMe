
namespace Entities.EmailModels
{
  
    public class ContactAttributes
    {
        public string CustomerId { get; set; }
        public string Phone { get; set; }
        public string WebName { get; set; }
        public string WebUrl { get; set; }
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public string OrderCode { get; set; }
        public string OrderDate { get; set; }
        public string PaymentMethod { get; set; }
        public string Items { get; set; }
        public string Address { get; set; }
        public string Country { get; set; }
        public string Town { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }
        public string Currency { get; set; }
        public string DeliveryDate { get; set; }
        public string TotalCost { get; set; }
        public string TotalAmount { get; set; }
        public string TotalDiscount { get; set; }
        public string OurEmail { get; set; }
        public string Year { get; set; }
        public string Tax { get; set; }

        public string Facebook { get; set; }
        public string Instagram { get; set; }
        public string Youtube { get; set; }
        public string Tiktok { get; set; }
        public string SupportEmail { get; set; }
        public string BannerImage { get; set; }
        public string VerificationCode { get; set;}

    }

    public class ItemDetails
    {
        public string Name { get; set; }
        public int Quantity { get; set; }
        public double Price { get; set; }
    }
}
