namespace eCommerce.Utility.SeerviceActivation
{
    public class ServiceActivationSettings
    {
        public ServiceToggle SubCategory { get; set; }
        public ServiceToggle Category { get; set; }
        public ServiceToggle Brand { get; set; }
        public ServiceToggle Series { get; set; }
        public ServiceToggle Occasion { get; set; }
        public ServiceToggle SubBrand { get; set; }
        public ServiceToggle Variant { get; set; }
        public ServiceToggle PreCheckout { get; set; }
    }

    public class ServiceToggle
    {
        public bool Active { get; set; }
        public string Lifetime { get; set; } // optional, only used for some
    }

}
