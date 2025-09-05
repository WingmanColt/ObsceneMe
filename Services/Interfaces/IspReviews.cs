using Core.Helpers;
using Entities.Enums;

namespace Services.Interfaces
{
    public interface IspReviews
    {
        Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams);
        Task<OperationResult> AddRatingToProduct(int? ProductId, int rating);
        Task<IAsyncEnumerable<T>> GetAllByProductId<T>(int? productId);
        Task<int> GetAllCountBy(int? productId, bool forSupport);
        Task<int> GetAllCountByStar(int? productId, int? productStars);
        Task<IAsyncEnumerable<T>> GetAllForSupport<T>(bool forSupport);
        Task<IAsyncEnumerable<T>> GetReviewCards<T>();
        Task<IAsyncEnumerable<T>> GetAllReviews<T>();

    }
}