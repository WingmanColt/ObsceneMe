using Core.Helpers;
using Entities.Enums;
using Entities.Models;

namespace Services.Interfaces
{
    public interface IspSubCategory
    {
        Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams);
        Task<IAsyncEnumerable<T>> GetByTitle<T>(string title);
        Task<IAsyncEnumerable<T>> GetAll<T>();
        Task<IAsyncEnumerable<T>> GetAllByCategory<T>(string shortName);
        Task<OperationResult> SeedCategories(bool deleteAllEverytime);
    }
    public interface IspSubCategoryProductRelation
    {
        Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams);
        Task<IAsyncEnumerable<T>> GetAll<T>();
        Task<T> GetByIdAsync<T>(int id);
    }
}