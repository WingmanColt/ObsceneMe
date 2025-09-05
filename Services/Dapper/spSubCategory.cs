using Core.Helpers;
using Dapper;
using Entities.Enums;
using Entities.Models;
using Microsoft.Extensions.Configuration;
using Services.Dapper;
using Services.Interfaces;

namespace Services
{
    public class spSubCategory : MainService, IspSubCategory
    {
        private string StoreName = "spSubCategories";

        public spSubCategory(IConfiguration config, ErrorLoggingService errorLogger) : base(config, errorLogger) { }

        public async Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams)
        {
            var param = new DynamicParameters();

            if (AutoFindParams)
                param = await ConstructParametersAsync<T>(StoreName, parameters);
            else
                param.AddDynamicParams(parameters);

            return await CRUDPost(StoreName, param, action);
        }
        public async Task<IAsyncEnumerable<T>> GetAll<T>()
        {
            return await GetAll<T>(StoreName, new { StatementType = "GetAll" });
        }
        public async Task<IAsyncEnumerable<T>> GetAllByCategory<T>(string shortName)
        {
            return await GetAll<T>(StoreName, new { CategoryShortName = shortName, StatementType = "GetAllByCategory" });
        }
        public async Task<IAsyncEnumerable<T>> GetByTitle<T>(string title)
        {
            return await GetAll<T>(StoreName, new { Title = title, StatementType = "GetByTitle" });
        }
        /*
         public async Task<T> GetByIdAsync<T>(int id)
         {
             if (id <= 0)
                 return default;

             return await GetByAsync<T>(StoreName, new { Id = id, StatementType = "GetById" });
         }
         public async Task<int> GetProductsCountById(int subCategoryId)
         {
             if (subCategoryId <= 0)
                 return default;

             return await GetCountBy(StoreName, new { Id = subCategoryId, StatementType = "GetProductsCountById" });
         }
        */
        public async Task<OperationResult> SeedCategories(bool deleteAllEverytime)
        {
            List<SubCategoryInput> List = new();

            string[] lines = await File.ReadAllLinesAsync(@"wwwroot/SubCategories.txt");

            for (int i = 0; i < lines?.Length; i++)
            {
                // Check if the line is empty or contains only whitespace characters
                if (string.IsNullOrWhiteSpace(lines[i]) || lines[i].StartsWith("//"))
                {
                    continue; // Skip this line
                }

                var vals1 = lines[i]?.Split('#');

                if (vals1.Length >= 4)
                {
                    var category = new SubCategoryInput
                    {
                        Title = vals1[0].Trim(),
                        Icon = vals1[1].Trim(),
                        ShortName = vals1[2].Trim(),
                        CategoryShortName = vals1[3].Trim(),
                        ProductsCount = 0
                    };

                    List.Add(category);
                }
                else
                {
                    // Handle lines that do not have enough parts (optional)
                    // You can log or handle such cases according to your requirements
                }
            }

            IAsyncEnumerable<SubCategory> result = await GetAll<SubCategory>();
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
                            var isDeleted = await CRUD<SubCategory>(new { Id = existingCategory.Id }, ActionEnum.Delete, false);

                            if (!isDeleted.Success)
                                return OperationResult.FailureResult("SubCategory deletion failed...");
                        }
                    }


                    // Insert the new SubCategory record
                    OperationResult isCreated = await CRUD<SubCategory>(item, ActionEnum.Create, true);

                    if (!isCreated.Success)
                        return OperationResult.FailureResult("Sub Categories have not been created...");
                }
            }
            else
            {
                if (result is not null && await result.AnyAsync())
                {
                    await foreach (var item in result)
                    {
                        await CRUD<SubCategory>(new { ShortName = item.ShortName }, ActionEnum.Delete, false);
                    }
                }

                foreach (var item in List)
                {

                    // Insert the new SubCategory record
                    OperationResult isCreated = await CRUD<SubCategory>(item, ActionEnum.Create, true);

                    if (!isCreated.Success)
                        return OperationResult.FailureResult("Sub Categories have not been created...");
                }

            }

            return OperationResult.SuccessResult("");
        }
    }
}


