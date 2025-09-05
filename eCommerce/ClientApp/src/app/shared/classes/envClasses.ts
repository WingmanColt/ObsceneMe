export interface Country {
 label?: string;
 image?: string;
 icon?: string;
}

export interface ShippingType {
 label?: string;
 shortname?: string;
 image?: string;
 icon?: string;
 freeShipping?: boolean;
 cost?: number;
 isExpanded?: boolean;
}

export interface PaymentType {
 label?: string;
 shortname?: string;
 image?: string;
 icon?: boolean;
 content?: string;
 isExpanded?: boolean;
}