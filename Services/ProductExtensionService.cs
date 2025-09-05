using Core.Helpers;
using Entities.Enums;
using Entities.Input;
using Entities.Models;
using HireMe.Data.Repository;
using Services.Interfaces;

namespace Services
{
    public class ProductExtensionService : IProductExtensionService
    {
        private readonly ErrorLoggingService _errorLogger;
        private readonly SemaphoreSlim _dbContextLock = new SemaphoreSlim(1);

        private readonly IRepository<Images> _imagesRepository;
 
        public ProductExtensionService(
            ErrorLoggingService errorLogger,
            IRepository<Images> imagesRepository)
        {
            _errorLogger = errorLogger;
            _imagesRepository = imagesRepository;
        }

        public async Task<OperationResult> AddOrUpdateImageAsync(IEnumerable<Images> images, int? productId)
        {
            if (images is null || !images.Any())
            {
                return OperationResult.FailureResult("Image list cannot be null or empty.");
            }

            // Ensure the productId is provided
            if (productId == null || productId <= 0)
            {
                return OperationResult.FailureResult("Valid ProductId is required.");
            }

            try
            {
                // Handle delete operation for images explicitly marked as DELETE
                var imagesToDelete = images
                    .Where(x => x.Operation == CRUD.Delete)
                    .Select(x => x.Id)
                    .ToList();

                if (imagesToDelete.Any())
                {
                    var imagesToRemove = _imagesRepository.GetAll(x => imagesToDelete.Contains(x.Id));
                    if (imagesToRemove.Any())
                    {
                        _imagesRepository.DeleteRange(imagesToRemove);
                    }
                }


                // Delete existing images associated with the productId
                var existingImages =  _imagesRepository.GetAll(x => x.ProductId == productId);
                if (existingImages.Any())
                {
                    _imagesRepository.DeleteRange(existingImages);
                }

                // Prepare new images to add
                var imagesToCreate = images
                    .Where(x => x.Operation == CRUD.Create || x.Operation == CRUD.Update)
                    .Select(x => new Images
                    {
                        ProductId = (int)productId!,
                        Src = x.Src,
                        ImageType = x.ImageType,
                        isExternal = x.isExternal,
                        VariantId = x.VariantId
                    }).AsQueryable();

                if (imagesToCreate.Any())
                {
                    await _imagesRepository.AddRangeAsync(imagesToCreate);
                }

                // Save changes to the database
                return await _imagesRepository.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log the exception with detailed information
                _errorLogger.LogException(ex, $"AddOrUpdateImageAsync", nameof(ProductExtensionService));
                return OperationResult.FailureResult("Image Create/Delete and Update process failed.");
            }
        }

        public async Task<OperationResult> DeleteAllImagesAsync(int? productId)
        {
            // Ensure the productId is provided
            if (productId == null || productId <= 0)
            {
                return OperationResult.FailureResult("Valid ProductId is required.");
            }

            try
            {
                var imagesToRemove = _imagesRepository.GetAll(x => x.ProductId == productId);
                if (imagesToRemove.Any())
                {
                    _imagesRepository.DeleteRange(imagesToRemove);
                }
                // Save changes to the database
                return await _imagesRepository.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log the exception with detailed information
                _errorLogger.LogException(ex, $"AddOrUpdateImageAsync", nameof(ProductExtensionService));
                return OperationResult.FailureResult("Image Create/Delete and Update process failed.");
            }
        }


        public async Task<OperationResult> UpdateMainImageAsync(int id, int oldImageId)
        {
            if (oldImageId == 0)
                return OperationResult.FailureResult($"Product and Image:{oldImageId} 'Main' property has not been updated.");

            try
            {
                await _dbContextLock.WaitAsync(); // Wait for the lock

                // Fetch the current image by its ID
                var imageEntry = await _imagesRepository.GetByIdAsync(id);

                // Check if the image exists
                if (imageEntry == null)
                {
                    return OperationResult.FailureResult($"Image with ID {id} not found.");
                }

                // Update the 'ImageType' property for the current image to 'Main'
                imageEntry.ImageType = ImageType.Main;

                // If the old image exists and is different, reset its 'ImageType' if it was 'Main'
                if (oldImageId != 0)
                {
                    var oldImageEntry = await _imagesRepository.GetByIdAsync(oldImageId);
                    if (oldImageEntry != null && oldImageEntry.ImageType == ImageType.Main)
                    {
                        oldImageEntry.ImageType = ImageType.Thumb; // Defaulting old main image to 'Thumb'
                       await _imagesRepository.UpdateAsync(oldImageEntry); // Mark the old image for update
                    }
                }

                // Notify the repository about the updated entity for the new image
                await _imagesRepository.UpdateAsync(imageEntry);

                // Save changes to the database asynchronously
                var result = await _imagesRepository.SaveChangesAsync();
                if (result.Success)
                {
                    return OperationResult.SuccessResult($"Image with ID {id} has been set as 'Main' successfully.");
                }
                else
                {
                    return OperationResult.FailureResult($"Failed to update 'Main' property for Image ID {id}.");
                }
            }
            catch (Exception ex)
            {
                // Log the exception with detailed information
                _errorLogger.LogException(ex, $"UpdateMainImageAsync", nameof(ProductExtensionService));
                return OperationResult.FailureResult($"Image:{id} 'Main' property has not been updated due to an error.");
            }
            finally
            {
                _dbContextLock.Release(); // Release the lock after operation is complete
            }
        }



    }
}
