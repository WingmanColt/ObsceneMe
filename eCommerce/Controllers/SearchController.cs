using Core.Helpers;
using eCommerce.Utility;
using eCommerce.Utility.SeerviceActivation;
using Entities.Enums;
using Entities.Models;
using Entities.ViewModels.Products;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Services.Interfaces;

namespace eCommerce.Controllers
{
    [ApiController]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly MemoryCacheWithKeys _memoryCache;
        private readonly ServicesContainer _services;

        private readonly IspProduct _spProductService;
        private readonly IspPages _spPages;

        // Define cache keys for each type of result
        private readonly string productCacheKeyFormat = "SearchProducts_{0}_{1}";
        private readonly string categoryCacheKeyFormat = "SearchCategories_{0}_{1}";
        private readonly string pagesCacheKeyFormat = "SearchPages_{0}_{1}";

        private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(1); // Set cache duration

        public SearchController(
            MemoryCacheWithKeys memoryCache,
            ServicesContainer serviceLocator,

            IspPages spPages,
            IspProduct spProductService) 
        {
            _memoryCache = memoryCache;
            _services = serviceLocator ?? throw new ArgumentNullException(nameof(serviceLocator));
            _spPages = spPages;
            _spProductService = spProductService;
        }

        [HttpPut]
        [Route("find")]
        public async Task<IActionResult> Find(SearchModelRequest viewModel)
        {
            string convertedSearchString = JsonHelper.SearchForValue(viewModel.SearchString, viewModel.UsedLanguage, true) ?? viewModel.SearchString;

            // Check if results are cached
            var cachedProducts = _memoryCache.TryGetValue(string.Format(productCacheKeyFormat, viewModel.SearchString, viewModel.UsedLanguage), out IAsyncEnumerable<ProductShort> cachedProductList) ? cachedProductList : null;
            var cachedCategories = _memoryCache.TryGetValue(string.Format(categoryCacheKeyFormat, viewModel.SearchString, viewModel.UsedLanguage), out IAsyncEnumerable<SubCategory> cachedCategoryList) ? cachedCategoryList : null;
            var cachedPages = _memoryCache.TryGetValue(string.Format(pagesCacheKeyFormat, viewModel.SearchString, viewModel.UsedLanguage), out IAsyncEnumerable<Entities.Models.Pages> cachedPagesList) ? cachedPagesList : null;

            // If all results are cached, return them
            if (cachedProductList != null && cachedCategoryList != null && cachedPagesList != null)
            {
                return Ok(new SearchModelResponse
                {
                    Products = cachedProductList,
                    Categories = cachedCategoryList,
                    Pages = cachedPagesList
                });
            }

            try
            {
                // Parallelize the asynchronous queries
                Task<IAsyncEnumerable<ProductShort>> productListTask = !string.IsNullOrEmpty(viewModel.SearchString)
                    ? _spProductService.GetProductsShort(convertedSearchString, 10)
                    : Task.FromResult<IAsyncEnumerable<ProductShort>>(null);

                Task<IAsyncEnumerable<SubCategory>> categoryListTask = Task.FromResult<IAsyncEnumerable<SubCategory>>(null);

                if (_services.SubCategory.IsAvailable && !string.IsNullOrEmpty(viewModel.SearchString))
                {
                    string searchValue = JsonHelper.SearchForValue(viewModel.SearchString, viewModel.UsedLanguage, true)
                                         ?? viewModel.SearchString;

                    categoryListTask = _services.SubCategory.Service!.GetByTitle<SubCategory>(searchValue);
                }


                Task<IAsyncEnumerable<Entities.Models.Pages>> pagesListTask = !string.IsNullOrEmpty(viewModel.SearchString)
                    ? _spPages.GetAll<Entities.Models.Pages>(new { Title = convertedSearchString })
                    : Task.FromResult<IAsyncEnumerable<Entities.Models.Pages>>(null);

                // Wait for all tasks to complete
                await Task.WhenAll(productListTask, categoryListTask, pagesListTask);

                // Retrieve the results from the completed tasks
                IAsyncEnumerable<ProductShort> productList = await productListTask;
                IAsyncEnumerable<SubCategory> categoryList = await categoryListTask; 
                IAsyncEnumerable<Entities.Models.Pages> pagesList = await pagesListTask;

                // Create the response object
                SearchModelResponse result = new()
                {
                    Products = productList,
                    Categories = categoryList,
                    Pages = pagesList
                };

                if (productList is not null && await productList.AnyAsync())
                    _memoryCache.Set(string.Format(productCacheKeyFormat, viewModel.SearchString, viewModel.UsedLanguage), productList, CacheDuration);

                if (categoryList is not null && await categoryList.AnyAsync())
                    _memoryCache.Set(string.Format(categoryCacheKeyFormat, viewModel.SearchString, viewModel.UsedLanguage), categoryList, CacheDuration);

                if (pagesList is not null && await pagesList.AnyAsync())
                    _memoryCache.Set(string.Format(pagesCacheKeyFormat, viewModel.SearchString, viewModel.UsedLanguage), pagesList, CacheDuration);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching search results: {ex.Message}");
            }
        }

    }

    public class SearchModelRequest
    {
        public string SearchString { get; set; }
        public SearchType SearchType { get; set; }
        public string UsedLanguage { get; set; }
    }

    public class SearchModelResponse
    {
        public IAsyncEnumerable<ProductShort> Products { get; set; }
        public IAsyncEnumerable<SubCategory> Categories { get; set; }
        public IAsyncEnumerable<Entities.Models.Pages> Pages { get; set; }
    }
}
