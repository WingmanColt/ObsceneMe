using Data;
using Entities.EmailTemplateModels;
using Entities.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Services
{
    public class EmailService : BackgroundService
    {
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly ErrorLoggingService _errorLogger;

        private readonly string webName;
        private readonly string webUrl;
        private readonly string salesEmail;

        private readonly string facebook;
        private readonly string instagram;
        private readonly string tiktok;
        private readonly string banner;

        private readonly string discountHtml;
        private readonly string skippedHtml;

        public EmailService(
            IConfiguration config,
            ErrorLoggingService errorLogger,
            IServiceScopeFactory serviceScopeFactory)
        {
            _errorLogger = errorLogger;
            _serviceScopeFactory = serviceScopeFactory;

            webUrl = config["WebUrls:userUrl"];
            webName = config["SendInBlue-Live:webName"];
            salesEmail = config["SendInBlue-Live:salesEmail"];

            facebook = config["Links:Facebook"];
            instagram = config["Links:Instagram"];
            tiktok = config["Links:Tiktok"];
            banner = config["Links:EmailBannerImage"];

            discountHtml = $"{config["EmailMarketing:BasePath"]}{config["EmailMarketing:DiscountHtml"]}";
            skippedHtml = $"{config["EmailMarketing:BasePath"]}{config["EmailMarketing:SkippedCheckoutHtml"]}";
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Run both loops in parallel
            var skippedLoop = RunPeriodicTask(SendSkippedCheckoutEmailAsync, TimeSpan.FromHours(1), stoppingToken);
            var discountLoop = RunPeriodicTask(SendDiscountOfferEmailAsync, TimeSpan.FromDays(1), stoppingToken);

            await Task.WhenAll(skippedLoop, discountLoop);
        }

        private async Task RunPeriodicTask(Func<CancellationToken, Task> action, TimeSpan interval, CancellationToken token)
        {
            var timer = new PeriodicTimer(interval);

            try
            {
                do
                {
                    await action(token);
                }
                while (await timer.WaitForNextTickAsync(token));
            }
            catch (OperationCanceledException)
            {
                // expected on shutdown
            }
        }

        private async Task SendSkippedCheckoutEmailAsync(CancellationToken cancellationToken)
        {
            try
            {
                using var scope = _serviceScopeFactory.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var sendInBlueService = scope.ServiceProvider.GetRequiredService<ISendInBlueService>();

                var unpayedCustomers = await dbContext.PreCheckout
                    .Where(record => record.PaymentCondition == PaymentCondition.Waiting)
                    .ToListAsync(cancellationToken);

                var emailTasks = unpayedCustomers.Select(async entity =>
                {
                    var model = new SkippedCheckoutModel
                    {
                        HtmlContentPath = skippedHtml,
                        CustomerName = entity.FullName,
                        CustomerId = entity.Id,
                        WebName = webName,
                        WebUrl = webUrl,
                        OurEmail = salesEmail,
                        Facebook = facebook,
                        Instagram = instagram,
                        Tiktok = tiktok,
                        Banner = banner
                    };

                    await sendInBlueService.SendSkippedCheckoutEmail(model, entity.Email);
                    entity.PaymentCondition = PaymentCondition.Recall;
                });

                await Task.WhenAll(emailTasks);
                await dbContext.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _errorLogger.LogException(ex, nameof(SendSkippedCheckoutEmailAsync), nameof(EmailService));
            }
        }

        private async Task SendDiscountOfferEmailAsync(CancellationToken cancellationToken)
        {
            try
            {
                using var scope = _serviceScopeFactory.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var sendInBlueService = scope.ServiceProvider.GetRequiredService<ISendInBlueService>();

                var unpayedCustomers = await dbContext.PreCheckout
                    .Where(record => record.PaymentCondition == PaymentCondition.Recall)
                    .ToListAsync(cancellationToken);

                var emailTasks = unpayedCustomers.Select(async entity =>
                {
                    var model = new DiscountModel
                    {
                        HtmlContentPath = discountHtml,
                        Code = "XFCGVP9H+",
                        ExpirationDate = DateTime.UtcNow.AddDays(2).ToString("u"),
                        CustomerName = entity.FullName,
                        CustomerId = entity.Id,
                        WebName = webName,
                        WebUrl = webUrl,
                        OurEmail = salesEmail,
                        Facebook = facebook,
                        Instagram = instagram,
                        Tiktok = tiktok,
                        Banner = banner
                    };

                    await sendInBlueService.SendDiscountEmail(model, entity.Email);
                    entity.PaymentCondition = PaymentCondition.Discount;
                });

                await Task.WhenAll(emailTasks);
                await dbContext.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _errorLogger.LogException(ex, nameof(SendDiscountOfferEmailAsync), nameof(EmailService));
            }
        }
    }
}
