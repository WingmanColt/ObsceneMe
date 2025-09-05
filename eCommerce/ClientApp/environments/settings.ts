export const settings = {
    animations: true,
    showInvoice: false,
    openDiscountModal: false,

    footerOnBottomMobileHeader: false,
    mobileMenuStyle:'White', //Black, White

    // Variants
    // "Color", "Size", "Taste"
    variantTypes: ["Taste"],

    logoPath: './assets/images/obscene.me/logos/',
    logoSizes: ['logo-black.webp', '209x209-black.webp'],

    megaMenuActive:false,
    megaMenuStyle:'White', // White, Black
    categoriesPage:false,
    categoryImageUrl: "./assets/images/CategoryImages/",
    categoryImageUrlExtension: ".webp",
    
    // Menu Items
    menu: [
        { 
            path: "", 
            title: "Home", 
            type: "link" 
        },

        {
            path: "/shop/product/the-devil",
            title: "Discover The Devil",
            type: "link",
        },
        {
            path: "/pages/reviews",
            title: "Reviews",
            type: "link",
        },
/*
        {
            title: "Explore",
            path: "/pages/categories",
            type: "linkedSub",
            megaMenu: true,
            badge: false,
            badgeText: "new",
            active: false,
            children: [],
            firstColumnTitle: "All Categories",
        },
        */
        {
            path: "/pages/contact",
            title: "Contact",
            type: "link",
        },
    ],
};
