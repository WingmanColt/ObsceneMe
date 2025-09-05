export class Favourite {

    constructor(productId: number) {
        this.productId = productId;
    }

    id?: number;
    userId?: string;
    productId?: number;
}