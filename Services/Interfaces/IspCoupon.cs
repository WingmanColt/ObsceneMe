using Core.Helpers;
using Entities.Enums;

namespace Services.Interfaces
{
    public interface IspCoupon
    {
        Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams);
        Task<IAsyncEnumerable<T>> GetAll<T>();
        Task<T> GetByCodeAsync<T>(string code);
        Task<OperationResult> SeedCoupons();
    }

}