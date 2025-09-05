import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ConfigService } from "src/app/Services/config.service";
import { ProductFilterService } from "src/app/Services/Product/filters.service";
import { ProductsService } from "src/app/Services/Product/products.service";
import { Occasion } from "src/app/shared/classes/categories";

@Component({
  selector: "app-occasions",
  templateUrl: "./occasions.component.html",
  styleUrls: ["./occasions.component.scss"]
})
export class OccasionsComponent implements OnInit, OnChanges {
  componentName: string = "OccasionsComponent";
  collectionSettings = environment.pagesSettings.CollectionSettings;
  occasions$: Observable<Occasion[]> | undefined;
  selectedOccasions: Occasion[] = [];

  @Input() selectedIds: Occasion[] = []; // Selected IDs from input
  @Input() isCollapsed: boolean = false;

  @Output() updateFilter = new EventEmitter<any>();
  occasionActive: boolean;

  constructor(
    private configService: ConfigService,
    public productService: ProductsService,
    private filterService: ProductFilterService
  ) {
    this.occasionActive = this.configService.getSetting('OccasionActive');
  }

  ngOnInit(): void {
    if (!this.occasionActive) return; // Disable functionality if setting is off
  
    // Load occasions and map them with selection state
    this.occasions$ = this.productService.occasions$.pipe(
      map(occasions =>
        occasions.map(entity => ({
          ...entity,
          isSelected: this.selectedIds.some(selected => selected.id === entity.id) // Set isSelected based on selectedIds
        }))
      )
    );
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.occasionActive) return; // Disable functionality if setting is off
  
    // Call the method to update selected occasions when selectedIds changes
    if (changes.selectedIds && !changes.selectedIds.firstChange) {
      this.updateSelectedOccasionsFromIds();
    }
  }

  private updateSelectedOccasionsFromIds(): void {
    // Reset selectedOccasions to the filtered array based on selectedIds
    this.selectedOccasions = this.selectedIds.filter(selectedId => {
      const occasion = this.occasions$?.pipe(
        map(occasions => occasions.find(o => o.id === selectedId.id))
      );
      return occasion ? true : false; // Check if the occasion exists
    });

  }

  onCheckboxChange(occasion: Occasion) {
    const index = this.selectedOccasions.findIndex(selected => selected.id === occasion.id);

    if (index === -1) {
      // Add occasion to selected if it wasn't already selected
      this.selectedOccasions.push(occasion);
    } else {
      // Remove from selected if it was already selected
      this.selectedOccasions.splice(index, 1);
    }

    // Toggle the isSelected property
    occasion.isSelected = !occasion.isSelected;

    // Emit updated selection to the filter service with the entire object
    this.filterService.updateFilter('occasions', this.selectedOccasions);
  }

  // Check if an occasion is selected
  isSelected(occasion: Occasion): boolean {
    return this.selectedOccasions.some(selected => selected.id === occasion.id);
  }

  // Helper method to generate image URLs for icons
  getIconUrl(value: string) {
    return (
      this.collectionSettings.occasionImageIconUrl +
      value?.toLowerCase() +
      this.collectionSettings.occasionImageExtension
    );
  }

  // Toggle collapse state of the component
  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
