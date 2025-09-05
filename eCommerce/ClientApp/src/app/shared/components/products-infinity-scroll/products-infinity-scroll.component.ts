import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'environments/environment';
import { Subject, takeUntil } from 'rxjs';
import { BreakpointDetectorService } from 'src/app/Services/Devices/breakpoint-detector.service';
import { ProductsService } from 'src/app/Services/Product/products.service';
import { ProductListing } from '../../classes/productListing';
import { ProductSearch } from '../../classes/productSearch';
import { Products } from 'projects/admin/src/app/classes/product';

enum LoaderState {
  None = 0,
  FetchingFromServer = 1,
  OnScroll = 2,
  Empty = 3
}
const LAYOUTS = {
  "grid-view": "col-xxl-3 col-xl-3 col-lg-2 col-md-4 col-sm-4 col-xs-2 col-6",
  "list-view": "col-md-11",
};

@Component({
  selector: 'app-products-infinity-scroll',
  templateUrl: './products-infinity-scroll.component.html',
  styleUrls: ['./products-infinity-scroll.component.scss']
})
export class ProductsInfinityScrollComponent implements OnInit, OnDestroy {

   grid: string = LAYOUTS["grid-view"];
   layoutView: string;
   
   LoaderState = LoaderState;
   loaderState: LoaderState = LoaderState.None;

   collectionSettings = environment.homeSettings;
   fetchedProducts: any[] = [];
   clientProducts: any[] = [];
   totalItems: number = 0;

    // Infinity scroll
    fetchCount: number = this.collectionSettings.topProductsCount;
    addItemCount: number = 0;

    isMobile: boolean = false;
    private productCache: Map<number, any[]> = new Map();

    // pageSize initial count of products to show
    private searchParams: ProductSearch = { pageNumber: 1, pageSize: 10, minPrice: 0, maxPrice: 99999 };
    private destroy$ = new Subject<void>(); // Subject for managing component destruction
     
    constructor(private productService: ProductsService, public device: BreakpointDetectorService) {}

    ngOnInit() {
      this.isMobile = !this.device.isDevice('Desktop');
      this.loaderState = LoaderState.FetchingFromServer;
      this.initProductFetching();
    }

    initProductFetching(): void {
      // If the data is already cached for the current page, use it
      if (this.productCache.has(this.searchParams.pageNumber)) {
        this.clientProducts = this.productCache.get(this.searchParams.pageNumber);
        this.loaderState = LoaderState.None;
        return;
      }
      
      // Make the API call to fetch products if they are not cached
      this.productService.updateProductSearch(this.searchParams, false);
      this.productService.getProductListing()
        .pipe(takeUntil(this.destroy$))
        .subscribe((response: ProductListing) => {
          this.loaderState = LoaderState.FetchingFromServer;
          this.processProductResponse(response);
        });
    }

    processProductResponse(response: ProductListing): void {
      this.fetchedProducts = response.product;
      this.totalItems = response.totalItems;

      if (response.product.length > 0) {
        // Cache the fetched products for the current page
        this.productCache.set(this.searchParams.pageNumber, response.product);
        this.loaderState = LoaderState.None;
  
        if (this.totalItems < this.searchParams.pageSize) {
          this.clientProducts = this.fetchedProducts;
        } else {
          this.fulfillClientProducts(this.fetchCount);
        }
      } else {
        this.clientProducts = [];
        this.loaderState = LoaderState.Empty;
      }

      // Fulfill client products to display
    //  this.fulfillClientProducts(this.fetchCount);
     // this.loaderState = LoaderState.None;
    }

    onScroll() {
      // If we've reached the total items, stop fetching
      if (this.clientProducts.length >= this.totalItems) {
        this.loaderState = LoaderState.Empty;
        return;
      }
      
      // If there are still items left, trigger scroll fetch
      if (this.clientProducts.length < this.totalItems) {
        this.loaderState = LoaderState.OnScroll;
        this.fulfillClientProducts(this.fetchCount);
      }
    }

    fulfillClientProducts(countToFulfil: number): void {
      const maxPages = Math.ceil(this.totalItems / this.searchParams.pageSize);

      // Stop further execution if clientProducts length has reached totalItems
      if (this.clientProducts.length >= this.totalItems) 
        return;
      
      if (this.searchParams.pageNumber == maxPages) 
        this.loaderState = LoaderState.Empty;
      

      if (this.fetchedProducts.length === 0) {
       
          // Fetch new data if no fetched products remain
          if (this.searchParams.pageNumber < maxPages) {
            this.searchParams = { 
              ...this.searchParams, 
              pageNumber: this.searchParams.pageNumber + 1
            };

            this.updateProductListing(this.searchParams);
          } 
          return;
      }
  
      const itemsToAdd = this.fetchedProducts.splice(0, countToFulfil);
  
      if (itemsToAdd.length > 0) {
          this.clientProducts.push(...itemsToAdd);
      }
    }

    updateProductListing(entity: ProductSearch) {
      this.productService.updateProductSearch(entity, false);
    }

    clearArrays(): void {
      this.loaderState = LoaderState.Empty;
      this.fetchedProducts = [];
      this.clientProducts = [];
    }

    ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
    }

    trackByProductId(index: number, product: Products): number {
      return product.id;
    }
}
