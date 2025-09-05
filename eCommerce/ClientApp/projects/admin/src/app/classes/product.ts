import { Bundle } from "src/app/shared/classes/bundle";
import { Order } from "src/app/shared/classes/order";
import { MarketStatus } from "src/app/shared/classes/product";

// Products
export class Products {
    id?: number;
    title?: string;
    description?: string;
    details?: string;
    videoUrl?: string;
    quantity?: number;
    price?: number;
    category?: number;
    categoryId?: number;
    discountRate?: number;
    userId?: string;
    isShippable?: boolean;
    pickupInStore?: boolean;
    isReturnRequestAllowed?: boolean;
    rating?: number;
    views?: number;
    ratingVotes?: number;
    votedUsers?: number;
    premiumPackage?: number;
    approveType?: number;
    marketStatus?: number;
    trademark?:number;
    itemType?: number;
    status?: number;
    gender?: number;
    createdOn?: Date;
    expiredOn?: Date;

    gif1_Url?: string;
    gif1_Title?: string;
    gif1_Details?: string;

    gif2_Url?: string;
    gif2_Title?: string;
    gif2_Details?: string;

    gif3_Url?: string;
    gif3_Title?: string;
    gif3_Details?: string;

    variants?: Variants[];
    images?: Images[];
    reviews?: Review[];
    bundle?: Bundle;

    activeColor?: any;
    activeSize?: any;
}

export class VariantSqlOutput {
    id?: number;
    title?: string;
    variantItems?: VariantItem[];
}
export class Variants {
    productId?: number;
    id?: number;
    size?: string;
    color?: string;
    imageId?: string;
    isSelected?: boolean;

    // New
    title?: string;
    icon?: string;
    variantItems?: VariantItem[];
}
export class VariantItem {
    id?: number;
    value?: string;
    image?: string;

    variantId?: number;
    variant?: Variants;
    isSelected?: boolean;
}

export class Images {
    productId?: number;
    id?: number;
    isExternal?: boolean;
    src?: string;
    variant_id?: number;
}
export class Review {
    id?: number;
    productId?: number;
    productStars?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    about?: string;
    sendToSupport?: boolean;
    createdOn?: Date;
}
export interface OrdersWithTotalCount {
    items: Order[];       // Array of orders
    totalCount: number;   // Total count of orders
  }
export enum ApproveType {
    Waiting = 0,
    Rejected = 1,
    Success = 2,
}
export enum Status {
    Available = 0,
    Sold = 1,
    Unavailable = 2,
    Archived = 3,
}
export enum ItemType {
    Physical = 0,
    Digital = 1,
    Bundle = 2,
}
export enum Gender {
    None = 0,
    Unisex = 1,
    Men = 2,
    Women = 3,
    Kids = 4,
}
export enum Stars {
    One = 1,
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
}
export const Gender_LabelMapping: Record<Gender, string> = {
    [Gender.None]: "None",
    [Gender.Unisex]: "Unisex",
    [Gender.Men]: "Mens",
    [Gender.Women]: "Womens",
    [Gender.Kids]: "Kids",
};
export const Stars_LabelMapping: Record<Stars, string> = {
    [Stars.One]: "1",
    [Stars.Two]: "2",
    [Stars.Three]: "3",
    [Stars.Four]: "4",
    [Stars.Five]: "5",
};
export const ItemType_LabelMapping: Record<ItemType, string> = {
    [ItemType.Physical]: "Physical item",
    [ItemType.Digital]: "Digital item",
    [ItemType.Bundle]: "Bundle package",
};

export const MarketStatus_LabelMapping: Record<MarketStatus, string> = {
    [MarketStatus.None]: "None",
    [MarketStatus.Low]: "Low",
    [MarketStatus.New]: "New",
    [MarketStatus.Sale]: "Sale",
    [MarketStatus.PreOrder]: "Pre Order",
    [MarketStatus.Sold]: "Sold",
};

export const ApproveType_LabelMapping: Record<ItemType, string> = {
    [ApproveType.Waiting]: "Waiting",
    [ApproveType.Rejected]: "Rejected",
    [ApproveType.Success]: "Success",
};