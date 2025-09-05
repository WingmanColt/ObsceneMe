using Core.Helpers;
using Entities.Input;
using Entities.Models;

namespace Services.Interfaces
{
    public interface IProductExtensionService
    {
        Task<OperationResult> DeleteAllImagesAsync(int? productId);
        Task<OperationResult> UpdateMainImageAsync(int id, int oldImageId);
        Task<OperationResult> AddOrUpdateImageAsync(IEnumerable<Images> images, int? productId);
    }
}