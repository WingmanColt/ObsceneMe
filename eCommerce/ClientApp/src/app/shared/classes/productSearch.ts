import { Brand, Series, SubBrand } from "./brands";
import { Occasion, Trademark } from "./categories";
import { Trademarks } from "./enums/trademarks";

export class ProductSearch {
 searchString?: string;
 categoryId?: number;
 subCategoryId?: number;

 brands?: Brand[];
 brandSeries?: Series[]; 
 subBrands?: SubBrand[]; 
 trademarks?: Trademark[];

 sortBy?: string;
 sortDirection?: string;

 genderId?: number; 
 statusId?: number; 
 ratingId?: number;

 minPrice?: number;
 maxPrice?: number; 
 
 occasions?: Occasion[];

 pageNumber: number;
 pageSize: number;
}