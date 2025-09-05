using Microsoft.Extensions.Configuration;
using Payments.Models;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace Payments.PayPal
{
    public class PaypalClient
    {
        private readonly HttpClient _client;
        private readonly string _paypalUrl;

        public PaypalClient(IConfiguration config, HttpClient client)
        {
            _client = client;
            _paypalUrl = config["PayPal-Live:RequestUrl"];
        }

        public async Task<AccessToken> GetToken(string clientID, string secretID)
        {
            var authToken = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{clientID}:{secretID}"));
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authToken);

            var response = await _client.PostAsync(_paypalUrl, new FormUrlEncodedContent(new Dictionary<string, string> { { "grant_type", "client_credentials" } }));
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<AccessToken>();
                return result;
            }
            return null;
        }

        public async Task<PaypalOrderResult> CreateOrder(PaypalOrder order, AccessToken token)
        {
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(token.token_type, token.access_token);
            var json = JsonSerializer.Serialize(order);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _client.PostAsync("/v2/checkout/orders", content);
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<PaypalOrderResult>();
                return result;
            }
            return null;
        }

        public async Task<bool> CaptureOrder(AccessToken accessToken, string orderId)
        {
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(accessToken.token_type, accessToken.access_token);
            var response = await _client.PostAsync($"v2/checkout/orders/{orderId}/capture", null);
            return response.IsSuccessStatusCode;
        }
    }
}
