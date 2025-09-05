using Core.Helpers;
using Entities.Models;

namespace Services.Interfaces
{
    public interface ICartItemService
    {
        Task<bool> CheckOrderCode(string code, int? productId);
        Task<bool> IsReviewExists(string code, int? productId);
    }
}