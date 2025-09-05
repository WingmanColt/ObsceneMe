import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ShippingApiUrls } from "src/app/configs/shippingApiUrls";

@Injectable({
 providedIn: "root",
})
export class ShippingService {
 constructor(private http: HttpClient, private config: ShippingApiUrls) {}

 calculateShippingPrice(shipment: any) {
  return this.http.post(this.config.setting["calculateEcont"], {
   mode: "calculate",
   label: shipment,
  });
 }
}
