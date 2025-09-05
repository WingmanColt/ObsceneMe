using Core.Helpers;
using Dapper;
using Entities.Enums;
using Microsoft.Extensions.Configuration;
using Services.Dapper;
using Services.Interfaces;

namespace Services
{
    public class spCheckout : MainService, IspCheckout
    {
        private string StoreName = "spCheckout";
        public spCheckout(IConfiguration config, ErrorLoggingService errorLogger) : base(config, errorLogger) { }

        public async Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams)
        {
            return await CRUD<T>(StoreName, parameters, action, AutoFindParams);
        }

        public async Task<IAsyncEnumerable<T>> GetAllAsync<T>()
        {
            return await GetAll<T>(StoreName, new { StatementType = "GetAll" });
        }

        public async Task<T> GetByIdAsync<T>(int id)
        {
            if (id <= 0)
                return default;

            return await GetByAsync<T>(StoreName, new { Id = id, StatementType = "GetById" });
        }

        public async Task<T> CheckExistingUserAsync<T>(string email, string phoneNumber, string address)
        {
            if (String.IsNullOrEmpty(email) || String.IsNullOrEmpty(phoneNumber) || String.IsNullOrEmpty(address))
                return default;

            return await GetByAsync<T>(StoreName, new { Email = email, PhoneNumber = phoneNumber, Address = address, StatementType = "CheckExistingUser" });
        }
    }

}
