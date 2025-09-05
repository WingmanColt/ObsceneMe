import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'environments/environment';
import { ProductsService } from 'src/app/Services/Product/products.service';
import { ProductListing } from 'src/app/shared/classes/productListing';
import { ProductSearch } from 'src/app/shared/classes/productSearch';
import { BreadcrumbObject } from 'src/app/shared/components/breadcrumb/breadcrumb.component';
import { Subject } from 'rxjs';
import { filter, take, takeUntil, tap } from 'rxjs/operators';
import { BreakpointDetectorService } from 'src/app/Services/Devices/breakpoint-detector.service';
import { ProductFilterService } from 'src/app/Services/Product/filters.service';
import { ActivatedRoute } from '@angular/router';
import { Category, Occasion, SubCategory } from 'src/app/shared/classes/categories';
import { Filters } from 'src/app/shared/classes/filters';
import { Brand } from 'src/app/shared/classes/brands';
import { BrandsService } from 'src/app/Services/Brands/brands.service';
import { TrademarkArray } from 'src/app/shared/classes/enums/trademarks';
import { ConfigService } from 'src/app/Services/config.service';

 enum LoaderState {
  None = 0,
  Fetching = 1,
  OnScroll = 2,
  Filtering = 3,
  Empty = 4,
  EmptyFiltered = 5
}

const LAYOUTS = {
  "grid-view": "col-xxl-4 col-xl-4 col-lg-3 col-md-3 col-sm-4 col-xs-2 col-6",
  "list-view": "col-md-11",
};

@Component({
  selector: 'app-collection-pagination',
  templateUrl: './collection-pagination.component.html',
  styleUrls: ['./collection-pagination.component.scss']
})
export class CollectionPaginationComponent implements OnInit, OnDestroy {
  componentName: string = "CollectionPaginationComponent";
  
  currBreadCrumb: BreadcrumbObject[] = [];
  selectedCategory: Category | undefined;
  selectedSubCategory: SubCategory | undefined;

  collectionSettings = environment.pagesSettings.CollectionSettings;
  grid: string = LAYOUTS["grid-view"];
  layoutView: string;

  fetchedProducts: any[] = [];
  clientProducts: any[] = [];

  isFiltering: boolean = false;
  selectedFilters: Array<string> = []; // Initialize as an empty array 

  searchParams: ProductSearch = {
    pageNumber: 1,
    pageSize: 25,
    occasions: [],
    brands: [],
    brandSeries: [],
    subBrands: [],
    trademarks: []
  }; 

  totalItems: number = 0;

  // Infinity scroll
  fetchCount: number = this.collectionSettings.infinityScrollAddCount;

  LoaderState = LoaderState;
  loaderState: LoaderState = LoaderState.None;

  isMobile: boolean = false;
  mobileSidebar: boolean = false;
  mobileSortBy: boolean = false;

  private destroy$ = new Subject<void>(); 

  categoriesActive: boolean;
  occasionActive: boolean;
  brandActive: boolean;
  trademarkActive: boolean;
  variantActive: boolean;
  

  constructor(
    private configService: ConfigService,
    private route: ActivatedRoute,
    private productService: ProductsService,
    private brandService: BrandsService,
    private filterService: ProductFilterService,
    public device: BreakpointDetectorService) { 

      this.categoriesActive = this.configService.getSetting('CategoriesActive');
      this.occasionActive = this.configService.getSetting('OccasionActive');
      this.brandActive = this.configService.getSetting('BrandActive');
      this.trademarkActive = this.configService.getSetting('TrademarkActive');
      this.variantActive = this.configService.getSetting('VariantActive');
    }

  async ngOnInit() {
    this.isMobile = !this.device.isDevice('Desktop');

    this.clearQueryParams();
    
    this.initProductFetching();

    await this.initActivatedRoute();
    await this.initOnFilterUpdate();
    this.updateBreadcrumbs();
}


// add cache
public async getLoadedOccasions(): Promise<Occasion[]> {
  return new Promise((resolve) => {
      this.productService.occasions$
      .pipe(take(1), takeUntil(this.destroy$))
          .subscribe(occasions => {
              resolve(occasions);
          });
  });
}

public async getLoadedBrands(): Promise<Brand[]> {
  return new Promise((resolve) => {
      this.brandService.brands$
          .pipe(take(1), takeUntil(this.destroy$))
          .subscribe(brands => {
              resolve(brands);
          });
  });
}




private initProductFetching(): void {
  // First Fetch
  this.isFiltering = false;
  this.loaderState = LoaderState.Fetching;
  this.updateProductsFetching(this.searchParams, false);

  this.productService.getProductListing().pipe(
    tap(() => {
      if(this.loaderState !== LoaderState.OnScroll)
      this.loaderState = LoaderState.Fetching;
    }),
    takeUntil(this.destroy$)
  ).subscribe((response: ProductListing) => {
    this.fetchedProducts = response.product; 
    this.totalItems = response.totalItems;

    if (response.product.length > 0) {
      this.loaderState = LoaderState.None;

      if (this.totalItems < this.searchParams.pageSize) {
        this.clientProducts = this.fetchedProducts;
      } else {
        this.isFiltering ? this.fulfillClientProductsFiltering(this.fetchCount) : this.fulfillClientProductsDefault(this.fetchCount);
      }
    } else {
      this.clientProducts = [];
    
      this.loaderState =  this.isFiltering ? LoaderState.EmptyFiltered : LoaderState.Empty;
    }
  });
}

private async initOnFilterUpdate(): Promise<void> {
  let isFiltersApplied = false; // Track whether filters are applied

  this.filterService.filters$
    .pipe(
      takeUntil(this.destroy$),
      filter((queryParameters) => {
        // Check if all filters are empty
        const allParamsEmpty = Object.keys(queryParameters).every((key) => {
          const value = queryParameters[key];
          return (
            value === null ||
            value === undefined ||
            (Array.isArray(value) && value.length === 0)
          );
        });

        if (allParamsEmpty) {
          // Only execute if filters were previously applied
          if (isFiltersApplied) {
            isFiltersApplied = false; // Reset the flag
            this.removeAllFilters();

            this.loaderState = LoaderState.Fetching;
            this.updateProductsFetching(this.searchParams, false);         
          }
          return false; // Stop further execution
        } else {
          this.isFiltering = true;
          isFiltersApplied = true; // Filters are applied
          return true; // Proceed with non-empty filters
        }
      })
    )
    .subscribe(async (queryParameters: Filters) => {
      // Clear everything before add new products
      this.resetSearchParams();

      // dont remove at all costs, breaks sorting, and pagination on filtering
      this.clientProducts = [];

      // Ensure properties are null
      this.ensurePropertiesAreNull(queryParameters, [
        'searchString',
        'categoryId',
        'subCategoryId',
        'brands',
        'brandSeries',
        'subBrands',
        'occasions',
        'trademarks',
        'genderId',
        'statusId',
        'ratingId',
        'minPrice',
        'maxPrice',
        'sortBy',
        'sortDirection',
      ]);

      // Assign properties based on params
      this.searchParams.searchString = queryParameters.searchString ?? undefined;
      this.searchParams.categoryId = queryParameters.categoryId ?? undefined;
      this.searchParams.subCategoryId = queryParameters.subCategoryId ?? undefined;

      this.searchParams.genderId = queryParameters.genderId ?? undefined;
      this.searchParams.statusId = queryParameters.statusId ?? undefined;
      this.searchParams.ratingId = queryParameters.ratingId ?? undefined;
      this.searchParams.sortBy = queryParameters.sortBy ?? undefined;
      this.searchParams.sortDirection = queryParameters.sortDirection ?? undefined;
      this.searchParams.minPrice = queryParameters.minPrice ?? undefined;
      this.searchParams.maxPrice = queryParameters.maxPrice ?? undefined;

      this.searchParams.brands = queryParameters.brands ?? [];
      this.searchParams.brandSeries = queryParameters.brandSeries ?? [];
      this.searchParams.subBrands = queryParameters.subBrands ?? [];
      this.searchParams.occasions = queryParameters.occasions ?? [];
      this.searchParams.trademarks = queryParameters.trademarks ?? [];

      //this.clientProducts = [...this.clientProducts];
      
      // Update selected filters
      await this.updateSelectedFilterBadges(this.searchParams, queryParameters);

      this.loaderState = LoaderState.Filtering;
      this.isFiltering = true;
      this.updateProductsFetching(this.searchParams, true);
    });
}

 public onScroll() {
  if (this.clientProducts.length >= this.totalItems) {
    this.loaderState = LoaderState.None; 
    return;
 }

  if (this.clientProducts?.length < this.totalItems) {
   this.loaderState = LoaderState.OnScroll;
   this.isFiltering ? this.fulfillClientProductsFiltering(this.fetchCount) : this.fulfillClientProductsDefault(this.fetchCount); 
  } 
}

// On Default Get
private fulfillClientProductsDefault(countToFulfil: number): void {
  const maxPages = Math.ceil(this.totalItems / this.searchParams.pageSize);

    // Stop further execution if clientProducts length has reached totalItems
    if (this.clientProducts.length >= this.totalItems) 
      return;
    
    
    if (this.fetchedProducts.length === 0) {
     
        // Fetch new data if no fetched products remain
        if (this.searchParams.pageNumber < maxPages) {
          this.searchParams = { 
            ...this.searchParams, 
            pageNumber: this.searchParams.pageNumber + 1
          };
          this.updateProductsFetching(this.searchParams, false);
        }
        return;
    }

    const itemsToAdd = this.fetchedProducts.splice(0, countToFulfil);

    if (itemsToAdd.length > 0) {
        this.clientProducts.push(...itemsToAdd);
    }
}

// On Filtering
private fulfillClientProductsFiltering(countToFulfil: number): void {
  const maxPages = Math.ceil(this.totalItems / this.searchParams.pageSize);

 // Stop further execution if clientProducts length has reached totalItems
    if (this.clientProducts.length >= this.totalItems) 
      return;

    if (this.fetchedProducts.length === 0) {
        // Fetch new data if no fetched products remain
        if (this.searchParams.pageNumber < maxPages) {
          this.searchParams = { 
            ...this.searchParams, 
            pageNumber: this.searchParams.pageNumber + 1
          };

          this.updateProductsFetching(this.searchParams, true);
        }
        return;
    }


    const itemsToAdd = this.fetchedProducts.splice(0, countToFulfil);

    if (itemsToAdd.length > 0) {
        this.clientProducts.push(...itemsToAdd);
    }
 }

  toggleFilters() {
    this.mobileSidebar = !this.mobileSidebar;
  }

  toggleSortBy() {
    this.mobileSortBy = !this.mobileSortBy;
  }

  private clearArrays(): void {
    this.fetchedProducts = [];
    this.clientProducts = [];

    this.loaderState = LoaderState.None;
  }

  clearQueryParams(): void {
    this.filterService.clearAllFilters();
  }

  ngOnDestroy() {
    this.clearQueryParams();

    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateProductsFetching(req: ProductSearch, isFiltering: boolean) {
    this.productService.updateProductSearch(req, isFiltering);
   }
 
  setSelectedCategories($event) {
    this.selectedCategory = $event.category ? $event.category : undefined;
    this.selectedSubCategory = $event.subCategory ? $event.subCategory : undefined;

    this.updateBreadcrumbs();
  }


   private updateBreadcrumbs(): void {
    this.currBreadCrumb = []; // Reset the breadcrumb array
  
    // Always include the Home link
    this.currBreadCrumb.push({ title: "Home", url: "/", params: {} });
  
    // Add the Shop link
    this.currBreadCrumb.push({ title: "Shop", url: "/shop", params: {} });
  
    // Add selected category if it exists
    if (this.selectedCategory) {
      this.currBreadCrumb.push({ 
        title: this.selectedCategory.title, 
        url: "/shop", 
        params: { categoryId: this.selectedCategory.id } // Example param
      });
    }
  
    // Add selected subcategory if it exists and if category is also present
    if (this.selectedSubCategory && this.selectedCategory) {
      this.currBreadCrumb.push({ 
        title: this.selectedSubCategory.title, 
        url: "/shop", 
        params: { categoryId: this.selectedCategory.id, subCategoryId: this.selectedSubCategory.id } // Example param
      });
    }
  }

  goBack(): void {
    window.history.back();
   }
  

  private resetSearchParams(): void {
    this.searchParams = {
      pageNumber: 1,
      pageSize: 25,

      genderId: undefined,
      statusId: undefined,
      ratingId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: undefined,
      sortDirection: undefined,

      searchString: undefined,
      categoryId: undefined,
      subCategoryId: undefined,

      brands: [],
      brandSeries: [],
      subBrands: [],
      occasions: [],
      trademarks: []
    };

  }


  removeAllFilters(): void {
    this.selectedFilters = []; 
    this.isFiltering = false;

    this.clearArrays();
    this.resetSearchParams();
    this.clearQueryParams();
  }

  removeFilter(label: string): void {
    // Check if the label exists in the selectedFilters array
    const index = this.selectedFilters.indexOf(label);
    
    // If the label exists, remove it
    if (index > -1) {
      // Remove the label from selectedFilters
      this.selectedFilters.splice(index, 1);
      
    // Remove the selected occasion by label
      const occasionIndex = this.searchParams.occasions.findIndex(ent => ent.title === label);
      if (occasionIndex > -1) {
        this.filterService.removeFilter('occasions', label);
      }

      const brandIndex = this.searchParams.brands.findIndex(ent => ent.title === label);
      if (brandIndex > -1) {
        this.filterService.removeFilter('brands', label);
      }

      const brandSeriesIndex = this.searchParams.brandSeries.findIndex(ent => ent.title === label);
      if (brandSeriesIndex > -1) {
        this.filterService.removeFilter('brandSeries', label);
      }

      const subBrandIndex = this.searchParams.subBrands.findIndex(ent => ent.title === label);
      if (subBrandIndex > -1) {
        this.filterService.removeFilter('subBrands', label);
      }

      const trademarkIndex = TrademarkArray.findIndex(ent => String(ent.label) === String(label));
      if (trademarkIndex > -1) {
        this.filterService.removeFilter('trademarks', label);
      }

/*
      // Remove selected sort option if applicable
      const selectedSortOption = this.collectionSettings.sortOptions.find(option => option.label === label);
      if (selectedSortOption) {
        this.filterService.updateFilter('sortBy', undefined); // Set to undefined or default value
        return;
      }
  
      // Remove selected sort direction if applicable
      const selectedSortDirection = this.collectionSettings.sortOptions.find(option => option.label === label);
      if (selectedSortDirection) {
        this.filterService.updateFilter('sortDirection', undefined); // Set to undefined or default value
        return;
      }
  */
      // Remove selected gender if applicable
      const selectedGender = this.collectionSettings.genderOptions.find(option => option.label === label);
      if (selectedGender) {
        this.filterService.updateFilter('genderId', undefined); // Set to undefined
        return;
      }
  
      // Remove selected status if applicable
      const selectedStatus = this.collectionSettings.statusOptions.find(option => option.label === label);
      if (selectedStatus) {
        this.filterService.updateFilter('statusId', undefined); // Set to undefined
        return;
      }
  
      // Remove selected star rating if applicable
      const selectedRating = this.collectionSettings.starOptions.find(option => option.label === label);
      if (selectedRating) {
        this.filterService.updateFilter('ratingId', undefined); // Set to undefined
        return;
      }

      // Remove selected star rating if applicable
      const selectedPrice = this.collectionSettings.priceOptions.find(option => option.label === label);
      if (selectedPrice) {
        this.filterService.updateFilter('minPrice', undefined);
        this.filterService.updateFilter('maxPrice', undefined);
        return;
      }
    }
  }

  private updateSelectedFilterBadges(selectedFilter: Filters, queryParameters?): Promise<void> {
    return new Promise((resolve) => {
      // Clear selected filters first
      this.selectedFilters = [];

      // Helper function to add unique filters
      const addDistinctFilter = (filter: string) => {
        if (filter && !this.selectedFilters.includes(filter)) {
          this.selectedFilters.push(filter);
        }
      };
  
      // Add selected occasion titles
      selectedFilter.occasions?.forEach(ent => {
        addDistinctFilter(ent?.title);
      });

      selectedFilter.brands?.forEach(ent => {
        addDistinctFilter(ent?.title);
      });

      selectedFilter.brandSeries?.forEach(ent => {
        addDistinctFilter(ent?.title);
      });

      selectedFilter.subBrands?.forEach(ent => {
        addDistinctFilter(ent?.title);
      });

      selectedFilter.trademarks?.forEach(ent => {
        addDistinctFilter(ent?.label);
      });
  /*
      // Add selected sort option label
      const selectedSortOption = this.collectionSettings.sortOptions.find(option => option.id === selectedFilter.sortBy);
      addDistinctFilter(selectedSortOption?.label);
  
      // Add selected sort direction label
      const selectedSortDirection = this.collectionSettings.sortOptions.find(option => option.id === selectedFilter.sortDirection);
      addDistinctFilter(selectedSortDirection?.label);
  */
      // Add selected gender label
      const selectedGender = this.collectionSettings.genderOptions.find(option => option.id === selectedFilter.genderId);
      addDistinctFilter(selectedGender?.label);
  
      // Add selected status label
      const selectedStatus = this.collectionSettings.statusOptions.find(option => option.id === selectedFilter.statusId);
      addDistinctFilter(selectedStatus?.label);
  
      // Add selected star rating label
      const selectedRating = this.collectionSettings.starOptions.find(option => option.id === selectedFilter.ratingId);
      addDistinctFilter(selectedRating?.label);
  
      // Add selected price range (replace starOptions if price options are elsewhere)
      const selectedPrice = this.collectionSettings.priceOptions.find(option => option.from === selectedFilter.minPrice);
      addDistinctFilter(selectedPrice?.label);
  
      // Resolve the Promise once filters have been updated
      resolve();
    });
  }
  

  private async initActivatedRoute(): Promise<void> {
    this.route.queryParams
      .pipe(
        takeUntil(this.destroy$),
        filter(params => Object.keys(params).length > 0) // Execute only if there are query params
      )
      .subscribe(async (params) => {
        // Extracting parameters
        const categoryId = params['categoryId'] ? +params['categoryId'] : undefined;
        const subCategoryId = params['subCategoryId'] ? +params['subCategoryId'] : undefined;
        const searchString = params['searchString'] ? params['searchString'] : undefined;

        const brandId = params['brandId'] ? +params['brandId'] : undefined;
        const subBrandId = params['subBrandId'] ? +params['subBrandId'] : undefined;
        const brandSeriesId = params['brandSeriesId'] ? params['brandSeriesId'] : undefined;

        const genderId = params['genderId'] ? +params['genderId'] : undefined;
        const ratingId = params['ratingId'] ? +params['ratingId'] : undefined;
        const statusId = params['statusId'] ? +params['statusId'] : undefined;
        const sortBy = params['sort'] ? params['sort'] : undefined;
        const sortDirection = params['direction'] ? params['direction'] : undefined;
        const minPrice = params['minPrice'] ? +params['minPrice'] : undefined;
        const maxPrice = params['maxPrice'] ? +params['maxPrice'] : undefined;


  
        // Parsing brands and occasions with IDs
        if ('brands' in params && this.collectionSettings.brandsOnFilters && this.brandActive) {
          // Wait for loaded brands
          const loadedBrands = await this.getLoadedBrands();
        
          // Parse brand IDs from params
          const parsedBrandIds = this.parseIds(params['brands'], '|');
          
          // Filter and map brands, series, and subBrands separately
          const selectedBrands = [];
          const selectedSeries = [];
          const selectedSubBrands = [];
        
          parsedBrandIds.forEach((id) => {
            const brand = loadedBrands.find((b) => b.id === id);
            if (brand) {
              selectedBrands.push(brand);
        
              // Extract related series
              brand.series.forEach((series) => {
                if (!selectedSeries.some((s) => s.id === series.id)) {
                  selectedSeries.push(series);
                }
        
                // Extract related subBrands
                series.subBrands.forEach((subBrand) => {
                  if (!selectedSubBrands.some((sb) => sb.id === subBrand.id)) {
                    selectedSubBrands.push(subBrand);
                  }
                });
              });
            }
          });
        
          // Update search params
          this.searchParams.brands = selectedBrands;
          this.searchParams.brandSeries = selectedSeries;
          this.searchParams.subBrands = selectedSubBrands;
        
          // Update selected filter badges
          await this.updateSelectedFilterBadges(this.searchParams);
        
          // Update filters in the filter service
          this.filterService.updateFilter('brands', selectedBrands);
          this.filterService.updateFilter('brandSeries', selectedSeries);
          this.filterService.updateFilter('subBrands', selectedSubBrands);
        }
        
  
      if ('occasions' in params && this.collectionSettings.occasionsOnFilters && this.occasionActive) {
        // Wait for loaded occasions
        const loadedOccasions = await this.getLoadedOccasions();
        this.searchParams.occasions = this.parseIds(params['occasions'], '|').map(id => {
            const occasion = loadedOccasions.find(o => o.id === id);
            return occasion ? occasion : undefined; // Return the occasion or a default object
        });
  
        await this.updateSelectedFilterBadges(this.searchParams);
        this.filterService.updateFilter('occasions', this.searchParams.occasions);
      }

      if ('trademarks' in params && this.collectionSettings.trademarkOnFilters && this.trademarkActive) {
        // Wait for loaded occasions
        const loadedTrademarks = TrademarkArray;
        this.searchParams.trademarks = this.parseIds(params['trademarks'], '|').map(id => {
            const trademark = loadedTrademarks.find(o => o.id === id);
            if (trademark) {
              // Set isSelected to true for the found trademark
              return { ...trademark, isSelected: true }; 
          }
          return undefined; // Return undefined if no match is found
        });
  
        console.log(this.searchParams.trademarks)
        await this.updateSelectedFilterBadges(this.searchParams);
        this.filterService.updateFilter('trademarks', this.searchParams.trademarks);
      }
  
        // Update other parameters if they exist
        this.updateParamsFromUrl({
          categoryId,
          subCategoryId,
          searchString,
          brandId,
          subBrandId,
          brandSeriesId,
          genderId,
          ratingId,
          statusId,
          sortBy,
          sortDirection,
          minPrice,
          maxPrice,
        });
    });
  }
    // Helper method to update the other filter parameters
  private updateParamsFromUrl(params: any) {
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined) {
        this.searchParams[key] = params[key];
        this.filterService.updateFilter(key as keyof Filters, params[key]);
      }
    });
  }


  private parseIds(idsString: string, separator: string = ','): number[] {
    // Split the string by the specified separator and convert to numbers
    return idsString.split(separator)
        .map(id => +id) // Convert to number
        .filter(id => !isNaN(id)); // Filter out any non-numeric values
  }

   // This ensures that after you update the properties based on the incoming params, you verify whether any of them are undefined and set them to null as needed.
   private ensurePropertiesAreNull(params: any, properties: string[]): void {
    properties.forEach(property => {
      if (params[property] === undefined) {
        this.searchParams[property] = null;
      }
    });
  }

  isNotEmptyState(): boolean {
    return this.loaderState !== LoaderState.Empty && this.loaderState !== LoaderState.EmptyFiltered;
  }

  isEmptyState(): boolean {
    return this.loaderState === LoaderState.Empty || this.loaderState === LoaderState.EmptyFiltered;
  }
}

