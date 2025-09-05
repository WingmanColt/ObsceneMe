import { MarketStatus, VariantItem } from "src/app/shared/classes/product";
import { Category, Occasion, SubCategory } from "src/app/shared/classes/categories";
import { Brand, Series, SubBrand } from "src/app/shared/classes/brands";
import { GroupedVariant } from "src/app/shared/classes/variants";
import { ApproveType, Gender, Images, ItemType, Status, Variants } from "../../../classes/product";
import { Trademarks } from "src/app/shared/classes/enums/trademarks";
import { StoryPage } from "src/app/shared/classes/products/storyBlock";
import { Bundle, BundleInput } from "src/app/shared/classes/bundle";

export interface ProductById {
 product?: ProductByIdAddProduct;
 categories?: Category[];
 subCategories?: SubCategory[];
 occasions?: Occasion[];
 bundle?: Bundle;
 brands?: Brand[];
 series?: Series[];
 subBrands?: SubBrand[];
 groupedVariants?: GroupedVariant[];
 images?: Images[];
}
export interface ProductByIdAddProduct {
 body: any;
 id?: number;
 title?: string;
 description?: any;
 usage?: any;
 composition?:any;
 characteristic?:any;
 details?: string;
 videoUrl?: string;
 quantity?: number;
 price?: number;
 discountRate?: number;

 isFreeShipping?: boolean;
 pickupInStore?: boolean;
 isReturnRequestAllowed?: boolean;

 premiumPackage?: number;
 approveType?: ApproveType;
 marketStatus?: MarketStatus;
 trademark?: Trademarks;
 itemType?: ItemType;
 status?: Status;
 gender?: Gender;
}
export class AddProduct {
 body: any;
 id?: number;
 title?: string;
 shortName?: string;
 description?: any;
 usage?: any;
 composition?:any;
 characteristic?:any;
 details?: string;
 videoUrl?: string;
 quantity?: number;
 price?: number;
 discountRate?: number;

 isFreeShipping?: boolean;
 pickupInStore?: boolean;
 isReturnRequestAllowed?: boolean;

 premiumPackage?: number;
 approveType?: ApproveType;
 marketStatus?: MarketStatus;
 trademark?: Trademarks;
 itemType?: ItemType;
 status?: Status;
 gender?: Gender;

 category?: Category[];
 subCategory?: SubCategory[];

 occasion?: Occasion[];
 bundle?: BundleInput;

 brand?: Brand[];
 series?: Series[];
 subBrand?: SubBrand[];
 
 variant?: Variants[];
 variantItems?: VariantItem[];
 groupedVariants?: GroupedVariant[];
 image?: Images[];
 storyPage?: StoryPage;

 mockProductsCount?: number;
}
