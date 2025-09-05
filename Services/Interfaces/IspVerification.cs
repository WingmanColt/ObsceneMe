using Core.Helpers;
using Entities.Enums;
using Entities.Models;
using Entities.ViewModels.Accounts;

namespace Services.Interfaces
{
    public interface IspVerification {

        Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams);
        Task<IAsyncEnumerable<T>> GetAll<T>();
        Task<T> GetByCodeAsync<T>(string code);
        Task<T> GetByEmailAndCodeAsync<T>(Verification model);
        Task<int> GetCountByEmailAsync(string email);
    }

}