import { ApproveType } from "./enums/approveType";
import { Operations } from "./enums/operations";
import { Products } from "./product";

// Order
export class Checkout {
  constructor(operation: Operations){
    this.Operation = operation
  }

  id?: number;
  fullname?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  country?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  userId?: string;
  referedByCode?: string;
  visitorID?: string;

  currency?: string;
  currencyPrice?: number;

  isGuest?: boolean;
  pickupAtHome?: boolean;
  promoCode?: PromoCode;

  coupon?: string;
  paymentType?: string;
  approveType?: ApproveType;
  paymentCondition?: PaymentCondition;


  // Just to send to server side and add to order
  totalCost: number;
  totalDiscount: number;


  products?: Products[];
  Operation?: Operations;
}

export interface PromoCode {
  code: string;
  discount: number;
}
export enum PaymentCondition {
  None = 0,
  Waiting = 1,
  Success = 2,
  Discount = 3
}