import { MarketStatus } from "../product";

export interface ProductShort {
 id?: number;
 title?: string;

 quantity?: number;
 price?: number;
 discountRate?: number;

 rating?: any;
 ratingVotes?: number;

 marketStatus?: MarketStatus;
 image?: string;
}


