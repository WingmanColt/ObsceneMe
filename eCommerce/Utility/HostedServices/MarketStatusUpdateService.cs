using Entities.Enums;
using Services.Interfaces;


public class MarketStatusUpdateService : BackgroundService
{
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ErrorLoggingService _errorLogger;
    private readonly TimeSpan _interval = TimeSpan.FromDays(3);

    public MarketStatusUpdateService(IServiceScopeFactory serviceScopeFactory, ErrorLoggingService errorLogger)
    {
        _serviceScopeFactory = serviceScopeFactory;
        _errorLogger = errorLogger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
     /*   while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await UpdateMarketStatusAsync();
            }
            catch (Exception ex)
            {
                _errorLogger.LogException(ex, nameof(ExecuteAsync), nameof(MarketStatusUpdateService));
            }

            await Task.Delay(_interval, stoppingToken);
        }*/
    }

    private async Task UpdateMarketStatusAsync()
    {
        using (var scope = _serviceScopeFactory.CreateScope()) // ✅ Creates a Scoped service instance
        {
            var spProduct = scope.ServiceProvider.GetRequiredService<IspProduct>();

            try
            {
                var res = await spProduct.UpdateMarketStatus((int)MarketStatus.New, MarketStatus.None);
                if (!res.Success)
                    _errorLogger.LogException(res.Exception, nameof(UpdateMarketStatusAsync), nameof(MarketStatusUpdateService));
            }
            catch (Exception ex)
            {
                _errorLogger.LogException(ex, nameof(UpdateMarketStatusAsync), nameof(MarketStatusUpdateService));
            }
        }
    }
}
