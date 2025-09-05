using Core.Helpers;
using Entities.Enums;

namespace Services.Interfaces
{
    public interface IspPages
    {
        Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams);
        Task<IAsyncEnumerable<T>> GetAll<T>(object parameters);
        Task<T> GetByIdAsync<T>(int id);
        Task<OperationResult> SeedPages();
    }
}