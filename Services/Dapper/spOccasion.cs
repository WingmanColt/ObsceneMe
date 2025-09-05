using Core.Helpers;
using Dapper;
using Entities.Enums;
using Entities.Models;
using Microsoft.Extensions.Configuration;
using Services.Dapper;
using Services.Interfaces;

namespace Services
{
    public class spOccasion : MainService, IspOccasion
    {
        private string StoreName = "spOccasions";

        public spOccasion(IConfiguration config, ErrorLoggingService errorLogger) : base(config, errorLogger) { }

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
            return await GetAll<T>(StoreName, new { StatementType = "GetUsedOccasions" });
        }
      /*  public async Task<T> GetByIdAsync<T>(int id)
        {
            if (id <= 0)
                return default;

            return await GetByAsync<T>(StoreName, new { Id = id, StatementType = "GetById" });
        }
        public async Task<int> GetTotalProductsCount(int occasionId)
        {
            if (occasionId <= 0)
                return default;

            return await GetCountBy(StoreName, new { Id = occasionId, StatementType = "GetProductsCount" });
        }
      */
        public async Task<OperationResult> SeedOccasions(bool deleteAllEverytime)
        {
            List<OccasionInput> List = new();

            string[] lines = await File.ReadAllLinesAsync(@"wwwroot/Occasions.txt");

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
                    var Occasion = new OccasionInput
                    {
                        Title = vals1[0].Trim(),
                        Icon = vals1[1].Trim(),
                        ShortName = vals1[2].Trim(),
                        ProductsCount = 0
                    };

                    List.Add(Occasion);
                }
                else
                {
                    // Handle lines that do not have enough parts (optional)
                    // You can log or handle such cases according to your requirements
                }
            }

            IAsyncEnumerable<Occasion> result = await GetAll<Occasion>();

                // Iterate through the list and check if each Occasion already exists in the database
                if (!deleteAllEverytime)
                {
                    foreach (var item in List)
                    {
                    if (result is not null && await result.AnyAsync())
                    {
                        var existingOccasion = await result.FirstOrDefaultAsync(c => c.ShortName == item.ShortName);

                        if (existingOccasion != null)
                        {
                            // Delete the existing Occasion record before adding the new one
                            var isDeleted = await CRUD<Occasion>(new { Id = existingOccasion.Id }, ActionEnum.Delete, false);

                            if (!isDeleted.Success)
                                return OperationResult.FailureResult($"Occasion {existingOccasion.Title} deletion failed...");
                        }
                    }


                        // Insert the new Occasion record
                        OperationResult isCreated = await CRUD<Occasion>(item, ActionEnum.Create, true);

                        if (!isCreated.Success)
                            return OperationResult.FailureResult($"Occasion {item.Title} have not been created...");
                    }
                }
                else
                {
                if (result is not null && await result.AnyAsync())
                {
                    await foreach (var item in result)
                    {
                        await CRUD<Occasion>(new { ShortName = item.ShortName }, ActionEnum.Delete, false);
                    }
                }

                    foreach (var item in List)
                    {

                        // Insert the new Occasion record
                        OperationResult isCreated = await CRUD<Occasion>(item, ActionEnum.Create, true);

                        if (!isCreated.Success)
                            return OperationResult.FailureResult($"Occasion {item.Title} have not been created...");
                    }

                }
            
            return OperationResult.SuccessResult();
        }
    }
}


