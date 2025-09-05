import { Component, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChildren } from "@angular/core";
import { environment } from "environments/environment";
import { ConfigService } from "src/app/Services/config.service";
import { ProductFilterService } from "src/app/Services/Product/filters.service";
import { ProductsService } from "src/app/Services/Product/products.service";
import { Trademark } from "src/app/shared/classes/categories";
import { ALPHABET_ARRAY } from "src/app/shared/classes/constants";
import { TrademarkArray } from "src/app/shared/classes/enums/trademarks";

@Component({
  selector: "app-trademarks",
  templateUrl: "./trademarks.component.html",
  styleUrls: ["./trademarks.component.scss"]
})
export class TrademarksComponent implements OnInit, OnChanges {
  componentName: string = "trademarksComponent";
  collectionSettings = environment.pagesSettings.CollectionSettings;
  trademarkActive: boolean;
  alphabet = ALPHABET_ARRAY;
  filteredTrademarks = [...TrademarkArray];

  selectedtrademarks: Trademark[] = [];

  @Input() isMobile: boolean;
  @Input() selectedIds: Trademark[] = []; // Selected IDs from input
  @Input() isCollapsed: boolean = false;

  @Output() updateFilter = new EventEmitter<any>();

  @ViewChildren('listItem') listItems: QueryList<any>;
  constructor(
    private configService: ConfigService,
    public productService: ProductsService,
    private filterService: ProductFilterService
  ) {
    this.trademarkActive = this.configService.getSetting('TrademarkActive');
  }

  ngOnInit(): void {
    if (!this.trademarkActive) return; // Disable functionality if setting is off
  
    console.log(this.selectedIds);
    this.filteredTrademarks = this.filteredTrademarks.map(entity => ({
      ...entity,
      isSelected: this.selectedIds.some(selected => selected.id === entity.id)
    }));
  
    this.updateSelectedtrademarksFromIds();
    this.scrollToSelectedItems();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.trademarkActive) return; // Prevent updates if setting is off
  
    if (changes.selectedIds && !changes.selectedIds.firstChange) {
      console.log(this.selectedIds);
      this.updateSelectedtrademarksFromIds();
    }
  }
  
  private scrollToSelectedItems(): void {
    // Once the list items are available, scroll to the selected ones
    setTimeout(() => {
      const selectedItems = this.listItems.toArray();
      selectedItems.forEach((item, index) => {
        if (this.selectedtrademarks.some(trademark => trademark.id === this.filteredTrademarks[index].id)) {
          item.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }


  private updateSelectedtrademarksFromIds(): void {
    // Reset selectedtrademarks to the filtered array based on selectedIds
    this.selectedtrademarks = this.selectedIds.filter(selectedId => {
      const Trademark = this.filteredTrademarks.find(o => o.id === selectedId.id)
      return Trademark ? true : false; // Check if the Trademark exists
    });

    console.log(this.selectedtrademarks)
  }
  onAlphabetClick(letter: string): void {
    if (letter) {
      this.filteredTrademarks = TrademarkArray.filter(trademark =>
        trademark.label.startsWith(letter)
      );
    } else {
      this.filteredTrademarks = [...TrademarkArray]; // Reset to all trademarks
    }
  }
  onCheckboxChange(ent: Trademark) {
    const index = this.selectedtrademarks.findIndex(selected => selected.id === ent.id);

    if (index === -1) {
      // Add Trademark to selected if it wasn't already selected
      this.selectedtrademarks.push(ent);
    } else {
      // Remove from selected if it was already selected
      this.selectedtrademarks.splice(index, 1);
    }

    // Toggle the isSelected property
    ent.isSelected = !ent.isSelected;

    // Emit updated selection to the filter service with the entire object
    this.filterService.updateFilter('trademarks', this.selectedtrademarks);
  }

  // Check if an Trademark is selected
  isSelected(Trademark: Trademark): boolean {
    return this.selectedtrademarks.some((selected) => selected.id === Trademark.id);
  }

  // Helper method to generate image URLs for icons
  getIconUrl(value: string) {
    return (
      this.collectionSettings.trademarkImageIconUrl +
      value +
      this.collectionSettings.trademarkImageExtension
    );
  }

  // Toggle collapse state of the component
  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
