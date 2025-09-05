import { MarketStatus, PremiumPackage } from "../product";
import { GroupedVariant } from "../variants";

export interface ProductById {
 id?: number;
 title?: string;
 details?: string;

 quantity?: number;
 customerPreferenceQuantity?: number;
 price?: number;
 discountRate?: number;

 isFreeShipping?: boolean;
 rating?: any;
 ratingVotes?: number;
 positiveRating?: any;

 premiumPackage?: PremiumPackage;
 marketStatus?: MarketStatus;

 selectedVariants?:GroupedVariant[];
 image?: string;
}