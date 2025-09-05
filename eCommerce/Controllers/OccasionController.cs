using Core.Helpers;
using eCommerce.Utility;
using eCommerce.Utility.SeerviceActivation;
using Entities.Enums;
using Entities.Models;
using Microsoft.AspNetCore.Mvc;

namespace eCommerce.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [ApiController]
    public class OccasionController : ControllerBase
    {
        private readonly MemoryCacheWithKeys _memoryCache;
        private readonly ServicesContainer _services;

        private const string AllOccasionsCacheKey = "allOccasions";
        private const string UsedOccasionsCacheKey = "usedOccasions";

        private static readonly TimeSpan CacheDuration = TimeSpan.FromDays(30);

        public OccasionController(
            MemoryCacheWithKeys memoryCache,
            ServicesContainer services)
        {
            _memoryCache = memoryCache;
            _services = services;
        }

        [HttpGet("get")]
        public async Task<IActionResult> GetAllOccasions()
        {
            if (!_services.Occasion.IsAvailable)
                return StatusCode(503, "Occasion service is not available.");

            return await GetCachedDataAsync(AllOccasionsCacheKey, () =>
                _services.Occasion.Service!.GetAll<Occasion>());
        }

        [HttpGet("get-used-occasions")]
        public async Task<IActionResult> GetUsedOccasions()
        {
            if (!_services.Occasion.IsAvailable)
                return StatusCode(503, "Occasion service is not available.");

            return await GetCachedDataAsync(UsedOccasionsCacheKey, () =>
                _services.Occasion.Service!.GetAllUsed<Occasion>());
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create(OccasionInput occasion)
        {
            if (!_services.Occasion.IsAvailable)
                return StatusCode(503, "Occasion service is not available.");

            if (occasion == null)
                return BadRequest("Invalid occasion data.");

            try
            {
                var result = await _services.Occasion.Service!.CRUD<Occasion>(occasion, ActionEnum.Create, true);
                InvalidateAllCaches();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating occasion: {ex.Message}");
            }
        }

        [HttpPut("update")]
        public async Task<IActionResult> Update(OccasionInput occasion)
        {
            if (!_services.Occasion.IsAvailable)
                return StatusCode(503, "Occasion service is not available.");

            if (occasion == null)
                return BadRequest("Invalid occasion data.");

            try
            {
                var result = await _services.Occasion.Service!.CRUD<Occasion>(occasion, ActionEnum.Update, true);
                InvalidateAllCaches();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating occasion: {ex.Message}");
            }
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!_services.Occasion.IsAvailable || !_services.OccasionProductRelation.IsAvailable)
                return StatusCode(503, "Required service(s) are not available.");

            try
            {
                var deletionTasks = new List<Task<OperationResult>>
                {
                    _services.OccasionProductRelation.Service!.CRUD<OccasionProductRelation>(
                        new { OccasionId = id }, ActionEnum.Delete, false),

                    _services.Occasion.Service!.CRUD<Occasion>(
                        new { Id = id }, ActionEnum.Delete, false)
                };

                await Task.WhenAll(deletionTasks);

                if (deletionTasks.All(task => task.Result.Success))
                {
                    InvalidateAllCaches();
                    return Ok("Occasion deleted successfully!");
                }

                return BadRequest("Failed to delete occasion.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting occasion: {ex.Message}");
            }
        }

        [HttpDelete("deleteAll")]
        public async Task<IActionResult> DeleteAll()
        {
            if (!_services.Occasion.IsAvailable || !_services.OccasionProductRelation.IsAvailable)
                return StatusCode(503, "Required service(s) are not available.");

            try
            {
                var deletionTasks = new List<Task<OperationResult>>
                {
                    _services.OccasionProductRelation.Service!.CRUD<OccasionProductRelation>(null, ActionEnum.Truncate, false),
                    _services.Occasion.Service!.CRUD<Occasion>(null, ActionEnum.Truncate, false)
                };

                await Task.WhenAll(deletionTasks);

                if (deletionTasks.All(task => task.Result.Success))
                {
                    InvalidateAllCaches();
                    return Ok("All occasions deleted successfully!");
                }

                return BadRequest("Failed to delete all occasions.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting all occasions: {ex.Message}");
            }
        }

        [HttpGet("seed")]
        public async Task<IActionResult> Seed()
        {
            if (!_services.Occasion.IsAvailable)
                return StatusCode(503, "Occasion service is not available.");

            try
            {
                var result = await _services.Occasion.Service!.SeedOccasions(false);
                InvalidateAllCaches();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error seeding occasions: {ex.Message}");
            }
        }

        // Helper method to invalidate all cache entries related to occasions
        private void InvalidateAllCaches()
        {
            _memoryCache.Remove(AllOccasionsCacheKey);
            _memoryCache.Remove(UsedOccasionsCacheKey);
        }

        // Generic method to fetch and cache data
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
