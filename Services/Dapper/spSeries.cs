using Core.Helpers;
using Dapper;
using Entities.Enums;
using Entities.Models;
using Microsoft.Extensions.Configuration;
using Services.Dapper;
using Services.Interfaces;

namespace Services
{
    public class spSeries : MainService, IspSeries
    {
        private string StoreName = "spSeries";
        public spSeries(IConfiguration config, ErrorLoggingService errorLogger) : base(config, errorLogger) { }

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
            return await GetAll<T>(StoreName, new { StatementType = "GetUsedSeries" });
        }
        public async Task<OperationResult> Seed(bool deleteAllEverytime)
        {
            List<SeriesInput> List = new();

            string[] lines = await File.ReadAllLinesAsync(@"wwwroot/Series.txt");

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
                    var ent = new SeriesInput
                    {
                        Title = vals1[0].Trim(),
                        Icon = vals1[1].Trim(),
                        ShortName = vals1[2].Trim()
                    };

                    List.Add(ent);
                }
                else
                {
                    // Handle lines that do not have enough parts (optional)
                    // You can log or handle such cases according to your requirements
                }
            }

            IAsyncEnumerable<Series> result = await GetAll<Series>();

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
                            var isDeleted = await CRUD<Series>(new { Id = existingBrand.Id }, ActionEnum.Delete, false);

                            if (!isDeleted.Success)
                                return OperationResult.FailureResult($"Series {existingBrand.Title} deletion failed...");
                        }
                    }


                    // Insert the new Brands record
                    OperationResult isCreated = await CRUD<Series>(item, ActionEnum.Create, true);

                    if (!isCreated.Success)
                        return OperationResult.FailureResult($"Series {item.Title} have not been created...");
                }
            }
            else
            {
                if (result is not null && await result.AnyAsync())
                {
                    await foreach (var item in result)
                    {
                        await CRUD<Series>(new { ShortName = item.ShortName }, ActionEnum.Delete, false);
                    }
                }

                foreach (var item in List)
                {

                    // Insert the new Brands record
                    OperationResult isCreated = await CRUD<Series>(item, ActionEnum.Create, true);

                    if (!isCreated.Success)
                        return OperationResult.FailureResult($"Series {item.Title} have not been created...");
                }

            }

            return OperationResult.SuccessResult();
        }
    }
}


