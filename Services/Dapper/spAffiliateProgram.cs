using Microsoft.Extensions.Configuration;
using Services.Dapper;
using Services.Interfaces;

namespace Services
{
    public class spAffiliateProgram : MainService, IspAffiliateProgram
    {
        private string StoreName = "spAffiliateProgram";
        public spAffiliateProgram(IConfiguration config, ErrorLoggingService errorLogger) : base(config, errorLogger) { }

        public async Task<IAsyncEnumerable<T>> GetPerformanceAsync<T>(string affiliateUserId,
            string startDateStr,
            string endDateStr,
            int status)
        {
            var parameters = new
            {
                StatementType = "GetPerformance",
                AffiliateUserId = affiliateUserId,
                StartDateStr = startDateStr,
                EndDateStr = endDateStr,
                Status = status
            };

            return await GetAll<T>(StoreName, parameters);
        }
    }
}


