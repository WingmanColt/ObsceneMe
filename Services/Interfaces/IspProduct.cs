using Core.Helpers;
using Entities.Enums;
using Entities.Models;
using Entities.ViewModels.Products;

namespace Services.Interfaces
{
    public interface IspProduct
    {
        Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams);
        Task<OperationResult> UpdateRelations(ProductInput Input, int? productId);
        Task<OperationResult> DeleteRelations(int? productId);
     
        Task<T> GetByIdAsync<T>(int id);
        Task<T> GetByIdWithImageAsync<T>(int id);

        Task<ProductWithRelations> GetByIdWithRelationsAsync(int productId);
        Task<ProductDetails> GetFullByIdAsync(int? id, string ShortName);
        Task<OperationResult> UpdateQuantity(OrderedProduct product);
        Task<OperationResult> UpdateStatus(int id, Status status);
        Task<OperationResult> UpdateMarketStatus(int id, MarketStatus status);
        Task<ProductListing> GetFilteredProductsDetailsAsync(ProductSearch entity);
        Task<ProductListing> GetDefaultProductsAsync(ProductSearch entity);

        Task<IAsyncEnumerable<Products>> GetProductsAsync(int take);
        Task<IAsyncEnumerable<SpecialProduct>> GetSpecialProductsAsync(int take);
        Task<IAsyncEnumerable<RelatedProduct>> GetRelatedProductsAsync(int take, int? categoryId, int? subCategoryId);
        Task<IAsyncEnumerable<ProductShort>> GetProductsShort(string title, int take);

        Task<OperationResult> Truncate();
    }
}