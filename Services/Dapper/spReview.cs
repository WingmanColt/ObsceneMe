using Core.Helpers;
using Dapper;
using Entities.Enums;
using Entities.Models;
using Microsoft.Extensions.Configuration;
using Services.Dapper;
using Services.Interfaces;

namespace Services
{
    public class spReviews : MainService, IspReviews
    {
        private string StoreName = "spReviews";
        private string ProductsStoreName = "spProduct";

        const int maxRating = 5;

        public spReviews(IConfiguration config, ErrorLoggingService errorLogger) : base(config, errorLogger) { }
        public async Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams)
        {
            return await CRUD<T>(StoreName, parameters, action, AutoFindParams);
        }
        public async Task<IAsyncEnumerable<T>> GetAllByProductId<T>(int? productId)
        {
            return await GetAll<T>(StoreName, new { ProductId = productId, StatementType = "GetAllByProductId" });
        }
        public async Task<IAsyncEnumerable<T>> GetAllForSupport<T>(bool forSupport)
        {
            return await GetAll<T>(StoreName, new { SendToSupport = forSupport, StatementType = "GetAllForSupport" });
        }
        public async Task<IAsyncEnumerable<T>> GetReviewCards<T>()
        {
            return await GetAll<T>(StoreName, new { StatementType = "getCards" });
        }
        public async Task<IAsyncEnumerable<T>> GetAllReviews<T>()
        {
            return await GetAll<T>(StoreName, new { StatementType = "GetAll" });
        }
        public async Task<int> GetAllCountBy(int? productId, bool forSupport)
        {
            return await GetCountBy(StoreName, new { ProductId = productId, SendToSupport = forSupport, StatementType = "GetAllCountBy" });
        }

        public async Task<int> GetAllCountByStar(int? productId, int? productStars)
        {
            return await GetCountBy(StoreName, new { ProductId = productId, ProductStars = productStars, StatementType = "GetAllCountByStar" });
        }

        public async Task<OperationResult> AddRatingToProduct(int? ProductId, int rating)
        {
            try
            {
                if (ProductId == null)
                    return OperationResult.FailureResult("Error occurred on rating update. Variables are negative or null.");

                // Retrieve product from the database
                var product = await GetByAsync<Product>(ProductsStoreName, new { Id = ProductId, StatementType = "GetByIdRatings" });
                if (product is null)
                    return OperationResult.FailureResult("Error occurred on rating update. Product is null.");

                // Update product rating
                product.RatingVotes += 1; // Assuming each rating is counted as one vote
                double newRating = ((product.Rating * product.RatingVotes) + rating) / (product.RatingVotes + 1);
                product.Rating = Math.Round(Math.Min(Math.Max(newRating, 0), 5), 2);

                // Prepare parameters for database update
                var param = new DynamicParameters();
                param.Add("@Id", ProductId);
                param.Add("@RatingVotes", product.RatingVotes);
                param.Add("@Rating", product.Rating);

                // Update rating in the database
                return await CRUDPost(ProductsStoreName, param, ActionEnum.AddRating);
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(AddRatingToProduct), nameof(spReviews));
                return OperationResult.FailureResult("Error occurred on rating update.");
            }
        }



    }

}
