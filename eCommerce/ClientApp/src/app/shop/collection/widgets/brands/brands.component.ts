import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { environment } from "environments/environment";
import { Observable, Subject } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import { BrandsService } from "src/app/Services/Brands/brands.service";
import { ConfigService } from "src/app/Services/config.service";
import { ProductFilterService } from "src/app/Services/Product/filters.service";
import { Brand, Series, SubBrand } from "src/app/shared/classes/brands";
import { Filters } from "src/app/shared/classes/filters";

@Component({
  selector: "app-brands",
  templateUrl: "./brands.component.html",
  styleUrls: ["./brands.component.scss"],
})
export class BrandsComponent implements OnInit, OnChanges, OnDestroy {
  componentName: string = "BrandsComponent";
  collectionSettings = environment.pagesSettings.CollectionSettings;
  brandActive: boolean;

  brands$: Observable<Brand[]> | undefined;
  selectedBrands: Brand[] = [];
  selectedSeries: Series[] = []; // Series grouped by brand short name
  selectedSubBrands: SubBrand[] = [];

  isCollapsedSeries: boolean = false;
  isCollapsedSubBrands: boolean = false;

  @Input() selectedItems: Filters; // Selected IDs from input
  @Input() isCollapsed: boolean = false;

  @Output() updateFilter = new EventEmitter<any>();

  private destroy$ = new Subject<void>();

  constructor(
    private configService: ConfigService,
    private brandService: BrandsService, 
    private filterService: ProductFilterService) { 
      
    this.brandActive = this.configService.getSetting('BrandActive');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.brandActive) return; // Disable functionality if setting is off

    if (changes.selectedItems && !changes.selectedItems.firstChange) {
      this.updateSelectedBrandsFromIds();
    }
  }

  ngOnInit(): void {
    if (!this.brandActive) return; // Disable functionality if setting is off

    this.FetchBrands();
    this.subscribeToFilters();
  }
  private subscribeToFilters(): void {
    this.filterService.filters$
      .pipe(takeUntil(this.destroy$))
      .subscribe((filters: Filters) => {
        // Update selected items based on filters
        this.selectedItems.brands = filters.brands;
        this.selectedItems.brandSeries = filters.brandSeries;
        this.selectedItems.subBrands = filters.subBrands;
  
        // Update selected brands
        this.selectedBrands = filters.brands || [];
  
        // Update selected series
        this.selectedSeries = filters.brandSeries?.map((series) => ({
          ...series,
          isSelected: true, // Mark as selected
        })) || [];
  
        // Update selected sub-brands
        this.selectedSubBrands = filters.subBrands?.map((subBrand) => ({
          ...subBrand,
          isSelected: true, // Mark as selected
        })) || [];
  
        // Update the brands to reflect the selected series and sub-brands
        this.updateBrandsState();
      });
  }
  private updateBrandsState(): void {
    this.brands$
      ?.pipe(takeUntil(this.destroy$))
      .subscribe((brands) => {
        this.selectedBrands = brands.filter((brand) =>
          this.selectedItems.brands?.some((selectedBrand) => selectedBrand.id === brand.id)
        );
  
        this.selectedSeries = this.selectedBrands.flatMap((brand) =>
          brand.series.filter((series) =>
            this.selectedItems.brandSeries?.some((selectedSeries) => selectedSeries.id === series.id)
          )
        );
  
        this.selectedSubBrands = this.selectedSeries.flatMap((series) =>
          series.subBrands.filter((subBrand) =>
            this.selectedItems.subBrands?.some((selectedSubBrand) => selectedSubBrand.id === subBrand.id)
          )
        );
      });
  }
  
  private FetchBrands(): void {
    this.brands$ = this.brandService.brands$.pipe(
      map((brands) =>
        brands.map((brand) => ({
          ...brand,
          isSelected: this.selectedItems.brands?.some(
            (selectedBrand) => selectedBrand.id === brand.id
          ),
          series: brand.series.map((series) => ({
            ...series,
            isSelected: this.selectedItems.brandSeries?.some(
              (selectedSeries) => selectedSeries.id === series.id
            ),
            subBrands: series.subBrands.map((subBrand) => ({
              ...subBrand,
              isSelected: this.selectedItems.subBrands?.some(
                (selectedSubBrand) => selectedSubBrand.id === subBrand.id
              ),
            })),
          })),
        }))
      )
    );
  
    // Update the selected items after fetching
    this.brands$
      .pipe(takeUntil(this.destroy$))
      .subscribe((brands) => {
        this.selectedBrands = brands.filter((brand) => brand.isSelected);
        this.selectedSeries = brands
          .flatMap((brand) => brand.series)
          .filter((series) => series.isSelected);
        this.selectedSubBrands = brands
          .flatMap((brand) =>
            brand.series.flatMap((series) => series.subBrands)
          )
          .filter((subBrand) => subBrand.isSelected);
      });
  }
  

private updateSelectedBrandsFromIds(): void {
  this.brands$
    ?.pipe(takeUntil(this.destroy$))
    .subscribe((brands) => {
      this.selectedBrands = brands.filter((brand) =>
        this.selectedItems.brands?.some((selectedBrand) => selectedBrand.id === brand.id)
      );
    });
}


onBrandSelect(brand: Brand): void {
  const brandIndex = this.selectedBrands.findIndex((b) => b.id === brand.id);

  if (brandIndex > -1) {
    // Remove the brand if already selected
    this.selectedBrands.splice(brandIndex, 1);

    // Remove associated series and sub-brands
    this.selectedSeries = this.selectedSeries.filter(
      (series) => series.brandShortName !== brand.shortName
    );
    this.selectedSubBrands = this.selectedSubBrands.filter(
      (subBrand) => subBrand.brandShortName !== brand.shortName
    );
  } else {
    // Add the brand
    this.selectedBrands.push(brand);
  }

  // Emit updated filters
  this.updateFilter.emit({
    brands: this.selectedBrands,
    series: this.selectedSeries,
    subBrands: this.selectedSubBrands,
  });
}


  onSeriesSelect(series: Series, brandShortName: string): void {
    const parentBrand = this.selectedBrands.find(
      (brand) => brand.shortName === brandShortName
    );
  
    if (parentBrand) {
      series.isSelected = !series.isSelected; // Toggle series selection
  
      if (series.isSelected) {
        // Add series to selectedSeries if not already present
        if (!this.selectedSeries.some(s => s.id === series.id)) {
          this.selectedSeries.push(series);
        }
  
        // Add new sub-brands only if they aren't already in the selectedSubBrands array
        series.subBrands.forEach((subBrand) => {
          if (!this.selectedSubBrands.some(sb => sb.id === subBrand.id)) {
            this.selectedSubBrands.push(subBrand);
            subBrand.isSelected = false; // Make sure the sub-brand isn't checked by default
          }
        });
      } else {
        // Remove series and its sub-brands if deselected
        this.selectedSeries = this.selectedSeries.filter(
          (selected) => selected.id !== series.id
        );
        this.selectedSubBrands = this.selectedSubBrands.filter(
          (subBrand) => subBrand.seriesShortName !== series.shortName
        );
      }
  
      // Emit the updated filter state
      this.updateFilter.emit({
        brands: this.selectedBrands,
        series: this.selectedSeries,
        subBrands: this.selectedSubBrands.filter((sb) => sb.isSelected),
      });
    }
  }
  
  onSubBrandSelect(subBrand: SubBrand, seriesShortName: string): void {
    const parentSeries = this.selectedSeries.find(
      (series) => series.shortName === seriesShortName
    );
  
    if (parentSeries) {
      subBrand.isSelected = !subBrand.isSelected; // Toggle the selection state
  
      // Update the selectedSubBrands array
      if (subBrand.isSelected) {
        if (!this.selectedSubBrands.some((sb) => sb.id === subBrand.id)) {
          this.selectedSubBrands.push(subBrand);
        }
      } else {
        const index = this.selectedSubBrands.findIndex(
          (sb) => sb.id === subBrand.id
        );
        if (index !== -1) {
          this.selectedSubBrands[index].isSelected = false;
        }
      }
  
      // Emit only selected sub-brands
      this.updateFilter.emit({
        brands: this.selectedBrands,
        series: this.selectedSeries,
        subBrands: this.selectedSubBrands.filter((sb) => sb.isSelected),
      });
    }
  }
  

  getSubBrands(): SubBrand[] {
    return this.selectedSeries.reduce(
      (acc, series) => [...acc, ...series.subBrands],
      []
    );
  }
  
// Checks if a brand is selected based on user interaction
isSelectedBrand(brand: Brand): boolean {
  return this.selectedBrands.some((selected) => selected.shortName === brand.shortName);
}

// Checks if a series is selected based on user interaction
isSelectedSeries(series: Series): boolean {
  return this.selectedSeries.some((selected) => selected.shortName === series.shortName);
}

// Checks if a sub-brand is selected based on user interaction
isSelectedSubBrand(subBrand: SubBrand): boolean {
  return this.selectedSubBrands.some((selected) => selected.shortName === subBrand.shortName);
}

  getIconUrl(value: string): string {
    return (
      this.collectionSettings.brandImageIconUrl +
      value?.toLowerCase() +
      this.collectionSettings.brandImageExtension
    );
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleCollapseSeries(): void {
    this.isCollapsedSeries = !this.isCollapsedSeries;
  }

  toggleCollapseSubBrands(): void {
    this.isCollapsedSubBrands = !this.isCollapsedSubBrands;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
