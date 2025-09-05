using Core.Helpers;
using eCommerce.Utility;
using Entities.Enums;
using Entities.Models;
using Entities.ViewModels.Products;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace eCommerce.Controllers 
{ 
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewController : ControllerBase
    {
        private readonly MemoryCacheWithKeys _memoryCache;
        private readonly IspReviews _spReviewService;
        private readonly ICartItemService _cartItemService;

        // Cache Keys
        private const string ReviewsCacheKey = "ReviewsCacheKey_{0}_{1}";
        private const string ReviewCountCacheKey = "ReviewCountCacheKey_{0}_{1}";
        private const string ProductReviewCardsCacheKey = "ProductReviewCardsCacheKey";

        private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(1); // 30 days

        private const string ItemNotFoundMessage = "The review is not found.";
        private const string WrongOrderCodeMessage = "Wrong order code or email address. Please try again.";
        private const string ReviewExistsMessage = "Thank you for feedback but you already voted for this product.";

        public ReviewController(
            MemoryCacheWithKeys memoryCache,
            IspReviews spReviewService,
            ICartItemService cartItemService)
        {
            _spReviewService = spReviewService;
            _cartItemService = cartItemService;
            _memoryCache = memoryCache;
        }

        private string GetReviewCacheKey(int? productId, bool sendToSupport) =>
            string.Format(ReviewsCacheKey, productId, sendToSupport);

        private string GetReviewCountCacheKey(int? productId, bool sendToSupport) =>
            string.Format(ReviewCountCacheKey, productId, sendToSupport);

        [HttpPost]
        [AllowAnonymous]
        [Route("get-review")]
        public async Task<IActionResult> Details(Review review)
        {
            try
            {
                var cacheKey = GetReviewCacheKey(review.ProductId, review.sendToSupport);
                return await GetCachedDataAsync(cacheKey, async () =>
                    review.sendToSupport
                        ? await _spReviewService.GetAllForSupport<Review>(review.sendToSupport)
                        : await _spReviewService.GetAllByProductId<Review>(review.ProductId)
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching reviews: {ex.Message}");
            }
        }

        [HttpPost]
        [AllowAnonymous]
        [Route("get-review-count")]
        public async Task<IActionResult> Count(Review review)
        {
            try
            {
                var cacheKey = GetReviewCountCacheKey(review.ProductId, review.sendToSupport);
                return await GetCachedDataAsync(cacheKey, async () =>
                    await _spReviewService.GetAllCountBy(review.ProductId, review.sendToSupport)
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching review count: {ex.Message}");
            }
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("get-review-cards")]
        public async Task<IActionResult> GetCards()
        {
          //  var res = await GetCachedDataAsync(ProductReviewCardsCacheKey, async () =>
             //   await _spReviewService.GetReviewCards<ProductReviewCard>());

            var res = await _spReviewService.GetReviewCards<ProductReviewCard>();
            return Ok(res);
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("get-all-reviews")]
        public async Task<IActionResult> GetAllReviews()
        {
            var res = await _spReviewService.GetAllReviews<ProductReviewCard>();
            return Ok(res);
        }

        [HttpPost]
        [Route("sent-message-to-support")]
        public async Task<IActionResult> SendToSupport([FromBody] ReviewInput input)
        {
            try
            {
                var entity = await _spReviewService.CRUD<Review>(input, ActionEnum.Create, true);
                if (entity.Success)
                {
                    return Ok(entity);
                }
                return Ok(entity.FailureMessage);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error adding review: {ex.Message}");
            }
        }

        [HttpPost]
        [Route("add-review")]
        public async Task<IActionResult> Create([FromBody] ReviewInput input)
         {
            if (input.ProductStars is null)
                return Ok(OperationResult.FailureResult("Please take a moment to rate your experience by selecting 1 to 5 stars below."));

            if (!(await _cartItemService.CheckOrderCode(input.OrderCode, input.ProductId)))
                return Ok(OperationResult.FailureResult(WrongOrderCodeMessage));

            if ((await _cartItemService.IsReviewExists(input.OrderCode, input.ProductId)))
                return Ok(OperationResult.FailureResult(ReviewExistsMessage));

            /*
            int reqId = int.Parse(StringHelper.GetAfter(input.OrderCode, '/', false));

            if (input.ProductId != reqId)
                return Ok(OperationResult.FailureResult("The used code/email is not for current product!"));
            */
            try
            {
                input.Src = await HandleImageUpload(input.Src);

                var entity = await _spReviewService.CRUD<Review>(input, ActionEnum.Create, true);
                if (entity.Success)
                {
                    await _spReviewService.AddRatingToProduct(input.ProductId, (int)input.ProductStars);
                    await InvalidateAllCaches();
                    return Ok(entity);
                }
                return Ok(entity.FailureMessage);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error adding review: {ex.Message}");
            }
        }

        [HttpPost]
        [Route("delete-review")]
        public async Task<IActionResult> Delete(Review review)
        {
            try
            {
                var entity = await _spReviewService.CRUD<Review>(new { ProductId = review.ProductId, Email = review.Email }, ActionEnum.Delete, false);
                if (entity is null)
                    return NotFound(ItemNotFoundMessage);

                await InvalidateAllCaches();
                return Ok(entity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting review: {ex.Message}");
            }
        }

        // This method generates image in two paths for development and production env. in assets/images/reviews and wwwroot/assets/images/reviews
        public async Task<string> HandleImageUpload(string imageSource)
        {
            if (string.IsNullOrWhiteSpace(imageSource))
                return null;

            try
            {
                if (imageSource.StartsWith("https", StringComparison.OrdinalIgnoreCase))
                {
                    return imageSource;
                }
                else
                {
                    // Base64 image
                    var base64Data = ExtractBase64Data(imageSource);
                    var fileExtension = DetermineFileExtension(imageSource);

                    // Development Path
                    var devFolder = Path.Combine(Directory.GetCurrentDirectory(), "ClientApp\\src\\assets\\images\\reviews");
                    var devUniqueFileName = Guid.NewGuid().ToString() + fileExtension;
                    var devFilePath = Path.Combine(devFolder, devUniqueFileName);

                    // Production Path
                    var prodFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\assets\\images\\reviews");
                    var prodUniqueFileName = Guid.NewGuid().ToString() + fileExtension;
                    var prodFilePath = Path.Combine(prodFolder, prodUniqueFileName);

                    // Ensure folders exist
                    if (!Directory.Exists(devFolder))
                        Directory.CreateDirectory(devFolder);

                    if (!Directory.Exists(prodFolder))
                        Directory.CreateDirectory(prodFolder);

                    // Convert Base64 to bytes
                    var fileBytes = Convert.FromBase64String(base64Data);

                    // Write to both paths
                    await System.IO.File.WriteAllBytesAsync(devFilePath, fileBytes);
                    await System.IO.File.WriteAllBytesAsync(prodFilePath, fileBytes);

                    // Return production file path (or modify as needed)
                    return prodUniqueFileName;
                }
            }
            catch (Exception ex)
            {
                // Log exception if necessary
                return null;
            }
        }




        // Helper method to invalidate all cache entries related to reviews

        private async Task InvalidateAllCaches(int? productId = null)
        {
            var prefix = productId.HasValue ? $"ReviewsCacheKey_{productId.Value}_" : "ReviewsCacheKey_";
            await _memoryCache.ClearByPrefixAsync(prefix);

            var prefixCount = productId.HasValue ? $"ReviewCountCacheKey_{productId.Value}_" : "ReviewCountCacheKey_";
            await _memoryCache.ClearByPrefixAsync(prefixCount);

            _memoryCache.Remove(ProductReviewCardsCacheKey);

        }

        private async Task<IActionResult> GetCachedDataAsync<T>(string cacheKey, Func<Task<T>> dataFetchFunc)
        {
            // Try to get the data from the cache
            if (!_memoryCache.TryGetValue(cacheKey, out T cachedResult))
            {
                // If not found in cache, fetch it from the service
                cachedResult = await dataFetchFunc();

                // Check if the result is null
                if (cachedResult == null)
                {
                    return NotFound("Data not found.");
                }

                // Set the fetched result in the cache
                _memoryCache.Set(cacheKey, cachedResult, CacheDuration);
            }

            // Return the cached or fetched data
            return Ok(cachedResult);
        }
        private static string ExtractBase64Data(string base64String)
        {
            return base64String.Contains("base64,")
                ? base64String.Split(new[] { "base64," }, StringSplitOptions.RemoveEmptyEntries)[1]
                : base64String;
        }

        private static string DetermineFileExtension(string base64String)
        {
            var mimeToExtensionMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                { "data:image/jpg", ".jpg" },
                { "data:image/jpeg", ".jpeg" },
                { "data:image/png", ".png" },
                { "data:image/gif", ".gif" },
                { "data:image/webp", ".webp" },
                { "data:image/avif", ".avif" }
            };

            foreach (var mime in mimeToExtensionMap.Keys)
            {
                if (base64String.Contains(mime))
                    return mimeToExtensionMap[mime];
            }

            // Default to ".png" if no match is found
            return ".png";
        }

    }
}
