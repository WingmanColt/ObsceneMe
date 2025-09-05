import { Products } from "./product";
import { GroupedVariant } from "./variants";

export interface Cart {
    id?: number;
    expiredOn?: Date;
    totalItems?: number;
    totalCost?: any;
    userId?: string;
    cartItems?: CartItem[];
    products?: Products[];
}

export interface CartItem {
    id?: number;
    productId?: number;
    cartId?: number;
    checkoutId?: number;
}

export interface CartItemState {
    productId?: number;
    customerPreferenceQuantity?: number;
    selectedVariants?: GroupedVariant[];

    selectedBundle?: {
    bundleId?: number;    
    title?: string;
    price?: number;
    discountRate?: number;
    quantity?: number;
    imageSrc?: string;
  };
}
