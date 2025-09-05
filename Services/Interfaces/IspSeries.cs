using Core.Helpers;
using Entities.Enums;
using Entities.Models;
using Models;

namespace Services.Interfaces
{
    public interface IspSeries
    {
        Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams);
        Task<IAsyncEnumerable<T>> GetAll<T>();
        Task<IAsyncEnumerable<T>> GetAllUsed<T>();
        Task<OperationResult> Seed(bool deleteAllEverytime);
    }
    public interface IspSeriesProductRelation
    {
        Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams);
        Task<IAsyncEnumerable<T>> GetAll<T>();
        Task<T> GetByIdAsync<T>(int id);
    }
}