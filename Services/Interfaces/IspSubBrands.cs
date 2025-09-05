using Core.Helpers;
using Entities.Enums;
using Entities.Models;
using Models;

namespace Services.Interfaces
{
    public interface IspSubBrands
    {
        Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams);
        Task<IAsyncEnumerable<T>> GetAll<T>();
        Task<IAsyncEnumerable<T>> GetAllUsed<T>();
        Task<OperationResult> SeedSubBrands(bool deleteAllEverytime);
    }
    public interface IspSubBrandsProductRelation
    {
        Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams);
        Task<IAsyncEnumerable<T>> GetAll<T>();
        Task<T> GetByIdAsync<T>(int id);
    }
}