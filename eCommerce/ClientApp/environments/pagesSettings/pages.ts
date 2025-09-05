import { AboutOptions } from "./pages/About";
import { AccountOptions } from "./pages/Account";
import { AffiliateGuideOptions } from "./pages/AffiliateGuide";
import { CheckoutOptions } from "./pages/Checkout";
import { CollectionOptions } from "./pages/Collection";
import { DetailsOptions } from "./pages/Details";
import { FAQOptions } from "./pages/FAQ";
import { PrivacyOptions } from "./pages/Privacy";
import { ReturnsWarrantyOptions } from "./pages/Returns&Warranty";
import { ReviewsOptions } from "./pages/Reviews";
import { VariantOptions } from "./pages/Variants";

export const pagesBaseOptions = {
    // Shop Page
    stickyHeader: true,
    transparentHeader: false,
    invisibleBottomMenu: true,

    AccountSettings: AccountOptions,
    AboutSettings: AboutOptions,
    FAQSettings: FAQOptions,
    AffiliateGuideSettings: AffiliateGuideOptions,
    PrivacySettings: PrivacyOptions,
    DetailsSettings: DetailsOptions,
    CollectionSettings: CollectionOptions,
    VariantSettings: VariantOptions,
    CheckoutSettings: CheckoutOptions,
    ReturnsWarrantySettings: ReturnsWarrantyOptions,
    ReviewsSettings: ReviewsOptions
};
