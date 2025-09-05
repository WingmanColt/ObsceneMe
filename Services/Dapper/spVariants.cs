using Core.Helpers;
using Dapper;
using Entities.Enums;
using Entities.Models;
using Entities.ViewModels;
using Entities.ViewModels.Products;
using Microsoft.Extensions.Configuration;
using Services.Dapper;
using Services.Enums;
using Services.Interfaces;
using System.Collections.Concurrent;
using System.Text.Json;

namespace Services
{
    public class spVariants : MainService, IspVariants
    {
        private readonly string VariantsStoreName = "spVariants";
        private readonly string VariantItemStoreName = "spVariantItem";
        private readonly string VariantsRelationStoreName = "spVariantProductRelation";
        private readonly string VariantsAndVariantItemRelationStoreName = "spVariantAndVariantItemRelation";

        public spVariants(IConfiguration config, ErrorLoggingService errorLogger) : base(config, errorLogger) { }

        public async Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, VariantActionEnum variantActionEnum, bool AutoFindParams)
        {
            var param = new DynamicParameters();

            string storeName = variantActionEnum switch
            {
                VariantActionEnum.Variant => VariantsStoreName,
                VariantActionEnum.VariantItem => VariantItemStoreName,
                VariantActionEnum.VariantProductRelation => VariantsRelationStoreName,
                VariantActionEnum.VariantAndVariantItemRelation => VariantsAndVariantItemRelationStoreName,
                _ => null, // Handle any other cases if needed
            };

            if (AutoFindParams)
                param = await ConstructParametersAsync<T>(storeName, parameters);
            else
                param.AddDynamicParams(parameters);

            return await CRUDPost(storeName, param, action);
        }

        public async Task<IAsyncEnumerable<T>> GetAll<T>(VariantActionEnum variantActionEnum, bool withoutProductId)
        {
            string StatementType = null, Storename = null;
            switch (variantActionEnum)
            {
                case VariantActionEnum.Variant:
                    {

                        StatementType = "GetAll";
                        Storename = VariantsStoreName;
                    }
                    break;
                case VariantActionEnum.VariantItem:
                    {
                        StatementType = "GetAll";
                        Storename = VariantItemStoreName;
                    }
                    break;
                case VariantActionEnum.VariantProductRelation:
                    {
                        StatementType = withoutProductId ? "GetAllFullWithoutProductId" : "GetAllFull";
                        Storename = VariantsRelationStoreName;

                    }
                    break;
                case VariantActionEnum.VariantAndVariantItemRelation:
                    {
                        StatementType = "GetAll";
                        Storename = VariantsAndVariantItemRelationStoreName;

                    }
                    break;
                case VariantActionEnum.Full:
                    {
                        StatementType = "GetAllFullSeparated";
                        Storename = VariantsRelationStoreName;
                    }
                    break;
            }

            return await GetAll<T>(Storename, new { StatementType = StatementType });
        }



        private async Task<IAsyncEnumerable<T>> GetAllByvId<T>(int vId, VariantActionEnum variantActionEnum)
        {
            if (vId <= 0)
            {
                return default;
            }

            string statementType = "GetByvId";
            string storeName = variantActionEnum switch
            {
                VariantActionEnum.Variant => VariantsStoreName,
                VariantActionEnum.VariantItem => VariantItemStoreName,
                _ => null, // Handle any other cases if needed
            };

            return await GetAll<T>(storeName, new { vId, StatementType = statementType });
        }


        public async Task<T> GetByTitleOrValue<T>(string val, VariantActionEnum variantActionEnum)
        {
            if (String.IsNullOrEmpty(val))
                return default;

            string statementType = variantActionEnum switch
            {
                VariantActionEnum.Variant => "GetByTitle",
                VariantActionEnum.VariantItem => "GetByValue",
                _ => null, // Handle any other cases if needed
            };

            string storeName = variantActionEnum switch
            {
                VariantActionEnum.Variant => VariantsStoreName,
                VariantActionEnum.VariantItem => VariantItemStoreName,
                _ => null, // Handle any other cases if needed
            };

            return await GetByAsync<T>(storeName, new { Value = val, Title = val, StatementType = statementType });
        }

        // SEED VARIANTS & ITEMS & RELATIONS
        public async Task<OperationResult> SeedAllVariant()
        {
            string text = await File.ReadAllTextAsync(@"ClientApp/environments/variants/Variants.json");
            VariantsInput[] variantOptions = JsonSerializer.Deserialize<VariantsInput[]>(text);

            foreach (var obj in variantOptions)
            {
                // Try to find existing variants with the same title
                var existingVariants = await GetAllByvId<Variants>(obj.vId, VariantActionEnum.Variant);

                if (existingVariants is not null && await existingVariants.AnyAsync())
                {
                    // Update existing variants with the new data
                    await foreach (var existingVariant in existingVariants)
                    {
                        obj.vId = existingVariant.vId; // Set the ID of the existing variant
                        var variantResult = await CRUD<Variants>(obj, ActionEnum.Update, VariantActionEnum.Variant, true);

                        if (variantResult.Success)
                            await CreateUpdateVariantItems(obj, existingVariant.Id);
                    }
                }
                else
                {
                    // No existing variants found, create a new one
                    var variantResult = await CRUD<Variants>(obj, ActionEnum.Create, VariantActionEnum.Variant, true);

                    if (variantResult.Success)
                        await CreateUpdateVariantItems(obj, variantResult.Id);
                }
            }

            return OperationResult.SuccessResult("Variants seeding is done.");
        }
        private async Task<OperationResult> CreateUpdateVariantItems(VariantsInput obj, int? Id)
        {
            foreach (var obj2 in obj.VariantItems)
            {
                // Try to find an existing variant item by some unique identifier (e.g., VariantItemName)
                var existingVariantItem = await GetAllByvId<VariantItem>(obj2.vId, VariantActionEnum.VariantItem).ConfigureAwait(true);

                if (existingVariantItem is not null && await existingVariantItem.AnyAsync())
                {
                    // Update existing variants with the new data
                    await foreach (var ent in existingVariantItem)
                    {
                        obj2.vId = ent.vId; // Set the ID of the existing variant
                        var variantItem = await CRUD<VariantItem>(obj2, ActionEnum.Update, VariantActionEnum.VariantItem, true).ConfigureAwait(true);

                        if (!variantItem.Success)
                            OperationResult.FailureResult("Variant Items update failure.");
                    }

                }
                else
                {
                    // Variant item does not exist, create it
                    var variantItemResult = await CRUD<VariantItem>(obj2, ActionEnum.Create, VariantActionEnum.VariantItem, true).ConfigureAwait(true);

                    if (variantItemResult.Success)
                        await AddVariantAndVariantItemRelation((int)Id, (int)variantItemResult.Id).ConfigureAwait(true);
                    //  await AddVariantProductRelation((int)Id, (int)variantItemResult.Id);
                }

            }
            return OperationResult.SuccessResult("Variant Items seeding is done.");
        }


        // Add VariantAndVariantItem relation private methods
        private async Task AddVariantAndVariantItemRelation(int variantId, int variantItemId)
        {
            // Check if the relation already exists between variant and variantItem

            bool isRelationExists = await CheckVariantAndVariantItemRelation(variantId, variantItemId, "Exists").ConfigureAwait(true);
            if (isRelationExists)
                return;


            var relation = new VariantAndVariantItemRelationInput
            {
                VariantId = variantId,
                VariantItemId = variantItemId
            };

            await CRUD<VariantAndVariantItemRelation>(relation, ActionEnum.Create, VariantActionEnum.VariantAndVariantItemRelation, true).ConfigureAwait(true);
        }
        private async Task<bool> CheckVariantAndVariantItemRelation(int variantId, int variantItemId, string statementType)
        {
            if (variantId <= 0 && variantItemId <= 0)
                return default;

            return await CheckIfExistsAsync(VariantsAndVariantItemRelationStoreName, new { VariantId = variantId, VariantItemId = variantItemId, StatementType = statementType }).ConfigureAwait(true);
        }





        // CREATE RELATIONS WHEN PRODUCT IS ADDING

        // Used in product add
        public async Task<OperationResult> CreateVariantsAsync(IEnumerable<GroupedVariant> entities, int productId)
        {
            if (productId < 0 || !entities.Any()) 
                return OperationResult.FailureResult("Invalid product ID or empty entities list.");

            var allItems = entities.SelectMany(ent => ent.VariantItems.Select(item => new VariantProductRelationInput
            {
                ProductId = productId,
                VariantAndVariantItemRelationId = item.VVIRelationId
            })).ToList();

            var options = new ParallelOptions { MaxDegreeOfParallelism = 4 }; // Adjust based on your environment capabilities

            var errors = new ConcurrentBag<string>();

            var deleteAllByProductId = await CRUD<VariantProductRelation>(new { ProductId = productId }, ActionEnum.Delete, VariantActionEnum.VariantProductRelation, false);

            if (!deleteAllByProductId.Success)
                return OperationResult.FailureResult("Errors occurred during variant product relation deletion of previous relations.");

            await Parallel.ForEachAsync(allItems, options, async (relation, cancellationToken) =>
                {
                    try
                    {
                        // Assuming CRUD method returns OperationResult
                        var result = await CRUD<VariantProductRelation>(relation, ActionEnum.Create, VariantActionEnum.VariantProductRelation, true);
                        if (!result.Success)
                        {
                            errors.Add(result.FailureMessage ?? "An error occurred.");
                        }
                    }
                    catch (Exception ex)
                    {
                        errorLogger.LogException(ex, nameof(CreateVariantsAsync), nameof(spVariants));
                        errors.Add(ex.Message);
                    }
                });

                if (!errors.Any())
                {
                    return OperationResult.SuccessResult("All ProductVariantRelations has been created.");
                }
                else
                {
                    // Here you might want to aggregate all errors or just return a generic fail result.
                    return OperationResult.FailureResult("Errors occurred during variant product relation creation.");
                }
            
        }



        private async Task CreateVariantItem(VariantsInput variantsInput, int variantId)
        {
        //    if (variantId < 0 || productId < 0 || !(await entities.AnyAsync()))
          //      return;

            foreach (var ent in variantsInput.VariantItems)
            {
             //   var isVariantItemExists = await GetByTitleOrValue<VariantItem>(ent.Value, VariantActionEnum.VariantItem);
              //  if (isVariantItemExists is null)
               //     await CRUD(ent, ActionEnum.Create, VariantActionEnum.VariantItem);

                await CreateVariantProductRelations(new VariantAndVariantItemRelationInput { VariantId = variantId, VariantItemId = ent.Id } );
            };
        }

        private async Task CreateVariantProductRelations(VariantAndVariantItemRelationInput variantProductRelation)
        {
            if (variantProductRelation.VariantId < 0 || variantProductRelation.VariantItemId < 0)
                return;

            var isRelationExists = await CheckProductVariantRelation(variantProductRelation.VariantId, variantProductRelation.VariantItemId, "Select");
            if (!isRelationExists)
                await CRUD<VariantProductRelation>(variantProductRelation, ActionEnum.Create, VariantActionEnum.VariantProductRelation, true);
        }



        // Add ProductAndVariantRelation relations private methods
        private async Task AddVariantProductRelation(int productId, int variantAndVariantItemRelationId)
        {
            bool isRelationExists = await CheckProductVariantRelation(productId, variantAndVariantItemRelationId, "Exists");
            if (isRelationExists)
                return;


            var relation = new VariantProductRelationInput
            {
                ProductId = productId,
                VariantAndVariantItemRelationId = variantAndVariantItemRelationId
            };

            await CRUD<VariantProductRelation>(relation, ActionEnum.Create, VariantActionEnum.VariantProductRelation, true);
        }
        private async Task<bool> CheckProductVariantRelation(int productId, int variantAndVariantItemRelationId, string statementType)
        {
            if (productId <= 0 && variantAndVariantItemRelationId <= 0)
                return default;


            return await CheckIfExistsAsync(VariantsRelationStoreName, new { ProductId = productId, VariantAndVariantItemRelationId = variantAndVariantItemRelationId, StatementType = statementType });
        }


    }

}


