import { Status } from "./enums/approveType";


export enum BundleType {
  QuantityBreak = 0,
  GroupedItems = 1,
  OptionalSelection = 2
}

export interface Bundle {
  id?: number;
  name?: string;
  description?: string;
  mainProductId?: number;

  isActive?: boolean;
  status?: Status;
  type?: BundleType,

  createdOn?: string;
  expiredOn?: string;

  bundleItems?: BundleItem[];
}
export interface BundleItem {
  id?: number;
  bundleId?: number;
  productId?: number;

  title?: string;
  price?: number;
  discountRate?: number;
  quantity?: number;
  imageSrc?: string;
  checked?: boolean;
}

export interface BundleInput {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  status: Status;
  type: BundleType;
  bundleItems: BundleItem[];
}
