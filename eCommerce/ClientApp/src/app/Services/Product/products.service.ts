import { Injectable } from "@angular/core";
import {
  BehaviorSubject,
  Observable,
  catchError,
  debounceTime,
  filter,
  lastValueFrom,
  shareReplay,
  switchMap,
  throwError
} from "rxjs";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Products } from "../../shared/classes/product";
import { WebApiUrls } from "../../configs/webApiUrls";
import { environment } from "environments/environment";
import { ProductSearch } from "src/app/shared/classes/productSearch";
import { ProductListing } from "src/app/shared/classes/productListing";
import {
  GetRelatedProducts,
  RelatedProduct,
} from "src/app/shared/classes/products/relatedProduct";
import { StoryBlock, StoryPage } from "src/app/shared/classes/products/storyBlock";
import { ProductDetails } from "src/app/shared/classes/productDetails";

@Injectable({
  providedIn: "root",
})
export class ProductsService {
  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
      //"accessToken": '"' + this.core.getAccessToken() + '"',
    }),
  };

  public enviroment = environment;
  private _productSearch$ = new BehaviorSubject<any | null>(null);

  private _specialOffersData$ = new BehaviorSubject<void>(null);
  private _relatedProductsData$ = new BehaviorSubject<void>(null);
  private _shortProductsData$ = new BehaviorSubject<void>(null);
  private _categoriesWithSubsData$ = new BehaviorSubject<void>(null);
  private _categoriesData$ = new BehaviorSubject<void>(null);
  private _allCategoriesData$ = new BehaviorSubject<void>(null);
  private _subCategoriesData$ = new BehaviorSubject<void>(null);

  private _productDetailsData$ = new BehaviorSubject<void>(null);
  private productCache = new Map<string, Observable<ProductDetails>>();

  private _occasionsData$ = new BehaviorSubject<void>(null);
  private _filterVariantsData$ = new BehaviorSubject<void>(null);

  constructor(private http: HttpClient, private config: WebApiUrls) {}

  
  // Product
  public products(): Observable<Products[]> {
    return this.http.get<Products[]>(this.config.setting["GetProducts"]);
  }

  private lastRequestId = 0; // Track the ID of the last request

  public getProductListing(): Observable<ProductListing> {
    return this._productSearch$.pipe(
      debounceTime(100), // Reduce request frequency
      switchMap((payload) => {
        if (!payload) return throwError(() => new Error('No search payload provided'));
  
        const currentRequestId = ++this.lastRequestId; // Increment and track the current request
  
        const request$ = payload.isFiltered
          ? this.http.post<ProductListing>(this.config.setting["FetchProductsPost"], payload.params).pipe(
              catchError((error) => {
                console.error('Error fetching filtered product listing:', error);
                return throwError(() => new Error('Failed to fetch filtered products'));
              })
            )
          : this.getDefaultProducts(payload.params as ProductSearch); // Separate helper for GET requests
  
        return request$.pipe(
          filter(() => currentRequestId === this.lastRequestId), // Ensure only the last request completes
        );
      })
    );
  }
  
  public getDefaultProducts(params: ProductSearch): Observable<ProductListing> {
    const validParams = Object.keys(params).reduce((acc, key) => {
      const value = params[key as keyof ProductSearch];
      if (value !== undefined && value !== null) {
        acc[key] = Array.isArray(value) ? value.join(',') : value.toString();
      }
      return acc;
    }, {} as { [key: string]: string });
  
    const httpParams = new HttpParams({ fromObject: validParams });
    return this.http.get<ProductListing>(this.config.setting["FetchProductsGet"], { params: httpParams }).pipe(
      catchError((error) => {
        console.error('Error fetching default product listing:', error);
        return throwError(() => new Error('Failed to fetch default products'));
      })
    );
  }
  
  public updateProductSearch(entity: ProductSearch, isFiltered: boolean): void {
    this._productSearch$.next({ isFiltered, params: entity });
  }

  private fetchData(subject: BehaviorSubject<void>, urlKey: string) {
    return subject.pipe(
      switchMap(() =>
        this.http.get<any[]>(this.config.setting[urlKey], {
          params: { _useCache: "true" },
        })
      ),
      shareReplay(1)
    );
  }
  private fetchDataPost(subject: BehaviorSubject<void>, urlKey: string, model: any) {
    return subject.pipe(
      switchMap(() =>
        this.http.post<any[]>(this.config.setting[urlKey], model, {
        //  params: { _useCache: "true" },
        })
      ),
      shareReplay(1)
    );
  }

  public getRelatedProducts(take: number, categoryId?: number, subCategoryId?: number): Observable<RelatedProduct[]> {
    return this.fetchDataPost(this._relatedProductsData$, "GetRelatedProducts",new GetRelatedProducts(take, categoryId, subCategoryId));
  }

  public specialOffers$ = this.fetchData(this._specialOffersData$,"GetSpecialProducts");
  public categoriesWithSubs$ = this.fetchData(this._categoriesWithSubsData$,"GetUsedCategoriesWithSubs");
  public categories$ = this.fetchData(this._categoriesData$, "GetUsedCategories");
  public allCategories$ = this.fetchData(this._allCategoriesData$, "GetAllCategories");
  public subCategories$ = this.fetchData(this._subCategoriesData$, "GetAllSubCategories");
  public occasions$ = this.fetchData(this._occasionsData$, "GetUsedOccasions");
  public shortProducts$ = this.fetchData(this._shortProductsData$,"GetProductsShort");
  public filterVariants$ = this.fetchData(this._filterVariantsData$, "GetFilterVariants");

  // Product Details Req
  /*public productDetails$(slug: string) {
    return this._productDetailsData$.pipe(
      switchMap(() =>
        this.http.get<any>(
          this.config.setting["GetProductDetails"] + slug,
          { params: { _useCache: "true" } }
        )
      ),
      shareReplay(1)
    );
  }*/

public productDetails$(slug: string): Observable<ProductDetails> {
  if (!this.productCache.has(slug)) {
    const request$ = this.http.get<ProductDetails>(
      this.config.setting["GetProductDetails"] + slug,
      { params: { _useCache: "true" } }
    ).pipe(shareReplay(1));
    
    this.productCache.set(slug, request$);
  }

  return this.productCache.get(slug)!;
}

    async getProductsAsync(): Promise<any> {
    // Make the GET request with query parameters
    return await lastValueFrom(this.http.get<any>(this.config.setting["GetProducts"]));
  }

  async getAllByCategory(shortname: string): Promise<any> {
    // Use HttpParams to add the query parameter
    const params = new HttpParams().set('shortName', shortname);

    // Make the GET request with query parameters
    return await lastValueFrom(this.http.get<any>(this.config.setting["GetAllByCategory"], { params }));
  }

  async getStoryPage(productId: number): Promise<StoryPage> {
    const url = this.config.setting["GetStoryPage"];
    if (!url) throw new Error("Missing config for GetStoryPage");
    const params = new HttpParams().set('productId', productId);
    return await lastValueFrom(this.http.get<any>(url, { params }));
  }

  async getStoryBlock(productId: number): Promise<StoryBlock[]> {
    const url = this.config.setting["GetStoryBlock"];
    if (!url) throw new Error("Missing config for GetStoryBlock");
    const params = new HttpParams().set('productId', productId);
    return await lastValueFrom(this.http.get<any>(url, { params }));
  }

}
