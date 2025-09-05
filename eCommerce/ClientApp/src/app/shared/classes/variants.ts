export class GroupedVariant {
 id: number;
 title?: string;
 icon?: string;
 variantItems?: GroupedVariantItem[];

 isSelected?: boolean = false; // used in add product
}

export class GroupedVariantItem {
 id: number;
 vId: number;
 VVIRelationId?: number;

 value?: string;
 image?: string;

 isSelected?: boolean = false; // used in add product
}