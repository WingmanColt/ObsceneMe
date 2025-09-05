import { Operations } from "./enums/operations";

export class Category {
    constructor(operation: Operations){
        this.Operation = operation
      }

    id?: number;
    title?: string;
    shortName?: string;
    icon?: string;
    totalProductsCount?: number;
    subCategoriesCount?: number;
    isSelected?: boolean;
    Operation?: Operations;

    subCategories?: SubCategory[];
}

export class SubCategory {
    constructor(operation: Operations){
        this.Operation = operation
      }

    id?: number;
    title?: string;
    categoryShortName?: string;
    shortName?: string;
    icon?: string;
    productsCount?: number;
    isSelected?: boolean;

    Operation?: Operations;
}

export class Occasion {
    constructor(operation: Operations){
        this.Operation = operation
      }
      
    id?: number;
    title?: string;
    shortName?: string;
    icon?: string;
    productsCount?: number;
    isSelected?: boolean;

    Operation?: Operations;
}

export class Trademark {
  constructor(operation: Operations){
      this.Operation = operation
    }
    
  id: number;
  label: string;
  
  isSelected?: boolean;
  Operation?: Operations;
}