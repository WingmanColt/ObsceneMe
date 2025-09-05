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
    public class SeriesController : ControllerBase
    {
        private readonly MemoryCacheWithKeys _memoryCache;
        private readonly ServicesContainer _serviceLocator;

        private const string AllSeriesCacheKey = "allSeries";
        private const string UsedSeriesCacheKey = "usedSeries";

        private static readonly TimeSpan CacheDuration = TimeSpan.FromDays(60);

        public SeriesController(
            MemoryCacheWithKeys memoryCache,
            ServicesContainer serviceLocator)
        {
            _memoryCache = memoryCache;
            _serviceLocator = serviceLocator;
        }

        [HttpGet("get-series")]
        public async Task<IActionResult> GetAll()
        {
            if (!_serviceLocator.Series.IsAvailable)
                return StatusCode(503, "Series service is not available.");

            return await GetCachedDataAsync(AllSeriesCacheKey,
                () => _serviceLocator.Series.Service!.GetAll<Series>());
        }

        [HttpGet("get-used-series")]
        public async Task<IActionResult> GetUsed()
        {
            if (!_serviceLocator.Series.IsAvailable)
                return StatusCode(503, "Series service is not available.");

            return await GetCachedDataAsync(UsedSeriesCacheKey,
                () => _serviceLocator.Series.Service!.GetAllUsed<Series>());
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create(SeriesInput inputEntity)
        {
            if (!_serviceLocator.Series.IsAvailable)
                return StatusCode(503, "Series service is not available.");

            try
            {
                var result = await _serviceLocator.Series.Service!.CRUD<Series>(inputEntity, ActionEnum.Create, true);
                InvalidateAllCaches();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating brand: {ex.Message}");
            }
        }

        [HttpPut("update")]
        public async Task<IActionResult> Update(SeriesInput inputEntity)
        {
            if (!_serviceLocator.Series.IsAvailable)
                return StatusCode(503, "Series service is not available.");

            try
            {
                var result = await _serviceLocator.Series.Service!.CRUD<Series>(inputEntity, ActionEnum.Update, true);
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
            if (!_serviceLocator.Series.IsAvailable || !_serviceLocator.SeriesProductRelation.IsAvailable)
                return StatusCode(503, "Required services are not available.");

            try
            {
                var deletionTasks = new List<Task<OperationResult>>
                {
                    _serviceLocator.SeriesProductRelation.Service!.CRUD<SeriesProductRelation>(
                        new { SeriesId = id }, ActionEnum.Delete, false),
                    _serviceLocator.Series.Service!.CRUD<Series>(
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
            if (!_serviceLocator.Series.IsAvailable || !_serviceLocator.SeriesProductRelation.IsAvailable)
                return StatusCode(503, "Required services are not available.");

            try
            {
                var deletionTasks = new List<Task<OperationResult>>
                {
                    _serviceLocator.SeriesProductRelation.Service!.CRUD<SeriesProductRelation>(null, ActionEnum.Truncate, false),
                    _serviceLocator.Series.Service!.CRUD<Series>(null, ActionEnum.Truncate, false)
                };

                await Task.WhenAll(deletionTasks);

                if (deletionTasks.All(task => task.Result.Success))
                {
                    InvalidateAllCaches();
                    return Ok("All Series deleted successfully!");
                }

                return BadRequest("Failed to delete all Series.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting all Series: {ex.Message}");
            }
        }

        [HttpGet("Seed")]
        public async Task<IActionResult> Seed()
        {
            if (!_serviceLocator.Series.IsAvailable)
                return StatusCode(503, "Series service is not available.");

            try
            {
                var result = await _serviceLocator.Series.Service!.Seed(false);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error seeding Series: {ex.Message}");
            }
        }

        private void InvalidateAllCaches()
        {
            _memoryCache.Remove(AllSeriesCacheKey);
            _memoryCache.Remove(UsedSeriesCacheKey);
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
