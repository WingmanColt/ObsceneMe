using Core.Helpers;
using Entities.Enums;
using Entities.Models;

namespace Services.Interfaces
{
    public interface IspOccasion
    {
        Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams);
        Task<IAsyncEnumerable<T>> GetAll<T>();
        Task<IAsyncEnumerable<T>> GetAllUsed<T>();
        Task<OperationResult> SeedOccasions(bool deleteAllEverytime);
    }
    public interface IspOccasionProductRelation
    {
        Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams);
        Task<IAsyncEnumerable<T>> GetAll<T>();
        Task<T> GetByIdAsync<T>(int id);
    }
}