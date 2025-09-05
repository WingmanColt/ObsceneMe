using Core.Helpers;
using Dapper;
using Entities.Enums;
using Entities.Models;
using Entities.ViewModels;
using Entities.ViewModels.Products;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Services.Dapper;
using Services.Interfaces;
using System.Data;
using static Dapper.SqlMapper;


namespace Services
{
    public class spProduct : MainService, IspProduct
    {
        private string StoreName = "spProduct";

        public spProduct(IConfiguration config, ErrorLoggingService errorLogger) : base(config, errorLogger) { }

        public async Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams)
        {
            return await CRUD<T>(StoreName, parameters, action, AutoFindParams);
        }
        public async Task<OperationResult> UpdateRelations(ProductInput entity, int? productId)
        {
            var parameters = new DynamicParameters(new
            {
                ProductId = productId,
                StatementType = "UpdateRelations"
            });

            // Add optional parameters only if they have valid values
            if (entity.Category?.Any() == true)
                parameters.Add("CategoryId", entity.Category.FirstOrDefault().Id);

            if (entity.SubCategory?.Any() == true)
                parameters.Add("SubCategoryId", entity.SubCategory.FirstOrDefault().Id);

            if (entity.Brand?.Any() == true)
                parameters.Add("BrandId", entity.Brand.FirstOrDefault().Id);

            if (entity.Series?.Any() == true)
                parameters.Add("SeriesId", entity.Series.FirstOrDefault().Id);

            if (entity.SubBrand?.Any() == true)
                parameters.Add("SubBrandId", entity.SubBrand.FirstOrDefault().Id);

            if (entity.Occasion?.Any() == true)
                parameters.Add("Occasions", Convert(entity.Occasion));

            try
            {
                using var connection = new SqlConnection(ConnectionString);
                await connection.OpenAsync().ConfigureAwait(false);

                var result = await connection.ExecuteAsync(StoreName, parameters, commandType: CommandType.StoredProcedure)
                .ConfigureAwait(false);

                OperationResult oResult = OperationResult.SuccessResult($"Object in {StoreName} was UpdateRelations successfully.");

                return oResult;
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(UpdateRelations), nameof(spProduct));
                return OperationResult.FailureResult(ex.Message);
            }
        }
        public async Task<OperationResult> DeleteRelations(int? productId)
        {
            var parameters = new DynamicParameters(new
            {
                ProductId = productId,
                StatementType = "DeleteRelations"
            });


            try
            {
                using var connection = new SqlConnection(ConnectionString);
                await connection.OpenAsync().ConfigureAwait(false);

                var result = await connection.ExecuteAsync(StoreName, parameters, commandType: CommandType.StoredProcedure)
                .ConfigureAwait(false);

                OperationResult oResult = OperationResult.SuccessResult($"Object in {StoreName} was DeleteRelations successfully.");

                return oResult;
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(UpdateRelations), nameof(spProduct));
                return OperationResult.FailureResult(ex.Message);
            }
        }
        public async Task<ProductListing> GetDefaultProductsAsync(ProductSearch entity)
        {
            var parameters = new DynamicParameters(new
            {
                PageNumber = entity.PageNumber,
                PageSize = entity.PageSize,
                StatementType = "GetDefaultProducts"
            });

            try
            {
                using (IDbConnection connection = Connection)
                {
                    connection.Open(); // Async open
                    using (var multi = await connection.QueryMultipleAsync(StoreName, parameters, commandType: CommandType.StoredProcedure))
                    {
                        var result = new ProductListing
                        {
                            TotalItems = multi.ReadFirstOrDefault<int>()
                        };

                        var productDetails = multi.Read<ProductListingDetail, string, string, string, ProductListingDetail>(
                            (product, src1, src2, src3) =>
                            {
                                if (!string.IsNullOrEmpty(src1)) product.Images.Add(new Images { Src = src1 });
                                if (!string.IsNullOrEmpty(src2)) product.Images.Add(new Images { Src = src2 });
                                if (!string.IsNullOrEmpty(src3)) product.Images.Add(new Images { Src = src3 });

                                return product;
                            },
                          splitOn: "Src1,Src2,Src3").Distinct().ToList();

                        result.Product = productDetails;

                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(GetFilteredProductsDetailsAsync), nameof(spProduct));
                return null;
            }
        }



        public async Task<ProductListing> GetFilteredProductsDetailsAsync(ProductSearch entity)
        {
            var parameters = new DynamicParameters(new
            {
                Title = entity.SearchString,
                CategoryId = entity.CategoryId,
                SubCategoryId = entity.SubCategoryId,
                Gender = entity.GenderId,
                Rating = entity.RatingId,
                Status = entity.StatusId,
                Brands = Convert(entity.Brands),
                Series = Convert(entity.BrandSeries),
                SubBrands = Convert(entity.SubBrands),
                Occasions = Convert(entity.Occasions),
                Trademarks = Convert(entity.Trademarks),
                PageNumber = entity.PageNumber,
                SortBy = entity.SortBy,
                SortDirection = entity.SortDirection,
                MinPrice = entity.MinPrice,
                MaxPrice = entity.MaxPrice,
                PageSize = entity.PageSize,
                StatementType = "GetFilteredProducts"
            });

            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();
                    using (var multi = await connection.QueryMultipleAsync(StoreName, parameters, commandType: CommandType.StoredProcedure))
                    {
                        var totalItems = multi.ReadFirst<int>();
                        var products = multi.Read<ProductListingDetail, string, string, string, ProductListingDetail>(
                            (product, src1, src2, src3) =>
                            {
                                product.Images = new List<Images>
                                {
                                 new Images { Src = src1 },
                                 new Images { Src = src2 },
                                 new Images { Src = src3 }
                                }.Where(i => !string.IsNullOrEmpty(i.Src)).ToList();

                                return product;
                            },
                            splitOn: "Src1,Src2,Src3"
                        ).ToList();

                        if (!products.Any())
                        {
                            // Log or handle the scenario where no products were returned.
                            return new ProductListing { TotalItems = 0, Product = new List<ProductListingDetail>() };
                        }
                        return new ProductListing { TotalItems = totalItems, Product = products };

                    }
                }
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(GetFilteredProductsDetailsAsync), nameof(spProduct));
                return null;
            }
        }


        public async Task<OperationResult> UpdateQuantity(OrderedProduct entity)
        {
            var param = new DynamicParameters();
            // var entity = await GetByIdAsync<Product>(product.Id);
            // var entitiesBySold = await GetBestSoldProduct<ProductById>(product.CategoryId, product.SubCategoryId);
            //int count = await entitiesBySold.CountAsync();

            if (entity.Quantity > 0)
            {
                entity.Quantity -= entity.CustomerPreferenceQuantity;
                entity.Sold += entity.CustomerPreferenceQuantity;

                /* for (int i = 0; i < count; i++)
                 {
                     var ent = await entitiesBySold.ElementAtAsync(i);
                     if (ent.Id == entity.Id) // Check if ent is the same as entity
                     {
                         switch (i)
                         {
                             case 0: entity.PremiumPackage = PremiumPackage.Gold; break;
                             case 1: entity.PremiumPackage = PremiumPackage.Silver; break;
                             case 2: entity.PremiumPackage = PremiumPackage.Bronze; break;
                             default: entity.PremiumPackage = PremiumPackage.None; break;
                         };
                     }
                 }*/
            }

            if (entity.Quantity > 0 && entity.Quantity < 3)
                entity.MarketStatus = MarketStatus.Low;

            if (entity.Quantity <= 0)
            {
                entity.Quantity = 0;
                entity.MarketStatus = MarketStatus.Sold;
            }

            param.Add("Id", entity.Id);
            param.Add("Quantity", entity.Quantity);
            param.Add("Sold", entity.Sold);
            param.Add("MarketStatus", entity.MarketStatus);
           // param.Add("PremiumPackage", entity.PremiumPackage);


            return await CRUDPost(StoreName, param, ActionEnum.UpdateProductsCount);
        }
        public async Task<OperationResult> UpdateStatus(int id, Status status)
        {
            var entity = await GetByIdAsync<Product>(id);

            if (entity == null)
                return OperationResult.FailureResult("Cannot update product status because product isn't found with ID:" + id);

            try { 
            var param = new DynamicParameters();

            entity.Status = status;
            
            param.Add("Id", entity.Id);
            param.Add("Status", entity.Status);

            return await CRUDPost(StoreName, param, ActionEnum.UpdateStatus);
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(UpdateStatus), nameof(spProduct));
                return OperationResult.FailureResult("Cannot update product status because product isn't found with ID:" + id);
            }
        }
        public async Task<OperationResult> UpdateMarketStatus(int id, MarketStatus status)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Id", id); // Id is used to pass old marketStatus 
                param.Add("MarketStatus", status);

                var result = await CRUDPost(StoreName, param, ActionEnum.UpdateMarketStatus);

                if (!result.Success)
                    return OperationResult.FailureResult("Failed to update market status for all products with old MarketStatus: " + id);

                return OperationResult.SuccessResult("Market status updated successfully.");
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(UpdateMarketStatus), nameof(spProduct));
                return OperationResult.FailureResult("An error occurred while updating the market status for all products with old MarketStatus: " + id);
            }
        }


        public async Task<OperationResult> UpdateCountOnRelations(int id, Status status)
        {
            var entity = await GetByIdAsync<Product>(id);

            if (entity == null)
                return OperationResult.FailureResult("Cannot update product status because product isn't found with ID:" + id);

            try
            {
                var param = new DynamicParameters();

                entity.Status = status;

                param.Add("Id", entity.Id);
                param.Add("Status", entity.Status);

                return await CRUDPost(StoreName, param, ActionEnum.UpdateStatus);
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(UpdateStatus), nameof(spProduct));
                return OperationResult.FailureResult("Cannot update product status because product isn't found with ID:" + id);
            }
        }
        /*
        public async Task<int> GetCountBy(int? categoryId, int? subCategoryId)
        {
            if (categoryId <= 0 || subCategoryId <= 0)
                return default;

            return await GetCountBy(StoreName, new { CategoryId = categoryId, SubCategoryId = subCategoryId, StatementType = "GetAllCountBy" });
        }


        public async Task<IAsyncEnumerable<T>> GetAll<T>(object parameters)
        {
            return await GetAll<T>(StoreName, parameters);
        }*/

        public static string Convert(IEnumerable<dynamic> array)
        {
            if (array == null || !array.Any())
            {
                return null;
            }

            // Map to integers (assuming the dynamic object has an Id property)
            var ids = array.Select(item => (int)item.Id); // Cast to int to ensure proper type

            // Join the integers with commas
            string result = string.Join(",", ids);
            return result;
        }

        public async Task<IAsyncEnumerable<SpecialProduct>> GetSpecialProductsAsync(int take)
        {
            var parameters = new DynamicParameters(new
            {
                Take = take,
                StatementType = "GetSpecialProducts"
            });

            try
            {
                using (IDbConnection connection = Connection)
                {
                    connection.Open();

                    using (var multi = await connection.QueryMultipleAsync(StoreName, parameters, commandType: CommandType.StoredProcedure))
                    {

                        var product = multi.Read<SpecialProduct, string, string, string, SpecialProduct>(
                            (product, src1, src2, src3) =>
                            {
                                if (!string.IsNullOrEmpty(src1)) product.Images.Add(new Images { Src = src1 });
                                if (!string.IsNullOrEmpty(src2)) product.Images.Add(new Images { Src = src2 });
                                if (!string.IsNullOrEmpty(src3)) product.Images.Add(new Images { Src = src3 });

                                return product;
                            },
                            splitOn: "Src1,Src2,Src3").Distinct().ToList();

                        connection.Close();
                        return product is not null ? product.ToAsyncEnumerable() : null;
                    }
                }
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(GetSpecialProductsAsync), nameof(spProduct));
                return null;
            }
        }

        public async Task<IAsyncEnumerable<RelatedProduct>> GetRelatedProductsAsync(int take, int? categoryId, int? subCategoryId)
        {
            var parameters = new DynamicParameters(new
            {
                Take = take,
                CategoryId = categoryId,
                SubCategoryId = subCategoryId,
                StatementType = "GetRelatedProducts"
            });

            try
            {
                using (IDbConnection connection = Connection)
                {
                    connection.Open();

                    using (var multi = await connection.QueryMultipleAsync(StoreName, parameters, commandType: CommandType.StoredProcedure))
                    {

                        var product = multi.Read<RelatedProduct, string, string, string, RelatedProduct>(
                            (product, src1, src2, src3) =>
                            {
                                if (!string.IsNullOrEmpty(src1)) product.Images.Add(new Images { Src = src1 });
                                if (!string.IsNullOrEmpty(src2)) product.Images.Add(new Images { Src = src2 });
                                if (!string.IsNullOrEmpty(src3)) product.Images.Add(new Images { Src = src3 });

                                return product;
                            },
                            splitOn: "Src1,Src2,Src3").Distinct().ToList();

                        connection.Close();
                        return product is not null ? product.ToAsyncEnumerable() : null;
                    }
                }
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(GetRelatedProductsAsync), nameof(spProduct));
                return null;
            }
        }

        /* var images = multi.Read<Images>().ToList();

         // Group images by ProductId and create a dictionary
          var imagesGroupedByProduct = images.GroupBy(img => img.ProductId)
                                             .ToDictionary(g => g.Key, g => g.ToList());

          // Associate images with their respective products
          foreach (var product in products)
          {
              if (imagesGroupedByProduct.TryGetValue(product.Id, out var productImages))
              {
                  product.Images = productImages;
              }
          }*/

        /*
        public async Task<List<object>> GetAllMultiple(object parameters, Type[] entityTypes)
        {
            return await GetAllMultiple(StoreName, parameters, entityTypes);
        }

        public async Task<IAsyncEnumerable<T>> GetBestSoldProduct<T>(int categoryId, int? subCategoryId)
        {
            return await GetAll<T>(StoreName, new { CategoryId = categoryId, SubCategoryId = subCategoryId, StatementType = "GetBestSoldProduct" });
        }
        */

        public async Task<IAsyncEnumerable<Products>> GetProductsAsync(int take)
        {
            var parameters = new DynamicParameters(new
            {
                Take = take,
                StatementType = "GetProducts"
            });

            try
            {
                using (IDbConnection connection = Connection)
                {
                    connection.Open();
                    var products = await connection.QueryAsync<Products>(StoreName, parameters, commandType: CommandType.StoredProcedure);
                    connection.Close();

                    return products is not null ? products.ToAsyncEnumerable() : null;
                }
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(GetProductsShort), nameof(spProduct));
                return null;
            }
        }

        public async Task<IAsyncEnumerable<ProductShort>> GetProductsShort(string title, int take)
        {
            var parameters = new DynamicParameters(new
            {
                Title = title,
                Take = take,
                StatementType = "GetAllShort"
            });

            try
            {
                using (IDbConnection connection = Connection)
                {
                    connection.Open();
                    var products = await connection.QueryAsync<ProductShort>(StoreName, parameters, commandType: CommandType.StoredProcedure);
                    connection.Close();

                    return products is not null ? products.ToAsyncEnumerable() : null;
                }
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(GetProductsShort), nameof(spProduct));
                return null;
            }
        }

        public async Task<T> GetByIdAsync<T>(int id)
        {
            if (id <= 0)
                return default;

            return await GetByAsync<T>(StoreName, new { Id = id, StatementType = "GetById" });
        }

        public async Task<T> GetByIdWithImageAsync<T>(int id)
        {
            if (id <= 0)
                return default;

            return await GetByAsync<T>(StoreName, new { Id = id, StatementType = "GetByIdWithImage" });
        }

        public async Task<ProductDetails> GetFullByIdAsync(int? id, string ShortName)
        {
            var parameters = new DynamicParameters(new
            {
                ProductId = id,
                ShortName = ShortName,
                IncludeImages = true,
                IncludeReviews = true,
                IncludeVariants = true,
                IncludeStoryPage = true,
                IncludeStoryBlocks = true,
                IncludeBundle = true,
                StatementType = "GetProductFull"
            });

            try
            {
                using var connection = new SqlConnection(ConnectionString);
                await connection.OpenAsync().ConfigureAwait(false);

                var multi = await connection.QueryMultipleAsync(StoreName, parameters, commandType: CommandType.StoredProcedure).ConfigureAwait(false);

                var productDetails = await SafeReadSingleOrDefaultAsync<ProductDetails>(multi);
                if (productDetails == null)
                    return null;

                // Images
                productDetails.Images = (await SafeReadAsync<Images>(multi))?.ToList() ?? new List<Images>();

                // Reviews
                productDetails.Reviews = (await SafeReadAsync<Review>(multi))?.ToList() ?? new List<Review>();

                // Bundles
                var bundles = await SafeReadAsync<BundleVW>(multi);
                var firstBundle = bundles?.FirstOrDefault();

                if (firstBundle != null)
                {
                    var bundleItems = await SafeReadAsync<BundleItemVW>(multi);
                    firstBundle.BundleItems = bundleItems?.Where(b => b.BundleId == firstBundle.Id).ToList() ?? new List<BundleItemVW>();
                }

                productDetails.Bundle = firstBundle;


                // Variants
                var variants = await SafeReadAsync<VariantGroupOutput>(multi);
                productDetails.Variants = variants != null ? await GroupByVariantAsync(variants.ToList()) : new List<GroupedVariant>();

                // StoryPages
                var storyPages = await SafeReadAsync<StoryPageDto>(multi);
                var storyPage = storyPages?.FirstOrDefault();

                if (storyPage != null)
                {
                    var blocks = await SafeReadAsync<StoryBlockDto>(multi);
                    storyPage.Blocks = blocks?.Where(b => b.Id == storyPage.Id).ToList() ?? new List<StoryBlockDto>();
                }

                productDetails.StoryPage = storyPage;

                return productDetails;
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(GetFullByIdAsync), nameof(StoreName));
                throw new Exception("An error occurred while fetching product details.", ex);
            }
        }
        public async Task<ProductWithRelations> GetByIdWithRelationsAsync(int productId)
        {
            var parameters = new DynamicParameters(new
            {
                Id = productId,
                ProductId = productId,
                StatementType = "GetByIdWithRelations"
            });

            try
            {
                using var connection = new SqlConnection(ConnectionString);
                await connection.OpenAsync().ConfigureAwait(false);

                using (var multi = await connection.QueryMultipleAsync(StoreName, parameters, commandType: CommandType.StoredProcedure))
                    {
                        // 1. Main product
                        var product = await multi.ReadSingleOrDefaultAsync<Product>();
                        if (product == null)
                            return null;

                        // 2. Categories
                        var categories = (await multi.ReadAsync<Category>()).ToList();

                        // 3. SubCategories
                        var subcategories = (await multi.ReadAsync<SubCategory>()).ToList();

                        // 4. Occasions
                        var occasions = (await multi.ReadAsync<Occasion>()).ToList();

                        // 5. Brands
                        var brands = (await multi.ReadAsync<Brands>()).ToList();

                        // 6. Series
                        var series = (await multi.ReadAsync<Series>()).ToList();

                        // 7. SubBrands
                        var subBrands = (await multi.ReadAsync<SubBrands>()).ToList();

                        // 8. Bundles (expect 0 or 1)
                        var bundles = (await multi.ReadAsync<BundleVW>()).ToList();
                        var firstBundle = bundles.FirstOrDefault();

                        // 9. BundleItems (only if bundle exists)
                        if (firstBundle != null)
                        {
                            var bundleItems = (await multi.ReadAsync<BundleItemVW>()).ToList();
                            // Assign only items that belong to this bundle, though ideally SP should return filtered
                            firstBundle.BundleItems = bundleItems.Where(bi => bi.BundleId == firstBundle.Id).ToList();
                        }
                        else
                        {
                            // still consume the result set so multi reader stays in sync
                            await multi.ReadAsync<BundleItemVW>();
                        }

                        // 10. StoryPages (expect 0 or 1)
                        var storyPages = (await multi.ReadAsync<StoryPageDto>()).ToList();
                        var storyPage = storyPages.FirstOrDefault();

                        // 11. StoryBlocks (only if storyPage exists)
                        if (storyPage != null)
                        {
                            var blocks = (await multi.ReadAsync<StoryBlockDto>()).ToList();
                            // Correct filtering: blocks belonging to this storyPage
                            storyPage.Blocks = blocks.Where(b => b.StoryPageId == storyPage.Id).ToList();
                        }
                        else
                        {
                            await multi.ReadAsync<StoryBlockDto>();
                        }

                        // 12. Images
                        var images = (await multi.ReadAsync<Images>()).ToList();

                        // 13. Variants & Variant Items
                        var groupedVariantItems = (await multi.ReadAsync<dynamic>()).ToList();

                        var groupedVariants = groupedVariantItems
                            .GroupBy(item => new
                            {
                                vId = (int)item.vId,
                                Title = (string)item.VariantTitle,
                                Icon = (string)item.VariantIcon
                            })
                            .Select(g => new GroupedVariant
                            {
                                Id = g.Key.vId,
                                Title = g.Key.Title,
                                Icon = g.Key.Icon,
                                VariantItems = g.Select(i => new GroupedVariantItem
                                {
                                    Id = (int)i.VVIRelationId,
                                    vId = (int)i.vId,
                                    Value = (string)i.ItemValue,
                                    Image = (string)i.ItemImage
                                }).ToList()
                            })
                            .ToList();

                        // Assemble final DTO
                        var productWithRelations = new ProductWithRelations
                        {
                            Product = product,
                            Categories = categories,
                            SubCategories = subcategories,
                            Occasions = occasions,
                            Brands = brands,
                            Series = series,
                            SubBrands = subBrands,
                            Bundle = firstBundle,
                            StoryPage = storyPage,
                            GroupedVariants = groupedVariants,
                            Images = images
                        };

                        return productWithRelations;
                    }
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(GetByIdWithRelationsAsync), nameof(StoreName));
                return null;
            }
        }



        private Task<List<GroupedVariant>> GroupByVariantAsync(List<VariantGroupOutput> items)
        {
            if (!items.Any())
                return Task.FromResult(new List<GroupedVariant>());

            var groupedVariants = items
                .GroupBy(item => item.VariantId)
                .Select(group => new GroupedVariant
                {
                    Id = group.Key,
                    Title = group.First().Title,
                    Icon = group.First().Icon,
                    VariantItems = group.Select(item => new GroupedVariantItem
                    {
                        Id = item.VariantItemId,
                        VVIRelationId = item.VVIRelationId,
                        vId = group.Key,
                        Value = item.Value,
                        Image = item.Image
                    }).ToList()
                }).ToList();

            return Task.FromResult(groupedVariants);
        }
        /*
        public async Task<OperationResult> AddRating(object parameters)
        {
            var param = new DynamicParameters();
            param.AddDynamicParams(parameters);

            return await CRUDPost(StoreName, param, ActionEnum.AddRating);
        }
        */
        public async Task<OperationResult> Truncate()
        {
            return await CRUDPost(StoreName, null, ActionEnum.Truncate);
        }
    }
}

