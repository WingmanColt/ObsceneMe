import { Bundle } from "./bundle";
import { Trademarks } from "./enums/trademarks";
import { Images, MarketStatus, Variants } from "./product";
import { StoryPage } from "./products/storyBlock";
import { Review } from "./review";

export interface ProductDetails {
 id?: number;
 title?: string;
 shortName?: string;
 description?: string;
 usage?: any;
 composition?:any;
 characteristic?:any;
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
 trademark?: Trademarks;
 itemType?: number;
 status?: number;

 categoryId?: number;
 categoryTitle?: string;

 subCategoryId?: number;
 subCategoryTitle?: string;

 brandId?: number;
 brandTitle?: string;

 seriesId?: number;
 seriesTitle?: string;

 subBrandId?: number;
 subBrandTitle?: string;

 images?: Images[];
 variants?: Variants[];
 reviews?: Review[];

 storyPage?: StoryPage;
 bundle?: Bundle;
}