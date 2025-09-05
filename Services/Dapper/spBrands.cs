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

namespace Services
{
    public class spBrands : MainService, IspBrands
    {
        private string StoreName = "spBrands";
        public spBrands(IConfiguration config, ErrorLoggingService errorLogger) : base(config, errorLogger) { }

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

        public async Task<IAsyncEnumerable<BrandVW>> GetAllUsed()
        {
            var parameters = new DynamicParameters(new
            {
                StatementType = "GetUsedBrandWithSeriesAndSubBrands"
            });

            try
            {
                using var connection = new SqlConnection(ConnectionString);
                await connection.OpenAsync().ConfigureAwait(false);

                var result = await connection.QueryMultipleAsync(StoreName, parameters, commandType: CommandType.StoredProcedure);

                // Read data asynchronously
                var brands = await result.ReadAsync<BrandVW>();
                var seriesList = await result.ReadAsync<SeriesVW>();
                var subBrandsList = await result.ReadAsync<SubBrands>();

                // Create dictionaries for faster lookups
                var seriesDictionary = seriesList
                    .Where(s => s.ShortName != null)
                    .GroupBy(s => s.BrandShortName)
                    .ToDictionary(g => g.Key, g => g.ToList());

                var subBrandsDictionary = subBrandsList
                    .Where(sb => sb.SeriesShortName != null)
                    .GroupBy(sb => sb.SeriesShortName)
                    .ToDictionary(g => g.Key, g => g.ToList());

                // Process and build the hierarchical structure
                var brandHierarchy = brands.Select(brand =>
                {
                    // Get related series for the current brand
                    if (seriesDictionary.TryGetValue(brand.ShortName, out var brandSeries))
                    {
                        // Add sub-brands to the series
                        foreach (var series in brandSeries)
                        {
                            if (subBrandsDictionary.TryGetValue(series.ShortName, out var subBrands))
                            {
                                series.SubBrands = subBrands;
                            }
                        }

                        return new BrandVW
                        {
                            Id = brand.Id, // Set the Id property from the original brand
                            Title = brand.Title, // Set the Title property from the original brand
                            Icon = brand.Icon, // Set the Icon property from the original brand
                            TotalProductsCount = brand.TotalProductsCount, // Set the TotalProductsCount from the original brand
                            ShortName = brand.ShortName,
                            Series = brandSeries
                        };
                    }

                    // Return a brand with no series if no match is found
                    return new BrandVW
                    {
                        Id = brand.Id, // Assign properties from the original brand
                        Title = brand.Title,
                        Icon = brand.Icon,
                        TotalProductsCount = brand.TotalProductsCount,
                        ShortName = brand.ShortName,
                        Series = new List<SeriesVW>()
                    };
                });

                // Return as an IAsyncEnumerable
                return brandHierarchy.ToAsyncEnumerable();
            }
            catch (Exception ex)
            {
                // Handle exceptions appropriately (e.g., logging)
                throw new Exception("An error occurred while fetching the data", ex);
            }
        }


        public async Task<OperationResult> SeedBrands(bool deleteAllEverytime)
        {
            List<BrandInput> List = new();

            string[] lines = await File.ReadAllLinesAsync(@"wwwroot/Brands.txt");

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


