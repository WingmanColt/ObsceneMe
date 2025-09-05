using Core.Helpers;
using Entities.Input;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Payments.Models;
using Payments.PayPal;

namespace eCommerce.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PayPalController : ControllerBase
    {
        private readonly PaypalClient _paypalClient;
        //  private readonly IspOrder _spOrderService;

        private readonly string _webDomain;
        private readonly string _clientID;
        private readonly string _clientSecret;

        public PayPalController(IConfiguration config, PaypalClient paypalClient/*, IspOrder spOrderService*/)
        {
            _paypalClient = paypalClient;
            //  _spOrderService = _spOrderService;

            _webDomain = config.GetValue<string>("WebUrls:userUrl");
            _clientID = config.GetValue<string>("PayPal-Live:PubKey");
            _clientSecret = config.GetValue<string>("PayPal-Live:SecretKey");
        }


        [HttpPut]
        [AllowAnonymous]
        [Route("create-paypal")]
        public async Task<IActionResult> Create([FromBody] PurchaseItemInput input)
        {
            AccessToken accesstoken = await _paypalClient.GetToken(_clientID, _clientSecret);
            if (accesstoken != null)
            {
                var order = new PaypalOrder()
                {
                    Intent = "CAPTURE",
                    Purchase_units = new List<PurchaseUnit>() {

                            new PurchaseUnit() {

                                Amount = new Amount() {
                                    Currency_code = input.currency,
                                    Value = input.price.ToString(),
                                    Breakdown = new Breakdown()
                                    {
                                        Item_total = new Amount()
                                        {
                                            Currency_code = input.currency,
                                            Value = input.price.ToString()
                                        }
                                    }
                                },
                                Description = input.brandName,
                                Items = new List<Items>
                                {
                                    new Items()
                                    {
                                        Name = input.name,
                                        Unit_amount = new Amount()
                                        {
                                            Currency_code = input.currency,
                                            Value = input.price.ToString()
                                        },
                                        Quantity = input.quantity.ToString()
                                    }
                                }
                            }
                        },
                    Application_context = new ApplicationContext()
                    {
                        Brand_name = input.brandName,
                        Landing_page = "NO_PREFERENCE",
                        User_action = "PAY_NOW", //Accion para que paypal muestre el monto de pago
                        Return_url = _webDomain + "/shop/checkout/paymentSuccess",
                        Cancel_url = _webDomain + "/shop/checkout/404"// cuando cancela la operacion
                    }
                };
                var orderResult = await _paypalClient.CreateOrder(order, accesstoken);
                if (orderResult is not null)
                {
                    return Ok(new { Url = orderResult.Links[1].Href, Token = StringHelper.GetAfter(orderResult.Links[1].Href, '=', true) });
                }

            }

            return Ok(_webDomain + "/shop/checkout/cancel");
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("check-success")]
        public async Task<IActionResult> CheckSuccess(string token)
        {
            var accesstoken = await _paypalClient.GetToken(_clientID, _clientSecret);
            if (accesstoken is not null)
            {
                var result = await _paypalClient.CaptureOrder(accesstoken, token);
                if (result)
                {
                    return Ok("Payed");
                }

                return Ok();
            }

            return Ok();
        }
    }

}