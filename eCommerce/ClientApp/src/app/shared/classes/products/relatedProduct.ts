import { Images, MarketStatus, PremiumPackage } from "../product";

export class GetRelatedProducts {
 take: number;
 categoryId?: number;
 subCategoryId?: number;

 constructor(take: number, categoryId?: number, subCategoryId?: number) {
  this.take = take;
  this.categoryId = categoryId;
  this.subCategoryId = subCategoryId;
 }
}

export interface RelatedProduct {
 id?: number;
 title?: string;

 quantity?: number;
 price?: number;
 discountRate?: number;

 isFreeShipping?: boolean;
 rating?: any;
 ratingVotes?: number;
 sold: number;

 premiumPackage?: PremiumPackage;
 marketStatus?: MarketStatus;

 categoryId?: number;
 categoryTitle?: string;

 subCategoryId?: number;
 subCategoryTitle?: string;

 images?: Images[];
}
