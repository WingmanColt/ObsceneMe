using Core.Helpers;
using eCommerce.Utility;
using eCommerce.Utility.SeerviceActivation;
using Entities.Enums;
using Entities.Models;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace eCommerce.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [ApiController]
    public class BrandsController : ControllerBase
    {
        private readonly MemoryCacheWithKeys _memoryCache;
        private readonly ServicesContainer _serviceLocator;

        private const string AllBrandsCacheKey = "allBrands";
        private const string UsedBrandsCacheKey = "usedBrands";

        private static readonly TimeSpan CacheDuration = TimeSpan.FromDays(1);

        public BrandsController(
            MemoryCacheWithKeys memoryCache,
            ServicesContainer serviceLocator)
        {
            _memoryCache = memoryCache;
            _serviceLocator = serviceLocator;
        }

        // Get all brands
        [HttpGet("get-brands")]
        public async Task<IActionResult> GetAllBrands()
        {
            var brandService = _serviceLocator.Brand.Service!;
            if (!_serviceLocator.Brand.IsAvailable)
                return StatusCode(503, "Brand service is not available.");

            return await GetCachedDataAsync(AllBrandsCacheKey, () => brandService.GetAll<Brands>());
        }

        // Get used brands
        [HttpGet("get-used-brands")]
        public async Task<IActionResult> GetUsedBrands()
        {
            var brandService = _serviceLocator.Brand.Service!;
            if (!_serviceLocator.Brand.IsAvailable)
                return StatusCode(503, "Brand service is not available.");

            return await GetCachedDataAsync(UsedBrandsCacheKey, () => brandService.GetAllUsed());
        }

        // Create a new brand
        [HttpPost("create")]
        public async Task<IActionResult> CreateBrand(BrandInput inputEntity)
        {
            var brandService = _serviceLocator.Brand.Service!;
            var brandProductRelationService = _serviceLocator.BrandProductRelation.Service!;
            if (!_serviceLocator.Brand.IsAvailable || !_serviceLocator.BrandProductRelation.IsAvailable)
                return StatusCode(503, "Required service(s) are not available.");

            try
            {
                var result = await brandService.CRUD<Brands>(inputEntity, ActionEnum.Create, true);
                InvalidateAllCaches();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating brand: {ex.Message}");
            }
        }

        // Update an existing brand
        [HttpPut("update")]
        public async Task<IActionResult> UpdateBrand(BrandInput inputEntity)
        {
            var brandService = _serviceLocator.Brand.Service!;
            var brandProductRelationService = _serviceLocator.BrandProductRelation.Service!;
            if (!_serviceLocator.Brand.IsAvailable || !_serviceLocator.BrandProductRelation.IsAvailable)
                return StatusCode(503, "Required service(s) are not available.");

            try
            {
                var result = await brandService.CRUD<Brands>(inputEntity, ActionEnum.Update, true);
                InvalidateAllCaches();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating brand: {ex.Message}");
            }
        }

        // Delete a specific brand
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteBrand(int id)
        {
            var brandService = _serviceLocator.Brand.Service!;
            var brandProductRelationService = _serviceLocator.BrandProductRelation.Service!;
            if (!_serviceLocator.Brand.IsAvailable || !_serviceLocator.BrandProductRelation.IsAvailable)
                return StatusCode(503, "Required service(s) are not available.");

            try
            {
                var deletionTasks = new List<Task<OperationResult>>
                {
                    brandProductRelationService.CRUD<BrandProductRelation>(new { BrandId = id }, ActionEnum.Delete, false),
                    brandService.CRUD<Brands>(new { Id = id }, ActionEnum.Delete, false)
                };

                await Task.WhenAll(deletionTasks);

                if (deletionTasks.All(task => task.Result.Success))
                {
                    InvalidateAllCaches();
                    return Ok("Brand deleted successfully!");
                }

                return BadRequest("Failed to delete brand.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting brand: {ex.Message}");
            }
        }

        // Delete all brands
        [HttpDelete("deleteAll")]
        public async Task<IActionResult> DeleteAllBrands()
        {
            var brandService = _serviceLocator.Brand.Service!;
            var brandProductRelationService = _serviceLocator.BrandProductRelation.Service!;
            if (!_serviceLocator.Brand.IsAvailable || !_serviceLocator.BrandProductRelation.IsAvailable)
                return StatusCode(503, "Required service(s) are not available.");

            try
            {
                var deletionTasks = new List<Task<OperationResult>>
                {
                    brandProductRelationService.CRUD<BrandProductRelation>(null, ActionEnum.Truncate, false),
                    brandService.CRUD<Brands>(null, ActionEnum.Truncate, false)
                };

                await Task.WhenAll(deletionTasks);

                if (deletionTasks.All(task => task.Result.Success))
                {
                    InvalidateAllCaches();
                    return Ok("All brands deleted successfully!");
                }

                return BadRequest("Failed to delete all brands.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting all brands: {ex.Message}");
            }
        }

        // Seed brands
        [HttpGet("Seed")]
        public async Task<IActionResult> SeedBrands()
        {
            var brandService = _serviceLocator.Brand.Service!;
            if (!_serviceLocator.Brand.IsAvailable)
                return StatusCode(503, "Brand service is not available.");

            try
            {
                var result = await brandService.SeedBrands(false);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error seeding brands: {ex.Message}");
            }
        }

        // Helper method to invalidate all cache entries related to brands
        private void InvalidateAllCaches()
        {
            _memoryCache.Remove(AllBrandsCacheKey);
            _memoryCache.Remove(UsedBrandsCacheKey);
        }

        // Generic method to fetch and cache data
        private async Task<IActionResult> GetCachedDataAsync<T>(string cacheKey, Func<Task<T>> dataFetchFunc)
        {
            if (!_memoryCache.TryGetValue(cacheKey, out T cachedResult))
            {
                cachedResult = await dataFetchFunc();

                if (cachedResult == null)
                {
                    return NotFound("Data not found.");
                }

                _memoryCache.Set(cacheKey, cachedResult, CacheDuration);
            }

            return Ok(cachedResult);
        }
    }
}
