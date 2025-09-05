using Core.Helpers;
using Entities.Enums;
using Entities.Models;
using Entities.ViewModels;

namespace Services.Interfaces
{
    public interface IspCategory
    {
        Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams);
        Task<IAsyncEnumerable<CategoriesVW>> GetAllWithSubCategories(string statementType);
        Task<IAsyncEnumerable<T>> GetAll<T>();
        Task<IAsyncEnumerable<T>> GetUsedCategories<T>();
        Task<OperationResult> SeedCategories(bool deleteAllEverytime);
    }
    public interface IspCategoryProductRelation
    {
        Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams);
        Task<IAsyncEnumerable<T>> GetAll<T>();
        Task<T> GetByIdAsync<T>(int id);
    }
}