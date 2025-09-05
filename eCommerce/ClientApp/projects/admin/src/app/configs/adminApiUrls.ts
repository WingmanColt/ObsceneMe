import { Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";

@Injectable({
  providedIn: 'root' // Ensure that the service is provided at the root level
})
export class adminApiUrls {
  private readonly _config: { [key: string]: string };

  constructor() {
    this._config = {
      AddProductMock: `${environment.baseApiUrl}Product/createMockProducts`,
      CreateProduct: `${environment.baseApiUrl}Product/create`,
      GetProductById: `${environment.baseApiUrl}Product/GetProductById`,
      DeleteProduct: `${environment.baseApiUrl}Product/delete`,
      UpdateProduct: `${environment.baseApiUrl}Product/update`,
      UpdateProductMainImage: `${environment.baseApiUrl}Product/updateMainImage`,
      UpdateProductStatus: `${environment.baseApiUrl}Product/updateStatus`,
      DeleteAllProducts: `${environment.baseApiUrl}Product/deleteAll`,

      GetAllOrders: `${environment.baseApiUrl}order/get-orders`,
      UpdateOrder: `${environment.baseApiUrl}order/update`,
      DeleteOrder: `${environment.baseApiUrl}order/delete`,
      DeleteAllOrders: `${environment.baseApiUrl}order/delete-all`,
      ExportAllOrders: `${environment.baseApiUrl}order/export-all-orders-csv`,

      GetCheckout: `${environment.baseApiUrl}checkout/get-checkout`,
      UpdateCheckout: `${environment.baseApiUrl}checkout/update`,
      DeleteCheckout: `${environment.baseApiUrl}checkout/delete`,
      DeleteAllCheckout: `${environment.baseApiUrl}checkout/delete-all`,

      GetAllCategories: `${environment.baseApiUrl}categories/get-categories`,
      CreateCategory: `${environment.baseApiUrl}categories/create-category`,
      UpdateCategory: `${environment.baseApiUrl}categories/update-category`,
      DeleteCategory: `${environment.baseApiUrl}categories/delete-category`,
      DeleteAllCategories: `${environment.baseApiUrl}categories/deleteAllCategories`,
      SeedCategories: `${environment.baseApiUrl}categories/seedCategories`,

      GetAllSubCategories: `${environment.baseApiUrl}categories/get-subcategories`,
      GetSubCategoriesByCategory: `${environment.baseApiUrl}categories/get-subcategory`,
      CreateSubCategory: `${environment.baseApiUrl}categories/create-subCategory`,
      UpdateSubCategory: `${environment.baseApiUrl}categories/update-subCategory`,
      DeleteSubCategory: `${environment.baseApiUrl}categories/delete-subCategory`,
      DeleteAllSubCategories: `${environment.baseApiUrl}categories/deleteAllSubCategories`,
      SeedSubCategories: `${environment.baseApiUrl}categories/seedSubCategories`,

      GetAllOccasions: `${environment.baseApiUrl}occasion/get`,
      CreateOccasion: `${environment.baseApiUrl}occasion/create`,
      UpdateOccasion: `${environment.baseApiUrl}occasion/update`,
      DeleteOccasion: `${environment.baseApiUrl}occasion/delete`,
      DeleteAllOccasions: `${environment.baseApiUrl}occasion/deleteAll`,
      SeedOccasions: `${environment.baseApiUrl}occasion/seed`,
      
      GetAllBrands: `${environment.baseApiUrl}brands/get-brands`,
      CreateBrand: `${environment.baseApiUrl}brands/create`,
      UpdateBrand: `${environment.baseApiUrl}brands/update`,
      DeleteBrand: `${environment.baseApiUrl}brands/delete`,
      DeleteAllBrands: `${environment.baseApiUrl}brands/deleteAll`,
      SeedBrands: `${environment.baseApiUrl}brands/seed`,

      GetAllSubBrands: `${environment.baseApiUrl}subBrands/get-subBrands`,
      CreateSubBrand: `${environment.baseApiUrl}subbrands/create`,
      UpdateSubBrand: `${environment.baseApiUrl}subBrands/update`,
      DeleteSubBrand: `${environment.baseApiUrl}subBrands/delete`,
      DeleteAllSubBrands: `${environment.baseApiUrl}subBrands/deleteAll`,
      SeedSubBrands: `${environment.baseApiUrl}subBrands/seed`,

      GetAllSeries: `${environment.baseApiUrl}Series/get-series`,
      CreateSeries: `${environment.baseApiUrl}Series/create`,
      UpdateSeries: `${environment.baseApiUrl}Series/update`,
      DeleteSeries: `${environment.baseApiUrl}Series/delete`,
      DeleteAllSeries: `${environment.baseApiUrl}Series/deleteAll`,
      SeedSeries: `${environment.baseApiUrl}Series/seed`,

      GetAllAffiliateUsers: `${environment.baseApiUrl}Affiliate/GetAffiliateUsers`,

      GetStoryPage: `${environment.baseApiUrl}StoryPage/get-story-page`,
      SaveStoryPage: `${environment.baseApiUrl}StoryPage/save-story-page`,
      GetStoryBlock: `${environment.baseApiUrl}StoryPage/get-story-block`,
      SaveStoryBlock: `${environment.baseApiUrl}StoryPage/save-story-block`,

      GetAllVariants: `${environment.baseApiUrl}variants/get-all-variants`,
      GetVariantItems: `${environment.baseApiUrl}variants/get-variant-items`,
      GetAllBundles: `${environment.baseApiUrl}bundle/get-bundles`,
      RegisterUser: `${environment.baseApiUrl}Account/register`,
      LoginUser: `${environment.baseApiUrl}Account/login`,
    };
  }

  get setting(): { [key: string]: string } {
    return this._config;
  }

  get(key: string): string | undefined {
    return this._config[key];
  }
}
