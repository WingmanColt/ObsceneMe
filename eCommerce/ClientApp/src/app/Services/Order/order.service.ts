import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { WebApiUrls } from "../../configs/webApiUrls";
import { Order } from "../../shared/classes/order";
import { lastValueFrom } from "rxjs";
import { Invoice, InvoiceInput } from "src/app/shared/classes/invoice";
import { FastOrder } from "src/app/shared/classes/fastOrder";
import { OrderHistory } from "src/app/shared/classes/orderHistory";
import { OperationResult } from "src/app/shared/interfaces/operationResult";

@Injectable({
  providedIn: "root",
})
export class OrderService {
  private lastCode: string = null;
  private lastToken: string = null;
  //private cachedInvoice: Observable<Invoice>;
  //private _invoiceData$ = new BehaviorSubject<void>(undefined);

  constructor(private http: HttpClient, private config: WebApiUrls) { }
  /*
    async Create(input: Order): Promise<OperationResult> {
      return lastValueFrom(this.http.post<OperationResult>(this.config.setting["AddOrder"], input));
    }*/

  async CreateFast(input: FastOrder): Promise<OperationResult> {
    return await lastValueFrom(this.http.post<OperationResult>(this.config.setting["AddFastOrder"], input));
  }

  async UpdateIsPayed(input: Order): Promise<OperationResult> {
    return await lastValueFrom(this.http.post<OperationResult>(this.config.setting["UpdateIsPayed"], input));
  }

  async getOrdersHistory(): Promise<OrderHistory[]> {
    return await lastValueFrom(
      this.http.get<OrderHistory[]>(this.config.setting['OrdersHistory'])
    );
  }

  async updateOrderHistory(req: Order): Promise<OperationResult> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return await lastValueFrom(
      this.http.post<OperationResult>(this.config.setting['UpdateOrderHistory'], req)
    );
  }

  async GetInvoice(code: string, token: string): Promise<Invoice> {
    // Check if code or token has changed
    if (this.lastCode === code && this.lastToken === token) 
      return null;

    // Update the last known code and token
    this.lastCode = code;
    this.lastToken = token;

    const req = new InvoiceInput(token, code);

   return await lastValueFrom(
      this.http.post<Invoice>(this.config.setting["GetInvoice"], req)
    );
    /*
    // Create a new observable for the HTTP request and cache it
    this.cachedInvoice = this._invoiceData$.pipe(
      switchMap(() => this.http.post<Invoice>(this.config.setting["GetInvoice"], { code: code, token: token })),
      shareReplay(1)
    );

    return this.cachedInvoice;*/
  }


}
