export const CollectionOptions = {
  // Shop Page
  stickyHeaderPages: true,
  transparentHeaderPages: false,
  invisibleBottomMenuPages: true,
  headerType: 0,

  // If search header on collection page is enabled
  searchHeaderWhiteColor: true,
  searchHeaderBGColor: "#fff", // Empty for default color ( black )
  searchHeaderIconsColor: "#000", // Empty for default color ( white )

  collectionPageBreadcrumb: false,
  categoriesSwiperOnMobile: true,

  activeDot: true,
  dotColorOnBasket: "transperent", // red, black, theme-default, transperent(no need for font-black/white !) // font-black, font-white
  cardTemplate: "clean", // basic, card, cardBlackBig, cardFull, minimal, cardProgress
  cardTemplateMobile: "clean", // basic, card, cardBlack, cardBlackBig, cardFull, minimal
  cardShowBadge: "like-btn", // like-btn, badges, empty for none
  useUniqueCard: true,

  // Filters on top with categories swiper on mobile AND categoris on left side of collection page
  showCategories: false,
  showSubCategories: true,
  showIconInsideCategory: true,
  showFiltersAsButtons:false,
  
  showImagesFromCloud: true, // if it is disabled line awesome icons are used.
  imageIconUrl: "./assets/images/CategoryImages/",
  imageIconExtension: ".webp",

  filterBtnPlacedStatic: true,
  filterMaxPrice: 99999,
  infinityScrollAddCount: 10,

  brandImageIconUrl: "./assets/images/Brands/",
  brandImageExtension: ".webp",

  trademarkImageIconUrl: "assets/images/trademarks/",
  trademarkImageExtension: ".webp",

  occasionImageIconUrl: "",
  occasionImageExtension: "",
  subscribeFooter: true,

  brandsOnFilters: true,
  occasionsOnFilters: false,
  trademarkOnFilters: true,
  
  sortOptions: [
    { id: "name", label: "Name", origin: "first" },
    { id: "price", label: "Price", origin: "first" },
    { id: "rating", label: "Popularity", origin: "first", default: true },
    { id: "date", label: "Date", origin: "first" },

    { id: "asc", label: "Ascending",  origin: "second" },
    { id: "desc", label: "Descending",  origin: "second", default: true },
  ],

  genderOnFilters: false,
  genderOptions: [
    { id: 1, label: 'Unisex', origin: "first" },
    { id: 2, label: 'For Male', origin: "first" },
    { id: 3, label: 'For Female', origin: "first" },
    { id: 4, label: 'For Kids', origin: "first" }
  ],

  ratingOnFilters: true,
  starOptions:  [
    { id: 1, label: '1 Star', origin: "first" },
    { id: 2, label: '2 Stars', origin: "first" },
    { id: 3, label: '3 Stars', origin: "first" },
    { id: 4, label: '4 Stars', origin: "first" },
    { id: 5, label: '5 Stars', origin: "first" }
  ],

  statusOnFilters: true,
  statusOptions:  [
    { id: 0, label: 'Available', origin: "first" },
    { id: 1, label: 'Unavailable', origin: "first" }
  ],

   priceOnFilters: true,
   priceOptions:  [
    { from: 0, to: 50, label: "Less than 50", active: false },
    { from: 50, to: 100, label: "50 - 100", active: false },
    { from: 100, to: 250, label: "100 - 250", active: false },
    { from: 250, to: 500, label: "250 - 500", active: false },
    { from: 500, to: 750, label: "500 - 750", active: false },
    { from: 750, to: 1000, label: "750 - 1000", active: false },
    { from: 1000, to: 5000, label: "1000 - 5000", active: false },
    { from: 5000, to: 10000, label: "More than 5000", active: false },
  ]
};
