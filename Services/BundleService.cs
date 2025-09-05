using Core.Helpers;
using Entities.Enums;
using Entities.Models;
using HireMe.Data.Repository;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Services.Interfaces;
using System.Data;

namespace Services
{
    public class BundleService : IBundleService
    {
        private readonly IRepository<Bundle> _bundleRepo;
        private readonly IRepository<BundleItem> _bundleItemRepo;

        public BundleService(IRepository<Bundle> bundleRepo, IRepository<BundleItem> bundleItemRepo)
        {
            _bundleRepo = bundleRepo;
            _bundleItemRepo = bundleItemRepo;
        }

        public async Task<Bundle> GetByIdAsync(int id)
        {
            return await _bundleRepo
                .GetAll(b => b.Id == id)
                .Include(b => b.BundleItems)
                .FirstOrDefaultAsync();
        }
        public async Task<OperationResult> SaveBundleAsync(int productId, BundleInput input)
        {
            if (string.IsNullOrWhiteSpace(input.Name))
                return OperationResult.FailureResult("Bundle Name is required.");

            if (input.MainProductId <= 0)
                input.MainProductId = productId;

            var existingBundle = await _bundleRepo.GetAll(b => b.MainProductId == input.MainProductId)
                .Include(b => b.BundleItems)
                .FirstOrDefaultAsync();

            if (existingBundle == null)
            {
                // Create new bundle
                var newBundle = new Bundle
                {
                    Name = input.Name,
                    Description = input.Description,
                    MainProductId = input.MainProductId,
                    IsActive = input.IsActive,
                    Status = (Status)Enum.Parse(typeof(Status), input.Status.ToString()),
                    Type = (BundleType)Enum.Parse(typeof(BundleType), input.Type.ToString()),
                    CreatedOn = DateTime.Now.ToString("dd/MM/yyyy"),
                    ExpiredOn = DateTime.Now.AddDays(30).ToString("dd/MM/yyyy"),
                    BundleItems = input.BundleItems?.Select(item => new BundleItem
                    {
                        Title = item.Title,
                        Price = item.Price,
                        DiscountRate = item.DiscountRate,
                        Quantity = item.Quantity,
                        ImageSrc = item.ImageSrc,
                        ProductId = item.ProductId
                    }).ToList()
                };

                await _bundleRepo.AddAsync(newBundle);
            }
            else
            {
                // Update core bundle properties
                existingBundle.Name = input.Name;
                existingBundle.Description = input.Description;
                existingBundle.MainProductId = input.MainProductId;
                existingBundle.IsActive = input.IsActive;
                existingBundle.Status = (Status)Enum.Parse(typeof(Status), input.Status.ToString());
                existingBundle.Type = (BundleType)Enum.Parse(typeof(BundleType), input.Type.ToString());
                existingBundle.CreatedOn = DateTime.Now.ToString("dd/MM/yyyy");
                existingBundle.ExpiredOn = DateTime.Now.AddDays(30).ToString("dd/MM/yyyy");

                var inputItems = input.BundleItems ?? new List<BundleItem>();
                var inputItemIds = inputItems.Where(i => i.Id > 0).Select(i => i.Id).ToHashSet();

                // Remove items not in input
                var itemsToRemove = existingBundle.BundleItems
                    .Where(bi => !inputItemIds.Contains(bi.Id))
                    .ToList();

                foreach (var item in itemsToRemove)
                    _bundleItemRepo.Delete(item);

                // Add or update items
                foreach (var inputItem in inputItems)
                {
                    var existingItem = existingBundle.BundleItems
                        .FirstOrDefault(bi => bi.Id == inputItem.Id);

                    if (existingItem == null)
                    {
                        existingBundle.BundleItems.Add(new BundleItem
                        {
                            Title = inputItem.Title,
                            Price = inputItem.Price,
                            DiscountRate = inputItem.DiscountRate,
                            Quantity = inputItem.Quantity,
                            ImageSrc = inputItem.ImageSrc,
                            ProductId = inputItem.ProductId
                        });
                    }
                    else
                    {
                        existingItem.Title = inputItem.Title;
                        existingItem.Price = inputItem.Price;
                        existingItem.DiscountRate = inputItem.DiscountRate;
                        existingItem.Quantity = inputItem.Quantity;
                        existingItem.ImageSrc = inputItem.ImageSrc;
                        existingItem.ProductId = inputItem.ProductId;
                    }
                }
            }

            try
            {
                var result = await _bundleRepo.SaveChangesAsync();
                return result;
            }
            catch (Exception ex)
            {
                return OperationResult.FailureResult($"Error saving bundle: {ex.Message}");
            }
        }


        public async Task<OperationResult> DeleteBundleAsync(int id)
        {
            var bundle = await _bundleRepo.GetAll(b => b.Id == id).Include(b => b.BundleItems).FirstOrDefaultAsync();
            if (bundle == null) return OperationResult.FailureResult("Bundle not found");

            // Delete related items first
                _bundleItemRepo.DeleteRange(bundle.BundleItems.AsQueryable());

            _bundleRepo.Delete(bundle);

            try
            {
                var result = await _bundleRepo.SaveChangesAsync();
                return result;
            }
            catch (Exception ex)
            {
                return OperationResult.FailureResult($"Error deleting bundle: {ex.Message}");
            }
        }
    }
}
