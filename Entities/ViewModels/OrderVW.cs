
using Entities.Enums;
using Entities.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.ViewModels
{

    public class OrderCreateVW
    {
        public bool isCreated { get; set; }
        public string Message { get; set; }
        public string Token { get; set; }
        public string Code { get; set; }
    }

    public class OrderVW : BaseViewModel
    {
        public int? CheckoutId { get; set; }
        public int ProductId { get; set; }
        public int? Quantity { get; set; }
        public int? WillEarnRewardPoints { get; set; }
        public double? Tax { get; set; }
        public bool IsPayed { get; set; }

        public string CreatedOn { get; set; }
        public string ExpiredOn { get; set; }

        public string PaymentType { get; set; }
        public string Currency { get; set; }

        public double CostPerItem { get; set; }
        public double DiscountPerItem { get; set; }


        // Fast Order
        public string Phone { get; set; }
        public string ProductTitle { get; set; }

        public double TotalCost { get; set; }
        public double TotalDiscount { get; set; }

        [NotMapped]
        public string Token { get; set; }
        public string Code { get; set; }
        public string ReferedByCode { get; set; }
    }

    public class FullOrderVW
    {
        public string Phone { get; set; }
        public string CreatedOn { get; set; }


        public int? Quantity { get; set; }
        public string ProductTitle { get; set; }
        public double TotalCost { get; set; }
        public string PaymentType { get; set; }
        public string Currency { get; set; }

        public string FullName { get; set; }
        public string Email { get; set; }
        public string Address { get; set; }
        public string Country { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }
        public string Note { get; set; }
        public bool PickupAtHome { get; set; }

    }

    public class OrderWithTotalCountVW
    {
        public IAsyncEnumerable<Order> Items { get; set; }
        public int TotalCount { get; set; }
    }
 }
