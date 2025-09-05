using Core.Helpers;
using Entities.Enums;
using Entities.Models;
using Entities.ViewModels;

namespace Services.Interfaces
{
    public interface IspOrder
    {
       
        Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams);
        Task<IAsyncEnumerable<T>> GetAllAsync<T>();
        Task<IAsyncEnumerable<T>> GetAllByCheckoutAsync<T>(int checkoutId);
        Task<OrderWithTotalCountVW> GetAllAsyncWithCount(int offset, int pageSize);
        Task<T> GetByCodeAsync<T>(string code);
        Task<T> GetByIdAsync<T>(int id);
        Task<IAsyncEnumerable<T>> GetByUserIdAsync<T>(string userId);
        Task<int> GetCountBy(int? checkoutId, int? productId);
        Task<OperationResult> UpdateIsPayed(string code);
        Task<bool> CheckByPhone(string phone, string productTitle);
        Task<bool> CheckExistingOrderAsync(int checkoutId, int productId, int quantity, string createdOn, double totalCost);
    }
}