
namespace Entities.ViewModels
{
    public class CurrencyVW
    {
        public string name { get; set; }
        public string currency { get; set; }
        public float price { get; set; }

        public bool alignSymbolEnd { get; set; }
        public string symbol { get; set; }
    }
}
