using eCommerce.Configuration;
using Entities.Input;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Stripe;
using Stripe.Checkout;

namespace eCommerce.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StripeController : Controller
    {
        public readonly IOptions<StripeOptions> options;
        private readonly IStripeClient client;


        public StripeController(IOptions<StripeOptions> options)
        {
            this.options = options;
            this.client = new StripeClient(this.options.Value.SecretKey);

        }
        [HttpGet("config")]
        public ConfigResponse Setup()
        {
            return new ConfigResponse
            {
                PublishableKey = this.options.Value.PublishableKey,
            };
        }

        [HttpPut]
        [AllowAnonymous]
        [Route("create-stripe")]
        public async Task<IActionResult> CheckOut(PurchaseItemInput input)
        {
            var productCreateOptions = new ProductCreateOptions
            {
                Name = input.name,
                Description = input.brandName,
            };

            var productService = new ProductService(this.client);
            var product = productService.Create(productCreateOptions);

            var priceCreateOptions = new PriceCreateOptions
            {
                Product = product.Id,
                UnitAmount = (input.price * 100),
                Currency = "usd",
            };

            var priceService = new PriceService(this.client);
            var price = priceService.Create(priceCreateOptions);


            var options = new SessionCreateOptions
            {
                SuccessUrl = $"{this.options.Value.Domain}/shop/checkout/stripeSuccess?session_id={{CHECKOUT_SESSION_ID}}",
                CancelUrl = $"{this.options.Value.Domain}/shop/checkout/404",
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                     Price = price.Id,
                     Quantity = 1,
                    },
                },
                Mode = "payment",
                // AutomaticTax = new SessionAutomaticTaxOptions { Enabled = true },
            };
            var checkoutService = new SessionService(this.client);
            var session = await checkoutService.CreateAsync(options);
            return Ok(session);
        }

        [Route("check-success")]
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> CheckoutSession(string session_id)
        {
            var service = new SessionService(this.client);
            var session = await service.GetAsync(session_id);

            if (session.PaymentStatus.Equals("paid"))
            {
                return Ok("Payed");
            }

            return Ok();
        }



    }

    public class ConfigResponse
    {
        [JsonProperty("publishableKey")]
        public string PublishableKey { get; set; }

    }
}
