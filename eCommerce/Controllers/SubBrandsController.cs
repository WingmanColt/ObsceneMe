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
    public class SubBrandsController : ControllerBase
    {
        private readonly MemoryCacheWithKeys _memoryCache;
        private readonly ServicesContainer _serviceLocator;

        private const string AllBrandsCacheKey = "allSubBrands";
        private const string UsedBrandsCacheKey = "usedSubBrands";

        private static readonly TimeSpan CacheDuration = TimeSpan.FromDays(60);

        public SubBrandsController(
            MemoryCacheWithKeys memoryCache,
            ServicesContainer serviceLocator)
        {
            _memoryCache = memoryCache;
            _serviceLocator = serviceLocator;
        }

        [HttpGet("get-subBrands")]
        public async Task<IActionResult> GetAll()
        {
            if (!_serviceLocator.SubBrand.IsAvailable)
                return StatusCode(503, "SubBrands service is not available.");

            return await GetCachedDataAsync(AllBrandsCacheKey,
                () => _serviceLocator.SubBrand.Service!.GetAll<SubBrands>());
        }

        [HttpGet("get-used-subBrands")]
        public async Task<IActionResult> GetUsed()
        {
            if (!_serviceLocator.SubBrand.IsAvailable)
                return StatusCode(503, "SubBrands service is not available.");

            return await GetCachedDataAsync(UsedBrandsCacheKey,
                () => _serviceLocator.SubBrand.Service!.GetAllUsed<SubBrands>());
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create(SubBrandInput inputEntity)
        {
            if (!_serviceLocator.SubBrand.IsAvailable)
                return StatusCode(503, "SubBrands service is not available.");

            try
            {
                var result = await _serviceLocator.SubBrand.Service!.CRUD<SubBrands>(inputEntity, ActionEnum.Create, true);
                InvalidateAllCaches();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating brand: {ex.Message}");
            }
        }

        [HttpPut("update")]
        public async Task<IActionResult> Update(SubBrandInput inputEntity)
        {
            if (!_serviceLocator.SubBrand.IsAvailable)
                return StatusCode(503, "SubBrands service is not available.");

            try
            {
                var result = await _serviceLocator.SubBrand.Service!.CRUD<SubBrands>(inputEntity, ActionEnum.Update, true);
                InvalidateAllCaches();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating brand: {ex.Message}");
            }
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!_serviceLocator.SubBrand.IsAvailable || !_serviceLocator.SubBrandProductRelation.IsAvailable)
                return StatusCode(503, "Required services are not available.");

            try
            {
                var deletionTasks = new List<Task<OperationResult>>
                {
                    _serviceLocator.SubBrandProductRelation.Service!.CRUD<SubBrandProductRelation>(
                        new { SubBrandId = id }, ActionEnum.Delete, false),
                    _serviceLocator.SubBrand.Service!.CRUD<SubBrands>(
                        new { Id = id }, ActionEnum.Delete, false)
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

        [HttpDelete("deleteAll")]
        public async Task<IActionResult> DeleteAll()
        {
            if (!_serviceLocator.SubBrand.IsAvailable || !_serviceLocator.SubBrandProductRelation.IsAvailable)
                return StatusCode(503, "Required services are not available.");

            try
            {
                var deletionTasks = new List<Task<OperationResult>>
                {
                    _serviceLocator.SubBrandProductRelation.Service!.CRUD<SubBrandProductRelation>(null, ActionEnum.Truncate, false),
                    _serviceLocator.SubBrand.Service!.CRUD<SubBrands>(null, ActionEnum.Truncate, false)
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

        [HttpGet("Seed")]
        public async Task<IActionResult> Seed()
        {
            if (!_serviceLocator.SubBrand.IsAvailable)
                return StatusCode(503, "SubBrands service is not available.");

            try
            {
                var result = await _serviceLocator.SubBrand.Service!.SeedSubBrands(false);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error seeding brands: {ex.Message}");
            }
        }

        private void InvalidateAllCaches()
        {
            _memoryCache.Remove(AllBrandsCacheKey);
            _memoryCache.Remove(UsedBrandsCacheKey);
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
