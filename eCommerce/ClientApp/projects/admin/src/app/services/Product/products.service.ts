import { Injectable } from "@angular/core";
import { catchError, firstValueFrom, Observable, throwError } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { adminApiUrls } from "../../configs/adminApiUrls";
import { Category } from "./classes/Categories";
import { VariantItem } from "src/app/shared/classes/product";
import { Brand, Series, SubBrand } from "src/app/shared/classes/brands";
import { Occasion, SubCategory } from "src/app/shared/classes/categories";
import { VariantSqlOutput } from "../../classes/product";
import { OperationResult } from "../../Interfaces/operationResult";

@Injectable({
    providedIn: "root",
})
export class AdminProductsService {
  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
      //"accessToken": '"' + this.core.getAccessToken() + '"',
    }),
  };
    constructor(private http: HttpClient, private config: adminApiUrls) { }


    public GetAllCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(this.config.setting["GetAllCategories"]).pipe(catchError(this.errorHandler));
    }
    public GetAllSubCategories(): Observable<SubCategory[]> {
        return this.http.get<SubCategory[]>(this.config.setting["GetAllSubCategories"]).pipe(catchError(this.errorHandler));
    }
    public GetSubCategoriesByCategory(): Observable<SubCategory[]> {
        return this.http.get<SubCategory[]>(this.config.setting["GetSubCategoriesByCategory"]).pipe(catchError(this.errorHandler));
    }
    public GetAllOccasions(): Observable<Occasion[]> {
        return this.http.get<Occasion[]>(this.config.setting["GetAllOccasions"]).pipe(catchError(this.errorHandler));
    }

    public GetAllBrands(): Observable<Brand[]> {
        return this.http.get<Brand[]>(this.config.setting["GetAllBrands"]).pipe(catchError(this.errorHandler));
    }
    public GetAllBrandSeries(): Observable<Series[]> {
        return this.http.get<Series[]>(this.config.setting["GetAllSeries"]).pipe(catchError(this.errorHandler));
    }
    public GetAllSubBrands(): Observable<SubBrand[]> {
        return this.http.get<SubBrand[]>(this.config.setting["GetAllSubBrands"]).pipe(catchError(this.errorHandler));
    }
    public GetAllVariants(): Observable<VariantSqlOutput[]> {
        return this.http.get<VariantSqlOutput[]>(this.config.setting["GetAllVariants"]).pipe(catchError(this.errorHandler));
    }
    public GetVariantItems(): Observable<VariantItem[]> {
        return this.http.get<VariantItem[]>(this.config.setting["GetVariantItems"]).pipe(catchError(this.errorHandler));
    }

  async saveStoryPage(productId: number, body: any): Promise<OperationResult> {
    const url = `${this.config.setting['SaveStoryPage']}/${productId}`;
    return await firstValueFrom(this.http.put<OperationResult>(url, body, this.httpOptions));
  }
  
  async saveStoryBlock(productId: number, body: any): Promise<OperationResult> {
    const url = `${this.config.setting['SaveStoryBlock']}/${productId}`;
    return await firstValueFrom(this.http.put<OperationResult>(url, body, this.httpOptions));
  }
    errorHandler(error) {
        let errorMessage = "";
        if (error.error instanceof ErrorEvent) {
            // Get client-side error
            errorMessage = error.error.message;
        } else {
            // Get server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        console.log(errorMessage);
        return throwError(errorMessage);
    }
}
