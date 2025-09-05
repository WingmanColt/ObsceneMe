export interface FastOrder {
    id: number;
    phone?: string;
    costPerItem?: number;
    discountPerItem?: number;
    productId?: number;
    productTitle?: string;
}