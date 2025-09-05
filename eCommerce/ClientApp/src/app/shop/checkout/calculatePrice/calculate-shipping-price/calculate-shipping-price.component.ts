import { Component } from "@angular/core";
import { ShippingService } from "src/app/Services/Shipping/shipping.service";
import { ShippingDetails } from "src/app/shared/classes/shipping";

@Component({
 selector: "app-calculate-shipping-price",
 templateUrl: "./calculate-shipping-price.component.html",
 styleUrls: ["./calculate-shipping-price.component.scss"],
})
export class CalculateShippingPriceComponent {
 constructor(private shippingService: ShippingService) {}

 getPrice() {
  const shipment: ShippingDetails = {
   label: {
    sender: {
     name: "John Doe",
     phones: ["0888888"],
    },
    senderAddress: {
     city: {
      country: {
       code3: "BGR",
      },
      name: "Русе",
      postCode: "7012",
     },
     street: "Алея Младост",
     num: "7",
    },
    receiver: {
     name: "Jane Doe",
     phones: ["0899999"],
    },
    receiverAddress: {
     city: {
      country: {
       code3: "BGR",
      },
      name: "Русе",
      postCode: "7010",
     },
     street: "Муткурова",
     num: "84",
     other: "бл. 5, вх. А, ет. 6",
    },
    packCount: 1,
    shipmentType: "PACK",
    weight: 2,
    shipmentDescription: "Clothes",
   },
   mode: "calculate",
  };

  this.shippingService.calculateShippingPrice(shipment).subscribe((result) => {
   // result contains totalPrice, currency etc.
   console.log(result);
  });
 }
}
