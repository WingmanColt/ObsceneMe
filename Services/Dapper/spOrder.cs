using Core.Helpers;
using Dapper;
using Entities.Enums;
using Entities.Models;
using Entities.ViewModels;
using Microsoft.Extensions.Configuration;
using Services.Dapper;
using Services.Interfaces;
using System.Data;

namespace Services
{
    public class spOrder : MainService, IspOrder
    {
        private string StoreName = "spOrder";
        public spOrder(IConfiguration config, ErrorLoggingService errorLogger) : base(config, errorLogger) { }

        public async Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams)
        {
            return await CRUD<T>(StoreName, parameters, action, AutoFindParams);
        }

        public async Task<T> GetByIdAsync<T>(int id)
        {
            if (id <= 0)
                return default;

            return await GetByAsync<T>(StoreName, new { Id = id, StatementType = "GetById" });
        }

        public async Task<IAsyncEnumerable<T>> GetAllAsync<T>()
        {
            return await GetAll<T>(StoreName, new { StatementType = "GetAll" });
        }

        public async Task<IAsyncEnumerable<T>> GetAllByCheckoutAsync<T>(int checkoutId)
        {
            return await GetAll<T>(StoreName, new { CheckoutId = checkoutId, StatementType = "GetAllByCheckout" });
        }

        public async Task<IAsyncEnumerable<T>> GetAllAsync<T>(int lastSavedId, int pageSize, int offset)
        {
            return await GetAll<T>(StoreName, new { LastSavedId = lastSavedId, PageSize = pageSize, Offset = offset, StatementType = "GetAll" });
        }

        public async Task<OrderWithTotalCountVW> GetAllAsyncWithCount(int offset, int pageSize)
        {
            var parameters = new DynamicParameters(new
            {
                Offset = offset,
                PageSize = pageSize,
                StatementType = "GetAllPaginated"
            });

            try
            {
                using (IDbConnection connection = Connection)
                {
                    connection.Open();

                    // Use QueryMultipleAsync to handle multiple result sets
                    using (var multi = await connection.QueryMultipleAsync(StoreName, parameters, commandType: CommandType.StoredProcedure))
                    {
                        // First result: TotalCount
                        var totalCount = await multi.ReadFirstAsync<int>();

                        // Second result: Items
                        var items = await multi.ReadAsync<Order>();

                        connection.Close();

                        var vw = new OrderWithTotalCountVW { Items = items.ToAsyncEnumerable(), TotalCount = totalCount };

                        // Return the items and total count
                        return vw;
                    }
                }
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(GetAllAsyncWithCount), nameof(spOrder));

                // Return an empty result in case of an error
                return null;
            }
        }

        public async Task<T> GetByCodeAsync<T>(string code)
        {
            if (String.IsNullOrEmpty(code))
                return default;

            return await GetByAsync<T>(StoreName, new { Code = code, StatementType = "GetByCode" });
        }

        public async Task<IAsyncEnumerable<T>> GetByUserIdAsync<T>(string userId)
        {
            if (String.IsNullOrEmpty(userId))
                return default;

            return await GetAll<T>(StoreName, new { UserId = userId, StatementType = "GetByUserId" });
        }

        public async Task<bool> CheckByPhone(string phone, string productTitle)
        {
            if (String.IsNullOrEmpty(phone))
                return default;

            return await CheckIfExistsAsync(StoreName, new { Phone = phone, ProductTitle = productTitle, StatementType = "CheckIfExistsByPhone" });
        }

        public async Task<int> GetCountBy(int? checkoutId, int? productId)
        {
            if (checkoutId <= 0 && productId <= 0)
                return default;

            return await GetCountBy(StoreName, new { CheckoutId = checkoutId, ProductId = productId, StatementType = "GetAllCountBy" });
        }


        public async Task<OperationResult> UpdateIsPayed(string code)
        {
            if (String.IsNullOrEmpty(code))
                return OperationResult.FailureResult("Code is not provided.");

            var entity = await GetByCodeAsync<Order>(code);

            if (entity is null)
                return OperationResult.FailureResult("Does not exists order with code:" + code);

            entity.isPayed = true;

            var param = new DynamicParameters();
            param.Add("Id", entity.Id);
            param.Add("IsPayed", entity.isPayed);
           
            return await CRUDPost(StoreName, param, ActionEnum.UpdateIsPayed);
        }


        public async Task<bool> CheckExistingOrderAsync(int checkoutId, int productId, int quantity, string createdOn, double totalCost)
        {
            if (checkoutId <= 0 || productId <= 0)
                return default;

            return await CheckIfExistsAsync(StoreName, new { CheckoutId = checkoutId, ProductId = productId, Quantity = quantity, CreatedOn = createdOn, TotalCost = totalCost, StatementType = "CheckExistingOrder" });
        }

    }

}
