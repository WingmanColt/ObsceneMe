import { Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime } from 'rxjs';
import { Filters } from 'src/app/shared/classes/filters';

@Injectable({
  providedIn: 'root'
})

export class ProductFilterService {
  // Use Filters model directly without queryParameters
  private filtersSubject = new BehaviorSubject<Filters>({
    categoryId: undefined,
    subCategoryId: undefined,
    searchString: undefined,
    genderId: undefined,
    statusId: undefined,
    ratingId: undefined,
    sortBy: undefined,
    sortDirection: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    
    brands: [],
    brandSeries: [],
    subBrands: [],
    occasions: [],
    trademarks: []
  });

  // Observable that emits Filters objects
  public filters$ = this.filtersSubject.asObservable()
    .pipe(debounceTime(100));

  private memoizedUrl: string = '';

  constructor() {}

  updateFilter(filterKey: keyof Filters, filterValue: any) {
    const currentFilters = this.filtersSubject.value;
  
    this.filtersSubject.next({
      ...currentFilters,
      [filterKey]: filterValue
    });
  
    // Update the URL with only IDs
    this.updateUrlIfNeeded(this.filtersSubject.value);
  }
  
  removeFilter(filterKey: string, label: string): void {
    const currentFilters = this.filtersSubject.value;

    if (filterKey === 'occasions') {
      currentFilters.occasions = currentFilters.occasions.filter(ent => ent.title !== label);
    }
    else if (filterKey === 'trademarks') {
      currentFilters.trademarks = currentFilters.trademarks.filter(ent => ent.label !== label);
    }
    else if (filterKey === 'brands') {
    currentFilters.brands = currentFilters.brands.filter(ent => ent.title !== label);
    }
    else if (filterKey === 'brandSeries') {
      currentFilters.brandSeries = currentFilters.brandSeries.filter(ent => ent.title !== label);
    }
    else if (filterKey === 'subBrands') {
      currentFilters.subBrands = currentFilters.subBrands.filter(ent => ent.title !== label);
    }  
    // Update the filters subject with the modified filters
    this.filtersSubject.next(currentFilters);

    // Update the URL with the new filter state
    this.updateUrlIfNeeded(this.filtersSubject.value);
  }
  private updateUrlIfNeeded(filters: Filters) {
    const urlParams: { [key: string]: string } = {};
    
    if (filters.searchString) {
      urlParams.searchString = filters.searchString;
    }
    if (filters.categoryId) {
      urlParams.categoryId = filters.categoryId.toString();
    }
    if (filters.subCategoryId) {
      urlParams.subCategoryId = filters.subCategoryId.toString();
    }
    if (filters.brands && filters.brands.length > 0) {
      urlParams.brands = filters.brands.map(ent => ent.id).join('|'); // Use brands id for URL
    }
    if (filters.brandSeries && filters.brandSeries.length > 0) {
      urlParams.brandSeries = filters.brandSeries.map(ent => ent.id).join('|'); // Use series id for URL
    }
    if (filters.subBrands && filters.subBrands.length > 0) {
      urlParams.subBrands = filters.subBrands.map(ent => ent.id).join('|'); // Use SUBBRAND id for URL
    }
    if (filters.occasions && filters.occasions.length > 0) {
      urlParams.occasions = filters.occasions.map(ent => ent.id).join('|'); // Use occasion id for URL
    }
    if (filters.trademarks && filters.trademarks.length > 0) {
      urlParams.trademarks = filters.trademarks.map(ent => ent.id).join('|'); // only id is coming from floating-filters as array of numbers
    }
    if (filters.genderId) {
      urlParams.genderId = filters.genderId.toString();
    }
    if (filters.statusId) {
      urlParams.statusId = filters.statusId.toString();
    }
    if (filters.ratingId) {
      urlParams.ratingId = filters.ratingId.toString();
    }
    if (filters.minPrice !== undefined) {
      urlParams.minPrice = filters.minPrice.toString();
    }
    if (filters.maxPrice !== undefined) {
      urlParams.maxPrice = filters.maxPrice.toString();
    }
    if (filters.sortBy) {
      urlParams.sort = filters.sortBy;
    }
    if (filters.sortDirection) {
      urlParams.direction = filters.sortDirection;
    }
  
    const queryString = new URLSearchParams(urlParams).toString();
    const currentUrl = `${window.location.pathname}?${queryString}`;
  
    if (this.memoizedUrl !== currentUrl) {
      this.memoizedUrl = currentUrl;
      history.replaceState(null, '', currentUrl);
    }
  }
  

  clearAllFilters(): void {
        const clearedFilters: Filters = {
          categoryId: undefined,
          subCategoryId: undefined,
          searchString: undefined,
          genderId: undefined,
          statusId: undefined,
          ratingId: undefined,
          sortBy: undefined,
          sortDirection: undefined,
          minPrice: undefined,
          maxPrice: undefined,
          brands: [],
          brandSeries: [],
          subBrands: [],
          occasions: [],
          trademarks: []
        };

       // Update filters subject with cleared values
       this.filtersSubject.next(clearedFilters);

       // Update the URL by removing all filters (no query parameters)
       const currentUrl = window.location.pathname; // No query params when cleared
       history.replaceState(null, '', currentUrl);
   
       // Memoize the new URL (which will be the base URL without query params)
       this.memoizedUrl = currentUrl;
  }
}
