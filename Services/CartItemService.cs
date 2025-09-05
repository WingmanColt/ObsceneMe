using Entities.Models;
using HireMe.Data.Repository;
using Microsoft.EntityFrameworkCore;
using Services.Interfaces;

namespace Services
{
    public class CartItemService : ICartItemService
    {
        private readonly IRepository<Order> _orderRepository; 
        private readonly IRepository<Review> _reviewRepository;

        public CartItemService(
            IRepository<Order> orderRepository,
            IRepository<Review> reviewRepository)
        {
            _orderRepository = orderRepository;
            _reviewRepository = reviewRepository;
        }

        public async Task<bool> CheckOrderCode(string code, int? productId)
        {
            if (code.Contains('@'))
            {
                // If the code contains '@', check against the Email property.
                return await _orderRepository.Set().AnyAsync(p => p.UserId == code && p.ProductId == productId);
            }
            else
            {
                // Otherwise, check against the Code property.
                return await _orderRepository.Set().AnyAsync(p => p.Code == code && p.ProductId == productId);
            }
        }

        public async Task<bool> IsReviewExists(string code, int? productId)
        {
            if (code.Contains('@'))
            {
                // If the code contains '@', check against the Email property.
                return await _reviewRepository.Set().AnyAsync(p => p.Email == code && p.ProductId == productId);
            }
            else
            {
                // Otherwise, check against the OrderCode property.
                return await _reviewRepository.Set().AnyAsync(p => p.OrderCode == code && p.ProductId == productId);
            }
        }


    }
}