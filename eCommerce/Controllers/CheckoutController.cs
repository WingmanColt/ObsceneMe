using Core.Helpers;
using eCommerce.Utility;
using Entities.EmailTemplateModels;
using Entities.Enums;
using Entities.Models;
using Entities.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Services;
using Services.Dapper;
using Services.Interfaces;


namespace eCommerce.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CheckoutController : ControllerBase
    {
        private readonly ErrorLoggingService _errorLogger;
        private readonly MemoryCacheWithKeys _memoryCache;

        private readonly IAccountService _accountService;
        private readonly IspOrder _spOrderService;
        private readonly IspCheckout _spCheckout;
        private readonly IspPreCheckout _spPreCheckout;
        private readonly IspProduct _spProduct;
        private readonly IAffiliateService _affiliateService;
        private readonly ISendInBlueService _sendInBlueService;

        private readonly string checkoutNotFound = "Checkout details are not found.";
        private readonly string userNotFound = "User is not found.";
        private readonly string noResults = "There is no results to show.";
        private readonly string noPromoCode = "You already applied one code.";

        private readonly string checkoutCacheKey = "Checkout_";
        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(10);

        private readonly string webName;
        private readonly string webUrl;
        private readonly string salesEmail;

        private readonly string facebook;
        private readonly string instagram;
        private readonly string tiktok;
        private readonly string invoiceHtml;

        private PromoCode appliedPromo;

        public CheckoutController(
            MemoryCacheWithKeys memoryCache,
            ErrorLoggingService errorLogger,
            IConfiguration config,
            IAccountService accountService,
            IspOrder spOrderService,
            ISendInBlueService sendInBlueService,
            IAffiliateService affiliateService,
            IspProduct spProduct,
            IspPreCheckout spPreCheckout,
            IspCheckout spCheckout) // Inject IMemoryCache
        {
            _memoryCache = memoryCache;
            _errorLogger = errorLogger;

            _accountService = accountService;
            _spOrderService = spOrderService;
            _sendInBlueService = sendInBlueService;
            _affiliateService = affiliateService;
            _spPreCheckout = spPreCheckout;
            _spCheckout = spCheckout;
            _spProduct = spProduct;

            webUrl = config.GetValue<string>("WebUrls:userUrl");
            webName = config.GetValue<string>("SendInBlue-Live:webName");
            salesEmail = config.GetValue<string>("SendInBlue-Live:salesEmail");

            facebook = config.GetValue<string>("EmailMarketing:Facebook");
            instagram = config.GetValue<string>("EmailMarketing:Instagram");
            tiktok = config.GetValue<string>("EmailMarketing:Tiktok");
            invoiceHtml = config.GetSection("EmailMarketing:BasePath").Value + config.GetSection("EmailMarketing:InvoiceHtml").Value;
        }

        // Get Checkout by ID with caching
        [HttpGet("get-checkout/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var cacheKey = $"{checkoutCacheKey}{id}";
            return await GetCachedDataAsync(cacheKey, async () =>
                await _spCheckout.GetByIdAsync<Checkout>(id));
        }

        // Apply Promo Code
        [HttpPost("apply-promo")]
        public IActionResult ApplyPromoCode([FromBody] PromoCode code)
        {
            try
            {
                if (appliedPromo is null || appliedPromo != code)
                {
                    appliedPromo = code;
                    return Ok(OperationResult.SuccessResult($"Applied Discount: {code.Discount}"));
                }

                return Ok(OperationResult.FailureResult(noPromoCode));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error applying promo code: {ex.Message}");
            }
        }

        // Add PreCheckout and invalidate relevant cache
        [HttpPost("add-precheckout")]
        public async Task<IActionResult> PreCreate([FromBody] PreCheckoutInput Input)
        {
            try
            {
                var entity = await _spPreCheckout.CRUD<PreCheckout>(Input, ActionEnum.Create, true);
                await _memoryCache.ClearByPrefixAsync(checkoutCacheKey);
                return Ok(entity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating pre-checkout: {ex.Message}");
            }
        }

        // Update Checkout and invalidate cache
        [HttpPut("update")]
        public async Task<IActionResult> Update(CheckoutInput inputEntity)
        {
            try
            {
                var entity = await _spCheckout.CRUD<Checkout>(inputEntity, ActionEnum.Update, true);
                string cacheKey = string.Format(checkoutCacheKey, inputEntity.Id);
                await _memoryCache.ClearByPrefixAsync(cacheKey);
                return Ok(entity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating checkout: {ex.Message}");
            }
        }

        // Delete Checkout and invalidate cache
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var entity = await _spCheckout.CRUD<Checkout>(new { Id = id }, ActionEnum.Delete, false);
                string cacheKey = string.Format(checkoutCacheKey, id);
                await _memoryCache.ClearByPrefixAsync(cacheKey);
                return Ok(entity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting checkout: {ex.Message}");
            }
        }

        // Delete all Checkouts and invalidate cache
        [HttpDelete("delete-all")]
        public async Task<IActionResult> DeleteAll()
        {
            try
            {
                var entity = await _spCheckout.CRUD<Checkout>(null, ActionEnum.Truncate, false);
                await _memoryCache.ClearByPrefixAsync(checkoutCacheKey);
                return Ok(entity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting all checkouts: {ex.Message}");
            }
        }
        // Add new Checkout and use existing data if available
        [HttpPost]
        [Route("add-checkout")]
        public async Task<OrderCreateVW> Create([FromHeader] string Authentication, [FromBody] CheckoutInput Input)
        {
            if (Input is null)
                return new OrderCreateVW() { isCreated = false, Message = "Order Creation Failed: Please provide valid customer information and check the product." };

            var userId = _accountService.ValidateToken(Authentication);
            if (userId.Success)
            {
                Input.UserId = userId.SuccessMessage;
                Input.IsGuest = false;
            }

            var existingCheckout = await _spCheckout.CheckExistingUserAsync<CheckoutVW>(Input.Email, Input.PhoneNumber, Input.Address);

            if (existingCheckout is null)
            {
                var entity = await _spCheckout.CRUD<Checkout>(Input, ActionEnum.Create, true);
                if (entity.Success)
                {
                    var checkout = await _spCheckout.GetByIdAsync<CheckoutVW>((int)entity.Id);
                    if (checkout is null)
                        return new OrderCreateVW() { isCreated = false, Message = "Order Creation Failed: Please provide valid customer information and check the product." };

                    var result = await CreateOrder(checkout, Input).ConfigureAwait(true);
                    return result;
                }
            }
            else
            {
                var result = await CreateOrder(existingCheckout, Input).ConfigureAwait(true);
                return result;
            }

            return new OrderCreateVW() { isCreated = false, Message = "Order Creation Failed: An unexpected error occurred. Please try again later." };
        }


        private async Task<OrderCreateVW> CreateOrder(CheckoutVW checkout, CheckoutInput Input)
        {
            string orderCode = null, notes = null;

            double Cost = 0;
            double defaultCost = 0;
            double Discount = 0;

            //  StringBuilder itemDetailsList = new();

            foreach (var product in Input.Products)
            {
                try
                {
                    // Null check early
                    if (product == null || checkout == null || Input == null)
                        continue;

                    bool existingOrders = await _spOrderService.CheckExistingOrderAsync(
                        checkout.Id, product.Id, product.Quantity,
                        DateTime.Now.ToString("dd/MM/yyyy"), Input.TotalCost);

                    if (!existingOrders)
                    {
                        double calculateCostPerItem = (product.Price - product.DiscountRate) * Input.CurrencyPrice;
                        double calculateDiscount = Input.TotalDiscount * calculateCostPerItem;

                        Cost += Math.Round((calculateCostPerItem - calculateDiscount) * product.CustomerPreferenceQuantity, 2);
                        Discount += Math.Round(calculateDiscount * product.CustomerPreferenceQuantity, 2);
                        defaultCost += Math.Round(calculateCostPerItem * product.CustomerPreferenceQuantity, 2);

                        // Safe variant item access
                        var selectedVariantItemValues = product.SelectedVariants?
                            .SelectMany(variant => variant?.VariantItems?.Where(item => item?.IsSelected == true) ?? Enumerable.Empty<dynamic>())
                            .Select(item => item?.Value)
                            .Where(val => !string.IsNullOrWhiteSpace(val))
                            .ToList() ?? new List<dynamic>();

                        string selectedVariantItemTitles = string.Join(", ", selectedVariantItemValues);

                        var orderInput = new OrderInput()
                        {
                            Code = $"{DateTime.Now:ddMMyyyyHHmmss}{checkout.Id}{product.CustomerPreferenceQuantity}/{product.Id}",
                            VariantItemTitles = selectedVariantItemTitles,
                            ProductId = product.Id,
                            CheckoutId = checkout.Id,
                            isPayed = false,
                            PaymentType = Input.PaymentType,
                            ShippingType = Input.ShippingType,
                            Quantity = product.CustomerPreferenceQuantity,
                            Currency = Input.Currency,
                            DiscountPerItem = Math.Max(0, Math.Min(100, Input.TotalDiscount * 100)),
                            CostPerItem = calculateCostPerItem,
                            TotalCost = Math.Round(Input.TotalCost * Input.CurrencyPrice, 2),
                            ProductTitle = product.Title,
                            Phone = Input.PhoneNumber,
                            TotalDiscount = Discount,
                            UserId = Input.Email,
                            VisitorID = Input.VisitorID
                        };

                        var orderResult = await _spOrderService.CRUD<Order>(orderInput, ActionEnum.Create, true);
                        if (orderResult.Success)
                        {
                            orderCode = orderInput.Code;
                            notes = orderInput.Notes;

                            await _spProduct.UpdateQuantity(product).ConfigureAwait(false);
                            await _affiliateService.CreateAffiliatedOrderAsync(Input.ReferedByCode, orderInput).ConfigureAwait(false);
                        }
                    }
                    else
                    {
                        return new OrderCreateVW()
                        {
                            isCreated = false,
                            Message = "Duplicate order: You have already placed an order for the same product today."
                        };
                    }
                }
                catch (Exception ex)
                {
                    _errorLogger.LogException(ex, nameof(CreateOrder), nameof(CheckoutController));
                    // Optional: collect a list of failed product IDs to inform the user/admin
                    continue; // Continue with the next product
                }
            }



            /* string fullPaymentName = Input.PaymentType == "cod" ? "Cash On Delivery" : Input.PaymentType;
             string deliveryDate = null;
             if (DateTime.TryParse(checkout.CreatedOn, out DateTime createdDate))
             {
                 deliveryDate = createdDate.AddDays(estimatedDeliveryDays).ToString("dd-MMM-yyyy");
             }
              string deliveryPlace = checkout.PickupAtHome == true ? "Home Delivery" : "Office Delivery";
            */


            var invoiceModel = new InvoiceModel()
            {
                HtmlContentPath = invoiceHtml,
                WebName = webName,
                WebUrl = webUrl,
                CustomerName = checkout.FullName,
                Phone = checkout.PhoneNumber,
                OrderDate = checkout.CreatedOn,
                OrderCode = orderCode,
                Address = checkout.Address,
                OurEmail = salesEmail,
                TotalAmount = Math.Round(Input.TotalCost * Input.CurrencyPrice, 2).ToString(),
                TotalCost = Math.Round(defaultCost, 2).ToString(),
                TotalDiscount = Math.Max(0, Math.Min(100, Input.TotalDiscount * 100)).ToString(),
                Country = checkout.Country,
                CurrencyPrice = Input.CurrencyPrice,
                Currency = Input.Currency,
                CustomerEmail = checkout.Email,
                PostalCode = checkout.PostalCode,
                Town = checkout.City,
                State = checkout.State,
                PaymentMethod = Input.PaymentType == "cod" ? "Cash On Delivery" : Input.PaymentType,
                ShippingType = Input.ShippingType,
                OrderedProduct = Input.Products,
                Notes = notes,
                Facebook = facebook,
                Instagram = instagram,
                Tiktok = tiktok
            };
            await _sendInBlueService.SendInvoiceEmail(invoiceModel, checkout.Email).ConfigureAwait(false);
            await _sendInBlueService.SendInvoiceEmail(invoiceModel, salesEmail).ConfigureAwait(false);
            await ClearExternalCaches().ConfigureAwait(false);

            return new OrderCreateVW() { isCreated = true, Code = orderCode, Token = TokenUtility.GenerateToken() };
        }


        private async Task ClearExternalCaches()
        {
            string ProductByIdCacheKey = "ProductById_";
            string ProductDetailsCacheKey = "ProductDetails_";
            string ProductShortCacheKey = "ProductShort_";

            await _memoryCache.ClearByPrefixAsync(ProductByIdCacheKey);
            await _memoryCache.ClearByPrefixAsync(ProductDetailsCacheKey);
            await _memoryCache.ClearByPrefixAsync(ProductShortCacheKey);
        }
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

    }
}