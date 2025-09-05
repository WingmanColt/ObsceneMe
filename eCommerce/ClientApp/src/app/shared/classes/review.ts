
export class Review {
    id?: number;
    productId?: number;
    productStars?: number = 0;
    firstName?: string;
    lastName?: string;
    email?: string;
    about?: string;
    src?: string;
    colour?: string;
    sendToSupport?: boolean;
    orderCode?: string;
    createdOn?: string;
}