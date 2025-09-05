import { Operations } from "./enums/operations";

export class Brand {
 constructor(operation: Operations){
  this.Operation = operation
}

 id?: number;
 title?: string;
 shortName?: string;
 icon?: string;
 totalProductsCount?: number;
 isSelected?:boolean;

 series?: Series[];
 Operation?: Operations;
}

export class Series {
    constructor(operation: Operations) {
    this.Operation = operation
  }
 
  id?: number;
  title?: string;
  brandShortName?: string;
  shortName?: string;
  icon?: string;
  productsCount?: number;
  isSelected?:boolean;
 
  subBrands?: SubBrand[];
  Operation?: Operations;
 }
export class SubBrand {
    constructor(operation: Operations) {
    this.Operation = operation
  }
 
  id?: number;
  title?: string;
  brandShortName?: string;
  seriesShortName?: string;
  shortName?: string;
  icon?: string;
  productsCount?: number;
  isSelected?:boolean;
 
  Operation?: Operations;
 }
 

 
 
