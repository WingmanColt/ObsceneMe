using Core.Helpers;
using Dapper;
using Entities.Enums;
using Entities.Models;
using Entities.ViewModels;
using Microsoft.Extensions.Configuration;
using Services.Dapper;
using Services.Interfaces;
using System;
using System.Data;
using static Dapper.SqlMapper;



namespace Services
{
    public class spCategory : MainService, IspCategory
    {
        private string StoreName = "spCategories";

        public spCategory(IConfiguration config, ErrorLoggingService errorLogger) : base(config, errorLogger) { }

        public async Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams)
        {
            var param = new DynamicParameters();

            if (AutoFindParams)
                param = await ConstructParametersAsync<T>(StoreName, parameters);           
            else
                param.AddDynamicParams(parameters);

            return await CRUDPost(StoreName, param, action);
        }

        public async Task<IAsyncEnumerable<T>> GetUsedCategories<T>()
        {
            return await GetAll<T>(StoreName, new { StatementType = "GetUsedCategories" });
        }
        public async Task<IAsyncEnumerable<T>> GetAll<T>()
        {
            return await GetAll<T>(StoreName, new { StatementType = "GetAll" });
        }
        public async Task<IAsyncEnumerable<CategoriesVW>> GetAllWithSubCategories(string statementType)
        {
            var parameters = new DynamicParameters(new
            {
                StatementType = statementType
            });

            try
            {
                using (IDbConnection connection = Connection)
                {
                    connection.Open();

                    using (var multi = await connection.QueryMultipleAsync(StoreName, parameters, commandType: CommandType.StoredProcedure))
                    {
                        var categoriesDictionary = new Dictionary<int, CategoriesVW>();

                        // Read categories and subcategories from the result set
                        var categoriesWithSubCategories = multi.Read<CategoriesVW, SubCategoriesVW, CategoriesVW>(
                            (category, subCategory) =>
                            {
                                if (!categoriesDictionary.TryGetValue(category.Id, out var categoryEntry))
                                {
                                    categoryEntry = category;
                                    categoryEntry.SubCategories = new List<SubCategory>();
                                    categoriesDictionary.Add(categoryEntry.Id, categoryEntry);
                                }

                                if (subCategory != null)
                                {
                                    SubCategory sub = new()
                                    {
                                        Id = subCategory.SubCategoryId,
                                        Title = subCategory.SubCategoryTitle,
                                        ShortName = subCategory.SubCategoryShortName,
                                        Icon = subCategory.SubCategoryIcon,
                                        ProductsCount = subCategory.ProductsCount,
                                        CategoryShortName = category.ShortName
                                    };

                                    categoryEntry.SubCategories.Add(sub);
                                }

                                return categoryEntry;
                            },
                            splitOn: "SubCategoryId"
                        );

                        // Group categories by ID and return them
                        var groupedCategories = categoriesDictionary.Values.ToAsyncEnumerable();

                        connection.Close();
                        return groupedCategories;
                    }
                }
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(GetAllWithSubCategories), nameof(spCategory));
                return null;
            }
        }

        public async Task<T> GetByIdAsync<T>(int id)
        {
            if (id <= 0)
                return default;

            return await GetByAsync<T>(StoreName, new { Id = id, StatementType = "GetById" });
        }
        public async Task<int> GetTotalProductsCount(int categoryId)
        {
            if (categoryId <= 0)
                return default;

            return await GetCountBy(StoreName, new { Id = categoryId, StatementType = "GetTotalProductsCount" });
        }
        public async Task<int> GetSubCategoriesCount(int categoryId)
        {
            if (categoryId <= 0)
                return default;

            return await GetCountBy(StoreName, new { Id = categoryId, StatementType = "GetSubCategoriesCount" });
        }
        public async Task<OperationResult> SeedCategories(bool deleteAllEverytime)
        {
            List<CategoryInput> List = new();

            string[] lines = await File.ReadAllLinesAsync(@"wwwroot/Categories.txt");

            for (int i = 0; i < lines?.Length; i++)
            {
                // Check if the line is empty or contains only whitespace characters
                if (string.IsNullOrWhiteSpace(lines[i]) || lines[i].StartsWith("//"))
                {
                    continue; // Skip this line
                }

                var vals1 = lines[i]?.Split('#');

                if (vals1.Length >= 3)
                {
                    var category = new CategoryInput
                    {
                        Title = vals1[0].ToString(),
                        Icon = vals1[1].ToString(),
                        ShortName = vals1[2].ToString(),
                        TotalProductsCount = 0,
                        SubCategoriesCount = 0
                    };

                    List.Add(category);
                }
                else
                {
                    // Handle lines that do not have enough parts (optional)
                    // You can log or handle such cases according to your requirements
                }
            }

            IAsyncEnumerable<Category> result = await GetAll<Category>();

            if (!deleteAllEverytime)
            {
                foreach (var item in List)
                {
                    if (result is not null && await result.AnyAsync())
                    {
                        var existingCategory = await result.FirstOrDefaultAsync(c => c.ShortName == item.ShortName);

                        if (existingCategory != null)
                        {
                            // Delete the existing category record before adding the new one
                            var isDeleted = await CRUD<Category>(new { Id = existingCategory.Id }, ActionEnum.Delete, false);

                            if (!isDeleted.Success)
                                return OperationResult.FailureResult("Category deletion failed...");
                        }
                    }


                    // Insert the new SubCategory record
                    OperationResult isCreated = await CRUD<Category>(item, ActionEnum.Create, true);

                    if (!isCreated.Success)
                        return OperationResult.FailureResult("Categories have not been created...");
                }
            }
            else
            {
                if (result is not null && await result.AnyAsync())
                {
                    await foreach (var item in result)
                    {
                        await CRUD<Category>(new { ShortName = item.ShortName }, ActionEnum.Delete, false);
                    }
                }

                foreach (var item in List)
                {

                    // Insert the new SubCategory record
                    OperationResult isCreated = await CRUD<Category>(item, ActionEnum.Create, true);

                    if (!isCreated.Success)
                        return OperationResult.FailureResult("Categories have not been created...");
                }

            }

            return OperationResult.SuccessResult("");
        }
    }
}


