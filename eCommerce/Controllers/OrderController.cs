using Core.Helpers;
using eCommerce.Utility;
using Entities.Enums;
using Entities.Input;
using Entities.Models;
using Entities.ViewModels;
using Entities.ViewModels.Products;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Models;
using Services.Interfaces;
using System.Globalization;
using System.Text;

namespace eCommerce.Controllers
{
    [Produces("application/json")]
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly MemoryCacheWithKeys _memoryCache;
        private readonly UserManager<User> _userManager;

        private readonly IConfiguration _config;
        private readonly IAccountService _accountService;
        private readonly IspOrder _spOrderService;
        private readonly IspProduct _spProductService;
        private readonly IspCheckout _spCheckout;

        // Cache Keys
        private const string AllOrdersCacheKey = "allOrders";
        private const string CurrencyCacheKey = "currencyCache";
        private const string OrderDetailsCacheKey = "orderDetails_";
        private const string OrderHistoryCacheKey = "orderHistory_";
        
        // Cache Duration
        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(10);

        public OrderController(
            MemoryCacheWithKeys memoryCache,
            UserManager<User> userManager,

            IConfiguration config,
            IAccountService accountService,
            IspOrder spOrderService,
            IspProduct spProductService,
            IspCheckout spCheckout)
        {
            _memoryCache = memoryCache;
            _userManager = userManager;

            _config = config;
            _accountService = accountService;
            _spOrderService = spOrderService;
            _spProductService = spProductService;
            _spCheckout = spCheckout;
        }

        [HttpGet("get-orders")]
        public async Task<IActionResult> GetAllOrders(int offset, int pageSize)
        {
            var result = await _spOrderService.GetAllAsyncWithCount(offset, pageSize);
            return Ok(result);
        }

        [HttpGet("info/{id}")]
        public async Task<IActionResult> GetOrderDetails(int id)
        {
            var result = await GetCachedDataAsync(string.Format(OrderDetailsCacheKey, id), () => _spOrderService.GetByIdAsync<OrderVW>(id));
            return Ok(result);
        }

        [HttpPut]
        [Route("update")]
        public async Task<IActionResult> Update(OrderInput inputEntity)
        {
            if (inputEntity == null || inputEntity.Id <= 0)
            {
                return BadRequest("Invalid order input data.");
            }

            try
            {
                var entity = await _spOrderService.CRUD<Order>(inputEntity, ActionEnum.Update, true);

                // Clear cache related to the updated order
                await ClearPrefixedCaches(inputEntity.Id.ToString());
                ClearAllNonPrefixedCaches();

                if (entity == null)
                {
                    return NotFound($"Order with ID {inputEntity.Id} not found.");
                }

                return Ok(entity); // Return a successful response with the updated entity
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating order: {ex.Message}");
            }
        }
        [HttpPost]
        [Route("update-ispayed")]
        public async Task<IActionResult> UpdatePayed(string code)
        {
            if (string.IsNullOrWhiteSpace(code))
            {
                return BadRequest("Invalid order code.");
            }

            try
            {
                var entity = await _spOrderService.UpdateIsPayed(code);

                if (entity == null)
                {
                    return NotFound($"Order with code {code} not found.");
                }

                // Clear cache for related order
                await ClearPrefixedCaches(code);
                ClearAllNonPrefixedCaches();
                return Ok(entity); // Return a successful response with the updated entity
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating payment status: {ex.Message}");
            }
        }
        [HttpPost]
        [Route("update-order-history")]
        public async Task<OperationResult> UpdateOrdersHistory([FromHeader] string Authentication, OrderInput input)
        {
            // Validate the token and extract user ID
            var tokenValidationResult = _accountService.ValidateToken(Authentication);
            if (!tokenValidationResult.Success)
            {
                return tokenValidationResult;
            }

            // Retrieve the user from the database using the user ID
            var user = await _userManager.FindByIdAsync(tokenValidationResult.SuccessMessage);
            if (user is null)
            {
                return OperationResult.FailureResult("The user does not exist in our database.");
            }

            var isOrderUpdated = await _spOrderService.CRUD<Order>(input, ActionEnum.Update, true);

            if (isOrderUpdated.Success)
            {
                // Clear related cache
                await ClearPrefixedCaches(input.Id.ToString());
                ClearAllNonPrefixedCaches();
                return OperationResult.SuccessResult();
            }

            return OperationResult.FailureResult("Error occurred during UpdateOrdersHistory.");
        }

        [HttpGet("get-orders-history")]
        [AllowAnonymous]
        public async Task<IActionResult> GetOrdersHistory([FromHeader] string Authentication)
        {
            // Validate the token and extract user ID
            var tokenValidationResult = _accountService.ValidateToken(Authentication);
            if (!tokenValidationResult.Success)
            {
                return NotFound(tokenValidationResult.FailureMessage);
            }

            // Retrieve the user from the database using the user ID
            var user = await _userManager.FindByIdAsync(tokenValidationResult.SuccessMessage);
            if (user is null)
            {
                return NotFound("The user does not exist in our database.");
            }

            return await GetCachedDataAsync(string.Format(OrderHistoryCacheKey, tokenValidationResult.SuccessMessage), () => FetchOrderHistory(tokenValidationResult.SuccessMessage));
        }

        private async Task<List<OrderHistoryVW>> FetchOrderHistory(string userId)
        {
            var historyList = new List<OrderHistoryVW>();
            var orders = await _spOrderService.GetByUserIdAsync<Order>(userId);

            var groupedOrders = orders.GroupBy(order => new { order.CheckoutId, order.CreatedOn });

            await foreach (var orderGroup in groupedOrders)
            {
                var first = await orderGroup.FirstAsync();
                var orderedProductsList = new List<ProductVW>();
                var checkout = await _spCheckout.GetByIdAsync<CheckoutVW>((int)orderGroup.Key.CheckoutId);
                var currency = await GetCurrency().FirstOrDefaultAsync(x => x.currency == first.Currency);

                await foreach (var order in orderGroup)
                {
                    var product = await _spProductService.GetByIdAsync<ProductVW>((int)order?.ProductId);
                    if (product != null)
                    {
                        product.Quantity = (int)order.Quantity;
                        orderedProductsList.Add(product);
                    }
                }

                if (orderedProductsList.Any())
                {
                    double totalDiscount = orderedProductsList.Sum(product => product.DiscountRate * product.Quantity);
                    double totalCost = orderedProductsList.Sum(product => product.Price * product.Quantity);
                    string logo = orderedProductsList.First().Images.FirstOrDefault(x => x.ImageType == ImageType.Main)?.Src;

                    OrderHistoryVW entity = new OrderHistoryVW()
                    {
                        Id = first.Id,
                        Country = checkout?.Country,
                        City = checkout?.City,
                        State = checkout?.State,
                        Address = checkout?.Address,
                        PostalCode = checkout?.PostalCode,
                        PhoneNumber = checkout?.PhoneNumber,
                        OrderCode = first.Code,
                        Currency = currency,
                        Discount = totalDiscount,
                        Cost = totalCost,
                        Shipping = 0.0,  // Fix this line if necessary
                        CreatedOn = orderGroup.Key.CreatedOn,
                        ApproveType = ApproveType.Waiting,
                        Products = orderedProductsList,
                        LogoSrc = logo,
                    };

                    historyList.Add(entity);
                }
            }

            return historyList; // Return the populated historyList instead of an empty list
        }

        [HttpPost]
        [Route("get-invoice")]
        public async Task<IActionResult> GetInvoice([FromBody] InvoiceInput input)
        {
                InvoiceVW invoice = new InvoiceVW();
                var order = await _spOrderService.GetByCodeAsync<Order>(input.Code);

                if (order is not null)
                {
                    var checkout = await _spCheckout.GetByIdAsync<CheckoutVW>((int)order?.CheckoutId);
                    var currency = await GetCurrency().FirstOrDefaultAsync(x => x.currency == order.Currency);

                    var ordersByCheckoutId = await _spOrderService.GetAllByCheckoutAsync<OrderVW>((int)order.CheckoutId);

                    var orderedTodayList = await ordersByCheckoutId
                        .Where(x => IsToday(DateTime.ParseExact(x.CreatedOn, "dd MMMM yyyy HH:mm", CultureInfo.InvariantCulture)))
                        .ToListAsync();

                    List<ProductVW> productList = new();
                    foreach (var orderByCheckout in orderedTodayList)
                    {
                        var product = await _spProductService.GetByIdAsync<ProductVW>((int)orderByCheckout.ProductId);
                        product.Quantity = (int)orderByCheckout.Quantity;
                        productList.Add(product);
                    }

                    double totalCostSum = productList.Sum(product => product.Price * product.Quantity);
                    double totalDiscountSum = productList.Sum(product => product.DiscountRate * product.Quantity);

                    invoice = new InvoiceVW()
                    {
                        FullName = checkout.FullName,
                        Note = checkout.Note,
                        Country = checkout.Country,
                        Town = checkout.City,
                        State = checkout.State,
                        Adress = checkout.Address,
                        PostalCode = checkout.PostalCode,
                        Phone = checkout.PhoneNumber,
                        Email = checkout.Email,
                        Code = order.Code,
                        Quantity = order.Quantity,
                        PickupAtHome = checkout.PickupAtHome,
                        Products = productList,
                        Cost = totalCostSum,
                        Discount = totalDiscountSum,
                        PaymentType = order.PaymentType,
                        Currency = order.Currency,
                        CurrencyPrice = currency.price,
                        CreatedOn = order.CreatedOn
                    };

                }

            return Ok(invoice);
        }

        [HttpGet("export-all-orders-csv")]
        public async Task<IActionResult> ExportAllOrdersCSV()
        {
            // Step 1: Fetch all orders
            var allOrders = await _spOrderService.GetAllAsync<FullOrderVW>();
            if (allOrders == null || !await allOrders.AnyAsync())
            {
                return NotFound("No orders found.");
            }


            // Step 4: Convert Invoices to CSV
            var csv = await GenerateCsv<FullOrderVW>(allOrders);

            // Step 5: Save CSV to Main Folder
            var currentDate = DateTime.Now.ToString("yyyy-MM-dd"); // Format: YYYYMMDD
            var fileName = $"all_checkouts_invoices_{currentDate}.csv";
            var mainUploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "orders", fileName);

            // Ensure directory exists
            var uploadsFolder = Path.GetDirectoryName(mainUploadsFolder);
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Write the CSV file to the folder
            await System.IO.File.WriteAllTextAsync(mainUploadsFolder, csv, Encoding.UTF8);

            // Step 6: Return File Path
            return Ok($"wwwroot/orders/{fileName}");
        }


        private async Task<string> GenerateCsv<T>(IAsyncEnumerable<T> data)
        {
            var sb = new StringBuilder();
            var properties = typeof(T).GetProperties();

            // Write header
            sb.AppendLine(string.Join(", ", properties.Select(p => p.Name)));

            // Write data rows
            await foreach (var item in data)
            {
                sb.AppendLine(string.Join(",", properties.Select(p => p.GetValue(item)?.ToString() ?? "")));
            }

            return sb.ToString();
        }

        private async Task ClearPrefixedCaches(string id)
        {
            await _memoryCache.ClearByPrefixAsync(OrderDetailsCacheKey + id);
            await _memoryCache.ClearByPrefixAsync(OrderHistoryCacheKey + id);
        }
        private void ClearAllNonPrefixedCaches()
        {
            // Clear all relevant caches
            _memoryCache.Remove(AllOrdersCacheKey);
            _memoryCache.Remove(CurrencyCacheKey);
        }

        // Helper methods
        private async Task<IActionResult> GetCachedDataAsync<T>(string cacheKey, Func<Task<T>> dataFetchFunc)
        {
            // Try to get the data from the cache
            if (!_memoryCache.TryGetValue(cacheKey, out T cachedResult))
            {
                // If not found in cache, fetch it from the service
                cachedResult = await dataFetchFunc();

                // Check if the result is null
                if (cachedResult == null)
                {
                    return NotFound("Data not found.");
                }

                // Set the fetched result in the cache
                _memoryCache.Set(cacheKey, cachedResult, CacheDuration);
            }

            // Return the cached or fetched data
            return Ok(cachedResult);
        }

        private IAsyncEnumerable<CurrencyVW> GetCurrency()
        {
            // Check if currencies are cached
            if (!_memoryCache.TryGetValue(CurrencyCacheKey, out IAsyncEnumerable<CurrencyVW> currentCurrency))
            {
                currentCurrency = _config.GetSection("currencies")
                    .GetChildren()
                    .Select(x => new CurrencyVW
                    {
                        name = x.GetValue<string>("name"),
                        currency = x.GetValue<string>("currency"),
                        price = x.GetValue<float>("price"),
                        alignSymbolEnd = x.GetValue<bool>("alignSymbolEnd"),
                        symbol = x.GetValue<string>("symbol")
                    }).ToAsyncEnumerable();

                // Cache the currencies
                _memoryCache.Set(CurrencyCacheKey, currentCurrency, TimeSpan.FromDays(30));
            }

            return currentCurrency;
        }

        private static bool IsToday(DateTime date) => date.Date == DateTime.Today;
    }
}
