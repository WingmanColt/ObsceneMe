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
    public class CategoriesController : ControllerBase
    {
        private readonly MemoryCacheWithKeys _memoryCache;
        private readonly ServicesContainer _services;  // your service container

        private const string CategoriesCacheKey = "CategoriesCacheKey";
        private const string UsedCategoriesCacheKey = "UsedCategoriesCacheKey";
        private const string SubCategoriesCacheKey = "SubCategoriesCacheKey";
        private const string AllCategoriesCacheKey = "AllCategoriesCacheKey";
        private const string AllCategoriesWithSubCacheKey = "AllCategoriesWithSubCacheKey";
        private const string UsedCategoriesWithSubCacheKey = "UsedCategoriesWithSubCacheKey";

        private static readonly TimeSpan CacheDuration = TimeSpan.FromDays(30);

        public CategoriesController(
            MemoryCacheWithKeys memoryCache,
            ServicesContainer services)  // Inject your services container here
        {
            _memoryCache = memoryCache;
            _services = services;
        }

        [HttpGet("get-allCategoriesWithSubs")]
        public async Task<IActionResult> GetAllCategoriesWithSubs()
        {
            var categoryService = _services.Category.Service!;
            if (!_services.Category.IsAvailable)
                return StatusCode(503, "Category service is not available.");

            return await GetCachedDataAsync(AllCategoriesWithSubCacheKey,
                () => categoryService.GetAllWithSubCategories("GetAllWithSubCategories"));
        }

        [HttpGet("get-usedCategoriesWithSubs")]
        public async Task<IActionResult> GetUsedCategoriesWithSubs()
        {
            var categoryService = _services.Category.Service!;
            if (!_services.Category.IsAvailable)
                return StatusCode(503, "Category service is not available.");

            return await GetCachedDataAsync(UsedCategoriesWithSubCacheKey,
                () => categoryService.GetAllWithSubCategories("GetUsedCategoriesWithSub"));
        }

        [HttpGet("get-all-by-category")]
        public async Task<IActionResult> GetAllByCategory(string shortName)
        {
            var subCategoryService = _services.SubCategory.Service!;
            if (!_services.SubCategory.IsAvailable)
                return StatusCode(503, "SubCategory service is not available.");

            return await GetCachedDataAsync(AllCategoriesCacheKey,
                () => subCategoryService.GetAllByCategory<SubCategory>(shortName));
        }

        [HttpGet("get-categories")]
        public async Task<IActionResult> GetAllCategories()
        {
            var categoryService = _services.Category.Service!;
            if (!_services.Category.IsAvailable)
                return StatusCode(503, "Category service is not available.");

            return await GetCachedDataAsync(CategoriesCacheKey,
                () => categoryService.GetAll<Category>());
        }

        [HttpGet("get-used-categories")]
        public async Task<IActionResult> GetUsedCategories()
        {
            var categoryService = _services.Category.Service!;
            if (!_services.Category.IsAvailable)
                return StatusCode(503, "Category service is not available.");

            return await GetCachedDataAsync(UsedCategoriesCacheKey,
                () => categoryService.GetUsedCategories<Category>());
        }

        [HttpDelete("delete-category/{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {

            if (!_services.Category.IsAvailable || !_services.CategoryProductRelation.IsAvailable)
                return StatusCode(503, "Required relation/category services are not available.");

            try
            {
                var categoryService = _services.Category.Service!;
                var categoryProductRelationService = _services.CategoryProductRelation.Service!;

                var deletionTasks = new List<Task<OperationResult>>
                {
                    categoryService.CRUD<CategoryProductRelation>(new { CategoryId = id }, ActionEnum.Delete, false),
                    categoryProductRelationService.CRUD<Category>(new { Id = id }, ActionEnum.Delete, false)
                };

                await Task.WhenAll(deletionTasks);

                if (deletionTasks.All(task => task.Result.Success))
                {
                    InvalidateAllCaches();
                    return Ok("Category was deleted successfully!");
                }

                return BadRequest("Category deletion failed!");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting category: {ex.Message}");
            }
        }

        [HttpDelete("deleteAllCategories")]
        public async Task<IActionResult> DeleteAllCategories()
        {
            if (!_services.Category.IsAvailable || !_services.CategoryProductRelation.IsAvailable)
                return StatusCode(503, "Required relation/category services are not available.");

            try
            {
                var categoryService = _services.Category.Service!;
                var categoryProductRelationService = _services.CategoryProductRelation.Service!;

                var deleteTasks = new List<Task<OperationResult>>
                {
                    categoryService.CRUD<Category>(null, ActionEnum.Truncate, false),
                     categoryProductRelationService.CRUD<CategoryProductRelation>(null, ActionEnum.Truncate, false)
                };

                await Task.WhenAll(deleteTasks);

                if (deleteTasks.All(task => task.Result.Success))
                {
                    InvalidateAllCaches();
                    return Ok("All categories were deleted successfully!");
                }

                return BadRequest("Failed to delete all categories!");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting all categories: {ex.Message}");
            }
        }

        [HttpPut("update-category")]
        public async Task<IActionResult> UpdateCategory(CategoryInput category)
        {
            var categoryService = _services.Category.Service!;
            if (!_services.Category.IsAvailable)
                return StatusCode(503, "Category service is not available.");

            try
            {
                var result = await categoryService.CRUD<Category>(category, ActionEnum.Update, true);
                InvalidateAllCaches();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating category: {ex.Message}");
            }
        }

        [HttpGet("get-subcategories")]
        public async Task<IActionResult> GetAllSubCategories()
        {
            var subCategoryService = _services.SubCategory.Service!;
            if (!_services.SubCategory.IsAvailable)
                return StatusCode(503, "SubCategory service is not available.");

            return await GetCachedDataAsync(SubCategoriesCacheKey,
                () => subCategoryService.GetAll<SubCategory>());
        }

        [HttpDelete("delete-subCategory/{id}")]
        public async Task<IActionResult> DeleteSubCategory(int id)
        {
            if (!_services.SubCategory.IsAvailable || !_services.SubCategoryProductRelation.IsAvailable)
                return StatusCode(503, "Required subcategory/relation services are not available.");

            try
            {
                var subCategoryService = _services.SubCategory.Service!;
                var subCategoryProductRelationService = _services.SubCategoryProductRelation.Service!;

                var deletionTasks = new List<Task<OperationResult>>
                {
                    subCategoryProductRelationService.CRUD<SubCategoryProductRelation>(new { SubCategoryId = id }, ActionEnum.Delete, false),
                    subCategoryService.CRUD<SubCategory>(new { Id = id }, ActionEnum.Delete, false)
                };

                await Task.WhenAll(deletionTasks);

                if (deletionTasks.All(task => task.Result.Success))
                {
                    InvalidateAllCaches();
                    return Ok("Subcategory was deleted successfully!");
                }

                return BadRequest("Subcategory deletion failed!");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting subcategory: {ex.Message}");
            }
        }

        [HttpPut("update-subCategory")]
        public async Task<IActionResult> UpdateSubCategory(SubCategoryInput subCategory)
        {
            var subCategoryService = _services.SubCategory.Service!;
            if (!_services.SubCategory.IsAvailable)
                return StatusCode(503, "SubCategory service is not available.");

            try
            {
                var result = await subCategoryService.CRUD<SubCategory>(subCategory, ActionEnum.Update, true);
                InvalidateAllCaches();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating subcategory: {ex.Message}");
            }
        }

        [HttpPost("create-subCategory")]
        public async Task<IActionResult> CreateSubCategory(SubCategoryInput subCategory)
        {
            var subCategoryService = _services.SubCategory.Service!;
            if (!_services.SubCategory.IsAvailable)
                return StatusCode(503, "SubCategory service is not available.");

            try
            {
                var result = await subCategoryService.CRUD<SubCategory>(subCategory, ActionEnum.Create, true);
                InvalidateAllCaches();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating subcategory: {ex.Message}");
            }
        }

        [HttpGet("seedCategories")]
        public async Task<IActionResult> SeedCategories()
        {
            var categoryService = _services.Category.Service!;
            if (!_services.Category.IsAvailable)
                return StatusCode(503, "Category service is not available.");

            try
            {
                var result = await categoryService.SeedCategories(false);
                InvalidateAllCaches();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error seeding categories: {ex.Message}");
            }
        }

        [HttpGet("seedSubCategories")]
        public async Task<IActionResult> SeedSubCategories()
        {
            var subCategoryService = _services.SubCategory.Service!;
            if (!_services.SubCategory.IsAvailable)
                return StatusCode(503, "SubCategory service is not available.");

            try
            {
                var result = await subCategoryService.SeedCategories(false);
                InvalidateAllCaches();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error seeding subcategories: {ex.Message}");
            }
        }

        private void InvalidateAllCaches()
        {
            _memoryCache.Remove(CategoriesCacheKey);
            _memoryCache.Remove(UsedCategoriesCacheKey);
            _memoryCache.Remove(AllCategoriesCacheKey);
            _memoryCache.Remove(AllCategoriesWithSubCacheKey);
            _memoryCache.Remove(UsedCategoriesWithSubCacheKey);
            _memoryCache.Remove(SubCategoriesCacheKey);
        }

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
