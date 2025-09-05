import { myCartOptions } from "./templateSettings/myCartOptions";
import { squareBannersSectionOptions } from "./templateSettings/squareBannerSectionOptions";
import { videoSectionOptions } from "./templateSettings/videoSectionOptions";

export const homeSettings = {
    // Layout
    homeType: 'Single-Product-Style', // BigSwiper, Style-Two, Single-Product-Style
    productDetailsOnHomePage: false,
    productDetailsOnHomePageTitle: false,
    productDetailsOnHomePageId: 1,
    productDetailsSwiperTemplate: "thumbnail-swiper",
    productDetailsTemplate: "Two",

    // Header
    headerType: 'One',
    stickyHeader: true,
    transparentHeader: true,
    invisibleBottomMenu: true,
    borderedBottom: false,

    activeDot: true,
    showColoredDotOnBasket: false,
    showColoredDotOnBasketMobile: false,
    dotColorOnBasket: "transperent font-black", // red, black, theme-default, transperent // font-black, font-white
    dotMobileColorOnBasket: "transperent font-black", // red, black, theme-default, transperent // font-black, font-white

    activeDotOnUser: false,
    showColoredDotOnUser: false,
    showColoredDotOnUserMobile: false,
    dotColorOnUser: "transperent font-white", // red, black, theme-default, transperent // font-black, font-white
    dotMobileColorOnUser: "transperent font-white", // red, black, theme-default, transperent // font-black, font-white


    searchWithInput: false,

    footerPartners: [
        {
            Link: "https://hellauto.com/",
            Title: "HellAuto.com",
        },
        {
            Link: "https://grandjob.eu/",
            Title: "GrandJob.eu",
        },
        {
            Link: "https://sgkclean.de/",
            Title: "SGKClean.de",
        },
        {
            Link: "https://obscene.me/pages/register-affiliate-account",
            Title: "Become a Partner",
        },
        {
            Link: "#",
            Title: "Your Ad Here",
        },
    ],

    // Swiper
    showSwiper: true,
    swiperTheme: "Style-Two", // BigSwiper, Style-Two
    // When enabled images of variants will be in pagination of swiper, also users can slide through.
    // If it`s disabled users wouldn't be exposed to those images, they will be visible on click.
    swiperVariantsVisibleOnPagination: false,
    mainSliderFluid: true,

    // Categories Section
    showCategories: true,
    categoriesTheme: "Two", // One, Two
    categoriesDevice: "", // empty for all, desktop-only, mobile-only, tablet-only, mobile-tablet-only, desktop-tablet-only
    categoriesInHomeSwiper: false,

    // Trending Products Section
    showTrendingsOne: true,
    trendingsOneCardTemplate: "clean", // basic, card, cardBlack, cardBlackBig, cardFull, minimal, cardProgress, clean
    trendingsOneCardTemplateMobile: "clean", // basic, card, cardBlack, cardBlackBig, cardFull, minimal, clean

    showBannerOne: false,

    showFeature: false,
    featureTitle: 'Our Mission',
    featureSubtitle: 'Our Mission',
    featureText1:'',
    featureText2:'',
    featureImage1:'//fabulove.co/cdn/shop/files/heather-mount-8c3zjKrkkBA-unsplash_750x_8972ab68-5891-44a0-8d3e-b72e57b25150_180x.webp?v=1670484862 180w, //fabulove.co/cdn/shop/files/heather-mount-8c3zjKrkkBA-unsplash_750x_8972ab68-5891-44a0-8d3e-b72e57b25150_360x.webp?v=1670484862 360w, //fabulove.co/cdn/shop/files/heather-mount-8c3zjKrkkBA-unsplash_750x_8972ab68-5891-44a0-8d3e-b72e57b25150_540x.webp?v=1670484862 540w, //fabulove.co/cdn/shop/files/heather-mount-8c3zjKrkkBA-unsplash_750x_8972ab68-5891-44a0-8d3e-b72e57b25150_750x.webp?v=1670484862 750w, //fabulove.co/cdn/shop/files/heather-mount-8c3zjKrkkBA-unsplash_750x_8972ab68-5891-44a0-8d3e-b72e57b25150_900x.webp?v=1670484862 900w, //fabulove.co/cdn/shop/files/heather-mount-8c3zjKrkkBA-unsplash_750x_8972ab68-5891-44a0-8d3e-b72e57b25150_1080x.webp?v=1670484862 1080w',
    featureImage2:'//fabulove.co/cdn/shop/files/infini-roze-h5jtfuPUyQc-unsplash_750x_ec003248-8f5e-4fcb-86fd-0b3d8fe3736c_180x.webp?v=1670484864 180w, //fabulove.co/cdn/shop/files/infini-roze-h5jtfuPUyQc-unsplash_750x_ec003248-8f5e-4fcb-86fd-0b3d8fe3736c_360x.webp?v=1670484864 360w, //fabulove.co/cdn/shop/files/infini-roze-h5jtfuPUyQc-unsplash_750x_ec003248-8f5e-4fcb-86fd-0b3d8fe3736c_540x.webp?v=1670484864 540w, //fabulove.co/cdn/shop/files/infini-roze-h5jtfuPUyQc-unsplash_750x_ec003248-8f5e-4fcb-86fd-0b3d8fe3736c_750x.webp?v=1670484864 750w, //fabulove.co/cdn/shop/files/infini-roze-h5jtfuPUyQc-unsplash_750x_ec003248-8f5e-4fcb-86fd-0b3d8fe3736c_900x.webp?v=1670484864 900w, //fabulove.co/cdn/shop/files/infini-roze-h5jtfuPUyQc-unsplash_750x_ec003248-8f5e-4fcb-86fd-0b3d8fe3736c_1080x.webp?v=1670484864 1080w',

    // Square Banners Section
    showSquareBanners: false,
    squareBannersSectionOptions: squareBannersSectionOptions,

    // Trending Products Section 2
    showTrendingsSecond: false,
    trendingsTwoCardTemplate: "clean", // basic, card, cardBlack, cardBlackBig, cardFull, minimal
    trendingsTwoCardTemplateMobile: "clean", // basic, card, cardBlack, cardBlackBig, cardFull, minimal

    showTopProducts: true,
    showTopCategories: true,
    topProductsCount: 25,
    topProductsCardTemplate: "clean", // basic, card, cardBlack, cardBlackBig, cardFull, minimal
    topProductsCardTemplateMobile: "clean",

    // Video Ad Section
    showVideo: false,
    videoSectionOptions: videoSectionOptions,

    // Right top on header my basket icon and window settings
    showMyCart: true,
    myCartSettings: myCartOptions,

    // Timer Section
    showTimer: false,
    timerText: "Save 47% OFF",
    timerImageUrl: "https://ik.imagekit.io/beautyflex/offer-banner-2.webp?updatedAt=1678797035993",

    showBannerTwo: false,

    showNewsletter: false,

    // Collection Section (product listing on Shop)
    listingCardTemplate: "card2", // basic, card, card2, cardFull

    darkMode: false,
    tapToTop: true,
};
