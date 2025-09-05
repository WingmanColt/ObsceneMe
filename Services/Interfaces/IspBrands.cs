using Core.Helpers;
using Entities.Enums;
using Entities.Models;
using Entities.ViewModels.Products;
using Models;

namespace Services.Interfaces
{
    public interface IspBrands
    {
        Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams);
        Task<IAsyncEnumerable<T>> GetAll<T>();
        Task<IAsyncEnumerable<BrandVW>> GetAllUsed();
        Task<OperationResult> SeedBrands(bool deleteAllEverytime);
    }
    public interface IspBrandsProductRelation
    {
        Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams);
        Task<IAsyncEnumerable<T>> GetAll<T>();
        Task<T> GetByIdAsync<T>(int id);
    }
}