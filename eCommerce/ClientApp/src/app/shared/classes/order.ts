import { Operations } from "./enums/operations";

export class Order {
    constructor(operation: Operations){
        this.Operation = operation
      }
      
    Id?: number;

    productId?: number;
    productTitle?: string;
    checkoutId?: number;
    quantity?: number;
    totalAmount?: any;
    isPayed?: boolean;
    willEarnRewardPoints?: number;
    tax?: number;
    createdOn?: Date;
    expiredOn?: Date;

    shippingType?: any;
    paymentType?: string;
    cost?: any;
    discount?: number;
    costPerItem?: number;
    discountPerItem?: number;
    totalCost?: number;
    totalDiscount?: number;
    currency?: string;
    code?: string;

    trackingNumber?: string;
    cancellationReason?: string;
    notes?:string;
    phone?: string;

    userId?: string;
    Operation?: Operations;
}

export interface OrderCreate {
    token?: string;
    code?: string;
    message?: string;
    isCreated?: boolean;
}
