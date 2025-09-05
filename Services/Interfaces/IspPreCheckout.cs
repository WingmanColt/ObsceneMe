using Core.Helpers;
using Entities.Enums;

namespace Services.Interfaces
{
    public interface IspPreCheckout
    {
        Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams);
        Task<IAsyncEnumerable<T>> GetAll<T>();
        Task<T> GetByIdAsync<T>(int id);
    }
}