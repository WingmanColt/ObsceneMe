export const CheckoutOptions = {
    // Shop Page
    stickyHeaderPages: true,
    transparentHeaderPages: false,
    invisibleBottomMenuPages: true,

    // If search header on collection page is enabled
    searchHeaderWhiteColor: true,
    searchHeaderBGColor: "#fff", // Empty for default color ( black )
    searchHeaderIconsColor: "#000", // Empty for default color ( white )

    template: "style-two",
    templateMobile: "style-two",

    freeShipping: true,
    freeShippingAfter: 19.90, // IN EUR
    oneCountry: true,

    payment: 'select', // expandable, select
    // Payment
    PaymentTypes: [
        { label: "Cash on Delivery", shortname: 'cod', icon: false, image: "wallet2", content: "You will pay the amount for the order and the fees when you receive the order or pick it up from a courier office.", isExpanded: false },
      //  { label: "PayPal", shortname: 'paypal', icon: false, image: "paypal", content: "You've selected PayPal as your payment method. Once you click 'Proceed', you'll be redirected to the secure PayPal website to complete your purchase.", isExpanded: false },
       // { label: "Stripe", shortname: 'stripe', icon: false, image: "stripe", content: "You've selected Stripe as your payment method. Once you click 'Proceed', you'll be redirected to the secure Stripe website to complete your purchase.", isExpanded: false },
    ],

    shipping: 'select', // expandable, select
    ShippingTypes: [
        { label: "Econt", shortname: 'econt', freeShipping: true, badge: 'Free Shipping', cost: 0, image: '', icon: "recommended-badge", content: "Choose where you want your shipment.", isExpanded: false },
        { label: "Speedy", shortname: 'speedy', freeShipping: false, cost: 1.5, image: '', icon: "badge", content: "Choose where you want your shipment.", isExpanded: false },
        { label: "FedEx", shortname: 'fedex', freeShipping: false, cost: 1.2, image: '', icon: "badge", content: "Choose where you want your shipment.", isExpanded: false },
    ],

    PromotionalCodes: [
        { code: 'flex-2023', discount: 0.3, isApplied: false },  // 30%
        { code: 'flex-2023+', discount: 0.5, isApplied: false }, // 50%
        { code: 'XFCGVP9H+', discount: 0.25, isApplied: false }, // 25%
    ]
};
