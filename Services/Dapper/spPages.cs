using Core.Helpers;
using Dapper;
using Entities.Enums;
using Entities.Models;
using Microsoft.Extensions.Configuration;
using Services.Dapper;
using Services.Interfaces;


namespace Services
{
    public class spPages : MainService, IspPages
    {
        private string StoreName = "spPages";
        public spPages(IConfiguration config, ErrorLoggingService errorLogger) : base(config, errorLogger) { }

        public async Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams)
        {
            return await CRUD<T>(StoreName, parameters, action, AutoFindParams);
        }

        public async Task<IAsyncEnumerable<T>> GetAll<T>(object parameters)
        {
            DynamicParameters param = new();
            param.AddDynamicParams(parameters);

            var model = new { StatementType = "GetAll" };
            param.AddDynamicParams(model);

            return await GetAll<T>(StoreName, param);
        }

        public async Task<T> GetByIdAsync<T>(int id)
        {
            if (id <= 0)
                return default;

            return await GetByAsync<T>(StoreName, new { Id = id, StatementType = "GetById" });
        }

        public async Task<OperationResult> SeedPages()
        {
            IAsyncEnumerable<Pages> result = await GetAll<Pages>(null);

            List<PagesInput> pagesList = new List<PagesInput>();  

            string[] lines = await File.ReadAllLinesAsync(@"wwwroot/Pages.txt");

                for (int i = 0; i < lines?.Length; i++)
                {
                    var vals1 = lines[i]?.Split('#');

                    var page = new PagesInput
                    {
                        Title = vals1[0].ToString(),
                        Icon = vals1[1].ToString(),
                        ShortName = vals1[2].ToString(),
                        UrlAddress = vals1[3].ToString(),
                    };

                    pagesList.Add(page);
                }
                bool same = (result is not null && await result.CountAsync() == pagesList.Count);

                if (result is not null && await result.AnyAsync() && same)
                {
                    var isDeleted = await CRUD<Pages>(null, ActionEnum.Truncate, false);

                    if (isDeleted.Success)
                    {
                        foreach (var item in pagesList)
                        {
                        OperationResult isCreated = await CRUD<Pages>(item, ActionEnum.Create, true);
                        if (!isCreated.Success)
                            return OperationResult.FailureResult("Pages have not been created...");
                        }
                    }
                } else {
                foreach (var item in pagesList)
                {
                    OperationResult isCreated = await CRUD<Pages>(item, ActionEnum.Create, true);
                    if (!isCreated.Success)
                        return OperationResult.FailureResult("Pages have not been created...");
                }
            }
            
            return OperationResult.SuccessResult("");
        }
    }
}


