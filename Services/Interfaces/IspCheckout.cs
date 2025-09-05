using Core.Helpers;
using Entities.Enums;

namespace Services.Interfaces
{
    public interface IspCheckout
    {
        Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams);
        Task<T> GetByIdAsync<T>(int id);
        Task<IAsyncEnumerable<T>> GetAllAsync<T>();
        Task<T> CheckExistingUserAsync<T>(string email, string phoneNumber, string address);
    }
}