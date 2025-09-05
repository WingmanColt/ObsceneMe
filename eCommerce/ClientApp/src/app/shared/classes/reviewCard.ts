import { AdStatus } from "./enums/approveType";

export class ProductReviewCard {
 id?: number;
 firstName?: string;
 lastName?: string;
 reviewComment?: string;
 reviewRating?: number;
 reviewRatingVotes?: number;
 reviewImage?: string;

 //categoryTitle?:string;
 productId?: number;
 productStars?: number;
 productImageUrl?: string;
 productTitle?: string;
 productAbout?: string;
 productPrice?: number;
 productDiscountRate?: number;
 productPositiveRating?: number;


 //adStatus?: AdStatus;
 createdOn?: string;
}