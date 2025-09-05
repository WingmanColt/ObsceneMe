using Core.Helpers;
using Entities.Enums;
using Entities.Models;
using Entities.ViewModels.Products;

namespace Services.Interfaces
{
    public interface IBundleService
    {
        Task<Bundle> GetByIdAsync(int id);
        Task<OperationResult> SaveBundleAsync(int mainProductId, BundleInput input);
        Task<OperationResult> DeleteBundleAsync(int id);
    }
}