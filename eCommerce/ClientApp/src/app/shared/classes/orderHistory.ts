import { ApproveType } from "./enums/approveType";
import { Products } from "./product";
import { Currency } from "./settings";

export class OrderHistory {
    id?: number;
    phoneNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: number;
    country?: string;
    cost?: number;
    shipping?: number;
    discount?: number;
    orderCode?: string;
    createdOn?: string;
    currency?: Currency;
    approveType?: ApproveType;
    logoSrc?: string;
    products?: Products[] = [];
}

