using Core.Helpers;
using eCommerce.Utility;
using Entities.Enums;
using Entities.Input;
using Entities.Models;
using Entities.ViewModels;
using Entities.ViewModels.Products;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;
using Services.Interfaces;
using System.Text;
using System.Text.Json;

namespace eCommerce.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly MemoryCacheWithKeys _memoryCache;

        private readonly IBundleService _bundleService;
        private readonly IspProduct _spProductService;
        private readonly IspVariants _spVariantsService;
        private readonly IProductExtensionService _extProductService;
        private readonly IStoryPageService _storyPageService;


        // Cache keys
        private const string RelatedProductsCacheKey = "RelatedProductsCacheKey";
        private const string CartProductsCacheKey = "myCartProductsCache";
        private const string SpecialProductsCacheKey = "SpecialProducts";

        private const string FilteredProductsCacheKey = "FilteredProductsCacheKey_";
        private const string ProductByIdCacheKey = "ProductById_";
        private const string ProductDetailsCacheKey = "ProductDetails_";
        private const string ProductShortCacheKey = "ProductShort_";
        private const string GetProductsCacheKey = "GetProducts";


        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5); // 30 days


        public ProductController(
            IConfiguration configuration,
            MemoryCacheWithKeys memoryCache,
            IBundleService bundleService,
            IStoryPageService storyPageService,
            IspProduct spProductService,
            IspVariants spVariantsService,
            IProductExtensionService extProductService)
        {
            _configuration = configuration;
            _memoryCache = memoryCache;
            _bundleService = bundleService;
            _storyPageService = storyPageService; 

            _spProductService = spProductService;
            _spVariantsService = spVariantsService;
            _extProductService = extProductService;
        }

        [HttpGet("fetch-products-get")]
        public async Task<IActionResult> GetDefaultProducts([FromQuery] ProductSearch viewModel)
        {
            try
            {
                // Return default product list (e.g., top 10 trending products)
                var defaultProducts = await _spProductService.GetDefaultProductsAsync(viewModel);
                return Ok(defaultProducts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while fetching default products.");
            }
        }

        [HttpPost("fetch-products-post")]
        public async Task<IActionResult> GetFilteredProducts([FromBody] ProductSearch viewModel)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            SanitizeInput(viewModel);
            if (!IsValidInput(viewModel))
                return BadRequest("Invalid input.");

            try
            {
                var filteredProducts = await _spProductService.GetFilteredProductsDetailsAsync(viewModel);
                return Ok(filteredProducts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while fetching filtered products.");
            }
        }

        /*[HttpPost("listing")]
        public async Task<IActionResult> GetFilteredProducts([FromBody] ProductSearch viewModel)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            SanitizeInput(viewModel);
            if (!IsValidInput(viewModel))
                return BadRequest("Invalid input.");

            //var cacheKey = GenerateCacheKey(viewModel);
            return Ok(await _spProductService.GetFilteredProductsDetailsAsync(viewModel));// await GetCachedDataAsync(cacheKey, async () => 
           // await _spProductService.GetFilteredProductsDetailsAsync(viewModel));
        }*/

        [HttpPut]
        [Route("getCartProducts")]
        public async Task<IActionResult> GetCartProducts([FromBody] IList<ProductByLocalStore> products)
        {
            if (!products.Any())
            {
                return Ok(null);
            }

            var result = await FetchCartProducts(products);
            return Ok(result);
        }


        [HttpGet("GetProductById/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            try
            {
                var cacheKey = $"{ProductByIdCacheKey}{id}";
                var result = await GetCachedDataAsync(cacheKey, async () =>
                    await _spProductService.GetByIdWithRelationsAsync(id));
              
                 return result;
             }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GetByIdAsync failed: {ex}");
                return StatusCode(500, "An internal server error occurred.");
    }
}

        [HttpGet("{value}")]
        [AllowAnonymous]
        public async Task<IActionResult> DetailsByValue(string value)
        {
            try
            {
                object result;

                if (int.TryParse(value, out int id))
                {
                    // It's a number → use ID
                    var cacheKey = $"{ProductDetailsCacheKey}{id}";
                    result = await _spProductService.GetFullByIdAsync(id, null);
                }
                else
                {
                    // It's a slug
                    var cacheKey = $"{ProductDetailsCacheKey}{value}";
                    result = await _spProductService.GetFullByIdAsync(null, value);
                }


                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] DetailsByValue failed: {ex}");
                return StatusCode(500, "An internal server error occurred.");
            }
        }


        [HttpGet("getSpecialProducts")]
        public async Task<IActionResult> GetSpecialProducts()
        {
            return await GetCachedDataAsync(SpecialProductsCacheKey, async () =>
                await _spProductService.GetSpecialProductsAsync(12));
        }

        [HttpGet("getProducts")]
        public async Task<IActionResult> GetProducts()
        {

            var cacheKey = $"{GetProductsCacheKey}";
            return await GetCachedDataAsync(cacheKey, async () =>
                await _spProductService.GetProductsAsync(1000));
        }

        [HttpGet("getShortProducts")]
        public async Task<IActionResult> GetShortProducts(string searchString)
        {
            searchString = StringSanitizer.SanitizeString(searchString);
            var cacheKey = $"{ProductShortCacheKey}{searchString}";
            return await GetCachedDataAsync(cacheKey, async () =>
                await _spProductService.GetProductsShort(searchString, 1000));
        }

        [HttpPost("getRelatedProducts")]
        public async Task<IActionResult> GetRelatedProducts([FromBody] GetRelatedProducts reqModel)
        {
           try
           {
            if (reqModel == null || reqModel.Take <= 0)
            return BadRequest("Invalid request model.");

            var cacheKey = $"{RelatedProductsCacheKey}_{reqModel.CategoryId}_{reqModel.SubCategoryId}_{reqModel.Take}";
            var result = await GetCachedDataAsync(cacheKey, async () =>
                await _spProductService.GetRelatedProductsAsync(reqModel.Take, reqModel.CategoryId, reqModel.SubCategoryId));
            
            return result;
            }
            catch (Exception ex)
            {
                    Console.WriteLine($"[ERROR] GetRelatedProducts failed: {ex}");
                    return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpPost]
        [Route("createMockProducts")]
        public async Task<OperationResult> CreateMock([FromHeader] string accessToken, [FromBody] ProductInput Input)
        {
            try
            {
                for (int i = 0; i < Input.MockProductsCount; i++)
                {
                    Input.ApproveType = (int)ApproveType.Success;
                    Input.DiscountRate = 10.0;

                    var oResult = await _spProductService.CRUD<Entities.Models.Product>(Input, ActionEnum.Create, true);
                    if (!oResult.Success)
                    {
                        return OperationResult.FailureResult(oResult.FailureMessage);
                    }

                    if (Input.Image.Any())
                    {
                        var imageUploadResult = await HandleImageUploads(Input, (int)oResult.Id);
                        if (imageUploadResult != null)
                        {
                            Input.Image = imageUploadResult;
                        }
                        else
                        {
                            return OperationResult.FailureResult("Failed to upload images.");
                        }
                    }

                    var relationResult = await _spProductService.UpdateRelations(Input, oResult.Id);
                    if (!relationResult.Success)
                    {
                        return OperationResult.FailureResult(relationResult.FailureMessage);
                    }
                   /* var relationResult = await _extProductService.ManageAllRelations(Input, oResult);
                    if (!relationResult.Success)
                    {
                        return OperationResult.FailureResult(relationResult.FailureMessage);
                    }*/

                    var increaseCountResult = await IncreaseProductCount(Input, true);

                    if (!increaseCountResult.Success)
                    {
                        return OperationResult.FailureResult(increaseCountResult.FailureMessage);
                    }

                    if (Input.GroupedVariants.Any())
                    {
                        var variantRelationsResult = await _spVariantsService.CreateVariantsAsync(Input.GroupedVariants, (int)oResult.Id);
                        if (!variantRelationsResult.Success)
                        {
                            return OperationResult.FailureResult(variantRelationsResult.FailureMessage);
                        }
                    }

                    if (i >= Input.MockProductsCount)
                    {
                        return oResult;
                    }
                }

                ClearAllProductCaches();
                return OperationResult.SuccessResult();
            }
            catch (Exception)
            {
                // Log exception if necessary
                return OperationResult.FailureResult("An error occurred while creating mock products.");
            }
        }

        [HttpPost]
        [Route("create")]
        public async Task<OperationResult> Create([FromHeader] string accessToken, [FromBody] ProductInput input)
        {
            if (!ModelState.IsValid)
            {
                var errorList = ModelState.Values.SelectMany(v => v.Errors)
                                  .Select(e => e.ErrorMessage).ToList();
                return OperationResult.FailureResult("Model validation failed:\n" + string.Join("\n", errorList));
            }

            try
            {
                input.ApproveType = (int)ApproveType.Success;

                var oResult = await _spProductService.CRUD<Entities.Models.Product>(input, ActionEnum.Create, true);
                if (!oResult.Success)
                {
                    return OperationResult.FailureResult(oResult.FailureMessage);
                }
                if (input.Image.Any())
                {
                    // Filter images that are not external or are in base64 format
                    var imagesToUpload = input.Image.Where(image =>
                        !(image.isExternal && (image.Src.StartsWith("http://") || image.Src.StartsWith("https://"))) &&
                        image.Src.StartsWith("data:image/") // Check for base64 format
                    ).ToList();

                    if (imagesToUpload.Any())
                    {
                        var imageUploadResult = await HandleImageUploads(input, (int)oResult.Id);
                        if (imageUploadResult != null)
                        {
                            input.Image = imageUploadResult;
                        }
                    }

                    var imagesResult = await _extProductService.AddOrUpdateImageAsync(input.Image, oResult.Id);
                    if (!imagesResult.Success)
                    {
                        return OperationResult.FailureResult(imagesResult.FailureMessage);
                    }
                }
                var relationResult = await _spProductService.UpdateRelations(input, oResult.Id);
                if (!relationResult.Success)
                {
                    return OperationResult.FailureResult(relationResult.FailureMessage);
                }

                if (input.GroupedVariants.Any())
                {
                    var variantRelationsResult = await _spVariantsService.CreateVariantsAsync(input.GroupedVariants, (int)oResult.Id);
                    if (!variantRelationsResult.Success)
                    {
                        return OperationResult.FailureResult(variantRelationsResult.FailureMessage);
                    }
                }


                var increaseCountResult = await IncreaseProductCount(input, true);

                if (!increaseCountResult.Success)
                {
                    return OperationResult.FailureResult(increaseCountResult.FailureMessage);
                }

                if (input.StoryPage is not null)
                {
                    try
                    {
                        await _storyPageService.SaveStoryPageAsync((int)oResult.Id, input.StoryPage);
                    }
                    catch (Exception storyEx)
                    {
                        
                        return OperationResult.FailureResult($"StoryPage saving failed: {storyEx.Message}");
                    }
                }
                if (input.Bundle is not null)
                {
                    try
                    {
                        await _bundleService.SaveBundleAsync((int)oResult.Id, input.Bundle);
                    }
                    catch (Exception storyEx)
                    {

                        return OperationResult.FailureResult($"StoryPage saving failed: {storyEx.Message}");
                    }
                }

                // Invalidate cache upon creation
                ClearAllProductCaches();

                return oResult;
            }
            catch (Exception ex)
            {
                // Log exception if necessary
                return OperationResult.FailureResult("An error occurred while processing your request.");
            }
        }
        [HttpPut]
        [Route("update/{id}")]
        public async Task<OperationResult> Update(int id, [FromBody] ProductInput Input)
        {
            try
            {
                var oResult = await _spProductService.CRUD<Entities.Models.Product>(Input, ActionEnum.Update, true);
                if (!oResult.Success)
                {
                    return OperationResult.FailureResult(oResult.FailureMessage);
                }

                if (Input.Image.Any())
                {
                    // Filter images that are not external or are in base64 format
                    var imagesToUpload = Input.Image.Where(image =>
                        !(image.isExternal && (image.Src.StartsWith("http://") || image.Src.StartsWith("https://"))) &&
                        image.Src.StartsWith("data:image/") // Check for base64 format
                    ).ToList();

                    if (imagesToUpload.Any())
                    {
                        var imageUploadResult = await HandleImageUploads(Input, (int)oResult.Id);
                        if (imageUploadResult != null)
                        {
                            Input.Image = imageUploadResult;
                        }
                    }

                    var imagesResult = await _extProductService.AddOrUpdateImageAsync(Input.Image, oResult.Id);
                    if (!imagesResult.Success)
                    {
                        return OperationResult.FailureResult(imagesResult.FailureMessage);
                    }
                }


                var relationResult = await _spProductService.UpdateRelations(Input, oResult.Id);
                if (!relationResult.Success)
                {
                    return OperationResult.FailureResult(relationResult.FailureMessage);
                }


                if (Input.GroupedVariants.Any())
                {

                    var variantRelationsResult = await _spVariantsService.CreateVariantsAsync(Input.GroupedVariants, (int)oResult.Id);
                    if (!variantRelationsResult.Success)
                    {
                        return OperationResult.FailureResult(variantRelationsResult.FailureMessage);
                    }
                }

                if (Input.StoryPage is not null)
                {
                    try
                    {
                        await _storyPageService.SaveStoryPageAsync((int)oResult.Id, Input.StoryPage);
                    }
                    catch (Exception storyEx)
                    {

                        return OperationResult.FailureResult($"StoryPage saving failed: {storyEx.Message}");
                    }
                }

                if (Input.Bundle is not null)
                {
                    try
                    {
                        await _bundleService.SaveBundleAsync((int)oResult.Id, Input.Bundle);
                    }
                    catch (Exception storyEx)
                    {

                        return OperationResult.FailureResult($"StoryPage saving failed: {storyEx.Message}");
                    }
                }

                // Invalidate cache upon update
                ClearAllProductCaches();
                await ClearPrefixedCaches(false, id);

                return oResult;
            }
            catch (Exception ex)
            {
                // Log exception if necessary
                return OperationResult.FailureResult("An error occurred while updating the product: " + ex.Message);
            }
        }


        [HttpPut]
        [Route("updateStatus/{id}")]
        public async Task<OperationResult> UpdateStatus(int id, [FromBody] Status status)
        {
            try
            {
                var _oResult = await _spProductService.UpdateStatus(id, status);
                if (!_oResult.Success)
                {
                    return OperationResult.FailureResult(_oResult.FailureMessage);
                }

                ClearAllProductCaches();
                await ClearPrefixedCaches(true, null);
                return _oResult;
            }
            catch (Exception)
            {
                // Log exception if necessary
                return OperationResult.FailureResult("An error occurred while deleting the product.");
            }
        }

        [HttpPut]
        [Route("updateMainImage/{id}")]
        public async Task<OperationResult> UpdateMainImage(int id, int oldImageId)
        {
            if(oldImageId == 0)
                return OperationResult.FailureResult($"Product and Image:{oldImageId} 'isMainImage' property has not been updated.");

            try
            {
                var _oResult = await _extProductService.UpdateMainImageAsync(id, oldImageId);
                if (!_oResult.Success)
                {
                    return OperationResult.FailureResult(_oResult.FailureMessage);
                }

                ClearAllProductCaches();
                await ClearPrefixedCaches(true, null);
                return _oResult;
            }
            catch (Exception)
            {
                // Log exception if necessary
                return OperationResult.FailureResult("An error occurred while deleting the product.");
            }
        }

        [HttpDelete]
        [Route("delete/{id}")]
        public async Task<OperationResult> Delete(int id)
        {
            var errorMessages = new List<string>(); // Collect errors

            try
            {
                var product = await _spProductService.GetFullByIdAsync(id, String.Empty);
                if (product is null)
                {
                    errorMessages.Add($"Product with id: {id} doesn't exist.");
                    return OperationResult.FailureResult(string.Join(" | ", errorMessages));
                }

                var imagesDeletionResult = await RemoveLocalImagesFromFolderAsync(product);
                if (!imagesDeletionResult.Success)
                {
                    errorMessages.Add(imagesDeletionResult.FailureMessage);
                }

                var imagesDeletionResult2 = await _extProductService.DeleteAllImagesAsync(id);
                if (!imagesDeletionResult2.Success)
                {
                    errorMessages.Add(imagesDeletionResult2.FailureMessage);
                }

                var relationResult = await _spProductService.DeleteRelations(id);
                if (!relationResult.Success)
                {
                    errorMessages.Add(relationResult.FailureMessage);
                }

                var decreaseCountResult = await _spProductService.CRUD<int>(new
                {
                    IncrementCount = false,
                    Quantity = 1,
                    CategoryId = product.CategoryId,
                    SubCategoryId = product.SubCategoryId,
                    BrandId = product.BrandId,
                    SeriesId = product.SeriesId,
                    SubBrandId = product.SubBrandId,
                    Occasions = product.OccasionIds
                }, ActionEnum.UpdateCountOnRelations, false).ConfigureAwait(false);

                if (!decreaseCountResult.Success)
                {
                    errorMessages.Add(decreaseCountResult.FailureMessage);
                }

                var oResult = await _spProductService.CRUD<Entities.Models.Product>(new { Id = id }, ActionEnum.Delete, false);
                if (!oResult.Success)
                {
                    errorMessages.Add(oResult.FailureMessage);
                }

                // Invalidate cache even if there were errors earlier
                ClearAllProductCaches();
                await ClearPrefixedCaches(true, null);

                if (errorMessages.Any())
                {
                    // Return failure result with all collected errors
                    return OperationResult.FailureResult(string.Join(" | ", errorMessages));
                }

                return oResult;
            }
            catch (Exception ex)
            {
                errorMessages.Add(ex.Message);
                return OperationResult.FailureResult(string.Join(" | ", errorMessages));
            }
        }


        public static async Task CopyFileAsync(string sourceFilePath, string destinationFilePath)
        {
            using (var sourceStream = new FileStream(sourceFilePath, FileMode.Open, FileAccess.Read, FileShare.Read, 4096, useAsync: true))
            using (var destinationStream = new FileStream(destinationFilePath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, useAsync: true))
            {
                await sourceStream.CopyToAsync(destinationStream);
            }
        }
        public async Task<List<Images>> HandleImageUploads(ProductInput input, int productId)
        {
            var uploadedImages = new List<Images>();
            bool enableImageProcessing = _configuration.GetValue<bool>("AppSettings:EnableImageProcessing");

            try
            {
                // Define folder paths for uploading images
                var mainUploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "assets", "images", "products", productId.ToString());
                Directory.CreateDirectory(mainUploadsFolder); // Ensure the directory exists

                int imageIndex = 1; // Counter to generate image names like image-1, image-2, etc.

                // Loop through the input images
                foreach (var file in input.Image)
                {
                    if (file == null || string.IsNullOrWhiteSpace(file.Src))
                    {
                        continue;
                    }

                    if (file.isExternal)
                    {
                        // If the file is external, directly add it to the uploaded images list
                        uploadedImages.Add(new Images
                        {
                            Src = file.Src,
                            isExternal = true,
                            VariantId = file.VariantId,
                            ProductId = productId,
                            ImageType = file.ImageType,
                            Operation = file.Operation
                        });
                    }
                    else
                    {
                        // Decode base64 image data
                        var base64Data = ExtractBase64Data(file.Src);
                        var fileExtension = DetermineFileExtension(file.Src);

                        // Generate a file name using the pattern image-1, image-2, etc.
                        var tempFileName = $"image-{imageIndex}{fileExtension}";
                        var tempFilePath = Path.Combine(mainUploadsFolder, tempFileName);

                        // Convert base64 to bytes and write to the file
                        var fileBytes = Convert.FromBase64String(base64Data);
                        await System.IO.File.WriteAllBytesAsync(tempFilePath, fileBytes);

                        // Add the file to the uploaded images list without resizing
                        uploadedImages.Add(new Images
                        {
                            ProductId = productId,
                            Src = tempFileName,
                            VariantId = file.VariantId,
                            isExternal = false,
                            ImageType = file.ImageType,
                            Operation = file.Operation
                        });

                        if (enableImageProcessing)
                        {
                            var imageProcessor = new ImageProcessor(_configuration);
                            var imageProcessorResult = imageProcessor.ResizeImage(tempFilePath, mainUploadsFolder);

                            if (!imageProcessorResult.Success)
                            {
                                OperationResult.FailureResult(imageProcessorResult.FailureMessage);
                                return new List<Images>();
                            }
                        }

                        // Increment the image index for the next image
                        imageIndex++;
                    }
                }
            }
            catch (Exception ex)
            {
                // Log exception if necessary
                OperationResult.FailureResult($"Error during image upload: {ex.Message}");
                return new List<Images>();  // Return an empty list in case of error
            }

            return uploadedImages;
        }


        private static async Task<OperationResult> RemoveLocalImagesFromFolderAsync(ProductDetails product)
        {
          //  var sanitizedTitle = SanitizeTitle(product.Title);

            // Define folder paths for main and client uploads
            var mainUploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), $"wwwroot\\images\\products\\{product.Id}");

            var errors = new List<string>();

            // Helper function to remove files and folder
            async Task RemoveFilesFromFolder(string folderPath)
            {

                foreach (var image in product.Images)
                {
                    if (!image.isExternal)
                    {
                        var filePath = Path.Combine(folderPath, image.Src);
                        try
                        {
                            if (System.IO.File.Exists(filePath))
                            {
                                await Task.Run(() => System.IO.File.Delete(filePath));
                            }
                            else
                            {
                                errors.Add($"File not found: {filePath} for product: {product.Id}, {product.Title}");
                            }
                        }
                        catch (Exception ex)
                        {
                            errors.Add($"Error deleting file {filePath}: {ex.Message} for product: {product.Id}, {product.Title}");
                        }
                    }
                }

                // Attempt to delete folder if empty
                try
                {
                    if (Directory.Exists(folderPath) && !Directory.EnumerateFileSystemEntries(folderPath).Any())
                    {
                        Directory.Delete(folderPath);
                    }
                }
                catch (Exception)
                {

                }
            }

            // Remove files from both main and client folders
            await RemoveFilesFromFolder(mainUploadsFolder);

            // Return the operation result
            if (errors.Any())
            {
                return OperationResult.FailureResult(string.Join(Environment.NewLine, errors));
            }

            return OperationResult.SuccessResult($"All images for product: {product.Id}, {product.Title} were deleted successfully, and empty folders were removed from both locations.");
        }



        private async Task<OperationResult> IncreaseProductCount(ProductInput input, bool increment)
        {
            return await _spProductService.CRUD<int>(new
            {
                IncrementCount = increment,
                Quantity = 1,
                CategoryId = input.Category?.FirstOrDefault()?.Id,
                SubCategoryId = input.SubCategory?.FirstOrDefault()?.Id,
                BrandId = input.Brand?.FirstOrDefault()?.Id,
                SeriesId = input.Series?.FirstOrDefault()?.Id,
                SubBrandId = input.SubBrand?.FirstOrDefault()?.Id,
                Occasions = string.Join(",", input.Occasion?.Select(o => o.Id))
            }, ActionEnum.UpdateCountOnRelations, false).ConfigureAwait(false);

        }
        private async Task<List<ProductById>> FetchCartProducts(IList<ProductByLocalStore> products)
        {
            var tasks = products.Select(async product =>
            {
                try
                {
                    var productEntity = await _spProductService.GetByIdWithImageAsync<ProductById>(product.productId);
                    if (productEntity != null)
                    {
                        productEntity.CustomerPreferenceQuantity = product.quantity;
                        return productEntity;
                    }
                }
                catch (Exception)
                {
                    // Log the exception or handle it based on your requirements.
                }
                return null;
            });

            var fetchedProducts = await Task.WhenAll(tasks);
            return fetchedProducts.Where(p => p != null).ToList();
        }
        private async Task ClearPrefixedCaches(bool all, int? id)
        {
            
            if (!all)
            {
                await _memoryCache.ClearByPrefixAsync(ProductByIdCacheKey + id);
                await _memoryCache.ClearByPrefixAsync(ProductDetailsCacheKey + id);
                await _memoryCache.ClearByPrefixAsync(ProductShortCacheKey + id);
            }
            else
            {
                await _memoryCache.ClearByPrefixAsync(ProductByIdCacheKey);
                await _memoryCache.ClearByPrefixAsync(ProductDetailsCacheKey);
                await _memoryCache.ClearByPrefixAsync(ProductShortCacheKey);
            }

            // Always all
            await _memoryCache.ClearByPrefixAsync(FilteredProductsCacheKey);
        }
        private void ClearAllProductCaches()
        {
            // Clear all relevant caches
            _memoryCache.Remove(SpecialProductsCacheKey);
            _memoryCache.Remove(RelatedProductsCacheKey);
            _memoryCache.Remove(CartProductsCacheKey);
        }

        // Generic method to fetch and cache data
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

        private static void SanitizeInput(ProductSearch viewModel)
        {
            viewModel.SearchString = StringSanitizer.SanitizeString(viewModel.SearchString);
        }
        private static string SanitizeTitle(string title)
        {
            // Replace invalid file system characters with an underscore
            foreach (var invalidChar in Path.GetInvalidFileNameChars())
            {
                title = title.Replace(invalidChar, '_');
            }

            // Optionally trim spaces and normalize the title
            return title.Trim();
        }
        private bool IsValidInput(ProductSearch viewModel)
        {
            if (viewModel.MinPrice < 0 || viewModel.MaxPrice < 0 || viewModel.MinPrice > viewModel.MaxPrice)
            {
                ModelState.AddModelError("MinPrice", "Invalid price range.");
                ModelState.AddModelError("MaxPrice", "Invalid price range.");
            }

            return ModelState.IsValid;
        }

        private static string GenerateCacheKey(ProductSearch viewModel)
        {
            var keyBuilder = new StringBuilder(FilteredProductsCacheKey);

            // Create a dictionary of property names and their corresponding values
            var properties = new Dictionary<string, string>
            {
                { "SearchString", viewModel.SearchString },
                { "SortBy", viewModel.SortBy },
                { "SortDirection", viewModel.SortDirection },
                { "MinPrice", viewModel.MinPrice > 0 ? viewModel.MinPrice.ToString() : null },
                { "MaxPrice", viewModel.MaxPrice > 0 ? viewModel.MaxPrice.ToString() : null },
                { "CategoryId", viewModel.CategoryId?.ToString() },
                { "CategoryTitle", viewModel.CategoryTitle },
                { "SubCategoryId", viewModel.SubCategoryId?.ToString() },
                { "SubCategoryTitle", viewModel.SubCategoryTitle },
                { "BrandIds", viewModel.Brands != null && viewModel.Brands.Any() ? string.Join(",", viewModel.Brands) : null },
                { "OccasionIds", viewModel.Occasions != null && viewModel.Occasions.Any() ? string.Join(",", viewModel.Occasions) : null },
                { "PageNumber", viewModel.PageNumber > 0 ? viewModel.PageNumber.ToString() : null },
                { "PageSize", viewModel.PageSize > 0 ? viewModel.PageSize.ToString() : null },
                { "LastProductId", viewModel.LastProductId > 0 ? viewModel.LastProductId.ToString() : null }
            };

            // Append each non-null property to the key builder
            foreach (var prop in properties)
            {
                if (!string.IsNullOrEmpty(prop.Value))
                {
                    keyBuilder.Append($"{prop.Key}_{prop.Value}_");
                }
            }

            // Trim the last underscore for a cleaner key
            return keyBuilder.ToString().TrimEnd('_');
        }

        private static string ExtractBase64Data(string base64String)
        {
            return base64String.Contains("base64,")
                ? base64String.Split(new[] { "base64," }, StringSplitOptions.RemoveEmptyEntries)[1]
                : base64String;
        }

        private static string DetermineFileExtension(string base64String)
        {
            if (string.IsNullOrWhiteSpace(base64String))
            {
                throw new ArgumentException("The Base64 string cannot be null or empty.");
            }

            if (!base64String.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase))
            {
                throw new FormatException("The provided Base64 string does not start with a valid image MIME type.");
            }

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
