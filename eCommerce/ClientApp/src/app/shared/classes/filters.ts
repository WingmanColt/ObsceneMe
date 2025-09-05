import { Brand, Series, SubBrand } from "./brands";
import { Occasion, Trademark } from "./categories";
import { Trademarks } from "./enums/trademarks";


export class Filters {
 constructor(init?: Partial<Filters>) {
  Object.assign(this, init);
}

categoryId?: number;
subCategoryId?: number; 
searchString?: string; 

genderId?: number; 
statusId?: number; 
ratingId?: number;

sortBy?: string;
sortDirection?: string;

minPrice?: number;
maxPrice?: number;

brands?: Brand[];
brandSeries?: Series[]; 
subBrands?: SubBrand[]; 
occasions?: Occasion[];
trademarks?: Trademark[];
}