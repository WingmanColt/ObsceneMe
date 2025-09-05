using Core.Helpers;
using Dapper;
using Entities.Enums;
using Entities.Input;
using Entities.Models;
using Microsoft.Extensions.Configuration;
using Services.Dapper;
using Services.Interfaces;
using System.Data;

namespace Services
{
    public class spCoupon : MainService, IspCoupon
    {
        private string StoreName = "spCoupon";

        public spCoupon(IConfiguration config, ErrorLoggingService errorLogger) : base(config, errorLogger) { }


        public async Task<OperationResult> CRUD<T>(object parameters, ActionEnum action, bool AutoFindParams)
        {
            return await CRUD<T>(StoreName, parameters, action, AutoFindParams);
        }

        public async Task<IAsyncEnumerable<T>> GetAll<T>()
        {
            return await GetAll<T>(StoreName, new { StatementType = "GetAll"});
        }

        public async Task<T> GetByCodeAsync<T>(string code)
        {
            if (String.IsNullOrEmpty(code))
                return default;

            return await GetByAsync<T>(StoreName, new { Code = code, StatementType = "GetByCode" });
        }


        public async Task<OperationResult> SeedCoupons()
        {
            IAsyncEnumerable<Coupon> result = await GetAll<Coupon>();

            List<CouponInput> pagesList = new List<CouponInput>();

            string[] lines = await File.ReadAllLinesAsync(@"wwwroot/Coupons.txt");

            for (int i = 0; i < lines?.Length; i++)
            {
                var vals1 = lines[i]?.Split('#');

                var entity = new CouponInput
                {
                    Title = vals1[0].ToString(),
                    Code = vals1[1].ToString(),
                    Discount = double.Parse(vals1[2]),
                    CreatedOn = DateTime.Now.ToString("dd/MM/yyyy"),
                    ExpiredOn = 30,
                    CouponState = CouponState.Infinity
                };

                pagesList.Add(entity);
            }

            // Check if any records with the same Code and Discount exist in the database
            var existingRecords = await result
                .Where(c => pagesList.Any(p => p.Code == c.Code))
                .ToListAsync();

            if (existingRecords.Any())
            {

                foreach (var item in existingRecords)
                {
                    // Delete the existing records and await each deletion
                    OperationResult isDeleted = await CRUD<Coupon>(new { Id = item.Id }, ActionEnum.Delete, false);
                    if (!isDeleted.Success)
                        return OperationResult.FailureResult("Coupons have not been removed...");

                }

                foreach (var item in pagesList)
                  {
                    // Create new records
                    OperationResult isCreated = await CRUD<Coupon>(item, ActionEnum.Create, true);
                    if (!isCreated.Success)
                        return OperationResult.FailureResult("Coupons have not been created...");                
                   }
                
            }
            else
            {
                foreach (var item in pagesList)
                {
                    OperationResult isCreated = await CRUD<Coupon>(item, ActionEnum.Create, true);
                    if (!isCreated.Success)
                        return OperationResult.FailureResult("Coupons have not been created...");
                }
            }

            return OperationResult.SuccessResult("");
        }
    }

}
