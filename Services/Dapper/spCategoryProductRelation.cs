using Core.Helpers;
using Dapper;
using Entities.Enums;
using Microsoft.Extensions.Configuration;
using Services.Dapper;
using Services.Interfaces;

namespace Services
{
    public class spCategoryProductRelation : MainService, IspCategoryProductRelation
    {
        private string StoreName = "spCategoryProductRelation";

        public spCategoryProductRelation(IConfiguration config, ErrorLoggingService errorLogger) : base(config, errorLogger) { }

        public async Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams)
        {
            return await CRUD<T>(StoreName, parameters, action, AutoFindParams);
        }

        public async Task<IAsyncEnumerable<T>> GetAll<T>()
        {
            return await GetAll<T>(StoreName, new { StatementType = "GetAll" });
        }
        public async Task<T> GetByIdAsync<T>(int id)
        {
            if (id <= 0)
                return default;

            return await GetByAsync<T>(StoreName, new { Id = id, StatementType = "GetById" });
        }
    }
}


