using Core.Helpers;
using Dapper;
using Entities.Enums;
using Entities.Models;
using Microsoft.Extensions.Configuration;
using Services.Dapper;
using Services.Interfaces;

namespace Services
{
    public class spSubBrands : MainService, IspSubBrands
    {
        private string StoreName = "spSubBrands";
        public spSubBrands(IConfiguration config, ErrorLoggingService errorLogger) : base(config, errorLogger) { }

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

        public async Task<IAsyncEnumerable<T>> GetAllUsed<T>()
        {
            return await GetAll<T>(StoreName, new { StatementType = "GetUsedSubBrands" });
        }
      /*  public async Task<T> GetByIdAsync<T>(int id)
        {
            if (id <= 0)
                return default;

            return await GetByAsync<T>(StoreName, new { Id = id, StatementType = "GetById" });
        }
        public async Task<int> GetTotalProductsCount(int brandId)
        {
            if (brandId <= 0)
                return default;

            return await GetCountBy(StoreName, new { Id = brandId, StatementType = "GetTotalProductsCount" });
        }*/

        public async Task<OperationResult> SeedSubBrands(bool deleteAllEverytime)
        {
            List<BrandInput> List = new();

            string[] lines = await File.ReadAllLinesAsync(@"wwwroot/SubBrands.txt");

            for (int i = 0; i < lines?.Length; i++)
            {
                // Check if the line is empty or contains only whitespace characters
                if (string.IsNullOrWhiteSpace(lines[i]))
                {
                    continue; // Skip this line
                }

                var vals1 = lines[i]?.Split('#');

                if (vals1.Length >= 3)
                {
                    var ent = new BrandInput
                    {
                        Title = vals1[0].Trim(),
                        Icon = vals1[1].Trim(),
                        ShortName = vals1[2].Trim(),
                        TotalProductsCount = 0
                    };

                    List.Add(ent);
                }
                else
                {
                    // Handle lines that do not have enough parts (optional)
                    // You can log or handle such cases according to your requirements
                }
            }

            IAsyncEnumerable<Brands> result = await GetAll<Brands>();

            // Iterate through the list and check if each Brands already exists in the database
            if (!deleteAllEverytime)
            {
                foreach (var item in List)
                {
                    if (result is not null && await result.AnyAsync())
                    {
                        var existingBrand = await result.FirstOrDefaultAsync(c => c.ShortName == item.ShortName);

                        if (existingBrand != null)
                        {
                            // Delete the existing Brands record before adding the new one
                            var isDeleted = await CRUD<Brands>(new { Id = existingBrand.Id }, ActionEnum.Delete, false);

                            if (!isDeleted.Success)
                                return OperationResult.FailureResult($"Brand {existingBrand.Title} deletion failed...");
                        }
                    }


                    // Insert the new Brands record
                    OperationResult isCreated = await CRUD<Brands>(item, ActionEnum.Create, true);

                    if (!isCreated.Success)
                        return OperationResult.FailureResult($"Brand {item.Title} have not been created...");
                }
            }
            else
            {
                if (result is not null && await result.AnyAsync())
                {
                    await foreach (var item in result)
                    {
                        await CRUD<Brands>(new { ShortName = item.ShortName }, ActionEnum.Delete, false);
                    }
                }

                foreach (var item in List)
                {

                    // Insert the new Brands record
                    OperationResult isCreated = await CRUD<Brands>(item, ActionEnum.Create, true);

                    if (!isCreated.Success)
                        return OperationResult.FailureResult($"Brand {item.Title} have not been created...");
                }

            }

            return OperationResult.SuccessResult();
        }
    }
}


