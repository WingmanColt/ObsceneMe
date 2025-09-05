using eCommerce.Utility;
using eCommerce.Utility.SeerviceActivation;
using Entities.Models;
using Entities.ViewModels;
using Entities.ViewModels.Products;
using Microsoft.AspNetCore.Mvc;
using Services.Enums;

namespace eCommerce.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VariantsController : Controller
    {
        private readonly MemoryCacheWithKeys _memoryCache;
        private readonly ServicesContainer _services;

        private const string VariantsCacheKey = "VariantsCacheKey";
        private const string AllVariantsCacheKey = "AllVariantsCacheKey";
        private const string AllVariantItemsCacheKey = "AllVariantItemsCacheKey";

        private static readonly TimeSpan CacheDuration = TimeSpan.FromDays(1);

        public VariantsController(
            MemoryCacheWithKeys memoryCache,
            ServicesContainer services)
        {
            _memoryCache = memoryCache;
            _services = services;
        }

        [HttpGet("get-all-variants")]
        public async Task<IActionResult> GetAllVariants()
        {
            if (!_services.Variant.IsAvailable)
                return StatusCode(503, "Variant service is not available.");

            try
            {
                return await GetCachedDataAsync(AllVariantsCacheKey, async () =>
                {
                    var variants = await _services.Variant.Service!.GetAll<VariantGroupOutput>(
                        VariantActionEnum.VariantAndVariantItemRelation, true);

                    return await GroupByVariantAsync(await variants.ToListAsync());
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching all variants: {ex.Message}");
            }
        }

        [HttpGet("get-variants")]
        public async Task<IActionResult> GetVariants()
        {
            if (!_services.Variant.IsAvailable)
                return StatusCode(503, "Variant service is not available.");

            try
            {
                return await GetCachedDataAsync(VariantsCacheKey, async () =>
                {
                    return await _services.Variant.Service!.GetAll<Variants>(
                        VariantActionEnum.Variant, false);
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching variants: {ex.Message}");
            }
        }

        [HttpGet("get-variant-items")]
        public async Task<IActionResult> GetAllVariantItems()
        {
            if (!_services.Variant.IsAvailable)
                return StatusCode(503, "Variant service is not available.");

            try
            {
                return await GetCachedDataAsync(AllVariantItemsCacheKey, async () =>
                {
                    return await _services.Variant.Service!.GetAll<VariantItem>(
                        VariantActionEnum.VariantItem, false);
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching variant items: {ex.Message}");
            }
        }

        private async Task<List<GroupedVariant>> GroupByVariantAsync(List<VariantGroupOutput> items)
        {
            var groupedVariants = items
                .GroupBy(item => item.VariantId)
                .Select(group => new GroupedVariant
                {
                    Id = group.Key,
                    Title = group.First().Title,
                    Icon = group.First().Icon,
                    VariantItems = group.Select(item => new GroupedVariantItem
                    {
                        Id = item.VariantItemId,
                        VVIRelationId = item.VVIRelationId,
                        vId = group.Key,
                        Value = item.Value,
                        Image = item.Image
                    }).ToList()
                }).ToList();

            return await Task.FromResult(groupedVariants);
        }

        private async Task<IActionResult> GetCachedDataAsync<T>(string cacheKey, Func<Task<T>> dataFetchFunc)
        {
            if (!_memoryCache.TryGetValue(cacheKey, out T cachedResult))
            {
                cachedResult = await dataFetchFunc();

                if (cachedResult == null)
                    return NotFound("Data not found.");

                _memoryCache.Set(cacheKey, cachedResult, CacheDuration);
            }

            return Ok(cachedResult);
        }
    }
}
