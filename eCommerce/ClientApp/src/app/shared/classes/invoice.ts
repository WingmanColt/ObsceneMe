import { Products } from "./product";

export class Invoice {
    firstName?: string;
    lastName?: string;
    phone?: string;
    adress?: string;
    town?: string;
    state?: string;
    postalCode?: number;
    country?: string;
    quantity?: number;
    productTitle?: string;
    pickUpAtHome?: boolean;
    email?: string;
    paymentType?: string;
    cost?: number;
    discount?: number;
    costPerItem?: number;
    discountPerItem?: number;
    currency?: string;
    currencyPrice?: number;
    token?: string;
    code?: string;
    createdOn?: string;

    products?:Products[];
}
export class InvoiceInput {
    token: string;
    code: string;

    constructor(token: string, code: string) {
        this.token = token;
        this.code = code;
    }
}