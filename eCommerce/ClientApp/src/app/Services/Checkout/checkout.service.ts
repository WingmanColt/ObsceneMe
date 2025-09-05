import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { WebApiUrls } from "../../configs/webApiUrls";
import { Checkout, PromoCode } from "../../shared/classes/checkout";
import { AccountService } from "../Account/account.service";
import { OrderCreate } from "src/app/shared/classes/order";
import { OperationResult } from "src/app/shared/interfaces/operationResult";

@Injectable({
  providedIn: "root",
})
export class CheckoutService {

  isCheckoutCompleted: boolean;
  constructor(private http: HttpClient, private config: WebApiUrls, private authService: AccountService) { }

  markCheckoutAsCompleted() {
    this.isCheckoutCompleted = true;
  }

  isCheckoutFinished() {
    return this.isCheckoutCompleted;
  }

  async CreatePreCheckout(body: Checkout): Promise<any> {
    return await lastValueFrom(this.http.post<any>(this.config.setting['AddPreCheckout'], body));
  }

  async Create(body: Checkout): Promise<OrderCreate> {
    // Check for affiliate ref in sessionStorage
    const affiliateRef = sessionStorage.getItem('affiliate_ref');
    if (affiliateRef) {
      body.referedByCode = affiliateRef;
    }

    return await lastValueFrom(
      this.http.post<OrderCreate>(this.config.setting["AddCheckout"], body)
    );
  }


  async Delete(body: Checkout): Promise<OperationResult> {
    return await lastValueFrom(this.http.post<OperationResult>(this.config.setting["DeleteCheckout"], body));
  }

  async applyPromoCode(code: PromoCode): Promise<any> {
    return await lastValueFrom(this.http.post<any>(this.config.setting["ApplyPromoCode"], code));
  }

}
