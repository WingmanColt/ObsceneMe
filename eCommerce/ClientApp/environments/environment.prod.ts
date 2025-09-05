import { accountSettings } from "./accountSettings";
import { countriesList } from "./countriesList";
import { homeSettings } from "./homeSettings";
import { pagesBaseOptions } from "./pagesSettings/pages";
import { settings } from "./settings";
import { socialSettings } from "./socialSettings";
import { cardsBaseOptions } from "./templateSettings/cards/cardsBaseOptions";
import { searchBarOptions } from "./templateSettings/searchBarOptions";
import { swiperBaseOptions } from "./templateSettings/swiper/swiperBaseOptions";

export const environment = {
  webName: "obscene.me",
  production: true,
  singleProduct: true,
  serviceActivation: {
    BrandActive: true,
    SeriesActive: true,
    CategoriesActive: false,
    OccasionActive: false,
    TrademarkActive: false,
    VariantActive: true,
    GenderActive: false,
  },

  defaultCurrency: "BGN",
  defaultCurrencyPrice: 1.96,
  defaultLanguage: "bg",
  
  defaultCurrencyName: "лв.",
  defaultCurrencySymbol: "лв.",
  defaultCurrencyAlignSymbolEnd: true,

  useLanguages: ["bg", "en"],
  ngxLoaderArray: [1, 2, 3, 4],

  setting: settings,
  accountSetting: accountSettings,
  homeSettings: homeSettings,
  socialSettings: socialSettings,
  countriesSettings: countriesList,
  pagesSettings: pagesBaseOptions,
  searchSettings: searchBarOptions,
  swiperSettings: swiperBaseOptions,
  cardsSettings: cardsBaseOptions,

  imageKitCloud: true,
  imageKitUrl: "https://ik.imagekit.io/beautyflex/", // user name !, not folder name
  placeholderSrc: "https://ik.imagekit.io/beautyflex/placeholder-600x400.webp",

  webUrl: "https://obscene.me/",
  baseApiUrl: "https://obscene.me/api/",
  hostingPath:"h:\\root\\home\\inexus2-001\\www\\obscene\\wwwroot\\assets\\images\\"
};
