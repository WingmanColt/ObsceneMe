import { Brand } from "./brands";
import { Bundle } from "./bundle";
import { Category, SubCategory } from "./categories";
import { Operations } from "./enums/operations";
import { Trademarks } from "./enums/trademarks";
import { Review } from "./review";

// Products
export interface Product {
  id?: number;
  title?: string;
  description?: string;
  about?:string;
  type?: string;
  brand?: string;
  collection?: any[];
  category?: string;
  subCategory?: string;
  price?: number;
  sale?: boolean;
  discountRate?: number;
  stock?: number;
  new?: boolean;
  quantity?: number;
  customerPreferenceQuantity?: number;
  tags?: any[];
  variants?: Variants[];
  images?: Images[];
  bundle?: Bundle;
}
export interface SpecialProduct {
  id?: number;
  title?: string;
  quantity?: number;
  price?: number;
  discountRate?: number;

  rating?: any;
  ratingVotes?: number;

  marketStatus?: MarketStatus;
  images?: Images[];
}


export interface Products {
  id?: number;
  title?: string;

  description?: string;
  usage?: string;
  composition?: string;
  characteristic?: string;
  details?: string;

  videoUrl?: string;
  quantity?: number;
  customerPreferenceQuantity?: number;
  sold?: number;
  price?: number;
  category?: Category;
  categoryTitle?: string;
  categoryId?: number;
  subCategoryTitle?: string;
  subCategoryId?: number;
  brandId?: number;
  brandName?: string;
  brand?: Brand;
  discountRate?: number;
  userId?: string;
  isFreeShipping?: boolean;
  isReturnRequestAllowed?: boolean;
  views?: number;
  rating?: any;
  ratingVotes?: number;
  positiveRating?: any;
  premiumPackage?: number;
  marketStatus?: MarketStatus;
  trademark?: Trademarks;
  approveType?: number;
  itemType?: number;
  status?: number;
  gender?: number;
  createdOn?: Date;
  expiredOn?: Date;
  src?: string;

  variants?: Variants[];
  images?: Images[];

  categories?: Category[];
  subCategory?: SubCategory[];
  reviews?: Review[];
  bundle?: Bundle;

  activeColor?: any;
  activeSize?: any;

  isLoading?: boolean;
}


export class Variant {
  title?: string;
  value?: string;
}
export class SelectedFilterArray {
  title?: string;
  values?: string[];
}
export class FilterVariants {
  id?: number;
  title?: string;
  icon?: string;
  variantItems?: VariantItem[];
}
export class Variants {
  productId?: number;
  id?: number;
  size?: string;
  color?: string;
  image?: string;
  value?: string;
  title?: string;
  isSelected?: boolean;
  icon?: string;
  variantItems?: VariantItem[];
}
export class VariantItem {
  id?: number;
  //variantId?: number;
  //variant?: Variants;
  value?: string;
  image?: string;
  isSelected?: boolean;
}

export class Images {
  constructor(operation: Operations){
    this.Operation = operation
  }

  productId?: number;
  id?: number;
  isExternal?: boolean;
  imageType?:ImageType;
  src?: string;
  variantId?: number;

  Operation?: Operations;
}
export class ProductIds {
  quantity?: number;
  id?: number;
}

export class LocalStorageProduct {
  key?: string;
  value?: any;
}
export class LocalStorageImages {
  productId?: number;
  src?: string;
  alt?: string;
}
export class LocalStorageVariants {
  productId?: number;
  color?: string;
  size?: string;
  imageId?: string;
}

export enum MarketStatus {
  None = 0,
  New = 1,
  Sale = 2,
  PreOrder = 3,
  Sold = 4,
  Low = 5
}

export enum PremiumPackage {
  None = 0,
  Bronze = 1,
  Silver = 2,
  Gold = 3,
}
export enum PurchaseStatus {
  None = 0,
  Quantity = 1,
  Processing = 2,
  Finish = 3,
}

export enum ImageType {
  Thumb = 0,
  Main = 1,
  About = 2,
  Usage = 3,
  Composition = 4,
  Characteristic = 5
}

export const ImageType_LabelMapping: Record<ImageType, string> = {
  [ImageType.Thumb]: "Thumb",
  [ImageType.Main]: "Main",
  [ImageType.About]: "About",
  [ImageType.Usage]: "Usage",
  [ImageType.Composition]: "Composition",
  [ImageType.Characteristic]: "Characteristic",
};
