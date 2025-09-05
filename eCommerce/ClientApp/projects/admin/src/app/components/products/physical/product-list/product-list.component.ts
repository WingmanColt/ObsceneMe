import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ProductsService } from 'src/app/Services/Product/products.service';
import { ProductSearch } from 'src/app/shared/classes/productSearch';
import { ProductListing } from 'src/app/shared/classes/productListing';
import { ActionsService } from 'src/app/Services/Product/actions.service';
import { environment } from 'environments/environment';
import { Status } from 'projects/admin/src/app/classes/product';
import { ImageUploadService } from 'projects/admin/src/app/services/image-upload.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {

  env = environment;
  fetchedProducts: any[] = [];
  totalItems: number = 0;
  totalPages: number = 0;
  pageLastProductIds: Map<number, number> = new Map(); // Track last product ID for each page

  searchParams: ProductSearch = { 
    pageNumber: 1, 
    pageSize: 25, 
    minPrice: 0, 
    maxPrice: 99999 
  }; // Initial fetch size: 25

  dropdownActions = [
    { id: 1, title: 'Available' },
    { id: 2, title: 'Sold' },
    { id: 3, title: 'Unavailable' },
    { id: 4, title: 'Archived' }
  ];  
  

  private destroy$ = new Subject<void>(); // Subject for managing component destruction

  constructor(
    public imageUploadService: ImageUploadService,
    private productsService: ProductsService, 
    private actionsService: ActionsService) {}

  ngOnInit() { 
    this.initProductFetching();
  }

  initProductFetching(): void {
    this.productsService.updateProductSearch(this.searchParams, false);
    this.productsService.getProductListing().pipe( 
      takeUntil(this.destroy$)
    ).subscribe((response: ProductListing) => {
      if(response.product?.length) {
        this.fetchedProducts = response.product;
        this.totalItems = response.totalItems;
        this.totalPages = Math.ceil(this.totalItems / this.searchParams.pageSize);

        // Store the lastProductId for the current page
        const lastFetchedProductId = this.fetchedProducts[this.fetchedProducts.length - 1].id;
        this.pageLastProductIds.set(this.searchParams.pageNumber, lastFetchedProductId);


      } 
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.searchParams.pageNumber = page;



      this.initProductFetching();
    }
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  async deleteProduct(productId: number): Promise<void> {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        var res = await this.actionsService.deleteProduct(productId);
        if(!res.success)
          alert(res.failureMessage)

        this.initProductFetching();
      } catch (error) {
        console.error('Error deleting product', error);
      }
    }
  }
  
      // Handle dropdown action selection
      onActionSelected(selectedAction: any, productId: number) {
        if (selectedAction && selectedAction.length > 0) {
          const action = selectedAction[0];  // Single select, so grab the first element
    
          switch (action.title) {
            case 'Available':
              this.updateStatus(productId, Status.Available);
              break;
            
            case 'Sold':
              this.updateStatus(productId, Status.Sold);
              break;
            
            case 'Unavailable':
              this.updateStatus(productId, Status.Unavailable);
              break;
          
            case 'Archived':
              this.updateStatus(productId, Status.Archived);
              break;
          }
        }
      }
      getStatusText(status: number): string {
        return Status[status]; // Converts the status int to enum key
      }
      
      async updateStatus(id: number, status: Status): Promise<void> {
          try {
            var res = await this.actionsService.updateProductStatus(id, status);
            
            if(!res.success)
              alert(res.failureMessage)

            this.actionsService.refreshOrders();
          } catch (error) {
            console.error('Error updating product status', error);
          }
        
      }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
function sanitizeTitle(title: string): string {
  // Replace invalid file system characters with an underscore
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g; // Regex for invalid file/folder characters
  const sanitizedTitle = title.replace(invalidChars, '_');

  // Trim spaces and normalize the title
  return sanitizedTitle.trim();
}
