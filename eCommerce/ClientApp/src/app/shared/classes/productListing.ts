import { Occasion } from "./categories";
import { Images, MarketStatus} from "./product";

export interface ProductListing {
 totalItems?: number;
 product?: ProductListingDetails[];
}

export interface ProductListingDetails {
 id?: number;
 title?: string;
 description?: string;
 details?: string;
 videoUrl?: string;

 quantity?: number;
 price?: number;
 discountRate?: number;

 isFreeShipping?: boolean;
 rating?: any;
 ratingVotes?: number;
 positiveRating?: any;
 premiumPackage?: number;
 marketStatus?: MarketStatus;
 itemType?: number;
 status?: number;

 categoryId?: number;
 categoryTitle?: string;

 subCategoryId?: number;
 subCategoryTitle?: string;

 brandId?: number;
 brandTitle?: string;

 images?: Images[];
 occasions?: Occasion[];
}