import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, lastValueFrom, shareReplay, switchMap } from 'rxjs';
import { AddProduct, ProductById } from "projects/admin/src/app/services/Product/classes/Product";
import { OperationResult } from "src/app/shared/interfaces/operationResult";
import { adminApiUrls } from "projects/admin/src/app/configs/adminApiUrls"; // Correct import path
import { Category, Occasion, SubCategory } from "src/app/shared/classes/categories";
import { Brand, SubBrand, Series } from "src/app/shared/classes/brands";
import { Order } from "src/app/shared/classes/order";
import { Checkout } from "src/app/shared/classes/checkout";
import { OrdersWithTotalCount, Status } from "projects/admin/src/app/classes/product";

@Injectable({
  providedIn: "root",
})
export class ActionsService {

  private httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
      // Uncomment and implement accessToken retrieval if needed
      // "accessToken": '"' + this.core.getAccessToken() + '"',
    }),
  };

  private _ordersData$ = new BehaviorSubject<void>(null);
  private _categoriesData$ = new BehaviorSubject<void>(null);
  private _subCategoriesData$ = new BehaviorSubject<void>(null);
  private _brandsData$ = new BehaviorSubject<void>(null);
  private _subBrandsData$ = new BehaviorSubject<void>(null);
  private _seriesData$ = new BehaviorSubject<void>(null);
  private _occasionsData$ = new BehaviorSubject<void>(null);

  constructor(private http: HttpClient, private apiUrls: adminApiUrls) {}

  /* Product */
  public async getProductById(productId: number): Promise<ProductById> {
    const url = `${this.apiUrls.get('GetProductById')}/${productId}`;
    return await lastValueFrom(this.http.get<ProductById>(url, this.httpOptions));
  }
public async createProduct(body: AddProduct): Promise<OperationResult> {
  const url = this.apiUrls.get('CreateProduct');
  try {
    return await lastValueFrom(
      this.http.post<OperationResult>(url, body, this.httpOptions)
    );
  } catch (err: any) {
    this.handleHttpError(err, 'creating product');
    throw err;
  }
}

  public async createMockProduct(body: AddProduct): Promise<OperationResult> {
    const url = this.apiUrls.get('AddProductMock');
    return await lastValueFrom(this.http.post<OperationResult>(url, body, this.httpOptions));
  }
public async updateProduct(productId: number, product: AddProduct): Promise<OperationResult> {
  const url = `${this.apiUrls.get('UpdateProduct')}/${productId}`;
  try {
    return await lastValueFrom(
      this.http.put<OperationResult>(url, product, this.httpOptions)
    );
  } catch (err: any) {
    this.handleHttpError(err, 'updating product');
    throw err;
  }
}

  public async updateProducMainImage(imageId: number, oldImageId?: number | undefined): Promise<OperationResult> {
    const url = `${this.apiUrls.get('UpdateProductMainImage')}/${imageId}`;
    return await lastValueFrom(this.http.put<OperationResult>(url, oldImageId, this.httpOptions));
  }
  public async updateProductStatus(productId: number, status: Status): Promise<OperationResult> {
    const url = `${this.apiUrls.get('UpdateProductStatus')}/${productId}`;
    return await lastValueFrom(this.http.put<OperationResult>(url, status, this.httpOptions));
  }
  public async deleteProduct(productId: number): Promise<OperationResult> {
    const url = `${this.apiUrls.get('DeleteProduct')}/${productId}`;
    return await lastValueFrom(this.http.delete<OperationResult>(url, this.httpOptions));
  }
  public async deleteAllProducts(): Promise<OperationResult> {
    const url = this.apiUrls.get('DeleteAllProducts');
    return await lastValueFrom(this.http.delete<OperationResult>(url, this.httpOptions));
  }

    
  /* Order */ 
getOrders(params: { offset: number, pageSize: number }): Observable<OrdersWithTotalCount> {
  const queryParams = new HttpParams()
    .set('offset', params.offset.toString())
    .set('pageSize', params.pageSize.toString());
  
  const url = this.apiUrls.get('GetAllOrders');
  
  return this.http.get<OrdersWithTotalCount>(url, { params: queryParams });
}
  public async getCheckout(id: number): Promise<any> {
    const url = `${this.apiUrls.get('GetCheckout')}/${id}`;
    return await lastValueFrom(this.http.get<any>(url, this.httpOptions));
  }
  public async updateCheckout(entity: Checkout): Promise<OperationResult> {
    const url = this.apiUrls.get('UpdateCheckout');
    return await lastValueFrom(this.http.put<OperationResult>(url, entity, this.httpOptions));
  }
  public async deleteCheckout(Id: number): Promise<OperationResult> {
    const url = `${this.apiUrls.get('DeleteCheckout')}/${Id}`;
    return await lastValueFrom(this.http.delete<OperationResult>(url, this.httpOptions));
  }
  public async deleteAllCheckouts(): Promise<OperationResult> {
    const url = this.apiUrls.get('DeleteCheckout');
    return await lastValueFrom(this.http.delete<OperationResult>(url, this.httpOptions));
  }

  public async updateOrder(entity: Order): Promise<OperationResult> {
    const url = this.apiUrls.get('UpdateOrder');
    return await lastValueFrom(this.http.put<OperationResult>(url, entity, this.httpOptions));
  }
  public async deleteOrder(Id: number): Promise<OperationResult> {
    const url = `${this.apiUrls.get('DeleteOrder')}/${Id}`;
    return await lastValueFrom(this.http.delete<OperationResult>(url, this.httpOptions));
  }
  public async deleteAllOrders(): Promise<OperationResult> {
    const url = this.apiUrls.get('DeleteAllOrders');
    return await lastValueFrom(this.http.delete<OperationResult>(url, this.httpOptions));
  }
  public async exportAllOrders(): Promise<any> {
    const url = this.apiUrls.get('ExportAllOrders');
    return await lastValueFrom(this.http.get<any>(url, this.httpOptions));
  }

  
  /* Category */ 
  public async createCategory(entity: Category): Promise<OperationResult> {
    const url = this.apiUrls.get('CreateCategory');
    return await lastValueFrom(this.http.post<OperationResult>(url, entity, this.httpOptions));
  }
  public async updateCategory(entity: Category): Promise<OperationResult> {
    const url = this.apiUrls.get('UpdateCategory');
    return await lastValueFrom(this.http.put<OperationResult>(url, entity, this.httpOptions));
  }
  public async deleteCategory(Id: number): Promise<OperationResult> {
    const url = `${this.apiUrls.get('DeleteCategory')}/${Id}`;
    return await lastValueFrom(this.http.delete<OperationResult>(url, this.httpOptions));
  }
  public async deleteAllCategories(): Promise<OperationResult> {
    const url = this.apiUrls.get('DeleteAllCategories');
    return await lastValueFrom(this.http.delete<OperationResult>(url, this.httpOptions));
  }
  public async seedCategories(): Promise<OperationResult> {
    const url = this.apiUrls.get('SeedCategories');
    return await lastValueFrom(this.http.get<OperationResult>(url, this.httpOptions));
  }


  /* Sub Category */ 
  public async createSubCategory(entity: SubCategory): Promise<OperationResult> {
    const url = this.apiUrls.get('CreateSubCategory');
    return await lastValueFrom(this.http.post<OperationResult>(url, entity, this.httpOptions));
  }
  public async updateSubCategory(entity: SubCategory): Promise<OperationResult> {
    const url = this.apiUrls.get('UpdateSubCategory');
    return await lastValueFrom(this.http.put<OperationResult>(url, entity, this.httpOptions));
  }
  public async deleteSubCategory(Id: number): Promise<OperationResult> {
    const url = `${this.apiUrls.get('DeleteSubCategory')}/${Id}`;
    return await lastValueFrom(this.http.delete<OperationResult>(url, this.httpOptions));
  }
  public async deleteAllSubCategories(): Promise<OperationResult> {
    const url = this.apiUrls.get('DeleteAllSubCategories');
    return await lastValueFrom(this.http.delete<OperationResult>(url, this.httpOptions));
  }
  public async seedSubCategories(): Promise<OperationResult> {
    const url = this.apiUrls.get('SeedSubCategories');
    return await lastValueFrom(this.http.get<OperationResult>(url, this.httpOptions));
  }

  /* Brands */
  public async createBrand(entity: Brand): Promise<OperationResult> {
    const url = this.apiUrls.get('CreateBrand');
    return await lastValueFrom(this.http.post<OperationResult>(url, entity, this.httpOptions));
  }
  public async updateBrand(entity: Brand): Promise<OperationResult> {
    const url = this.apiUrls.get('UpdateBrand');
    return await lastValueFrom(this.http.put<OperationResult>(url, entity, this.httpOptions));
  }
  public async deleteBrand(Id: number): Promise<OperationResult> {
    const url = `${this.apiUrls.get('DeleteBrand')}/${Id}`;
    return await lastValueFrom(this.http.delete<OperationResult>(url, this.httpOptions));
  }
  public async deleteAllBrands(): Promise<OperationResult> {
    const url = this.apiUrls.get('DeleteAllBrands');
    return await lastValueFrom(this.http.delete<OperationResult>(url, this.httpOptions));
  }
  public async seedBrands(): Promise<OperationResult> {
    const url = this.apiUrls.get('SeedBrands');
    return await lastValueFrom(this.http.get<OperationResult>(url, this.httpOptions));
  }
  /* Sub Brands */
  public async createSubBrand(entity: SubBrand): Promise<OperationResult> {
    const url = this.apiUrls.get('CreateSubBrand');
    return await lastValueFrom(this.http.post<OperationResult>(url, entity, this.httpOptions));
  }
  public async updateSubBrand(entity: SubBrand): Promise<OperationResult> {
    const url = this.apiUrls.get('UpdateSubBrand');
    return await lastValueFrom(this.http.put<OperationResult>(url, entity, this.httpOptions));
  }
  public async deleteSubBrand(Id: number): Promise<OperationResult> {
    const url = `${this.apiUrls.get('DeleteSubBrand')}/${Id}`;
    return await lastValueFrom(this.http.delete<OperationResult>(url, this.httpOptions));
  }
  public async deleteAllSubBrands(): Promise<OperationResult> {
    const url = this.apiUrls.get('DeleteAllSubBrands');
    return await lastValueFrom(this.http.delete<OperationResult>(url, this.httpOptions));
  }
  public async seedSubBrands(): Promise<OperationResult> {
    const url = this.apiUrls.get('SeedSubBrands');
    return await lastValueFrom(this.http.get<OperationResult>(url, this.httpOptions));
  }
    /* SubBrands */
    public async createSeries(entity: Series): Promise<OperationResult> {
      const url = this.apiUrls.get('CreateSeries');
      return await lastValueFrom(this.http.post<OperationResult>(url, entity, this.httpOptions));
    }
    public async updateSeries(entity: Series): Promise<OperationResult> {
      const url = this.apiUrls.get('UpdateSeries');
      return await lastValueFrom(this.http.put<OperationResult>(url, entity, this.httpOptions));
    }
    public async deleteSeries(Id: number): Promise<OperationResult> {
      const url = `${this.apiUrls.get('DeleteSeries')}/${Id}`;
      return await lastValueFrom(this.http.delete<OperationResult>(url, this.httpOptions));
    }
    public async deleteAllSeries(): Promise<OperationResult> {
      const url = this.apiUrls.get('DeleteAllSeries');
      return await lastValueFrom(this.http.delete<OperationResult>(url, this.httpOptions));
    }
    public async seedSeries(): Promise<OperationResult> {
      const url = this.apiUrls.get('SeedSeries');
      return await lastValueFrom(this.http.get<OperationResult>(url, this.httpOptions));
    }
  /* Occasions */
  public async createOccasion(entity: Occasion): Promise<OperationResult> {
    const url = this.apiUrls.get('CreateOccasion');
    return await lastValueFrom(this.http.post<OperationResult>(url, entity, this.httpOptions));
  }
  public async updateOccasion(entity: Occasion): Promise<OperationResult> {
    const url = this.apiUrls.get('UpdateOccasion');
    return await lastValueFrom(this.http.put<OperationResult>(url, entity, this.httpOptions));
  }
  public async deleteOccasion(Id: number): Promise<OperationResult> {
    const url = `${this.apiUrls.get('DeleteOccasion')}/${Id}`;
    return await lastValueFrom(this.http.delete<OperationResult>(url, this.httpOptions));
  }
  public async deleteAllOccasions(): Promise<OperationResult> {
    const url = this.apiUrls.get('DeleteAllOccasions');
    return await lastValueFrom(this.http.delete<OperationResult>(url, this.httpOptions));
  }
  public async seedOccasions(): Promise<OperationResult> {
    const url = this.apiUrls.get('SeedOccasions');
    return await lastValueFrom(this.http.get<OperationResult>(url, this.httpOptions));
  }

  // Fetch Data With Subscribe 
  public orders$ = this.fetchData(this._ordersData$, "GetAllOrders");
  public occasions$ = this.fetchData(this._occasionsData$, "GetAllOccasions");
  public categories$ = this.fetchData(this._categoriesData$, "GetAllCategories");
  public subCategories$ = this.fetchData(this._subCategoriesData$, "GetAllSubCategories");
  public brands$ = this.fetchData(this._brandsData$, "GetAllBrands");
  public subBrands$ = this.fetchData(this._subBrandsData$, "GetAllSubBrands");
  public series$ = this.fetchData(this._seriesData$, "GetAllSeries");

  private fetchData(subject: BehaviorSubject<void>, urlKey: string) {
    return subject.pipe(
      switchMap(() =>
        this.http.get<any[]>(this.apiUrls.get(urlKey))
      ),
      shareReplay(1)
    );
  }

    // Methods to refresh data
    refreshOrders(): void {
      this._ordersData$.next();
    }
  
    refreshOccasions(): void {
      this._occasionsData$.next();
    }
  
    refreshCategories(): void {
      this._categoriesData$.next();
    }
  
    refreshSubCategories(): void {
      this._subCategoriesData$.next();
    }
  
    refreshBrands(): void {
      this._brandsData$.next();
    }
    refreshSubBrands(): void {
      this._subBrandsData$.next();
    }
    refreshSeries(): void {
      this._seriesData$.next();
    }

    private handleHttpError(error: any, context: string): void {
  console.error(`❌ Error while ${context}:`, error);

  let message = 'An unexpected error occurred.';

  if (typeof error?.error === 'string') {
    message = error.error;
  } else if (error?.error?.failureMessage) {
    message = error.error.failureMessage;
  } else if (error?.message) {
    message = error.message;
  }

  alert(`❌ Error while ${context}:\n${message}`);
}

}
