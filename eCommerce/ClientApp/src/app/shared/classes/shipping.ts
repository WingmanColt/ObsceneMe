export interface Sender {
 name: string;
 phones: string[];
}

export interface Address {
 city: {
  country: {
   code3: string;
  };
  name: string;
  postCode: string;
 };
 street: string;
 num: string;
 other?: string;
}

export interface Shipment {
 sender: Sender;
 senderAddress: Address;
 receiver: Sender;
 receiverAddress: Address;
 packCount: number;
 shipmentType: "PACK" | "PALLET";
 weight: number;
 shipmentDescription: string;
}

export interface ShippingDetails {
 label: Shipment;
 mode: "calculate";
}

export interface Shipping {
    label?: string;
    shortName?: string;
    cost?: number;
    freeShipping?:boolean;

    //image?: string;
   // icon?:string;
   // content?:string;
   // isExpanded: boolean;
   }
   
