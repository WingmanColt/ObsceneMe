namespace eCommerce.Utility.HostedService
{
    public class ClearMemoryCache : IHostedService
    {
        private readonly MemoryCacheWithKeys _memoryCache;

        public ClearMemoryCache(MemoryCacheWithKeys memoryCache)
        {
            _memoryCache = memoryCache;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            // Logic to execute on application start
            IEnumerable<object> keys = _memoryCache.GetAllKeys();
            await _memoryCache.RemoveAsync(keys);
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            // Logic to execute on application shutdown (optional)
            return Task.CompletedTask;
        }
    }
}
