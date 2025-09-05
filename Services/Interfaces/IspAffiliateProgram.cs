namespace Services.Interfaces
{
    public interface IspAffiliateProgram
    {
        Task<IAsyncEnumerable<T>> GetPerformanceAsync<T>(string affiliateUserId, string startDateStr, string endDateStr, int status);
    }
}