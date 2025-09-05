using Core.Helpers;
using Entities.Enums;
using Entities.Models;
using Entities.ViewModels;
using Models;
using Services.Enums;

namespace Services.Interfaces
{
    public interface IspVariants
    {
        Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, VariantActionEnum variantActionEnum, bool autoFindParams);
        Task<IAsyncEnumerable<T>> GetAll<T>(VariantActionEnum variantActionEnum, bool withoutProductId);
        Task<OperationResult> CreateVariantsAsync(IEnumerable<GroupedVariant> entities, int productId);
        Task<OperationResult> SeedAllVariant();
    }
}