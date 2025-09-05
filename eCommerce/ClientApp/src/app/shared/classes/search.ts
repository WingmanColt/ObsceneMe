import { Category } from "./categories";
import { Products } from "./product";

export class SearchRequest {
 searchString?: string;
 searchType?: SearchType;
 usedLanguage: string;

 constructor(searchString, searchType, usedLanguage) {
  this.searchString = searchString;
  this.searchType = searchType;
  this.usedLanguage = usedLanguage;
 }
}

export class SearchResponse {
 products?: Products[] | undefined;
 categories?: Category[] | undefined;
 //    pages: [];
}

export class KeywordsArray {
 keyword: string;
 type: number;
 catId: number;

 constructor(key, type, catId) {
  this.keyword = key;
  this.type = type;
  this.catId = catId;
 }
}

export enum SearchType {
 Product = 0,
 Category = 1,
 Page = 2
}
